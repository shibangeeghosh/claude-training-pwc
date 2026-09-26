"""Classifies a SourceDocument's document_type via LLM, with a heuristic fallback.

Mirrors the query_planner pattern: ask the LLM first, but never block on it - if the
call fails or returns something unparseable, fall back to a keyword heuristic rather
than crashing or guessing wildly. Confidence gates whether extraction is even attempted
(LLD S4: "never extracted against a guessed spec").
"""

from src import extraction_spec, llm_client


def _known_document_types():
    """Document types are config-driven (config/extraction_specs/*.yaml) - a new spec file
    alone is enough to make classify_document() route to it, no src/ change required."""
    return list(extraction_spec.load_all_specs().keys())


_HEURISTIC_KEYWORDS = {
    "discharge_summary": ["discharge summary", "discharge diagnosis", "discharge disposition", "hospital course"],
    "operative_note": ["operative note", "procedure performed", "preoperative diagnosis", "surgeon"],
    "pathology_report": ["pathology report", "specimen", "microscopic description", "margin status"],
}


def _heuristic_classify(text):
    lowered = text.lower()
    scores = {}
    for doc_type, keywords in _HEURISTIC_KEYWORDS.items():
        scores[doc_type] = sum(1 for kw in keywords if kw in lowered)

    best_type = max(scores, key=scores.get)
    best_score = scores[best_type]
    total_hits = sum(scores.values()) or 1
    confidence = round(best_score / total_hits, 2) if best_score else 0.0

    return {
        "document_type": best_type if best_score else None,
        "confidence": confidence,
        "method": "heuristic",
    }


def classify_document(text, api_key, model):
    """Returns {"document_type": str|None, "confidence": float, "method": str, "detail": str|None}."""
    known_types = _known_document_types()
    prompt = (
        "Classify the following clinical document into exactly one of these types: "
        f"{', '.join(known_types)}.\n"
        "Respond with JSON only: {\"document_type\": <one of the types>, \"confidence\": <0.0-1.0>}.\n\n"
        f"DOCUMENT:\n{text}"
    )
    result = llm_client.chat_completion(
        api_key=api_key,
        model=model,
        messages=[{"role": "user", "content": prompt}],
        json_mode=True,
    )

    if not result["ok"]:
        fallback = _heuristic_classify(text)
        fallback["detail"] = f"LLM classification failed ({result['error_type']}): {result.get('detail', '')}"
        return fallback

    parsed = llm_client.parse_json_content(result["content"])
    if not parsed or "document_type" not in parsed:
        fallback = _heuristic_classify(text)
        fallback["detail"] = "LLM classification response was unparseable"
        return fallback

    doc_type = parsed.get("document_type")
    if doc_type not in known_types:
        fallback = _heuristic_classify(text)
        fallback["detail"] = f"LLM returned an unknown document_type: {doc_type!r}"
        return fallback

    confidence = parsed.get("confidence")
    if not isinstance(confidence, (int, float)):
        confidence = 0.5

    return {
        "document_type": doc_type,
        "confidence": float(confidence),
        "method": "llm",
        "detail": None,
    }
