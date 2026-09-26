"""Step 2 of the agent loop: decompose the research question into per-source sub-queries and
flag ambiguity. Backed by a Groq LLM call; falls back to Day3's keyword heuristic if the
LLM call fails or returns something unparseable -- the pipeline must still degrade gracefully.
"""
from __future__ import annotations

from . import llm_client

SOURCE_TYPES = ["literature", "trial_registry", "patent", "internal"]

SYSTEM_PROMPT = """You are the query-planning step of an agentic literature-review RAG system for \
pharmaceutical R&D. Given a research question and a therapeutic-area domain, decide whether the \
question is too ambiguous to search on, and if not, produce one focused search sub-query per \
evidence source type. Respond with ONLY a JSON object, no prose, matching exactly this shape:
{"ambiguous": true|false, "clarify_message": "<string or null>", "sub_queries": \
{"literature": "<string>", "trial_registry": "<string>", "patent": "<string>", "internal": "<string>"}}
A question is ambiguous if it lacks a concrete drug, condition, mechanism, or comparison to search on. \
If ambiguous, set sub_queries to null and give a clarify_message asking what to narrow down. \
Sub-queries should be short keyword-style phrases relevant to that source type, not full sentences."""


def plan_query(question: str, domain: dict, api_key: str, model: str) -> dict:
    user_prompt = f"Domain: {domain['label']}\nResearch question: {question}"
    result = llm_client.chat_completion(
        api_key,
        model,
        [{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": user_prompt}],
        json_mode=True,
    )
    if result["ok"]:
        parsed, err = llm_client.parse_json_content(result["content"])
        if parsed is not None and "ambiguous" in parsed:
            if parsed.get("ambiguous"):
                return {
                    "ambiguous": True,
                    "clarify_message": parsed.get("clarify_message") or "Please narrow your question.",
                    "llm_used": True,
                }
            sub_queries = parsed.get("sub_queries") or {}
            if all(sub_queries.get(t) for t in SOURCE_TYPES):
                return {"ambiguous": False, "sub_queries": sub_queries, "llm_used": True}
        # Parsed but malformed -- fall through to heuristic rather than trusting a partial result.

    return _heuristic_plan(
        question,
        domain,
        llm_failed=not result["ok"],
        llm_error=result.get("error_type"),
        llm_error_detail=result.get("error"),
    )


def _heuristic_plan(
    question: str,
    domain: dict,
    llm_failed: bool,
    llm_error: str | None,
    llm_error_detail: str | None = None,
) -> dict:
    words = question.strip().split()
    concrete_keywords = {k.lower() for k in domain.get("keywords", [])}
    has_concrete_term = any(w.lower() in concrete_keywords for w in words)
    ambiguous = len(words) < 6 or not has_concrete_term
    if ambiguous:
        msg = "Please narrow your question with a specific drug, condition, or mechanism."
        if llm_failed:
            msg += f" (LLM query planning was unavailable: {llm_error}"
            if llm_error_detail:
                msg += f" - {llm_error_detail}"
            msg += "; used a fallback heuristic.)"
        return {"ambiguous": True, "clarify_message": msg, "llm_used": False, "llm_error": llm_error}

    sub_queries = {t: question for t in SOURCE_TYPES}
    return {"ambiguous": False, "sub_queries": sub_queries, "llm_used": False, "llm_error": llm_error}
