# Commure — Clinical Documentation Automation at Scale — High-Level Design

> Illustrative design exercise. This document proposes a plausible architecture for a large-scale
> clinical documentation automation platform matching Commure's published problem statement; it
> is not a description of Commure's actual internal system.

## 1. Problem framing

Beyond a single physician's documentation burden (see the Banner Health case study in this same
set), a health system operating at scale needs clinical documentation generated consistently
across many facilities, specialties, and encounter types, directly from the patient encounter
itself. The goal is to **automate clinical documentation generation directly from patient
encounters, saving clinicians millions of hours** in aggregate — this is a platform/scale problem
(multi-tenant, multi-specialty, high encounter volume) as much as a per-encounter accuracy
problem.

Non-goal: the platform does not replace facility- or specialty-specific documentation policy; it
generates drafts conforming to configurable templates/policies per deployment.

## 2. Actors & Stakeholders

- **Clinicians across many facilities/specialties** — end users, with varying documentation
  templates and workflows.
- **Health system administrators** — configure documentation policy/templates per facility or
  specialty and monitor platform-wide adoption/time-savings metrics.
- **IT/integration teams** — connect the platform to many different EHR instances at scale.
- **Compliance/legal (multi-tenant)** — govern PHI handling across facilities, potentially across
  legal entities.

## 3. Architecture overview

```
Many Encounters, Many Facilities/Specialties (ambient audio + EHR context, at volume)
      |
      v
Multi-Tenant Ingestion Layer  (per-facility routing, specialty-aware template selection)
      |
      v
Encounter Processing Pipeline (per-encounter, horizontally scaled)
  - Transcription
  - Context assembly (facility/specialty-scoped EHR read)
  - Claude-based drafting against the applicable template/policy
  - Grounding & confidence check
      |
      v
Clinician Review Layer  (per-facility EHR-embedded review UI)
      |
      v
EHR Write-back  (per-facility EHR integration, only on sign-off)
      |
      v
Platform Observability & Audit  (per-facility + aggregate: volume, accuracy, time-saved metrics)
```

## 4. Key Components

- **Multi-Tenant Ingestion Layer**: routes each incoming encounter to the correct facility
  configuration and specialty-specific documentation template — the platform-scale analog of the
  single-deployment ingestion step in the Banner Health design.
- **Encounter Processing Pipeline**: the same conceptual steps as a single-facility documentation
  assistant (transcription → context → drafting → grounding), but designed to run horizontally
  across many concurrent encounters and facilities without cross-tenant data leakage.
- **Clinician Review Layer**: embedded per-facility in that facility's EHR, so clinicians across
  different health systems get a consistent review experience regardless of backend facility
  configuration differences.
- **EHR Write-back (multi-integration)**: must support many EHR integration targets, not one —
  an integration adapter layer per EHR vendor/version rather than a single hard-coded write path.
- **Platform Observability & Audit**: tracks both per-facility audit trails (who drafted/edited/
  signed) and aggregate platform metrics (documentation time saved, draft acceptance rate) used
  to substantiate the scale claim.

## 5. Data Flow

1. Encounter occurs at a specific facility; ingestion layer identifies facility + specialty
   context and selects the applicable template.
2. Processing pipeline runs transcription, context assembly, and Claude-based drafting scoped to
   that facility's EHR and template.
3. Grounding check verifies claims against transcript/context as in the single-facility design.
4. Clinician reviews and signs within their own EHR's embedded review layer.
5. Write-back commits via the facility-specific EHR adapter.
6. Observability layer records per-encounter audit detail and rolls up aggregate metrics.

## 6. Non-Functional Requirements

- **Multi-tenancy / isolation**: strict data isolation between facilities/health systems sharing
  the platform — no cross-tenant data access, even accidentally, in a shared processing pipeline.
- **Horizontal scalability**: the processing pipeline must scale to encounter volume across many
  facilities concurrently, not just one facility's peak load.
- **Configurability**: templates/policies vary by facility and specialty; the design treats this
  as first-class configuration, not per-deployment code forks.
- **Auditability at scale**: both per-encounter (facility-level compliance) and platform-wide
  (aggregate outcome reporting) audit views are required.

## 7. Key Risks & Trade-offs

- **Cross-tenant leakage risk** — the biggest platform-specific risk beyond the single-facility
  design; mitigated by strict per-tenant scoping at every pipeline stage (ingestion, context
  assembly, storage), not relying on a single perimeter control.
- **Template/policy proliferation** — many facilities × many specialties can produce a large
  configuration surface; the design favors a shared template schema with facility-level overrides
  over fully bespoke per-facility logic, to keep the pipeline maintainable.
- **EHR integration heterogeneity** — supporting many EHR vendors at scale is a larger integration
  burden than the single-EHR case; an adapter-pattern write-back layer isolates this variability.
- **Aggregate metric integrity** — "millions of hours saved" claims require consistent, comparable
  per-encounter time measurement across very different facility workflows; the observability
  layer must define this consistently up front rather than approximate it after the fact.
