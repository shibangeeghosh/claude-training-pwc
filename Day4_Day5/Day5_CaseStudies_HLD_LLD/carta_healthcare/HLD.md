# Carta Healthcare — 66% Faster Clinical Data Processing — High-Level Design

> Illustrative design exercise. This document proposes a plausible architecture for a clinical
> data extraction/structuring system matching Carta Healthcare's published problem statement; it
> is not a description of Carta Healthcare's actual internal system.

## 1. Problem framing

Registries, quality reporting, and research all depend on structured clinical data (diagnoses,
procedures, outcomes) — but source records arrive as a mix of structured EHR fields, scanned
documents, and free-text notes. Manual abstraction is slow and inconsistent. The goal is to
**automate extraction and structuring of clinical data from health records while maintaining 99%
accuracy**, i.e. speed and accuracy are both hard requirements, not a trade-off between them.

Non-goal: the system does not make clinical judgments about the data it structures; it extracts
and structures what the source record states, with every field traceable back to its source.

## 2. Actors & Stakeholders

- **Clinical data abstractors** — currently do this work manually; become reviewers/exception-
  handlers rather than full-time transcribers.
- **Registry / quality-reporting teams** — consume the structured output for submissions.
- **Researchers** — consume structured data for study cohorts.
- **Compliance / data governance** — own accuracy validation and audit requirements (99% accuracy
  is a governance-relevant SLA, not just a product metric).

## 3. Architecture overview

```
Source Documents (EHR structured fields, scanned charts, free-text notes, PDFs)
      |
      v
Document Ingestion & Classification  (identify document type, route to the right extraction path)
      |
      v
Claude-Based Extraction Engine
  (extracts target fields per registry/data-dictionary spec, with source-span citations)
      |
      v
Structuring & Normalization  (map extracted values to target schema / coding standards)
      |
      v
Accuracy Validation Layer  (confidence scoring, dual-extraction cross-check on a sample, rules checks)
      |
      v
Exception Queue  (low-confidence or failed-validation fields routed to human abstractor)
      |
      v
Structured Output  (registry/schema-conformant record, fully source-cited)
      |
      v
Audit Log  (extraction confidence, validation outcome, human corrections)
```

## 4. Key Components

- **Document Ingestion & Classification**: normalizes heterogeneous source documents and
  classifies document type, so extraction is routed against the right field spec (e.g. a
  discharge summary vs. an operative note need different target fields).
- **Claude-Based Extraction Engine**: extracts target fields per a registry or data-dictionary
  specification, citing the exact source span for each extracted value.
- **Structuring & Normalization**: maps raw extracted values into the target schema (units,
  coding standards like ICD-10/CPT/SNOMED where applicable).
- **Accuracy Validation Layer**: the component that makes the 99%-accuracy claim credible —
  combines model confidence, rule-based sanity checks (e.g. value in expected range/format), and
  a sampled dual-extraction cross-check to estimate and enforce accuracy.
- **Exception Queue**: anything failing validation or below a confidence threshold routes to a
  human abstractor instead of being auto-accepted.
- **Structured Output & Audit Log**: the final, schema-conformant record with full source
  traceability and a log of every validation/correction event.
- **LLM Provider & Model Configuration**: the POC build's Claude-Based Extraction Engine calls
  Groq's OpenAI-compatible chat completions API, defaulting to `openai/gpt-oss-120b` (model is
  user-selectable at runtime). The API key is supplied through the UI per session and is never
  persisted to disk, config, or the audit log — it lives only in the server session and the
  outbound request header for the duration of that session.
- **RAG-Grounded Normalization**: to keep coding-standard mapping trustworthy rather than a raw
  LLM guess, Structuring & Normalization retrieves candidate ICD-10/CPT/SNOMED entries from a
  curated reference corpus (TF-IDF/cosine retrieval) and constrains the model to pick among those
  retrieved candidates only. If no candidate clears a minimum relevance score, the field is
  preserved raw and routed to the Exception Queue rather than coerced to a plausible-but-wrong
  code — this is what makes the 99%-accuracy claim credible for the coding step specifically, not
  just the extraction step.

## 5. Data Flow

1. Source documents ingested and classified by type.
2. Extraction engine pulls target fields per the relevant spec, with source citations.
3. Structuring/normalization maps values to the target schema.
4. Validation layer scores confidence and runs sanity/cross-checks.
5. Anything under threshold routes to the exception queue for human review.
6. Final structured record is emitted with full audit trail.

## 6. Non-Functional Requirements

- **Accuracy**: 99% field-level accuracy is a hard requirement — the validation layer, not the
  extraction model alone, is what the system is accountable to.
- **Throughput**: designed for batch/high-volume processing of documents (the "66% faster" claim
  implies large volume relative to a manual baseline), not single-document interactive latency.
- **Traceability**: every structured field must cite its source span, both for accuracy auditing
  and for downstream registry/compliance requirements.
- **PHI handling**: source documents and extracted data are PHI; access scoped to the
  registries/teams authorized to receive that structured output. In the POC build, all sample and
  reference data is synthetic and clearly labeled as such, with a repository guard that
  independently blocks any write that looks PHI-shaped (SSN/MRN/DOB/name patterns) into the
  sample or reference data directories — a second enforcement layer, not a substitute for real
  PHI-handling controls in a production deployment.

## 7. Key Risks & Trade-offs

- **Extraction errors that pass validation** — the accuracy layer is probabilistic, not perfect;
  the design accepts a sampled cross-check (not 100% dual-extraction) as a cost/accuracy
  trade-off, with the sampling rate tunable per data-dictionary field criticality.
- **Document classification errors** — misrouting a document to the wrong extraction spec
  corrupts downstream fields; classification confidence is itself checked before extraction
  proceeds.
- **Coding standard drift** (e.g. ICD-10 code set updates) — normalization mappings must be
  versioned so historical records remain correctly interpretable.
- **Over-reliance on automation** — the exception queue is designed to be a real, actively-worked
  queue, not a rubber-stamp, since it's the last line of defense for the accuracy SLA.
