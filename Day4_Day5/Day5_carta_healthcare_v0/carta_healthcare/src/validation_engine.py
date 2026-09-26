"""Ordered validation gate, the failsafe.py analog for this domain.

Per field: extraction-confidence check -> rule/format check -> sampled cross-check.
The cross-check is evaluated with override priority: if it disagrees, the field is
forced to `exception` regardless of what the earlier checks concluded (LLD S4/S5) -
disagreement is never masked by an otherwise-passing confidence/rule check.

Classification confidence is a separate, document-level gate (check_classification_gate)
run before extraction is even attempted - a document never gets extracted against a
guessed spec.
"""


def check_classification_gate(confidence, thresholds):
    """Returns True if the document may proceed to extraction."""
    return confidence >= thresholds["classification_confidence_min"]


def _check_rule(field_spec, normalized_field):
    value = normalized_field.get("normalized_value")
    if value is None or (isinstance(value, str) and not value.strip()):
        return False, "missing_value"

    if field_spec.get("data_type") == "integer":
        digits = "".join(ch for ch in str(value) if ch.isdigit())
        if not digits:
            return False, "not_integer_format"

    if field_spec.get("coding_standard") and normalized_field.get("coding_standard_code") is None:
        return False, "no_confident_coding_match"

    return True, None


def apply_validation_gate(extracted_field, normalized_field, field_spec, thresholds, cross_check_pass=None):
    """Returns a ValidationResult dict: {field_name, status, checks, reason}."""
    field_name = extracted_field["field_name"]

    extraction_confidence_pass = (
        bool(extracted_field.get("verified"))
        and extracted_field.get("extraction_confidence", 0.0) >= thresholds["extraction_confidence_min"]
    )
    rule_pass, rule_reason = _check_rule(field_spec, normalized_field)

    checks = {
        "extraction_confidence_pass": extraction_confidence_pass,
        "rule_pass": rule_pass,
        "cross_check_pass": cross_check_pass,
    }

    # Cross-check disagreement overrides everything else - checked first even though it
    # conceptually runs "last" in the ordered gate, precisely because it must win.
    if cross_check_pass is False:
        return {"field_name": field_name, "status": "exception", "checks": checks, "reason": "cross_check_disagreement"}

    if not extraction_confidence_pass:
        reason = "low_extraction_confidence" if extracted_field.get("verified") else (extracted_field.get("reason") or "unverifiable_source_span")
        return {"field_name": field_name, "status": "exception", "checks": checks, "reason": reason}

    if not rule_pass:
        return {"field_name": field_name, "status": "exception", "checks": checks, "reason": rule_reason}

    return {"field_name": field_name, "status": "accepted", "checks": checks, "reason": None}
