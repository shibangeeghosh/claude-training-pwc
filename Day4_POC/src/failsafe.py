"""Step 7 of the agent loop: fail gracefully. Every trigger below maps to a named action --
refuse, escalate, or a non-blocking gap flag -- so the system never silently guesses.
"""
from __future__ import annotations

from .allowlist import is_stale

LLM_ERROR_MESSAGES = {
    "MISSING_API_KEY": "No Groq API key was provided.",
    "MISSING_MODEL": "No model was selected.",
    "INVALID_API_KEY": "Groq rejected the API key.",
    "RATE_LIMITED": "Groq rate limit was exceeded.",
    "TIMEOUT": "The Groq request timed out.",
    "NETWORK_ERROR": "A network error occurred calling Groq.",
    "API_ERROR": "Groq returned an error.",
    "MALFORMED_RESPONSE": "The model's response could not be parsed.",
}


def apply_failsafe_gate(
    retrieved_passages: list[dict],
    hook_log: list[dict],
    grounding_result: dict,
) -> dict:
    gaps: list[str] = []

    if not grounding_result.get("grounded"):
        error_type = grounding_result.get("llm_error", "UNKNOWN")
        reason = LLM_ERROR_MESSAGES.get(error_type, f"LLM call failed ({error_type}).")
        return {"status": "escalate", "reason": reason, "gaps": gaps}

    if not retrieved_passages:
        return {"status": "refuse", "reason": "No evidence was found for this question in the selected domain.", "gaps": gaps}

    if not grounding_result.get("trusted"):
        return {
            "status": "escalate",
            "reason": "The model's draft answer could not be verified against retrieved evidence.",
            "gaps": gaps,
        }

    conflict = _check_conflicts(retrieved_passages)
    if conflict:
        return {"status": "escalate", "reason": conflict, "gaps": gaps}

    gaps.extend(_check_stale_sources(hook_log))
    return {"status": "answer", "reason": None, "gaps": gaps}


def _check_conflicts(retrieved_passages: list[dict]) -> str | None:
    by_topic: dict[str, set[str]] = {}
    for p in retrieved_passages:
        topic = p["full_doc"].get("topic")
        outcome = p["full_doc"].get("outcome")
        if not topic or not outcome:
            continue
        by_topic.setdefault(topic, set()).add(outcome)
    for topic, outcomes in by_topic.items():
        if len(outcomes) > 1:
            return f"Conflicting trial evidence found for topic '{topic}': {sorted(outcomes)}."
    return None


def _check_stale_sources(hook_log: list[dict]) -> list[str]:
    gaps = []
    for entry in hook_log:
        allow_entry = entry.get("allowlist_entry")
        if allow_entry and is_stale(allow_entry):
            gaps.append(
                f"Source '{allow_entry['id']}' allowlist entry is stale "
                f"(last reviewed {allow_entry['last_reviewed']}); evidence from it may be out of date."
            )
    return gaps
