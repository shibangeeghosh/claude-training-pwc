from src import structured_output

CLASSIFICATION = {"document_type": "discharge_summary", "confidence": 0.9}

EXTRACTED_FIELDS = [
    {
        "field_name": "primary_diagnosis",
        "value": "pneumonia",
        "source_span": {"start": 0, "end": 9, "text_excerpt": "pneumonia"},
        "extraction_confidence": 0.9,
        "verified": True,
        "reason": None,
    },
    {
        "field_name": "discharge_disposition",
        "value": None,
        "source_span": None,
        "extraction_confidence": 0.0,
        "verified": False,
        "reason": "unverifiable_source_span",
    },
]

NORMALIZED_FIELDS = [
    {"field_name": "primary_diagnosis", "normalized_value": "Pneumonia, unspecified organism", "coding_standard": "icd10", "coding_standard_code": "J18.9", "coding_reference_version": "coding_reference_v1", "spec_version": 1},
    {"field_name": "discharge_disposition", "normalized_value": None, "coding_standard": None, "coding_standard_code": None, "coding_reference_version": None, "spec_version": 1},
]

VALIDATION_RESULTS = [
    {"field_name": "primary_diagnosis", "status": "accepted", "checks": {}, "reason": None},
    {"field_name": "discharge_disposition", "status": "exception", "checks": {}, "reason": "unverifiable_source_span"},
]


def test_compose_builds_per_field_output_with_provenance():
    result = structured_output.compose("doc-1", "discharge_summary", CLASSIFICATION, EXTRACTED_FIELDS, NORMALIZED_FIELDS, VALIDATION_RESULTS, spec_version=1)

    by_name = {f["field_name"]: f for f in result["fields"]}
    accepted = by_name["primary_diagnosis"]
    assert accepted["status"] == "accepted"
    assert accepted["source_excerpt"] == "pneumonia"
    assert accepted["coding_standard_code"] == "J18.9"
    assert accepted["coding_reference_version"] == "coding_reference_v1"
    assert accepted["spec_version"] == 1
    assert accepted["exception_id"] is None


def test_compose_sets_exception_id_only_for_exceptions():
    result = structured_output.compose("doc-1", "discharge_summary", CLASSIFICATION, EXTRACTED_FIELDS, NORMALIZED_FIELDS, VALIDATION_RESULTS, spec_version=1)
    by_name = {f["field_name"]: f for f in result["fields"]}
    assert by_name["discharge_disposition"]["exception_id"] == "doc-1:discharge_disposition"


def test_compose_status_is_exception_pending_when_any_field_has_exception():
    result = structured_output.compose("doc-1", "discharge_summary", CLASSIFICATION, EXTRACTED_FIELDS, NORMALIZED_FIELDS, VALIDATION_RESULTS, spec_version=1)
    assert result["status"] == "exception_pending"
    assert result["validation_summary"] == {"total_fields": 2, "accepted": 1, "exceptions": 1}


def test_compose_status_is_complete_when_all_fields_accepted():
    all_accepted = [{"field_name": "primary_diagnosis", "status": "accepted", "checks": {}, "reason": None}]
    normalized = [NORMALIZED_FIELDS[0]]
    extracted = [EXTRACTED_FIELDS[0]]
    result = structured_output.compose("doc-1", "discharge_summary", CLASSIFICATION, extracted, normalized, all_accepted, spec_version=1)
    assert result["status"] == "complete"
    assert result["validation_summary"]["exceptions"] == 0
