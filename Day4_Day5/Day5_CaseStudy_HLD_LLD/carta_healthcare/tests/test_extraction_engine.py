import json

from src import extraction_engine, llm_client

SPEC = {
    "fields": [
        {"field_name": "primary_diagnosis", "data_type": "string"},
        {"field_name": "length_of_stay_days", "data_type": "integer"},
    ]
}

DOCUMENT_TEXT = "Patient was diagnosed with pneumonia. Length of stay was 4 days."


def _stub_llm(content):
    def _fake_chat_completion(api_key, model, messages, json_mode=False, timeout=30, temperature=0.0):
        return {"ok": True, "content": content}
    return _fake_chat_completion


def test_verified_quote_is_accepted(monkeypatch):
    draft = json.dumps({"fields": [
        {"field_name": "primary_diagnosis", "value": "pneumonia", "quote": "diagnosed with pneumonia", "confidence": 0.9},
        {"field_name": "length_of_stay_days", "value": "4", "quote": "4 days", "confidence": 0.8},
    ]})
    monkeypatch.setattr(llm_client, "chat_completion", _stub_llm(draft))

    fields = extraction_engine.extract_fields(DOCUMENT_TEXT, SPEC, "key", "model")
    by_name = {f["field_name"]: f for f in fields}

    assert by_name["primary_diagnosis"]["verified"] is True
    assert by_name["primary_diagnosis"]["value"] == "pneumonia"
    assert by_name["primary_diagnosis"]["source_span"]["text_excerpt"] == "diagnosed with pneumonia"
    assert by_name["length_of_stay_days"]["verified"] is True


def test_quote_not_found_in_document_is_unverified(monkeypatch):
    draft = json.dumps({"fields": [
        {"field_name": "primary_diagnosis", "value": "pneumonia", "quote": "this text is not in the document", "confidence": 0.9},
        {"field_name": "length_of_stay_days", "value": "4", "quote": "4 days", "confidence": 0.8},
    ]})
    monkeypatch.setattr(llm_client, "chat_completion", _stub_llm(draft))

    fields = extraction_engine.extract_fields(DOCUMENT_TEXT, SPEC, "key", "model")
    by_name = {f["field_name"]: f for f in fields}

    assert by_name["primary_diagnosis"]["verified"] is False
    assert by_name["primary_diagnosis"]["reason"] == "unverifiable_source_span"
    assert by_name["primary_diagnosis"]["value"] is None


def test_field_not_returned_by_model_is_unextracted(monkeypatch):
    draft = json.dumps({"fields": [
        {"field_name": "primary_diagnosis", "value": "pneumonia", "quote": "diagnosed with pneumonia", "confidence": 0.9},
    ]})
    monkeypatch.setattr(llm_client, "chat_completion", _stub_llm(draft))

    fields = extraction_engine.extract_fields(DOCUMENT_TEXT, SPEC, "key", "model")
    by_name = {f["field_name"]: f for f in fields}
    assert by_name["length_of_stay_days"]["reason"] == "not_returned_by_model"


def test_llm_failure_marks_all_fields_unextracted(monkeypatch):
    def _fake_chat_completion(api_key, model, messages, json_mode=False, timeout=30, temperature=0.0):
        return {"ok": False, "error_type": "TIMEOUT", "detail": "timed out"}
    monkeypatch.setattr(llm_client, "chat_completion", _fake_chat_completion)

    fields = extraction_engine.extract_fields(DOCUMENT_TEXT, SPEC, "key", "model")
    assert all(f["reason"] == "extraction_failed:TIMEOUT" for f in fields)
    assert all(f["verified"] is False for f in fields)


def test_malformed_response_marks_all_fields_unextracted(monkeypatch):
    monkeypatch.setattr(llm_client, "chat_completion", _stub_llm("not json at all"))
    fields = extraction_engine.extract_fields(DOCUMENT_TEXT, SPEC, "key", "model")
    assert all(f["reason"] == "extraction_failed:malformed_response" for f in fields)
