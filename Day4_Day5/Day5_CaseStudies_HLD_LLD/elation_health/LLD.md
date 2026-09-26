# Elation Health — 61% Less Time on Chart Review — Low-Level Design

> Illustrative design exercise, companion to `HLD.md` in this folder.

## 1. Component Breakdown

- **`ChartChangeDetector`** — computes a `chart_version_hash` per patient from the set of
  problems/meds/labs/notes; compares against the hash the last summary was generated from to
  decide whether regeneration is needed.
- **`SummarizationEngine`** — the Claude-based component; given the current chart data, produces
  a `ChartSummary` with prioritized sections and per-statement source citations.
- **`GroundingValidator`** — confirms every `SummaryStatement.source_ref` resolves to an actual
  chart entry id present in the data passed to the engine.
- **`SummaryCache`** — stores the latest valid `ChartSummary` per patient keyed by
  `chart_version_hash`, so unchanged charts don't regenerate on every view.
- **`SummaryPanelService`** — serves the summary (and drill-through source data) to the EHR UI.
- **`FeedbackCollector`** — records clinician feedback (`useful` / `inaccurate` + optional note)
  per summary instance for quality monitoring.

## 2. Data Model

```
ChartSnapshot {
  patient_id, chart_version_hash, generated_from: {
    problems: [{ id, code, display, onset_date }],
    medications: [{ id, code, display, status }],
    labs: [{ id, code, value, date }],
    notes: [{ id, date, excerpt }]
  }
}

ChartSummary {
  patient_id, chart_version_hash,
  sections: [{ heading, statements: [SummaryStatement] }],
  generated_at, model_used
}

SummaryStatement {
  text, source_ref: chart_entry_id, priority: "urgent" | "notable" | "routine"
}

FeedbackEvent {
  patient_id, chart_version_hash, clinician_id, rating: "useful" | "inaccurate",
  note, submitted_at
}
```

## 3. API / Integration Contracts

```
GET /patients/{id}/chart-summary
  200: ChartSummary (from cache if chart_version_hash unchanged, else freshly generated)

POST /patients/{id}/chart-summary/regenerate
  body: {}  // explicit clinician-triggered refresh, bypasses cache
  200: ChartSummary

POST /patients/{id}/chart-summary/feedback
  body: { chart_version_hash, rating, note }
  200: FeedbackEvent

GET /patients/{id}/chart-entries/{entry_id}
  200: { entry detail for drill-through from a SummaryStatement.source_ref }
```

This is a native EHR platform feature, so all of the above sit behind the platform's existing
patient-chart access-control layer — no separate auth model.

## 4. Sequence Flow (primary use case: clinician opens a patient chart)

1. Clinician opens the chart; UI calls `GET /patients/{id}/chart-summary`.
2. `ChartChangeDetector` computes the current `chart_version_hash` from live chart data.
3. If `SummaryCache` has a valid entry for that hash, it's returned immediately (fast path).
4. Otherwise, `SummarizationEngine` calls Claude with the current `ChartSnapshot`, requesting a
   structured summary with a `source_ref` per statement.
5. `GroundingValidator` checks every `source_ref` resolves against the snapshot passed in step 4;
   any statement that doesn't resolve is dropped (not shown with a fabricated citation).
6. `SummaryCache` stores the validated `ChartSummary` keyed by `chart_version_hash`.
7. `SummaryPanelService` renders the summary inline; each statement links to its source chart
   entry via `GET /patients/{id}/chart-entries/{entry_id}`.
8. Clinician optionally submits a `FeedbackEvent` via the panel.

## 5. Error Handling & Failsafes

| Condition | Action |
|---|---|
| Claude summarization call fails (timeout, error) | Panel falls back to the last valid cached summary if one exists (labeled as possibly stale), else shows "summary unavailable — review chart directly," never blocks chart access |
| A `SummaryStatement` fails grounding validation | Statement dropped from the rendered summary; not shown with an unresolved or fabricated citation |
| Chart data incomplete at generation time (e.g. a subsystem timeout mid-fetch) | Summary generation deferred/retried rather than generated from a partial snapshot; if forced, summary is explicitly flagged `partial_data` |
| Clinician marks summary `inaccurate` | Recorded via `FeedbackEvent`; does not auto-suppress future summaries, but feeds the quality-monitoring signal referenced in the HLD's feedback loop |
| Cache hit but chart was updated by a source the change-detector didn't observe (e.g. a race with a concurrent edit) | `chart_version_hash` mismatch on next check invalidates the stale cache entry — correctness depends on the hash covering all summarized data sources, not on perfect real-time invalidation |

## 6. Security & Compliance Notes

- No new PHI storage location is introduced: `ChartSnapshot` and `ChartSummary` data derive
  directly from the existing EHR chart and are governed by the platform's existing access-control
  and audit logging, not a parallel system.
- Summary generation calls include only the chart data needed for summarization (not the entire
  historical record indiscriminately) to bound PHI exposure per generation call.
- `FeedbackEvent`s are linked to `chart_version_hash` (not raw chart content) so quality
  monitoring can operate without duplicating PHI into a separate analytics store.
- Drill-through access to `chart-entries/{entry_id}` re-uses the same per-clinician access checks
  as the rest of the chart — a summary link cannot grant access beyond what the clinician already
  has on the underlying record.
