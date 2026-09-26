"""Extracts per-field values with a source_span, then independently verifies each
quoted excerpt actually occurs in the raw document text before trusting it.

This is the grounding.py analog for this domain: "verify, don't trust." A field whose
quoted excerpt can't be found verbatim in the source is never treated as fact - it's
marked unverified and validation_engine routes it to an exception.
"""

from src import llm_client


def _build_prompt(document_text, fields_spec):
    field_lines = "\n".join(f"- {f['field_name']} ({f['data_type']})" for f in fields_spec)
    return (
        "Extract the following fields from the clinical document below. For each field, "
        "return the extracted value AND the exact verbatim quote copied from the document "
        "that supports it (do not paraphrase the quote), and a confidence score from 0.0 to 1.0.\n\n"
        f"Fields to extract:\n{field_lines}\n\n"
        "Respond with JSON only, in this shape:\n"
        '{"fields": [{"field_name": "...", "value": "...", "quote": "...", "confidence": 0.0}]}\n\n'
        f"DOCUMENT:\n{document_text}"
    )


def unextracted_field(field_name, reason):
    return {
        "field_name": field_name,
        "value": None,
        "source_span": None,
        "extraction_confidence": 0.0,
        "verified": False,
        "reason": reason,
    }


def extract_fields(document_text, spec, api_key, model):
    """Returns a list of ExtractedField dicts, one per field in spec["fields"]."""
    fields_spec = spec["fields"]
    prompt = _build_prompt(document_text, fields_spec)

    result = llm_client.chat_completion(
        api_key=api_key,
        model=model,
        messages=[{"role": "user", "content": prompt}],
        json_mode=True,
    )

    if not result["ok"]:
        return [unextracted_field(f["field_name"], f"extraction_failed:{result['error_type']}") for f in fields_spec]

    parsed = llm_client.parse_json_content(result["content"])
    if not parsed or not isinstance(parsed.get("fields"), list):
        return [unextracted_field(f["field_name"], "extraction_failed:malformed_response") for f in fields_spec]

    returned_by_name = {
        item.get("field_name"): item for item in parsed["fields"] if isinstance(item, dict)
    }

    extracted = []
    for field_spec in fields_spec:
        name = field_spec["field_name"]
        raw = returned_by_name.get(name)
        if not raw:
            extracted.append(unextracted_field(name, "not_returned_by_model"))
            continue

        quote = (raw.get("quote") or "").strip()
        start = document_text.find(quote) if quote else -1
        verified = start != -1

        if not verified:
            extracted.append(unextracted_field(name, "unverifiable_source_span"))
            continue

        confidence = raw.get("confidence")
        if not isinstance(confidence, (int, float)):
            confidence = 0.5

        extracted.append(
            {
                "field_name": name,
                "value": raw.get("value"),
                "source_span": {"start": start, "end": start + len(quote), "text_excerpt": quote},
                "extraction_confidence": float(confidence),
                "verified": True,
                "reason": None,
            }
        )

    return extracted
