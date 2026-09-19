import json

from src import grounding, llm_client

PASSAGES = [
    {
        "citation_id": "trial_registry-NCT020",
        "source": "clinicaltrials_gov",
        "locator": "NCT05020020",
        "snippet": "Extended-release arm showed non-inferior HbA1c reduction with fewer GI adverse events.",
    },
    {
        "citation_id": "literature-PMID001",
        "source": "pubmed",
        "locator": "PMID001",
        "snippet": "Meta-analysis found extended-release metformin better tolerated than immediate-release.",
    },
]


def _stub_llm(content: str, usage=None):
    def _fake_chat_completion(api_key, model, messages, json_mode=False, timeout=30, temperature=0.2):
        return {"ok": True, "content": content, "usage": usage or {"total_tokens": 42}, "model": model}
    return _fake_chat_completion


def test_valid_citations_are_trusted(monkeypatch):
    draft = json.dumps({
        "answer": "Extended-release metformin was better tolerated [trial_registry-NCT020].",
        "uncovered_aspects": [],
        "confidence_level": "high",
        "confidence_basis": "One concordant trial.",
    })
    monkeypatch.setattr(llm_client, "chat_completion", _stub_llm(draft))
    result = grounding.draft_and_verify("Is ER metformin better tolerated?", PASSAGES, "key", "model")
    assert result["grounded"] is True
    assert result["trusted"] is True
    assert result["citations"][0]["id"] == "trial_registry-NCT020"
    assert result["usage"]["total_tokens"] == 42


def test_fabricated_citation_is_discarded(monkeypatch):
    draft = json.dumps({
        "answer": "This drug cures everything [literature-FAKE999].",
        "uncovered_aspects": [],
        "confidence_level": "high",
        "confidence_basis": "n/a",
    })
    monkeypatch.setattr(llm_client, "chat_completion", _stub_llm(draft))
    result = grounding.draft_and_verify("q", PASSAGES, "key", "model")
    assert result["grounded"] is True
    assert result["trusted"] is False
    assert result["citations"] == []
    assert any("FAKE999" in gap or "unverifiable" in gap for gap in result["gaps"])


def test_answer_with_no_citations_is_discarded(monkeypatch):
    draft = json.dumps({
        "answer": "Extended-release metformin is generally well tolerated.",
        "uncovered_aspects": [],
        "confidence_level": "medium",
        "confidence_basis": "n/a",
    })
    monkeypatch.setattr(llm_client, "chat_completion", _stub_llm(draft))
    result = grounding.draft_and_verify("q", PASSAGES, "key", "model")
    assert result["trusted"] is False
    assert result["citations"] == []


def test_llm_failure_propagates_as_ungrounded(monkeypatch):
    def _fake_chat_completion(api_key, model, messages, json_mode=False, timeout=30, temperature=0.2):
        return {"ok": False, "error_type": "INVALID_API_KEY", "error": "Groq rejected the API key (401)."}
    monkeypatch.setattr(llm_client, "chat_completion", _fake_chat_completion)
    result = grounding.draft_and_verify("q", PASSAGES, "bad-key", "model")
    assert result["grounded"] is False
    assert result["llm_error"] == "INVALID_API_KEY"


def test_malformed_response_is_ungrounded(monkeypatch):
    monkeypatch.setattr(llm_client, "chat_completion", _stub_llm("not json at all"))
    result = grounding.draft_and_verify("q", PASSAGES, "key", "model")
    assert result["grounded"] is False
    assert result["llm_error"] == "MALFORMED_RESPONSE"


def test_multiple_ids_combined_in_one_bracket_are_still_verified(monkeypatch):
    # A richer/higher-temperature draft can drift from "one id per bracket" and stuff several
    # ids into a single bracket -- this must still be recognized as verifiable, not discarded.
    draft = json.dumps({
        "answer": (
            "Extended-release metformin was non-inferior and better tolerated "
            "[trial_registry-NCT020, literature-PMID001]."
        ),
        "uncovered_aspects": [],
        "confidence_level": "high",
        "confidence_basis": "Two concordant sources.",
    })
    monkeypatch.setattr(llm_client, "chat_completion", _stub_llm(draft))
    result = grounding.draft_and_verify("Is ER metformin better tolerated?", PASSAGES, "key", "model")
    assert result["trusted"] is True
    assert {c["id"] for c in result["citations"]} == {"trial_registry-NCT020", "literature-PMID001"}


def test_trailing_punctuation_inside_bracket_is_tolerated(monkeypatch):
    draft = json.dumps({
        "answer": "Extended-release metformin was better tolerated [trial_registry-NCT020.].",
        "uncovered_aspects": [],
        "confidence_level": "high",
        "confidence_basis": "One trial.",
    })
    monkeypatch.setattr(llm_client, "chat_completion", _stub_llm(draft))
    result = grounding.draft_and_verify("q", PASSAGES, "key", "model")
    assert result["trusted"] is True
    assert result["citations"][0]["id"] == "trial_registry-NCT020"
