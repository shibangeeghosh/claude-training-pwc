# Commure — Clinical Documentation Automation at Scale — Low-Level Design

> Illustrative design exercise, companion to `HLD.md` in this folder.

## 1. Component Breakdown

- **`TenantRouter`** — resolves an incoming encounter to a `facility_id`, loads that facility's
  `FacilityConfig` (specialty templates, EHR adapter type, policy flags).
- **`TranscriptionService`** — same role as in the single-facility design (see Banner Health
  LLD), but stateless/horizontally scaled and always invoked with an explicit `facility_id` for
  isolation.
- **`TenantScopedContextAssembler`** — fetches EHR context via the facility's specific EHR
  adapter; every query is parameterized by `facility_id` so a bug cannot cross-query another
  tenant's EHR connection.
- **`TemplateResolver`** — given `facility_id` + `specialty`, resolves the applicable
  `DocumentationTemplate` (section structure, required fields) from the shared template schema
  plus facility-level overrides.
- **`DraftingEngine`** — the Claude-based drafting call, parameterized by the resolved template
  (structurally identical role to Banner Health's `DraftingEngine`, generalized to accept a
  template rather than a fixed note format).
- **`GroundingValidator`** — same responsibility as in the single-facility design: every claim
  must cite a transcript/context source id.
- **`EhrAdapter`** (one implementation per supported EHR vendor/version) — normalizes
  write-back calls behind a common interface so the pipeline doesn't branch on EHR type.
- **`ObservabilityService`** — records per-encounter audit events and rolls up aggregate,
  cross-facility metrics (time-saved, acceptance rate) without exposing per-facility PHI in the
  aggregate view.

## 2. Data Model

```
FacilityConfig {
  facility_id, ehr_adapter_type, specialty_templates: [template_id],
  policy_flags: { require_dual_sign: bool, ... }
}

DocumentationTemplate {
  template_id, specialty, version,
  sections: [{ heading, required_fields: [string] }]
}

EncounterJob {
  encounter_id, facility_id, specialty, template_id,
  status: "transcribing" | "drafting" | "review" | "signed" | "written_back"
}

DraftNote {                       // same shape as Banner Health's DraftNote, plus tenant scoping
  encounter_id, facility_id, template_id,
  sections: [{ heading, body, source_refs: [id] }],
  unverified_claims: [string]
}

AggregateMetric {
  facility_id | "platform_total", metric: "hours_saved" | "acceptance_rate",
  period, value, computed_at
}

AuditEvent {
  event_type, encounter_id, facility_id, actor, timestamp, detail
}
```

## 3. API / Integration Contracts

```
POST /encounters
  body: { facility_id, specialty, transcript_ref | audio_ref }
  202: EncounterJob

GET /encounters/{id}
  200: EncounterJob (with current DraftNote if available)

POST /encounters/{id}/sign
  body: { final_sections, signed_by }
  200: { status: "written_back", ehr_document_id }

GET /facilities/{id}/config
  200: FacilityConfig

GET /metrics/aggregate?scope=platform|facility_id&period=...
  200: AggregateMetric[]
```

`EhrAdapter` interface (implemented per EHR vendor, not exposed externally):

```
adapter.fetch_context(facility_id, patient_id) -> PatientContext
adapter.write_document(facility_id, FinalNote) -> ehr_document_id
```

## 4. Sequence Flow (primary use case: one encounter, platform-scale path)

1. `POST /encounters` arrives with `facility_id`; `TenantRouter` loads `FacilityConfig` and
   rejects the request if `facility_id` is unknown or inactive (fails closed, not open).
2. `TranscriptionService` produces a transcript, tagged with `facility_id`.
3. `TemplateResolver` resolves the `DocumentationTemplate` for this facility + specialty.
4. `TenantScopedContextAssembler` fetches EHR context using this facility's `EhrAdapter` only.
5. `DraftingEngine` calls Claude with transcript + context + template, producing a `DraftNote`
   scoped to `facility_id` and `template_id`.
6. `GroundingValidator` checks source references exactly as in the single-facility design.
7. Clinician reviews/signs within that facility's embedded review layer; if
   `policy_flags.require_dual_sign` is set, a second sign-off is required before write-back.
8. `EhrAdapter.write_document()` commits via the facility-specific adapter.
9. `ObservabilityService` records the per-encounter `AuditEvent` chain and updates
   `AggregateMetric`s for both that `facility_id` and the platform total.

## 5. Error Handling & Failsafes

| Condition | Action |
|---|---|
| Unknown or inactive `facility_id` | Request rejected at `TenantRouter`; nothing downstream executes — fail closed to prevent misrouted tenant data |
| Wrong/missing `EhrAdapter` for a facility's configured vendor | Encounter held at `written_back`-pending state, flagged `adapter_unavailable`; never falls back to a different facility's adapter |
| Template resolution fails (no matching specialty template) | Draft generation blocked, `EncounterJob` flagged `template_missing`; administrator must configure before drafting proceeds, rather than falling back to a generic template silently |
| Claude drafting call fails | Same as Banner Health design: `status: draft_unavailable`, clinician falls back to manual documentation for that encounter only |
| `GroundingValidator` finds unresolved claims | Same as Banner Health design: surfaced in `unverified_claims`, never merged into the note body |
| Aggregate metrics computed from a facility mid-incident (e.g. partial outage) | That facility's `AggregateMetric` for the affected period is flagged `incomplete_period` rather than silently under-counted into the platform total |

## 6. Security & Compliance Notes

- Every pipeline stage takes `facility_id` as an explicit, required parameter — there is no
  ambient/global EHR context, which is the primary control against cross-tenant PHI leakage in a
  shared multi-tenant pipeline.
- `EhrAdapter` credentials/connections are provisioned per facility and never shared across
  `facility_id`s, even when two facilities use the same EHR vendor.
- `ObservabilityService`'s aggregate/platform-wide views expose only rolled-up metrics
  (`AggregateMetric`), never per-encounter PHI — cross-facility reporting cannot become a
  cross-tenant PHI access path.
- `AuditEvent`s are partitioned by `facility_id` for compliance review, matching how a real
  multi-tenant deployment would need to support per-facility (and potentially per-legal-entity)
  audit obligations independently.
