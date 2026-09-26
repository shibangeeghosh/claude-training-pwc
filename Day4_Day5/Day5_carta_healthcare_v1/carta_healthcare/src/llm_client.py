"""Thin wrapper around Groq's OpenAI-compatible chat completions endpoint.

Groq's API is OpenAI-compatible, so swapping providers only requires changing GROQ_URL
and the Authorization header below. The API key is always supplied by the caller at
call time (from the Flask session) - never read from an env var, never persisted.
"""

import json
import re

import requests

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

DEFAULT_MODEL = "openai/gpt-oss-120b"

MODEL_CHOICES = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "llama-3.3-70b-versatile",
]

_ERROR_STATUS_MAP = {
    401: "INVALID_API_KEY",
    403: "INVALID_API_KEY",
    429: "RATE_LIMITED",
    402: "INSUFFICIENT_CREDITS",
}


def chat_completion(api_key, model, messages, json_mode=False, timeout=30, temperature=0.0):
    """Call the Groq chat completions endpoint.

    Returns a uniform ``{"ok": bool, ...}`` shape:
      - ok=True:  {"ok": True, "content": str}
      - ok=False: {"ok": False, "error_type": str, "detail": str}

    error_type is one of: MISSING_API_KEY, INVALID_API_KEY, RATE_LIMITED, TIMEOUT,
    NETWORK_ERROR, API_ERROR, INSUFFICIENT_CREDITS, MALFORMED_RESPONSE.
    """
    if not api_key:
        return {"ok": False, "error_type": "MISSING_API_KEY", "detail": "No Groq API key provided."}

    payload = {
        "model": model or DEFAULT_MODEL,
        "messages": messages,
        "temperature": temperature,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    try:
        resp = requests.post(GROQ_URL, headers=headers, json=payload, timeout=timeout)
    except requests.exceptions.Timeout:
        return {"ok": False, "error_type": "TIMEOUT", "detail": "Request to Groq timed out."}
    except requests.exceptions.RequestException as exc:
        return {"ok": False, "error_type": "NETWORK_ERROR", "detail": str(exc)}

    if resp.status_code != 200:
        error_type = _ERROR_STATUS_MAP.get(resp.status_code, "API_ERROR")
        detail = resp.text[:500]
        return {"ok": False, "error_type": error_type, "detail": detail}

    try:
        data = resp.json()
        content = data["choices"][0]["message"]["content"]
    except (ValueError, KeyError, IndexError, TypeError) as exc:
        return {"ok": False, "error_type": "MALFORMED_RESPONSE", "detail": str(exc)}

    return {"ok": True, "content": content}


def parse_json_content(content):
    """Tolerant JSON parser for LLM output that may be wrapped in ```json ... ``` fences."""
    if content is None:
        return None
    text = content.strip()
    fence_match = re.search(r"```(?:json)?\s*(.*?)\s*```", text, re.DOTALL)
    if fence_match:
        text = fence_match.group(1).strip()
    try:
        return json.loads(text)
    except (ValueError, TypeError):
        return None
