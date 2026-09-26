# Qualified Health — Identifying Patients for Life-Saving Treatments — High-Level Design

> Illustrative design exercise. This document proposes a plausible architecture for a
> population-scale patient-identification system matching Qualified Health's published problem
> statement; it is not a description of Qualified Health's actual internal system.

## 1. Problem framing

A health system knows, in aggregate, that some evidence-based intervention (e.g. a genetic
screening, a preventive therapy) saves lives — but the patients who qualify are scattered across
fragmented, inconsistently structured records (multiple EHRs, scanned documents, free-text notes).
The goal is to **screen large patient populations against these fragmented records and surface
candidates** for a clinical team to act on, at a scale and consistency manual chart review cannot
match.

Non-goal: the system does not make a treatment decision or contact patients directly. It produces
a ranked, explainable candidate list for clinician review and outreach.

## 2. Actors & Stakeholders

- **Clinical program teams** — define the eligibility criteria for an intervention and review
  surfaced candidates.
- **Population health / care coordinators** — action the reviewed list (outreach, scheduling).
- **Patients** — ultimate beneficiaries; also the subject of sensitive record analysis at scale.
- **Compliance / privacy office** — govern population-level PHI processing and outreach consent.
- **IT/data engineering** — own the multi-source record ingestion pipeline.

## 3. Architecture overview

```
Multiple Source Systems (EHR A, EHR B, scanned docs, claims data, registries)
      |
      v
Ingestion & Normalization Layer  (structured extraction + entity resolution across sources)
      |
      v
Patient Record Store  (unified, de-duplicated longitudinal record per patient)
      |
      v
Criteria Definition  (clinical team encodes eligibility criteria for a given intervention)
      |
      v
Claude-Based Screening Engine
  (reads each unified record against criteria; produces match + rationale + evidence citations)
      |
      v
Ranking & Explainability Layer  (confidence score, cited evidence spans, uncertainty flags)
      |
      v
Clinical Review Queue  (clinician confirms / rejects each candidate)
      |
      v
Outreach Hand-off  (confirmed candidates -> care coordination system)
      |
      v
Audit Log  (criteria version, screened population, decisions, reviewer actions)
```

## 4. Key Components

- **Ingestion & Normalization Layer**: pulls records from multiple, heterogeneous source systems,
  extracts structured fields from unstructured text/scans, and resolves patient identity across
  sources into one unified record.
- **Patient Record Store**: the canonical longitudinal record per patient, versioned so screening
  results can be traced to the record state at screening time.
- **Criteria Definition**: a structured, versioned representation of an intervention's eligibility
  rules, authored by the clinical program team (not hard-coded per intervention).
- **Claude-Based Screening Engine**: evaluates each patient's unified record against the active
  criteria, producing a match determination with an evidence-cited rationale — not a bare
  yes/no.
- **Ranking & Explainability Layer**: orders candidates by confidence and surfaces exactly which
  evidence supports (or is missing for) each match, so clinicians can review efficiently at scale.
- **Clinical Review Queue & Outreach Hand-off**: human clinicians confirm each candidate before
  any outreach occurs; confirmed candidates flow to the care coordination system.

## 5. Data Flow

1. Records ingested and normalized from all connected source systems into the unified store.
2. Clinical team defines/updates criteria for a target intervention.
3. Screening engine evaluates the eligible population against current criteria.
4. Each match is ranked and annotated with cited evidence and any uncertainty.
5. Clinician reviews the queue, confirms or rejects each candidate.
6. Confirmed candidates are handed off for outreach; every step is logged.

## 6. Non-Functional Requirements

- **Scale**: designed to screen large populations (thousands–millions of records) per criteria
  run, not single-patient lookups — batch-oriented processing, not synchronous request/response.
- **PHI handling**: population-scale PHI processing requires strict access scoping and minimum-
  necessary data exposure per screening run.
- **Explainability**: every match must be traceable to specific evidence in the record — a bare
  score without rationale is not an acceptable output, since clinicians must be able to audit it.
- **Auditability**: criteria versions and screening runs are immutable once executed, so a later
  question ("why was patient X included/excluded") is always answerable.

## 7. Key Risks & Trade-offs

- **False negatives (missed candidates)** are clinically costly — the design favors recall-
  oriented screening with clinician review as the precision filter, rather than an overly
  conservative auto-filter.
- **Entity resolution errors across sources** (wrongly merging or splitting patient identities)
  directly corrupt screening results — this is treated as a first-class risk, not an
  implementation detail, and is designed with confidence-scored matching plus a manual
  resolution path for ambiguous cases.
- **Criteria drift** — clinical guidelines change; criteria are versioned so past screening runs
  remain interpretable under the rules that were active at the time.
- **Consent/outreach boundary** — the system stops at "candidate for clinician review"; patient
  contact is explicitly outside its scope to avoid conflating screening with consent-bearing
  outreach.
