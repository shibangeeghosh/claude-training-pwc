# Banner Health — Reducing Physician Burnout at Scale — High-Level Design

> Illustrative design exercise. This document proposes a plausible architecture for an AI
> clinical-documentation assistant matching Banner Health's published problem statement; it is
> not a description of Banner Health's actual internal system.

## 1. Problem framing

Physicians spend a large share of every patient encounter on documentation — dictating notes,
summarizing prior visits, reconciling problem lists — rather than on the patient. The goal of this
system is to **draft clinical documentation and summarize patient records** so that a physician's
time-on-paperwork drops materially, without introducing errors into the medical record or removing
the physician's final authority over what gets signed.

Non-goal: the system never writes directly to the legal medical record. Every draft is a proposal
a clinician must review, edit, and sign before it becomes part of the chart.

## 2. Actors & Stakeholders

- **Physicians / clinicians** — primary users; review and sign drafted notes.
- **Care team (nurses, MAs)** — may review ambient-capture transcripts or pre-visit summaries.
- **Patients** — subject of the record; expect accuracy and privacy.
- **Compliance / HIM (Health Information Management)** — own documentation-integrity policy.
- **IT / EHR administrators** — own the EHR integration and uptime of the assistant.

## 3. Architecture overview

```
Encounter (in-room audio, or existing chart data)
      |
      v
Ingestion Layer  (ambient audio capture + transcription, or EHR record pull)
      |
      v
Context Assembler  (pulls relevant prior notes, problem list, meds, labs from EHR via FHIR)
      |
      v
Claude Drafting Service
  - Note drafting from transcript + context (SOAP / structured note format)
  - Record summarization (longitudinal history -> concise summary)
      |
      v
Grounding & Confidence Check  (every clinical claim traced to a transcript span or EHR field)
      |
      v
Clinician Review UI  (inline edit, accept, reject, regenerate)
      |
      v
EHR Write-back  (only on explicit physician sign-off)
      |
      v
Audit Log  (who drafted, who edited, who signed, timestamps)
```

## 4. Key Components

- **Ingestion Layer**: captures the encounter (ambient audio + speech-to-text, or a request to
  summarize an existing chart) and normalizes it into a structured transcript/record object.
- **Context Assembler**: retrieves the minimum necessary patient context from the EHR (via a
  FHIR-based read API) — active problems, medications, recent labs, last N visit notes — so the
  drafting step is grounded in the patient's actual record rather than the transcript alone.
- **Claude Drafting Service**: two related capabilities — (a) drafting a structured clinical note
  from the encounter transcript plus context, and (b) summarizing a longitudinal record for quick
  pre-visit or handoff review. Both are Claude-based generation calls constrained to the supplied
  context.
- **Grounding & Confidence Check**: a verification pass that requires each clinical assertion in
  the draft to be traceable to either a transcript span or an EHR field pulled in this session;
  unsupported assertions are flagged rather than silently included.
- **Clinician Review UI**: the mandatory human-in-the-loop surface — the physician edits or
  accepts the draft; nothing reaches the chart unedited-and-unreviewed.
- **EHR Write-back & Audit Layer**: commits the signed note back to the EHR and appends an
  immutable audit record of the drafting → editing → signing chain.

## 5. Data Flow

1. Encounter starts; ambient capture (or manual note-summarization request) begins.
2. Ingestion layer produces a transcript (or pulls the target record).
3. Context Assembler fetches relevant EHR context for the patient.
4. Claude Drafting Service produces a structured draft note or summary.
5. Grounding check flags any unsupported claim for the clinician's attention.
6. Physician reviews in the UI, edits as needed, signs.
7. Signed note is written back to the EHR; the full chain is logged to the audit trail.

## 6. Non-Functional Requirements

- **PHI handling**: all audio, transcripts, and drafts are PHI; encrypted in transit and at rest,
  access scoped to the treating clinician and authorized care team.
- **Latency**: draft should be available within the clinical workflow (target: seconds after
  encounter end, not next-day), since the value proposition is same-visit time savings.
- **Availability**: assistant downtime must degrade to the pre-existing manual documentation
  workflow, never block care delivery.
- **Auditability**: every draft, edit, and signature is attributable and timestamped (supports
  HIM and compliance review, and legal defensibility of the record).

## 7. Key Risks & Trade-offs

- **Hallucination / fabricated clinical detail** — mitigated by grounding-to-source verification
  and mandatory physician sign-off before any EHR write.
- **Ambient audio capture privacy** — requires explicit patient consent workflow and clear
  recording indicators; out of scope for this design but a hard dependency in deployment.
- **Physician trust / adoption** — a draft that requires heavy editing erodes the time-savings
  value; the design favors traceable, editable drafts over more "confident" but opaque ones.
- **EHR integration complexity** — FHIR coverage varies by legacy EHR; read-only context pulls are
  prioritized over write access to minimize integration risk.
