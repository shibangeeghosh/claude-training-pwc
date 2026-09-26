from src import validation_engine

THRESHOLDS = {"classification_confidence_min": 0.60, "extraction_confidence_min": 0.60}

FIELD_SPEC = {"field_name": "primary_diagnosis", "data_type": "string", "coding_standard": "icd10"}
INT_FIELD_SPEC = {"field_name": "length_of_stay_days", "data_type": "integer", "coding_standard": None}
PASSTHROUGH_SPEC = {"field_name": "discharge_disposition", "data_type": "string", "coding_standard": None}


def _extracted(verified=True, confidence=0.9):
    return {"field_name": "primary_diagnosis", "value": "pneumonia", "verified": verified, "extraction_confidence": confidence}


def _normalized(value="Pneumonia, unspecified organism", code="J18.9"):
    return {"field_name": "primary_diagnosis", "normalized_value": value, "coding_standard_code": code}


def test_classification_gate_passes_above_threshold():
    assert validation_engine.check_classification_gate(0.75, THRESHOLDS) is True


def test_classification_gate_fails_below_threshold():
    assert validation_engine.check_classification_gate(0.4, THRESHOLDS) is False


def test_accepted_when_all_checks_pass():
    result = validation_engine.apply_validation_gate(_extracted(), _normalized(), FIELD_SPEC, THRESHOLDS, cross_check_pass=None)
    assert result["status"] == "accepted"
    assert result["reason"] is None


def test_low_extraction_confidence_forces_exception():
    result = validation_engine.apply_validation_gate(_extracted(confidence=0.2), _normalized(), FIELD_SPEC, THRESHOLDS)
    assert result["status"] == "exception"
    assert result["reason"] == "low_extraction_confidence"


def test_unverified_extraction_forces_exception_with_original_reason():
    extracted = {"field_name": "primary_diagnosis", "value": None, "verified": False, "extraction_confidence": 0.0, "reason": "unverifiable_source_span"}
    result = validation_engine.apply_validation_gate(extracted, _normalized(code=None, value=None), FIELD_SPEC, THRESHOLDS)
    assert result["status"] == "exception"
    assert result["reason"] == "unverifiable_source_span"


def test_missing_normalized_value_fails_rule_check():
    normalized = {"field_name": "discharge_disposition", "normalized_value": None, "coding_standard_code": None}
    result = validation_engine.apply_validation_gate(_extracted(), normalized, PASSTHROUGH_SPEC, THRESHOLDS)
    assert result["status"] == "exception"
    assert result["reason"] == "missing_value"


def test_non_integer_value_fails_rule_check_for_integer_field():
    extracted = {"field_name": "length_of_stay_days", "value": "several", "verified": True, "extraction_confidence": 0.9}
    normalized = {"field_name": "length_of_stay_days", "normalized_value": "several", "coding_standard_code": None}
    result = validation_engine.apply_validation_gate(extracted, normalized, INT_FIELD_SPEC, THRESHOLDS)
    assert result["status"] == "exception"
    assert result["reason"] == "not_integer_format"


def test_missing_coding_code_fails_rule_check_when_coding_standard_required():
    normalized = {"field_name": "primary_diagnosis", "normalized_value": "pneumonia", "coding_standard_code": None}
    result = validation_engine.apply_validation_gate(_extracted(), normalized, FIELD_SPEC, THRESHOLDS)
    assert result["status"] == "exception"
    assert result["reason"] == "no_confident_coding_match"


def test_cross_check_disagreement_overrides_otherwise_passing_checks():
    result = validation_engine.apply_validation_gate(_extracted(), _normalized(), FIELD_SPEC, THRESHOLDS, cross_check_pass=False)
    assert result["status"] == "exception"
    assert result["reason"] == "cross_check_disagreement"


def test_cross_check_disagreement_overrides_even_when_confidence_and_rule_would_also_fail():
    # Cross-check disagreement must win regardless of what the earlier checks concluded.
    result = validation_engine.apply_validation_gate(_extracted(confidence=0.1), _normalized(code=None), FIELD_SPEC, THRESHOLDS, cross_check_pass=False)
    assert result["status"] == "exception"
    assert result["reason"] == "cross_check_disagreement"


def test_cross_check_pass_true_does_not_block_acceptance():
    result = validation_engine.apply_validation_gate(_extracted(), _normalized(), FIELD_SPEC, THRESHOLDS, cross_check_pass=True)
    assert result["status"] == "accepted"
