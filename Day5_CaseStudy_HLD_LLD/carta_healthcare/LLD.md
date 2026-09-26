# Carta Healthcare — 66% Faster Clinical Data Processing — Low-Level Design

> Illustrative design exercise, companion to `HLD.md` in this folder.

## 1. Component Breakdown

> POC build note: each abstract component below is implemented by a concrete module under
> `src/` in this directory. The mapping is exact (not just "inspired by") — see the module
> docstrings for implementation specifics.

- **`DocumentIngestService`** — accepts source documents (structured EHR export, PDF/scan, free
  text), OCRs scans where needed, produces a normalized `SourceDocument`. POC: `src/ingest.py`
  (loads pre-transcribed synthetic `.txt` samples only; OCR/FHIR ingestion are Phase B).
- **`DocumentClassifier`** — assigns a `document_type` (e.g. `discharge_summary`,
  `operative_note`) with a confidence score, used to select the right `ExtractionSpec`. POC:
  `src/document_classifier.py`.
- **`ExtractionEngine`** — the Claude-based component; given a `SourceDocument` and its
  `ExtractionSpec` (the target field list/data dictionary), returns `ExtractedField`s with source
  spans. POC: `src/extraction_engine.py` (Groq-backed; independently re-verifies every quoted
  source span against the raw text before trusting it).
- **`NormalizationEngine`** — maps raw extracted values to the target schema/coding standard
  (units, ICD-10/CPT/SNOMED where the spec requires it). POC: `src/normalization_engine.py`,
  grounded by `src/rag_index.py` (see "RAG Retrieval Contract" below).
- **`ValidationEngine`** — three checks per field: (a) confidence threshold, (b) rule-based sanity
  check (format/range against the data dictionary), (c) sampled dual-extraction cross-check for a
  configurable fraction of records. POC: `src/validation_engine.py`.
- **`ExceptionQueueService`** — holds fields that fail any validation check for human abstractor
  resolution. POC: `src/exception_queue.py` (in-process store for this POC; a durable store is a
  Phase B concern).
- **`AuditLogger`** — records extraction, validation outcome, and any human correction per field.
  POC: `src/audit.py` (append-only JSONL; never persists the LLM API key).

## 2. Data Model

```
SourceDocument { id, patient_ref, raw_content_ref, document_type, classification_confidence }

ExtractionSpec { spec_id, document_type, version, fields: [
  { field_name, data_type, expected_format, coding_standard, criticality: "high"|"standard" }
]}

ExtractedField {
  document_id, field_name, value, source_span: { start, end, text_excerpt },
  extraction_confidence, spec_version
}

NormalizedField {
  document_id, field_name, normalized_value, coding_standard_code, source_field_ref
}

ValidationResult {
  document_id, field_name,
  status: "accepted" | "exception",
  checks: { confidence_pass: bool, rule_pass: bool, cross_check_pass: bool | null },
  reason  // populated whenever status = "exception"
}

ExceptionItem {
  document_id, field_name, validation_result, assigned_to, resolution: "corrected" | "confirmed" | null
}

AuditEvent {
  event_type: "classified" | "extracted" | "normalized" | "validated" | "exception_resolved",
  document_id, field_name, actor, timestamp, detail
}
```

## 3. API / Integration Contracts

```
POST /documents
  body: { raw_content_ref, patient_ref }
  202: { document_id, status: "queued" }

GET /documents/{id}/status
  200: { status: "classified"|"extracted"|"validated"|"exception_pending"|"complete" }

GET /documents/{id}/structured-output
  200: { fields: NormalizedField[], source_citations: [...], validation_summary }

GET /exceptions?assigned_to=...
  200: ExceptionItem[]

POST /exceptions/{id}/resolve
  body: { corrected_value, resolver }
  200: ExceptionItem
```

External integration points:

```
POST /ocr/extract-text        -> DocumentIngestService, for scanned/PDF sources
GET  /fhir/DocumentReference  -> DocumentIngestService, for structured EHR-native sources
```

## 3a. LLM Provider Contract (POC build)

`src/llm_client.py` wraps Groq's OpenAI-compatible chat completions endpoint:

```
chat_completion(api_key, model, messages, json_mode=False, timeout=30, temperature=0.0)
  -> {"ok": True, "content": str}
  -> {"ok": False, "error_type": str, "detail": str}

error_type one of:
  MISSING_API_KEY | INVALID_API_KEY | RATE_LIMITED | TIMEOUT
  | NETWORK_ERROR | API_ERROR | INSUFFICIENT_CREDITS | MALFORMED_RESPONSE
```

`GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"`, default model
`openai/gpt-oss-120b`. The API key is always supplied by the caller from the active session — the
client never reads it from an environment variable or config file, so there is no path by which
it could be accidentally persisted at this layer.

## 3b. RAG Retrieval Contract (POC build)

`src/rag_index.py` builds a pure-stdlib TF-IDF + cosine-similarity index per coding standard
(`icd10`/`cpt`/`snomed`) over a curated reference corpus:

```
RagIndex.search(query_text, coding_standard, top_k=5)
  -> [{code, description, score}, ...]   # sorted by score desc
```

`NormalizationEngine` (`src/normalization_engine.py`) uses this as a hard constraint: an LLM
disambiguation call may only select among the returned candidates (by index, or -1 for "none
fit") — it can never emit a coding-standard code that wasn't retrieved. If the top candidate's
score is below `rag_min_score` (configured in `config/thresholds.yaml`), the field is preserved
raw with `method: "no_confident_coding_match"` and routed toward exception, rather than coerced.

## 3c. POC Route List

```
GET/POST /login, GET /logout
GET/POST /registry                     # pick registry/program -> session["registry_id"]
GET/POST /api-key                      # Groq key + model -> session only, never persisted
GET      /                             # pick a sample document
POST     /api/documents                # runs the pipeline synchronously for one document
GET      /api/documents/<id>           # structured output + validation summary
GET      /api/exceptions               # open ExceptionItems (optionally ?document_id=)
POST     /api/exceptions/<id>/resolve  # abstractor corrects/confirms a field
```

This POC runs the pipeline synchronously per document rather than the async
`202`/`GET .../status` contract in section 3 above — real async batch queueing is a Phase B
concern once there's production document volume to justify it.

## 4. Sequence Flow (primary use case: process one incoming document)

1. `POST /documents` submits a raw source document; `DocumentIngestService` normalizes it
   (OCR if needed) into a `SourceDocument`.
2. `DocumentClassifier` assigns `document_type` + confidence; if confidence is below threshold,
   the document routes directly to the exception queue for manual type assignment (never
   extracted against a guessed spec).
3. `ExtractionEngine` calls Claude with the `SourceDocument` and the matching `ExtractionSpec`,
   requiring a `source_span` per extracted field.
4. `NormalizationEngine` maps each `ExtractedField` to a `NormalizedField` per the spec's coding
   standard.
5. `ValidationEngine` runs all three checks per field; fields sampled for cross-check are
   independently re-extracted and compared.
6. Fields passing all checks become part of the accepted `structured-output`; fields failing any
   check become `ExceptionItem`s in `ExceptionQueueService`.
7. A human abstractor resolves each exception (`corrected` or `confirmed`); `AuditLogger` records
   the resolution.
8. Once all fields for a document are either accepted or resolved, the document's
   `structured-output` is finalized and available via `GET /documents/{id}/structured-output`.

## 5. Error Handling & Failsafes

| Condition | Action |
|---|---|
| OCR fails or produces low-confidence text | Document routed to exception queue at ingestion; extraction not attempted on unreliable text |
| Classification confidence below threshold | Manual type assignment required before extraction runs |
| Extraction call fails (timeout, error) | Field marked `exception`, reason `"extraction_failed"`; other fields in the same document continue processing independently |
| Normalization can't map a value to the coding standard | Field held as `exception` with raw value preserved (never silently coerced to a plausible-but-wrong code) |
| Cross-check sample disagrees with the primary extraction | Both values retained on the `ValidationResult`; field forced to `exception` regardless of confidence score |
| Human abstractor unavailable / queue backlog | Documents accumulate in `exception_pending` status; `structured-output` for that document is incomplete but individually-completed fields remain available, not blocked as a batch |

> POC build note: `src/validation_engine.py`'s `apply_validation_gate()` checks cross-check
> disagreement *first*, even though it's conceptually the last of the three checks to run — this
> is deliberate override priority, so a cross-check failure can never be masked by an
> otherwise-passing confidence or rule check.

## 6. Security & Compliance Notes

- Source documents and all extracted/normalized values are PHI; `raw_content_ref` and structured
  fields are access-scoped to the registries/teams authorized for that data use.
- `source_span` citations reference offsets into the original document, not copies of PHI text,
  where feasible, to limit duplication of sensitive content across the pipeline's data stores.
- `AuditEvent`s retain field-level provenance (who/what extracted, who corrected) to support the
  99%-accuracy claim being independently auditable, not just self-reported by the extraction
  engine.
- Coding-standard mapping tables (`NormalizationEngine`) are versioned; a document's
  `NormalizedField`s always record which mapping version produced them, so registry submissions
  remain reproducible under audit.
