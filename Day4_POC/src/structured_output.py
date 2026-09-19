"""Step 6 of the agent loop: fixed structured-output contract. `gaps` is always present, even
when empty of content, so callers can never mistake "no gaps" for "we forgot to check."
"""
from __future__ import annotations

CONFIDENCE_RANK = {"low": 0, "medium": 1, "high": 2}


def compose_structured_output(
    grounding_result: dict,
    domain_label: str,
    model: str,
    extra_gaps: list[str] | None = None,
) -> dict:
    citations = grounding_result.get("citations", [])
    gaps = list(grounding_result.get("gaps", [])) + list(extra_gaps or [])

    level, basis = _hybrid_confidence(grounding_result, citations, gaps)

    return {
        "answer": grounding_result.get("answer") or "No grounded answer could be produced.",
        "confidence": {"level": level, "basis": basis},
        "citations": citations,
        "gaps": gaps if gaps else ["No gaps identified."],
        "domain": domain_label,
        "model_used": model,
    }


def _hybrid_confidence(grounding_result: dict, citations: list[dict], gaps: list[str]) -> tuple[str, str]:
    """LLM proposes a confidence level; code floors/caps it against the citation count and
    whether any gaps were raised, so the model can't overclaim confidence on thin evidence."""
    llm_level = grounding_result.get("llm_confidence_level") or "low"
    if llm_level not in CONFIDENCE_RANK:
        llm_level = "low"

    n = len(citations)
    if n >= 3 and not gaps:
        cap = "high"
    elif n >= 1:
        cap = "medium"
    else:
        cap = "low"

    final_level = min(llm_level, cap, key=lambda lvl: CONFIDENCE_RANK[lvl])
    basis = (
        f"{n} citation(s) retrieved; model self-assessed '{llm_level}'"
        f"{' (' + grounding_result['llm_confidence_basis'] + ')' if grounding_result.get('llm_confidence_basis') else ''}"
        f", capped at '{cap}' by citation count/gaps -> final '{final_level}'."
    )
    return final_level, basis
