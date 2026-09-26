# Carta Healthcare — Clinical Data Extraction POC

A working proof-of-concept for the pipeline described in `HLD.md`/`LLD.md`: classify a
clinical document, extract fields with source citations, normalize to coding standards
via a RAG-grounded lookup, validate with an ordered fail-safe gate, and route anything
uncertain to a human abstractor - all backed by an append-only audit trail. LLM calls go
through Groq's OpenAI-compatible API (default model `openai/gpt-oss-120b`).

Scope is limited to this directory (`carta_healthcare/`) - do not edit sibling case
study folders from here.

## Sub-agent delegation

Three scoped sub-agents live in `.claude/agents/`:

- **carta-backend** - `app.py`, `src/*`, `config/*`, `data/coding_reference/*.json`,
  `data/sample_documents/*.txt`, `scripts/*`, `tests/*`. Delegate anything touching
  routes, classification, extraction, RAG-grounded normalization, validation, exception
  handling, or audit logging here.
- **carta-frontend** - `templates/*` only. Delegate anything touching the
  login/registry/api-key forms or the results/review UI here.
- **carta-triage** - read-only P3 reviewer. Run this after a backend and/or frontend
  change lands, before considering the change done. It checks diffs against the
  non-negotiable invariants below and flags anything that would leak the Groq API key or
  introduce non-synthetic sample data. It does not edit code - treat its report as
  input, not as a patch.

Prefer delegating to the scoped agent whose file boundaries match the change, rather
than editing across boundaries directly. If a change genuinely spans both (e.g. adding a
field to the structured-output schema that the results UI must also render), make the
backend edit first, then delegate the matching frontend edit as a separate, explicitly-
described step.

## Isolation

Each sub-agent's `tools:` frontmatter is the primary boundary - carta-triage has no
Edit/Write at all, so it cannot make code changes regardless of what it's asked to do.
The `check_phi_guard.py` hook is a second, independent enforcement layer for the
synthetic-data invariant: it re-reads `config/phi_guard_patterns.yaml` from disk on every
`Write`/`Edit` into `data/`, rather than trusting any agent's self-restraint.

## Context trimming

Once a sub-agent's working context (files read + diffs seen) exceeds roughly 12-15% of
this project's corpus, summarize conversation history beyond the latest 8-10 exchanges
before continuing, rather than letting the transcript grow unbounded. This keeps triage
and backend agents focused on the current change instead of re-deriving earlier,
already-resolved context.

## Config-driven design

New registries, document types, or coding-standard entries are added via YAML/JSON in
`config/` and `data/coding_reference/` - never hardcoded in `src/`. `extraction_spec.py`
fails loudly if a spec is missing a `version` field, since every `NormalizedField` must
be traceable to the exact spec version that produced it.

## Non-negotiable invariants

These hold regardless of which agent (or human) is making a change:

- No field is ever marked `accepted` without a verified `source_span` -
  `extraction_engine.py` independently checks that the quoted excerpt actually occurs in
  the raw document text before a field can pass validation.
- The Groq API key is never written to disk, logs, or `audit_log.jsonl`. It lives only in
  the Flask `session` and the outbound `Authorization` header.
- Cross-check disagreement always forces `exception` in `validation_engine.py`'s ordered
  gate, regardless of what the classification/extraction/rule checks concluded.
- `normalization_engine.py` never lets an LLM emit a coding-standard code that wasn't
  among `rag_index.py`'s retrieved candidates - grounded normalization, not a guess.
- Every `NormalizedField` records the `coding_reference_version` and `spec_version` that
  produced it, so registry submissions stay reproducible under audit.
- A document's exception fields require an explicit abstractor `resolve()` action
  (`corrected` or `confirmed`) via `exception_queue.py` - no auto-acceptance, in either
  the backend or the UI.
- `data/sample_documents/` and `data/coding_reference/` contain only synthetic content -
  never real PHI.

## Phase B — dev-time tooling

Built in a later session, on top of Phase A: a custom MCP server
(`mcp_clinical_server.py`), OpenTelemetry/Grafana observability (`otel_setup.py`,
`docker-compose.yaml`, `observability/*`), and a k6 load test (`local-load-test.js`).
None of these sit on the Flask app's request path — `app.py` still calls `src/*`
directly; the MCP server is a separate stdio process for agent tooling, and telemetry/
load-testing are additive instrumentation and an external harness respectively. See
`README.md`'s "Phase B" sections for details, and `.claude/agents/carta-backend.md` for
their ownership.

## Phase B (deferred, not built)

An Obsidian knowledge vault, prompt-engineering iteration against a larger eval set, and
the live stakeholder demo remain out of scope. See `README.md` for one-line notes on
each.
