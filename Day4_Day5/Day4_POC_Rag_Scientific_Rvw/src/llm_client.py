"""Thin Groq chat-completion wrapper.

The API key is supplied by the user at runtime (never read from env/disk) and is only ever
passed through to the Authorization header -- it is not logged or persisted anywhere.
Every call returns a uniform {"ok": bool, ...} shape so callers never need to catch exceptions;
any failure maps to a named error_type that the fail-safe gate can act on. Groq's API is
OpenAI-compatible (same /chat/completions request/response shape as OpenRouter), so only the
endpoint and provider-specific headers would need to change if swapping providers again.
"""
from __future__ import annotations

import json

import requests

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
DEFAULT_TIMEOUT_SECONDS = 30


def chat_completion(
    api_key: str,
    model: str,
    messages: list[dict],
    json_mode: bool = False,
    timeout: int = DEFAULT_TIMEOUT_SECONDS,
    temperature: float = 0.2,
) -> dict:
    if not api_key:
        return {"ok": False, "error_type": "MISSING_API_KEY", "error": "No Groq API key provided."}
    if not model:
        return {"ok": False, "error_type": "MISSING_MODEL", "error": "No model selected."}

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    body = {"model": model, "messages": messages, "temperature": temperature}
    if json_mode:
        body["response_format"] = {"type": "json_object"}

    try:
        resp = requests.post(GROQ_URL, headers=headers, json=body, timeout=timeout)
    except requests.exceptions.Timeout:
        return {"ok": False, "error_type": "TIMEOUT", "error": f"Groq request timed out after {timeout}s."}
    except requests.exceptions.RequestException as exc:
        return {"ok": False, "error_type": "NETWORK_ERROR", "error": str(exc)}

    if resp.status_code == 401:
        return {"ok": False, "error_type": "INVALID_API_KEY", "error": "Groq rejected the API key (401)."}
    if resp.status_code == 429:
        return {"ok": False, "error_type": "RATE_LIMITED", "error": "Groq rate limit exceeded (429)."}
    if resp.status_code == 402:
        return {
            "ok": False,
            "error_type": "INSUFFICIENT_CREDITS",
            "error": f"Groq rejected the request: insufficient credits (402). {resp.text[:300]}",
        }
    if resp.status_code >= 400:
        return {
            "ok": False,
            "error_type": "API_ERROR",
            "error": f"Groq returned HTTP {resp.status_code}: {resp.text[:300]}",
        }

    try:
        data = resp.json()
        content = data["choices"][0]["message"]["content"]
    except (ValueError, KeyError, IndexError) as exc:
        return {
            "ok": False,
            "error_type": "MALFORMED_RESPONSE",
            "error": f"Could not parse Groq response: {exc}",
        }

    usage = data.get("usage", {})
    return {"ok": True, "content": content, "usage": usage, "model": data.get("model", model)}


def parse_json_content(content: str) -> tuple[dict | None, str | None]:
    """Best-effort JSON parse of an LLM response, tolerating a ```json fenced block."""
    text = content.strip()
    if text.startswith("```"):
        text = text.strip("`")
        if text.lower().startswith("json"):
            text = text[4:]
    try:
        return json.loads(text.strip()), None
    except json.JSONDecodeError as exc:
        return None, str(exc)
