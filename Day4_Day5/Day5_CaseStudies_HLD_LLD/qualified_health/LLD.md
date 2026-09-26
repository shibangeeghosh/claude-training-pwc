# Qualified Health — Identifying Patients for Life-Saving Treatments — Low-Level Design

> Illustrative design exercise, companion to `HLD.md` in this folder.

## 1. Component Breakdown

- **`SourceConnector`** (one per source system) — pulls raw records (structured EHR export,
  scanned PDF, claims feed) and emits a normalized `RawRecordFragment`.
- **`ExtractionEngine`** — for unstructured fragments (scans, free text), runs extraction to
  produce structured `RecordFact` entries; structured sources pass through with light validation.
- **`EntityResolver`** — matches `RawRecordFragment`s across sources to a single `patient_id`
  using deterministic identifiers first (MRN, SSN-hash) then probabilistic matching
  (name+DOB+address) with a confidence score; low-confidence merges go to a manual resolution
  queue rather than auto-merging.
- **`UnifiedRecordStore`** — versioned store of `PatientRecord` per patient, append-only per
  update so a screening run can reference the exact record snapshot it evaluated.
- **`CriteriaRegistry`** — stores versioned `EligibilityCriteria` definitions authored by clinical
  teams.
- **`ScreeningEngine`** — the Claude-based component; for each `(PatientRecord, EligibilityCriteria)`
  pair, produces a `ScreeningResult` with match status, confidence, cited evidence, and gaps.
- **`RankingService`** — orders `ScreeningResult`s for a run by confidence and surfaces missing-
  evidence flags for clinician triage.
- **`ReviewQueueService`** — clinician-facing confirm/reject workflow over ranked results.
- **`OutreachHandoff`** — pushes confirmed candidates to the care-coordination system.

## 2. Data Model

```
PatientRecord {
  patient_id, version, updated_at,
  facts: [{ id, category, code, value, source_system, source_ref, effective_date }]
}

EligibilityCriteria {
  criteria_id, version, intervention_name, rules: [
    { rule_id, description, required_fact_categories: [string] }
  ],
  authored_by, effective_date
}

ScreeningResult {
  patient_id, patient_record_version, criteria_id, criteria_version,
  match_status: "match" | "no_match" | "insufficient_evidence",
  confidence: "high" | "medium" | "low",
  evidence: [{ rule_id, fact_id, rationale }],
  gaps: [string],           // never silently empty on insufficient_evidence
  screened_at
}

ReviewDecision {
  screening_result_id, reviewer, decision: "confirmed" | "rejected", reason, decided_at
}

AuditEvent {
  event_type: "ingested" | "entity_resolved" | "screened" | "reviewed" | "handed_off",
  patient_id, criteria_id, actor, timestamp, detail
}
```

## 3. API / Integration Contracts

```
POST /criteria
  body: EligibilityCriteria
  200: { criteria_id, version }

POST /screening-runs
  body: { criteria_id, criteria_version, population_filter }
  202: { run_id, status: "queued" }

GET /screening-runs/{run_id}/results?min_confidence=...
  200: ScreeningResult[]   // ranked

POST /screening-results/{id}/review
  body: { decision, reviewer, reason }
  200: ReviewDecision

POST /handoff
  body: { screening_result_ids: [] }
  200: { status: "sent", coordination_system_ref }
```

External source integration (illustrative, per source type):

```
GET /fhir/Patient?_lastUpdated=...        -> structured EHR sources
POST /document-extraction/scan            -> scanned/unstructured document sources
```

## 4. Sequence Flow (primary use case: run screening for one intervention)

1. Clinical team submits `EligibilityCriteria` via `POST /criteria`; `CriteriaRegistry` versions
   it.
2. Data engineering triggers ingestion: `SourceConnector`s pull from each connected system;
   `ExtractionEngine` structures unstructured fragments into `RecordFact`s.
3. `EntityResolver` matches fragments to `patient_id`s; ambiguous matches route to a manual
   resolution queue rather than auto-resolving.
4. `UnifiedRecordStore` persists the current `PatientRecord` version per patient.
5. `POST /screening-runs` starts a batch run: `ScreeningEngine` evaluates each in-scope
   `PatientRecord` against the specified `EligibilityCriteria` version, calling Claude with the
   record's relevant facts and the criteria's rules, requiring cited evidence per rule matched.
6. `RankingService` orders `ScreeningResult`s; results with `insufficient_evidence` are ranked
   separately and always carry non-empty `gaps`.
7. Clinician works the `ReviewQueueService` queue, confirming or rejecting each candidate.
8. Confirmed candidates go through `OutreachHandoff` to the care-coordination system;
   `AuditLogger` records the full ingested → screened → reviewed → handed-off chain per patient.

## 5. Error Handling & Failsafes

| Condition | Action |
|---|---|
| Source system unreachable during ingestion | Skip that source for this run, flag population as `partial_source_coverage`; never silently treat missing data as "not eligible" |
| Extraction confidence too low on a fragment | Fact excluded from `PatientRecord.facts`, not guessed; contributes to `gaps` at screening time if relevant to a rule |
| Entity resolution below confidence threshold | Routed to manual resolution queue; the fragment is not merged into any `patient_id` until resolved |
| Claude screening call fails for a patient | `ScreeningResult.match_status = "insufficient_evidence"`, gap = `"screening_call_failed"`; run continues for remaining patients rather than aborting the batch |
| Cited evidence in a `ScreeningResult` doesn't resolve to an actual `RecordFact` in that patient's record snapshot | Result discarded and re-flagged as `insufficient_evidence` — never shown as a confirmed match |
| Criteria updated mid-run | In-flight run continues against the version it started with; a new run is required to apply the updated criteria (screening results always name their `criteria_version`) |

## 6. Security & Compliance Notes

- Population-scale PHI processing is scoped to the minimum fact categories a given
  `EligibilityCriteria` actually requires — `ScreeningEngine` does not receive full records when a
  rule only needs specific fact categories.
- Access to `UnifiedRecordStore` and screening results is role-scoped to the clinical program team
  and reviewers assigned to that intervention, not organization-wide.
- `AuditEvent`s retain criteria version and evidence references (not raw PHI values beyond what's
  needed to reconstruct a decision) to support compliance review without duplicating the full
  record into the audit trail.
- Outreach hand-off is a distinct, separately consented step outside this system's boundary —
  `OutreachHandoff` only ever sends a patient reference and rationale summary, never triggers
  patient contact itself.
