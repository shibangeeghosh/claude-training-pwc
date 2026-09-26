"""Maps an ExtractedField to a NormalizedField, grounding any coding-standard choice
in rag_index's retrieved candidates - the LLM may only pick among candidates that were
actually retrieved, it can never emit an unconstrained code guess. If nothing clears
the rag_min_score threshold, the field is preserved raw and flagged for exception
rather than silently coerced to a plausible-but-wrong code (LLD S5).
"""

from src import llm_client, rag_index


def _llm_pick_candidate(value_text, candidates, api_key, model):
    options = "\n".join(
        f"{i}: {c['description']} (code {c['code']})" for i, c in enumerate(candidates)
    )
    prompt = (
        f'Given the extracted clinical text: "{value_text}"\n'
        "Pick the single best-matching coding-standard candidate from this list, by index. "
        "If none are a good match, respond with -1.\n\n"
        f"{options}\n\n"
        'Respond with JSON only: {"index": <int>}.'
    )
    result = llm_client.chat_completion(
        api_key=api_key,
        model=model,
        messages=[{"role": "user", "content": prompt}],
        json_mode=True,
    )
    if not result["ok"]:
        return None

    parsed = llm_client.parse_json_content(result["content"])
    if not parsed or not isinstance(parsed.get("index"), int):
        return None

    idx = parsed["index"]
    if idx < 0 or idx >= len(candidates):
        return None
    return candidates[idx]


def normalize_field(extracted_field, field_spec, thresholds, api_key, model, spec_version):
    """Returns a NormalizedField dict for one ExtractedField."""
    field_name = extracted_field["field_name"]
    coding_standard = field_spec.get("coding_standard")

    if not coding_standard:
        return {
            "field_name": field_name,
            "normalized_value": extracted_field.get("value"),
            "coding_standard_code": None,
            "coding_standard": None,
            "method": "passthrough",
            "coding_reference_version": None,
            "spec_version": spec_version,
        }

    value_text = extracted_field.get("value")
    if not extracted_field.get("verified"):
        return {
            "field_name": field_name,
            "normalized_value": value_text,
            "coding_standard_code": None,
            "coding_standard": coding_standard,
            "method": "coding_lookup_skipped_unverified_extraction",
            "coding_reference_version": rag_index.CODING_REFERENCE_VERSION,
            "spec_version": spec_version,
        }
    if not value_text:
        return {
            "field_name": field_name,
            "normalized_value": value_text,
            "coding_standard_code": None,
            "coding_standard": coding_standard,
            "method": "coding_lookup_skipped_empty_value",
            "coding_reference_version": rag_index.CODING_REFERENCE_VERSION,
            "spec_version": spec_version,
        }

    candidates = rag_index.search(value_text, coding_standard, top_k=5)
    top = candidates[0] if candidates else None

    if not top or top["score"] < thresholds["rag_min_score"]:
        return {
            "field_name": field_name,
            "normalized_value": value_text,
            "coding_standard_code": None,
            "coding_standard": coding_standard,
            "method": "no_confident_coding_match",
            "coding_reference_version": rag_index.CODING_REFERENCE_VERSION,
            "spec_version": spec_version,
        }

    chosen = _llm_pick_candidate(value_text, candidates, api_key, model)
    method = "llm_disambiguated"
    if chosen is None:
        chosen = top
        method = "heuristic_top_candidate"

    return {
        "field_name": field_name,
        "normalized_value": chosen["description"],
        "coding_standard_code": chosen["code"],
        "coding_standard": coding_standard,
        "method": method,
        "coding_reference_version": rag_index.CODING_REFERENCE_VERSION,
        "spec_version": spec_version,
    }
