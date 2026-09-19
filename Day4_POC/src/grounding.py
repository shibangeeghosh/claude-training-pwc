"""Step 5 of the agent loop: an LLM drafts a claim-by-claim answer tagged with citation_ids,
constrained to the retrieved passages -- then code independently verifies every tag against the
actually-retrieved set. This is grounding-by-verification, not grounding-by-construction: unlike
Day3_case_study_ag_rag_scntfc_lit_rvw (which only ever templated one sentence per retrieved
passage), the model drafts freely but nothing it cites is trusted unless it resolves to a real,
retrieved passage. If it can't be verified, it never reaches the user as a stated fact.
"""
from __future__ import annotations

import re

from . import llm_client

# A richer, higher-temperature draft occasionally drifts from "one id per bracket" -- e.g. stuffing
# two ids in one bracket ("[trial_registry-NCT020, literature-PMID001]") or trailing punctuation
# inside the bracket ("[trial_registry-NCT020.]"). Rather than reject those as "no citations found",
# scan bracket contents for every embedded id so a formatting slip doesn't discard an otherwise
# well-grounded answer.
BRACKET_CONTENT_RE = re.compile(r"\[([^\[\]]*)\]")
CITATION_ID_RE = re.compile(r"(?:literature|trial_registry|patent|internal)-[A-Za-z0-9_]+")


def _extract_cited_ids(draft_answer: str) -> set[str]:
    ids: set[str] = set()
    for bracket_content in BRACKET_CONTENT_RE.findall(draft_answer):
        ids.update(CITATION_ID_RE.findall(bracket_content))
    return ids


SYSTEM_PROMPT = """You are the grounded-answer-drafting step of an agentic literature-review RAG \
system for pharmaceutical R&D, writing for a scientific reviewer who will decide whether to release \
your answer. You will be given a research question and a list of retrieved evidence passages, each \
with a citation_id. Write a substantive, analyst-quality answer using ONLY information from these \
passages -- not a one-line summary. Where the evidence supports it, name specific findings (effect \
sizes, populations, timeframes, mechanisms) instead of vague generalities, and synthesize across \
passages (agreement, tension, what one passage adds that another lacks) rather than listing them \
one by one. Every factual claim MUST end with the citation_id of the passage it came from, in \
square brackets, e.g. "...reduced hospitalization risk [trial_registry-NCT010]." Never cite a \
citation_id that is not in the provided passage list. Never state anything not supported by the \
passages -- if an aspect of the question isn't covered by the evidence, list it in \
uncovered_aspects instead of guessing; do not pad the answer with hedges or filler to compensate. \
When one sentence synthesizes more than one passage, give EACH source its own separate bracket \
tag, one right after another -- never combine multiple citation_ids inside a single bracket. \
For example, write: "Extended-release metformin was non-inferior on HbA1c [trial_registry-NCT020] \
and was better tolerated in a separate meta-analysis [literature-PMID001]." -- NOT \
"...[trial_registry-NCT020, literature-PMID001]". Also self-assess your confidence in the answer as "high", "medium", or "low", with a specific, \
concrete basis (name the evidence quantity/quality reason, not a generic phrase). Respond with \
ONLY a JSON object, no prose, matching exactly:
{"answer": "<answer text with inline [citation_id] tags>", "uncovered_aspects": ["<string>", ...], \
"confidence_level": "high"|"medium"|"low", "confidence_basis": "<string>"}"""


def draft_and_verify(question: str, retrieved_passages: list[dict], api_key: str, model: str) -> dict:
    passage_list = [
        {
            "citation_id": p["citation_id"],
            "source": p["source"],
            "locator": p["locator"],
            "snippet": p["snippet"],
        }
        for p in retrieved_passages
    ]
    user_prompt = (
        f"Research question: {question}\n\nRetrieved passages (JSON):\n{passage_list}"
    )
    result = llm_client.chat_completion(
        api_key,
        model,
        [{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": user_prompt}],
        json_mode=True,
        temperature=0.6,
    )
    if not result["ok"]:
        return {"grounded": False, "llm_error": result.get("error_type"), "error": result.get("error")}

    usage = result.get("usage", {})
    parsed, parse_err = llm_client.parse_json_content(result["content"])
    if parsed is None or "answer" not in parsed:
        return {"grounded": False, "llm_error": "MALFORMED_RESPONSE", "error": parse_err, "usage": usage}

    draft_answer = parsed["answer"]
    uncovered_aspects = parsed.get("uncovered_aspects") or []

    valid_ids = {p["citation_id"] for p in retrieved_passages}
    cited_ids = _extract_cited_ids(draft_answer)
    invalid_ids = cited_ids - valid_ids
    print(f"[grounding-debug] model={model} valid_ids={valid_ids} cited_ids={cited_ids} draft_answer={draft_answer!r}", flush=True)

    if invalid_ids or not cited_ids:
        # The draft either cited something that doesn't exist, or cited nothing at all --
        # in both cases we cannot trust it as grounded fact, so it never reaches the user.
        gaps = list(uncovered_aspects)
        reason = (
            f"Model cited unverifiable source(s) {sorted(invalid_ids)}; answer discarded."
            if invalid_ids
            else "Model produced no verifiable citations; answer discarded."
        )
        gaps.append(reason)
        return {
            "grounded": True,
            "trusted": False,
            "citations": [],
            "gaps": gaps,
            "draft_answer": None,
            "usage": usage,
        }

    citations = [
        {"id": p["citation_id"], "source": p["source"], "locator": p["locator"], "snippet": p["snippet"]}
        for p in retrieved_passages
        if p["citation_id"] in cited_ids
    ]
    return {
        "grounded": True,
        "trusted": True,
        "answer": draft_answer,
        "citations": citations,
        "gaps": list(uncovered_aspects),
        "llm_confidence_level": parsed.get("confidence_level"),
        "llm_confidence_basis": parsed.get("confidence_basis"),
        "usage": usage,
    }
