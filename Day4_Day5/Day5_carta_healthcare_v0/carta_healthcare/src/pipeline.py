"""Orchestrates one document through the full pipeline: classify -> extract ->
normalize -> validate -> exception/accept -> audit. The review_loop.py analog.

Runs synchronously for this POC (one document per call) - real async batch queueing
(the LLD's POST /documents -> 202 -> GET /status contract) is a Phase B concern once
there's real document volume to justify it.
"""

import random

from src import (
    audit,
    document_classifier,
    exception_queue,
    extraction_engine,
    extraction_spec,
    normalization_engine,
    structured_output,
    validation_engine,
)


def _cross_check_sample(source_text, spec, extracted_fields, thresholds, api_key, model):
    """Decides which high-criticality fields to independently re-extract and compare.
    Returns {field_name: True|False|None} - None means not sampled this run."""
    high_crit_names = [f["field_name"] for f in spec["fields"] if f.get("criticality") == "high"]
    sampled_names = {n for n in high_crit_names if random.random() < thresholds["cross_check_sample_rate"]}
    if not sampled_names:
        return {}

    # Re-extract only the sampled fields, not the whole spec - the fields dropped here are
    # never read below, so extracting them would just be a wasted second LLM round-trip.
    sampled_spec = dict(spec, fields=[f for f in spec["fields"] if f["field_name"] in sampled_names])
    second_pass = extraction_engine.extract_fields(source_text, sampled_spec, api_key, model)
    second_by_name = {f["field_name"]: f for f in second_pass}
    original_by_name = {f["field_name"]: f for f in extracted_fields}

    results = {}
    for name in sampled_names:
        original = original_by_name.get(name)
        other = second_by_name.get(name)
        if not original or not other:
            results[name] = False
            continue
        if not original.get("verified") or not other.get("verified"):
            results[name] = False
            continue
        results[name] = str(original.get("value", "")).strip().lower() == str(other.get("value", "")).strip().lower()

    return results


def run_pipeline(document_id, source_text, thresholds, api_key, model, owner=None):
    """Classifies the document itself, then selects the matching ExtractionSpec -
    a document is never extracted against a caller-guessed spec. Returns a
    structured-output dict (see structured_output.compose).

    ``owner`` (typically the submitting abstractor's username) is recorded on every
    exception this run creates, so the exception queue can be scoped per-user."""
    classification = document_classifier.classify_document(source_text, api_key, model)
    audit.record_event("classified", document_id, detail=classification)

    if not validation_engine.check_classification_gate(classification["confidence"], thresholds):
        validation = {
            "field_name": "_classification",
            "status": "exception",
            "checks": {},
            "reason": "low_classification_confidence",
        }
        exception_queue.add_exception(document_id, "_classification", validation, assigned_to=owner)
        audit.record_event("exception_created", document_id, field_name="_classification", detail=validation)
        return {
            "document_id": document_id,
            "document_type": classification.get("document_type"),
            "spec_version": None,
            "classification_confidence": classification["confidence"],
            "fields": [],
            "validation_summary": {"total_fields": 0, "accepted": 0, "exceptions": 1},
            "status": "exception_pending",
        }

    spec = extraction_spec.load_spec(classification["document_type"])

    extracted_fields = extraction_engine.extract_fields(source_text, spec, api_key, model)
    audit.record_event("extracted", document_id, detail={"field_count": len(extracted_fields)})

    cross_check_results = _cross_check_sample(source_text, spec, extracted_fields, thresholds, api_key, model)
    extracted_by_name = {f["field_name"]: f for f in extracted_fields}

    normalized_fields = []
    validation_results = []
    for field_spec in spec["fields"]:
        name = field_spec["field_name"]
        extracted = extracted_by_name.get(name) or extraction_engine.unextracted_field(name, "not_returned_by_model")

        normalized = normalization_engine.normalize_field(extracted, field_spec, thresholds, api_key, model, spec["version"])
        normalized_fields.append(normalized)

        cross_check_pass = cross_check_results.get(name)
        validation = validation_engine.apply_validation_gate(
            extracted, normalized, field_spec, thresholds, cross_check_pass=cross_check_pass
        )
        validation_results.append(validation)

        if validation["status"] == "exception":
            exception_queue.add_exception(document_id, name, validation, assigned_to=owner)
            audit.record_event("exception_created", document_id, field_name=name, detail=validation)
        else:
            audit.record_event("validated", document_id, field_name=name, detail=validation)

    structured = structured_output.compose(
        document_id,
        classification["document_type"],
        classification,
        extracted_fields,
        normalized_fields,
        validation_results,
        spec["version"],
    )
    audit.record_event("structured_output_composed", document_id, detail={"status": structured["status"]})
    return structured
