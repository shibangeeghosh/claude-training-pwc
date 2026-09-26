import json

from src import document_classifier, llm_client

DISCHARGE_TEXT = "DISCHARGE SUMMARY\nDischarge Diagnosis: pneumonia\nDischarge Disposition: home\nHospital Course: uncomplicated."
OPERATIVE_TEXT = "OPERATIVE NOTE\nPreoperative Diagnosis: appendicitis\nProcedure Performed: laparoscopic appendectomy\nSurgeon: Dr. Smith"


def _stub_llm(content):
    def _fake_chat_completion(api_key, model, messages, json_mode=False, timeout=30, temperature=0.0):
        return {"ok": True, "content": content}
    return _fake_chat_completion


def test_llm_classification_used_when_successful(monkeypatch):
    monkeypatch.setattr(
        llm_client, "chat_completion",
        _stub_llm(json.dumps({"document_type": "discharge_summary", "confidence": 0.92})),
    )
    result = document_classifier.classify_document(DISCHARGE_TEXT, "key", "model")
    assert result == {"document_type": "discharge_summary", "confidence": 0.92, "method": "llm", "detail": None}


def test_llm_failure_falls_back_to_heuristic(monkeypatch):
    def _fake_chat_completion(api_key, model, messages, json_mode=False, timeout=30, temperature=0.0):
        return {"ok": False, "error_type": "RATE_LIMITED", "detail": "429"}
    monkeypatch.setattr(llm_client, "chat_completion", _fake_chat_completion)

    result = document_classifier.classify_document(OPERATIVE_TEXT, "key", "model")
    assert result["method"] == "heuristic"
    assert result["document_type"] == "operative_note"
    assert "RATE_LIMITED" in result["detail"]


def test_malformed_llm_response_falls_back_to_heuristic(monkeypatch):
    monkeypatch.setattr(llm_client, "chat_completion", _stub_llm("not json"))
    result = document_classifier.classify_document(DISCHARGE_TEXT, "key", "model")
    assert result["method"] == "heuristic"
    assert result["document_type"] == "discharge_summary"


def test_llm_returning_unknown_document_type_falls_back_to_heuristic(monkeypatch):
    monkeypatch.setattr(
        llm_client, "chat_completion",
        _stub_llm(json.dumps({"document_type": "not_a_real_type", "confidence": 0.9})),
    )
    result = document_classifier.classify_document(OPERATIVE_TEXT, "key", "model")
    assert result["method"] == "heuristic"


def test_heuristic_returns_none_document_type_for_no_keyword_hits():
    result = document_classifier._heuristic_classify("no relevant keywords in here at all")
    assert result["document_type"] is None
    assert result["confidence"] == 0.0


def test_llm_confidence_defaults_when_not_numeric(monkeypatch):
    monkeypatch.setattr(
        llm_client, "chat_completion",
        _stub_llm(json.dumps({"document_type": "discharge_summary", "confidence": "high"})),
    )
    result = document_classifier.classify_document(DISCHARGE_TEXT, "key", "model")
    assert result["confidence"] == 0.5
