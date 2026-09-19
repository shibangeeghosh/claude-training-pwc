# Agentic RAG for Literature Review & Drug-Discovery Intelligence

Capstone project. Scope is limited to this directory (`Day4_POC/`) - do not edit sibling
`Day3_*`/`Day4_SIP` folders from here.

## Sub-agent delegation

Three scoped sub-agents live in `.claude/agents/`:

- **poc-backend** - `app.py`, `src/*`, `mcp_lit_review_server.py`, `otel_setup.py`, `data/*.json`,
  config YAML/JSON, `tests/`. Delegate anything touching routes, retrieval, LLM/Groq
  integration, grounding, fail-safe logic, or audit logging here.
- **poc-frontend** - `templates/*`. Delegate anything touching the login/domain/api-key forms or
  the results/review UI here.
- **poc-triage** - read-only P3 reviewer. Run this after a backend and/or frontend change lands,
  before considering the change done. It checks diffs against the four design commitments
  (allowlist enforcement, grounding, structured output, fail-safe) and flags anything that would
  leak the Groq API key. It does not edit code - treat its report as input, not as a patch.

Prefer delegating to the scoped agent whose file boundaries match the change, rather than editing
across boundaries directly. If a change genuinely spans both (e.g. adding a field to the
structured-output schema that the results UI must also render), make the backend edit first, then
delegate the matching frontend edit as a separate, explicitly-described step.

## Context trimming

Once a sub-agent's working context (files read + diffs seen) exceeds roughly 12-15% of this
project's corpus, summarize conversation history beyond the latest 8-10 exchanges before
continuing, rather than letting the transcript grow unbounded. This keeps triage and backend
agents focused on the current change instead of re-deriving earlier, already-resolved context.

## Non-negotiable invariants

These hold regardless of which agent (or human) is making a change:

- The Groq API key is never written to disk, logs, or `audit_log.jsonl`. It lives only in
  the Flask `session` and the outbound `Authorization` header.
- Every claim in an LLM-drafted answer must resolve to a citation_id from the actually-retrieved
  passage set (`src/grounding.py`), or it is discarded into `gaps` - never shown as fact.
- `gaps` in the structured output is never silently empty (`["No gaps identified."]` otherwise).
- A pending review requires an explicit human approve/reject action before it is released - no
  auto-approval, in either the backend or the UI.
- Retrieval is always filtered by both the selected domain and the source allowlist.
