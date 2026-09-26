# Banner Health — Reducing Physician Burnout at Scale — Low-Level Design

> Illustrative design exercise, companion to `HLD.md` in this folder.

## 1. Component Breakdown

- **`AudioIngestService`** — receives ambient audio stream (or an uploaded recording), calls a
  speech-to-text provider, produces a timestamped `Transcript`. Also exposes a direct
  `summarize_record(patient_id, date_range)` entry point for the non-audio (chart-review) path.
- **`ContextAssembler`** — given `patient_id` and encounter time, queries the EHR FHIR API for
  `Condition`, `MedicationRequest`, `Observation` (labs/vitals), and the last N `DocumentReference`
  notes; returns a bounded `PatientContext` object (size-capped to control prompt length/cost).
- **`DraftingEngine`** — wraps the Claude call. Two modes: `draft_note(transcript, context)` and
  `summarize_history(context)`. Both return a structured object, not free text (see §2).
- **`GroundingValidator`** — regex/structural pass over the draft: every clinical assertion must
  carry a `source_ref` (a transcript span id or an EHR field id from `PatientContext`); assertions
  without a resolvable `source_ref` are moved to `unverified_claims` rather than `note_body`.
- **`ReviewSession`** — server-side state for one draft awaiting clinician action: holds the draft,
  the clinician's edits, and the final signed version.
- **`EhrWriteBackService`** — commits only the signed `FinalNote` to the EHR, never an unsigned
  draft.
- **`AuditLogger`** — appends one immutable event per state transition (drafted, edited, signed,
  written back).

## 2. Data Model

```
Transcript {
  id, patient_id, encounter_id, segments: [{ speaker, text, start_ts, end_ts, id }]
}

PatientContext {
  patient_id,
  conditions: [{ code, display, onset_date, id }],
  medications: [{ code, display, status, id }],
  observations: [{ code, display, value, effective_date, id }],
  prior_notes: [{ note_id, date, summary_excerpt }]
}

DraftNote {
  encounter_id,
  sections: [{ heading, body, source_refs: [transcript_span_id | context_field_id] }],
  unverified_claims: [string],   // never silently dropped
  model_used, generated_at
}

FinalNote {
  encounter_id, sections, signed_by, signed_at, edits_from_draft: [diff]
}

AuditEvent {
  event_type: "drafted" | "edited" | "signed" | "written_back",
  actor, encounter_id, timestamp, detail
}
```

## 3. API / Integration Contracts

Internal service API (illustrative):

```
POST /encounters/{id}/draft-note
  body: { transcript_id, patient_id }
  200: DraftNote

POST /encounters/{id}/summarize-history
  body: { patient_id, date_range }
  200: DraftNote  (sections = summary sections)

POST /encounters/{id}/sign
  body: { final_sections, signed_by }
  200: { status: "written_back", ehr_document_id }

GET /encounters/{id}/audit-trail
  200: AuditEvent[]
```

External EHR integration (read via FHIR, write via the EHR's document API):

```
GET  /fhir/Patient/{id}/$everything?since=...   -> feeds ContextAssembler
POST /fhir/DocumentReference                    -> EhrWriteBackService, signed notes only
```

## 4. Sequence Flow (primary use case: draft note from encounter)

1. Encounter audio stream opens → `AudioIngestService` produces `Transcript` incrementally.
2. On encounter end, `ContextAssembler.fetch(patient_id, encounter_time)` returns `PatientContext`.
3. `DraftingEngine.draft_note(transcript, context)` calls Claude with both inputs and a structured
   output schema (sections + inline source references required per clinical claim).
4. `GroundingValidator` checks every claim's `source_ref` resolves against the actual transcript
   segments and context fields fetched in steps 1–2; unresolved claims move to
   `unverified_claims`.
5. `DraftNote` is handed to `ReviewSession`; `AuditLogger` records `"drafted"`.
6. Clinician opens the review UI: sees `sections` inline, `unverified_claims` called out
   separately for explicit attention (not silently included in the note body).
7. Clinician edits and signs → `ReviewSession` produces `FinalNote`; `AuditLogger` records
   `"edited"` (if diffs are non-empty) then `"signed"`.
8. `EhrWriteBackService.write(FinalNote)` commits to the EHR; `AuditLogger` records
   `"written_back"` with the resulting `ehr_document_id`.

## 5. Error Handling & Failsafes

| Condition | Action |
|---|---|
| Speech-to-text/transcription fails or confidence too low | Fall back to manual note entry; log `"transcription_failed"`, no draft attempted |
| EHR context fetch fails or times out | Proceed with a context-degraded draft, but flag every section as `context_incomplete` so the clinician knows what wasn't checked |
| Claude call fails (timeout, error, malformed output) | Return `status: draft_unavailable`; clinician workflow falls back to manual documentation, nothing silently retried indefinitely |
| Grounding validator finds unresolved claims | Never dropped and never merged into `note_body` silently — always surfaced in `unverified_claims` for clinician attention |
| Clinician rejects draft outright | `AuditLogger` records `"rejected"`; no EHR write occurs |
| Attempted EHR write of an unsigned note | Rejected at the `EhrWriteBackService` boundary — signature is a required precondition, not just a UI convention |

## 6. Security & Compliance Notes

- Audio, transcripts, `PatientContext`, and all note content are PHI: encrypted in transit (TLS)
  and at rest; access scoped to the treating clinician/authorized care team via the existing EHR
  identity/authorization system (no separate credential store).
- `AuditLogger` output is append-only and retained per the organization's HIM/legal-hold policy;
  it is the record of who drafted, edited, and signed each note.
- No PHI is sent to any logging/telemetry sink outside the drafting pipeline; error logs capture
  event types and ids, not clinical content.
- Ambient audio is discarded (or retained only per an explicit, separately governed retention
  policy) after transcription — the transcript, not the raw audio, is the durable artifact feeding
  this pipeline.
