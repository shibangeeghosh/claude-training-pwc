"""Composes the final per-document structured record from normalized fields and their
validation results. A document is "complete" only once every field is either accepted
or has had its exception resolved - never a batch-level all-or-nothing gate."""


def compose(document_id, document_type, classification, extracted_fields, normalized_fields, validation_results, spec_version):
    results_by_field = {v["field_name"]: v for v in validation_results}
    extracted_by_field = {e["field_name"]: e for e in extracted_fields}

    fields_output = []
    for norm in normalized_fields:
        name = norm["field_name"]
        validation = results_by_field.get(name) or {"status": "exception", "reason": "missing_validation_result"}
        extracted = extracted_by_field.get(name, {})
        source_span = extracted.get("source_span") or {}
        exception_id = f"{document_id}:{name}" if validation["status"] == "exception" else None

        fields_output.append(
            {
                "field_name": name,
                "normalized_value": norm["normalized_value"],
                "coding_standard": norm.get("coding_standard"),
                "coding_standard_code": norm.get("coding_standard_code"),
                "coding_reference_version": norm.get("coding_reference_version"),
                "spec_version": norm.get("spec_version"),
                "extraction_confidence": extracted.get("extraction_confidence"),
                "source_excerpt": source_span.get("text_excerpt"),
                "status": validation["status"],
                "reason": validation.get("reason"),
                "exception_id": exception_id,
            }
        )

    accepted_count = sum(1 for v in validation_results if v["status"] == "accepted")
    exception_count = len(validation_results) - accepted_count

    return {
        "document_id": document_id,
        "document_type": document_type,
        "spec_version": spec_version,
        "classification_confidence": classification["confidence"],
        "fields": fields_output,
        "validation_summary": {
            "total_fields": len(validation_results),
            "accepted": accepted_count,
            "exceptions": exception_count,
        },
        "status": "complete" if exception_count == 0 else "exception_pending",
    }
