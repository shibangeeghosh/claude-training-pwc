import json

from src import llm_client, normalization_engine, rag_index

THRESHOLDS = {"rag_min_score": 0.15}

FIELD_SPEC = {"field_name": "primary_diagnosis", "coding_standard": "icd10"}
PASSTHROUGH_SPEC = {"field_name": "discharge_disposition", "coding_standard": None}

CANDIDATES = [
    {"code": "I21.3", "description": "ST elevation (STEMI) myocardial infarction of unspecified site", "score": 0.8},
    {"code": "J18.9", "description": "Pneumonia, unspecified organism", "score": 0.3},
]


def _verified_field(value="acute myocardial infarction"):
    return {"field_name": "primary_diagnosis", "value": value, "verified": True, "extraction_confidence": 0.9}


def test_passthrough_field_skips_rag_entirely(monkeypatch):
    def _fail_search(*a, **k):
        raise AssertionError("rag_index.search should not be called for a passthrough field")
    monkeypatch.setattr(rag_index, "search", _fail_search)

    extracted = {"field_name": "discharge_disposition", "value": "home", "verified": True, "extraction_confidence": 0.9}
    result = normalization_engine.normalize_field(extracted, PASSTHROUGH_SPEC, THRESHOLDS, "key", "model", 1)
    assert result["method"] == "passthrough"
    assert result["normalized_value"] == "home"
    assert result["coding_standard_code"] is None
    assert result["spec_version"] == 1


def test_every_method_records_spec_version(monkeypatch):
    # Provenance invariant: every NormalizedField must be traceable to the spec_version
    # that produced it, regardless of which of the four normalize_field outcomes it hit.
    monkeypatch.setattr(rag_index, "search", lambda *a, **k: CANDIDATES)
    monkeypatch.setattr(
        llm_client, "chat_completion",
        lambda api_key, model, messages, json_mode=False, timeout=30, temperature=0.0: {
            "ok": True, "content": json.dumps({"index": 0}),
        },
    )
    result = normalization_engine.normalize_field(_verified_field(), FIELD_SPEC, THRESHOLDS, "key", "model", 7)
    assert result["spec_version"] == 7


def test_unverified_extraction_skips_coding_lookup(monkeypatch):
    def _fail_search(*a, **k):
        raise AssertionError("rag_index.search should not be called for an unverified field")
    monkeypatch.setattr(rag_index, "search", _fail_search)

    extracted = {"field_name": "primary_diagnosis", "value": "pneumonia", "verified": False, "extraction_confidence": 0.0}
    result = normalization_engine.normalize_field(extracted, FIELD_SPEC, THRESHOLDS, "key", "model", 1)
    assert result["method"] == "coding_lookup_skipped_unverified_extraction"
    assert result["coding_standard_code"] is None


def test_low_top_score_yields_no_confident_coding_match(monkeypatch):
    monkeypatch.setattr(rag_index, "search", lambda *a, **k: [{"code": "X00", "description": "unrelated", "score": 0.05}])
    result = normalization_engine.normalize_field(_verified_field(), FIELD_SPEC, THRESHOLDS, "key", "model", 1)
    assert result["method"] == "no_confident_coding_match"
    assert result["coding_standard_code"] is None


def test_no_candidates_yields_no_confident_coding_match(monkeypatch):
    monkeypatch.setattr(rag_index, "search", lambda *a, **k: [])
    result = normalization_engine.normalize_field(_verified_field(), FIELD_SPEC, THRESHOLDS, "key", "model", 1)
    assert result["method"] == "no_confident_coding_match"


def test_llm_disambiguates_among_candidates_only(monkeypatch):
    monkeypatch.setattr(rag_index, "search", lambda *a, **k: CANDIDATES)
    monkeypatch.setattr(
        llm_client, "chat_completion",
        lambda api_key, model, messages, json_mode=False, timeout=30, temperature=0.0: {
            "ok": True, "content": json.dumps({"index": 0}),
        },
    )
    result = normalization_engine.normalize_field(_verified_field(), FIELD_SPEC, THRESHOLDS, "key", "model", 1)
    assert result["method"] == "llm_disambiguated"
    assert result["coding_standard_code"] == "I21.3"
    assert result["coding_reference_version"] == rag_index.CODING_REFERENCE_VERSION


def test_llm_out_of_range_index_falls_back_to_heuristic_top(monkeypatch):
    monkeypatch.setattr(rag_index, "search", lambda *a, **k: CANDIDATES)
    monkeypatch.setattr(
        llm_client, "chat_completion",
        lambda api_key, model, messages, json_mode=False, timeout=30, temperature=0.0: {
            "ok": True, "content": json.dumps({"index": 99}),
        },
    )
    result = normalization_engine.normalize_field(_verified_field(), FIELD_SPEC, THRESHOLDS, "key", "model", 1)
    assert result["method"] == "heuristic_top_candidate"
    assert result["coding_standard_code"] == "I21.3"


def test_llm_failure_falls_back_to_heuristic_top(monkeypatch):
    monkeypatch.setattr(rag_index, "search", lambda *a, **k: CANDIDATES)
    monkeypatch.setattr(
        llm_client, "chat_completion",
        lambda api_key, model, messages, json_mode=False, timeout=30, temperature=0.0: {
            "ok": False, "error_type": "RATE_LIMITED",
        },
    )
    result = normalization_engine.normalize_field(_verified_field(), FIELD_SPEC, THRESHOLDS, "key", "model", 1)
    assert result["method"] == "heuristic_top_candidate"
    assert result["coding_standard_code"] == "I21.3"


def test_llm_never_receives_an_unretrieved_candidate(monkeypatch):
    captured = {}

    def _fake_chat_completion(api_key, model, messages, json_mode=False, timeout=30, temperature=0.0):
        captured["prompt"] = messages[0]["content"]
        return {"ok": True, "content": json.dumps({"index": -1})}

    monkeypatch.setattr(rag_index, "search", lambda *a, **k: CANDIDATES)
    monkeypatch.setattr(llm_client, "chat_completion", _fake_chat_completion)

    result = normalization_engine.normalize_field(_verified_field(), FIELD_SPEC, THRESHOLDS, "key", "model", 1)
    assert "-1" in captured["prompt"] or "index" in captured["prompt"]
    assert result["method"] == "heuristic_top_candidate"
