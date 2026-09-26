# Elation Health — 61% Less Time on Chart Review — High-Level Design

> Illustrative design exercise. This document proposes a plausible architecture for an EHR-
> embedded chart-review assistant matching Elation Health's published problem statement; it is
> not a description of Elation Health's actual internal system.

## 1. Problem framing

Before (and between) visits, primary-care clinicians must review a patient's chart — problem
list, meds, labs, prior notes — to prepare for the encounter. This review is repetitive and
time-consuming, especially for patients with long histories. The goal is to **reduce chart-review
and documentation burden for clinicians** by surfacing a concise, trustworthy pre-visit summary
directly inside the EHR platform's existing workflow.

Non-goal: the summary is a reading aid, not a replacement for the chart — the clinician can always
drill into the full record, and the summary never substitutes for clinical judgment during the
visit.

## 2. Actors & Stakeholders

- **Primary-care clinicians** — primary users, reviewing summaries pre-visit and during
  documentation.
- **Care team / MAs** — may also use summaries for rooming/prep.
- **Patients** — subject of the summarized record.
- **EHR platform team (Elation itself)** — owns the summary feature as part of the core product,
  not a bolt-on integration.

## 3. Architecture overview

```
Patient Chart (native EHR data: problems, meds, labs, encounters, notes)
      |
      v
Chart Change Detector  (identifies what's new/changed since the summary was last generated)
      |
      v
Claude-Based Summarization Service
  (produces a structured, prioritized pre-visit / chart-review summary)
      |
      v
Grounding Check  (every summary statement traced to a specific chart entry)
      |
      v
In-EHR Summary Panel  (surfaced natively in the clinician's existing workflow, with drill-through)
      |
      v
Feedback Loop  (clinician marks summary useful/inaccurate -> informs prompt/quality monitoring)
```

## 4. Key Components

- **Chart Change Detector**: avoids regenerating a full summary on every chart view — tracks what
  changed since the last summary for a given patient, so summaries stay current without wasted
  regeneration.
- **Claude-Based Summarization Service**: produces a structured summary (e.g. active problems,
  recent changes, care gaps, upcoming items) prioritized for pre-visit relevance rather than a
  flat chronological recap.
- **Grounding Check**: verifies each summary statement maps to an actual chart entry, since the
  summary is meant to reduce chart review — a clinician must be able to trust it without
  re-reading the whole chart to verify it.
- **In-EHR Summary Panel**: the delivery surface is native to the existing EHR UI (this is an
  EHR platform's own feature, not an external add-on) with drill-through to the source entry for
  any summary line.
- **Feedback Loop**: lightweight clinician feedback (useful / inaccurate) on summary quality,
  feeding ongoing quality monitoring — not a retraining pipeline in this design's scope.

## 5. Data Flow

1. Clinician opens a patient's chart or is preparing for an upcoming visit.
2. Chart Change Detector determines whether a fresh summary is needed.
3. If needed, Summarization Service generates a structured summary from current chart data.
4. Grounding Check verifies each statement against the source chart entries.
5. Summary Panel renders inline in the existing chart-review workflow, with drill-through links.
6. Clinician optionally flags the summary's usefulness/accuracy, feeding quality monitoring.

## 6. Non-Functional Requirements

- **Latency**: summary must render fast enough to fit into a clinician's per-patient prep time
  (target: near-instant on chart open, using cached summaries where the chart hasn't changed).
- **Trustworthiness**: since the entire value proposition is *not* re-reading the full chart,
  ungrounded or inaccurate summary content is a critical-severity defect, not a minor one.
- **Native integration**: must feel like a core EHR feature (consistent UI, permissions, and
  audit model with the rest of the platform), not a separate tool.
- **PHI handling**: summaries and the underlying chart data follow the EHR platform's existing
  access-control and audit model — no new PHI storage location.

## 7. Key Risks & Trade-offs

- **Summary staleness** — mitigated by the Chart Change Detector regenerating on meaningful
  change rather than a fixed schedule, trading some regeneration cost for freshness.
- **Over-summarization hiding a critical detail** — the design keeps drill-through to source
  entries one click away, and biases the summary format toward flagging (not omitting) anything
  time-sensitive (e.g. an abnormal recent lab).
- **Clinician over-trust** — a highly accurate summary can reduce vigilance; framing the panel as
  a "review aid" with visible source citations (not an authoritative replacement) is a deliberate
  UX choice, not just a legal disclaimer.
- **Feature scope creep into documentation** — this design keeps chart-review summarization
  separate from note-drafting (a related but distinct capability, see the Banner Health case
  study in this same set) to keep the trust boundary narrow and well-tested.
