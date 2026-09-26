import random

from src import document_classifier, exception_queue, extraction_engine, normalization_engine, pipeline

THRESHOLDS = {
    "classification_confidence_min": 0.60,
    "extraction_confidence_min": 0.60,
    "cross_check_sample_rate": 0.0,
    "rag_min_score": 0.15,
}

DISCHARGE_FIELD_NAMES = ["primary_diagnosis", "procedures_performed", "discharge_disposition", "length_of_stay_days"]


def _all_verified_extraction(source_text, spec, api_key, model):
    return [
        {
            "field_name": f["field_name"],
            "value": "4" if f["data_type"] == "integer" else "some value",
            "source_span": {"start": 0, "end": 10, "text_excerpt": "some value"},
            "extraction_confidence": 0.9,
            "verified": True,
            "reason": None,
        }
        for f in spec["fields"]
    ]


def _all_accepted_normalization(extracted_field, field_spec, thresholds, api_key, model, spec_version):
    coding_standard = field_spec.get("coding_standard")
    return {
        "field_name": extracted_field["field_name"],
        "normalized_value": extracted_field["value"],
        "coding_standard_code": "SOME_CODE" if coding_standard else None,
        "coding_standard": coding_standard,
        "method": "llm_disambiguated" if coding_standard else "passthrough",
        "coding_reference_version": "coding_reference_v1" if coding_standard else None,
        "spec_version": spec_version,
    }


def test_low_classification_confidence_short_circuits_before_extraction(monkeypatch):
    monkeypatch.setattr(
        document_classifier, "classify_document",
        lambda text, api_key, model: {"document_type": "discharge_summary", "confidence": 0.1, "method": "llm", "detail": None},
    )

    def _fail_extract(*a, **k):
        raise AssertionError("extraction must not run when the classification gate fails")
    monkeypatch.setattr(extraction_engine, "extract_fields", _fail_extract)

    result = pipeline.run_pipeline("doc-1", "irrelevant text", THRESHOLDS, "key", "model")

    assert result["status"] == "exception_pending"
    assert result["fields"] == []
    assert exception_queue.get_exception("doc-1:_classification") is not None


def test_full_pipeline_accepts_every_field_when_all_checks_pass(monkeypatch):
    monkeypatch.setattr(
        document_classifier, "classify_document",
        lambda text, api_key, model: {"document_type": "discharge_summary", "confidence": 0.95, "method": "llm", "detail": None},
    )
    monkeypatch.setattr(extraction_engine, "extract_fields", _all_verified_extraction)
    monkeypatch.setattr(normalization_engine, "normalize_field", _all_accepted_normalization)

    result = pipeline.run_pipeline("doc-2", "irrelevant text", THRESHOLDS, "key", "model")

    assert result["status"] == "complete"
    assert result["validation_summary"] == {"total_fields": 4, "accepted": 4, "exceptions": 0}
    assert {f["field_name"] for f in result["fields"]} == set(DISCHARGE_FIELD_NAMES)
    assert exception_queue.open_exceptions_for_document("doc-2") == []


def test_field_level_failure_routes_to_exception_queue(monkeypatch):
    monkeypatch.setattr(
        document_classifier, "classify_document",
        lambda text, api_key, model: {"document_type": "discharge_summary", "confidence": 0.95, "method": "llm", "detail": None},
    )
    monkeypatch.setattr(extraction_engine, "extract_fields", _all_verified_extraction)

    def _no_coding_match_for_diagnosis(extracted_field, field_spec, thresholds, api_key, model, spec_version):
        if field_spec["field_name"] == "primary_diagnosis":
            return {
                "field_name": "primary_diagnosis", "normalized_value": extracted_field["value"],
                "coding_standard_code": None, "coding_standard": "icd10",
                "method": "no_confident_coding_match", "coding_reference_version": "coding_reference_v1",
                "spec_version": spec_version,
            }
        return _all_accepted_normalization(extracted_field, field_spec, thresholds, api_key, model, spec_version)

    monkeypatch.setattr(normalization_engine, "normalize_field", _no_coding_match_for_diagnosis)

    result = pipeline.run_pipeline("doc-3", "irrelevant text", THRESHOLDS, "key", "model")

    assert result["validation_summary"]["exceptions"] == 1
    assert result["status"] == "exception_pending"
    exc = exception_queue.get_exception("doc-3:primary_diagnosis")
    assert exc is not None
    assert exc["validation_result"]["reason"] == "no_confident_coding_match"


def test_cross_check_disagreement_forces_exception_even_when_field_would_otherwise_pass(monkeypatch):
    monkeypatch.setattr(
        document_classifier, "classify_document",
        lambda text, api_key, model: {"document_type": "discharge_summary", "confidence": 0.95, "method": "llm", "detail": None},
    )

    call_count = {"n": 0}

    def _extract(source_text, spec, api_key, model):
        call_count["n"] += 1
        value = "first value" if call_count["n"] == 1 else "disagreeing value"
        return [
            {
                "field_name": f["field_name"],
                "value": value,
                "source_span": {"start": 0, "end": 10, "text_excerpt": value},
                "extraction_confidence": 0.9,
                "verified": True,
                "reason": None,
            }
            for f in spec["fields"]
        ]

    monkeypatch.setattr(extraction_engine, "extract_fields", _extract)
    monkeypatch.setattr(normalization_engine, "normalize_field", _all_accepted_normalization)
    monkeypatch.setattr(random, "random", lambda: 0.0)  # force every high-criticality field to be sampled

    always_sample_thresholds = dict(THRESHOLDS, cross_check_sample_rate=1.0)
    result = pipeline.run_pipeline("doc-4", "irrelevant text", always_sample_thresholds, "key", "model")

    by_name = {f["field_name"]: f for f in result["fields"]}
    assert by_name["primary_diagnosis"]["status"] == "exception"
    assert by_name["primary_diagnosis"]["reason"] == "cross_check_disagreement"
    assert by_name["procedures_performed"]["status"] == "exception"
    assert by_name["procedures_performed"]["reason"] == "cross_check_disagreement"
    assert call_count["n"] == 2
