# Agentic RAG for Literature Review & Drug-Discovery Intelligence — Design Spec

## 1. Problem framing

R&D teams support decisions with evidence scattered across peer-reviewed literature, patents,
trial registries, and internal reports. A single research question can surface far more material
than anyone reads end to end, and a stale or wrong internal report can circulate as fact without
being checked against the primary literature. This system asks: **given a research question and
a therapeutic area, which evidence is relevant, how confident can the team be, and what's the
complete source trail?**

Critical non-goal, unchanged from the prior prototype: **this system does not make the scientific
judgment itself.** It surfaces evidence and a confidence estimate for a human reviewer to weigh,
and every candidate answer requires an explicit human approve/reject before it counts as released.

## 2. What this build adds on top of the prior prototype

`Day3_case_study_ag_rag_scntfc_lit_rvw` (a prior capstone in this same repo) implements the same
four commitments below, but with **no live LLM call anywhere** — query decomposition, drafting,
and confidence were all hand-written heuristics — and no login, domain-selection, or API-key
concept. This build keeps that prototype's control-plane pattern (allowlist gate, structured
schema, fail-safe triggers, audit log) and changes three things:

1. **A real LLM, brought by the user.** Login → select a therapeutic/research domain → enter a
   Groq API key and pick a model. The key lives only in the Flask session for that login,
   never on disk, never in a log line, never in the audit trail.
2. **Domain scoping.** Every mock document is tagged with a `domain`. Retrieval filters by
   `domain == session domain` in addition to the allowlist check — a user in "Neurology" cannot
   surface an oncology internal report even if its keywords happen to overlap.
3. **Grounding-by-verification instead of grounding-by-construction.** The prior prototype could
   only ever emit one templated sentence per retrieved passage — trivially "grounded" because
   nothing was synthesized. Here the LLM drafts a real answer and tags every claim with a
   `citation_id`; code then independently verifies each tag resolves to a passage that was
   actually retrieved this session. Anything that doesn't verify — a hallucinated ID, or no ID at
   all — is discarded wholesale into `gaps`, never shown as fact (see §4).

## 3. Architecture overview

```
Login (session) -> Select domain -> Enter Groq key + model (session only)
      |
      v
Research question
      |
      v
Query Planner (Groq call: decomposes into sub-queries per source type + ambiguity check;
                falls back to a keyword heuristic if the LLM call fails)
      |
      v
Retriever, domain- and allowlist-gated (mock corpus: literature / patents / trials / internal)
      |
      v
Grounded Drafting + Verification
  (LLM drafts an answer with inline [citation_id] tags, constrained to retrieved passages;
   code rejects any tag that doesn't resolve to an actually-retrieved passage)
      |
      v
Structured Output Composer (answer / confidence{level,basis} / citations[] / gaps[])
      |
      v
Fail-safe Gate (LLM failure -> escalate; zero hits -> refuse; untrusted draft -> escalate;
                conflicting evidence -> escalate; stale allowlist entry -> gap flag, non-blocking)
      |
      v
Human review (explicit approve/reject in the UI)
      |
      v
Audit log (JSONL: user, domain, model, decision, reviewer action — never the API key)
```

## 4. Commitment 1 — Retrieve only from approved sources

Unchanged in mechanism from the prior prototype: `allowlist.yaml` lists five sources (`pubmed`,
`clinicaltrials_gov`, `eppatent`, `uspto`, `internal_reports`), each with `id`, `type`, a
`fnmatch`-style `pattern`, an `owner`, and a `last_reviewed` date. `src/allowlist.py`'s
`check_target()` is the single enforcement point, and it runs twice, independently:

- **Defense layer 1 — MCP connector scoping.** `src/mcp_connectors.py` builds one connector per
  allowlist entry, each bound to exactly one `target` pattern; `check_target()` runs on every
  `.query()` call against `self.allowlist`, an in-memory list captured once when the Flask
  process (or MCP server process) starts.
- **Defense layer 2 — the `PreToolUse` hook.** `.claude/hooks/check_allowlist.py`, wired via
  `.claude/settings.json`'s matcher on the real tool names
  (`search_literature|search_trials|search_patents|search_internal_reports`), intercepts every
  call to `mcp_lit_review_server.py`'s search tools at the Claude Code level. It maps the tool
  name to the allowlist `type` it corresponds to (e.g. `search_patents` → `patent`) and
  **re-reads `allowlist.yaml` from disk on every invocation** — deliberately not trusting the
  long-running process's in-memory copy — denying the call if no entry of that type remains.
  This is what makes the two layers genuinely independent rather than duplicates: layer 1 can
  only ever reflect the allowlist as it was when the process started, while layer 2 catches an
  entry being pulled (e.g. after a security review) even while an older process is still running.
  Every allow/deny decision is logged to `retrieval_audit.log`.

`uspto`'s `last_reviewed` (2024-12-01) is deliberately left stale (>12 months) so the staleness
gap-flag path in §6 has a real trigger to exercise.

Retrieval also always applies the domain filter described in §2 — a connector's allowlist match
is necessary but not sufficient; the result must also belong to the session's selected domain.

## 5. Commitment 2 — Ground every claim

Implemented in `src/grounding.py`. The LLM is given the retrieved passages (each with a
`citation_id`) and instructed to draft an answer where every factual claim ends with the
`citation_id` it came from, in square brackets, and to list anything the evidence doesn't cover
in `uncovered_aspects` rather than guess. After the draft returns:

1. Extract every `[source_type-id]` tag from the draft via regex.
2. Compute `invalid_ids = cited_ids - {passages actually retrieved this session}`.
3. If `invalid_ids` is non-empty, or no tags were found at all, **the entire draft answer is
   discarded** — not trimmed sentence-by-sentence, discarded wholesale — and the reason is
   appended to `gaps`. Nothing partially-grounded is shown as fact.
4. Only if every cited ID resolves does the draft become the trusted `answer`, with `citations`
   built from the passages it actually referenced.

This is stricter than "does this sentence have a citation" — a model that invents a plausible
but non-existent citation ID is caught exactly the same way as a model that cites nothing.

## 6. Commitment 3 — Structured output contract

`src/structured_output.py` emits, unconditionally:

```json
{
  "answer": "string — the verified answer, or a fixed fallback if nothing was trusted",
  "confidence": {"level": "high|medium|low", "basis": "string, names a concrete factor"},
  "citations": [{"id": "...", "source": "...", "locator": "...", "snippet": "..."}],
  "gaps": ["string, never silently empty — 'No gaps identified.' if there are none"],
  "domain": "string — the session's selected domain label",
  "model_used": "string — the Groq model id used for this request"
}
```

**Confidence is hybrid, not model-trusted.** The LLM self-assesses a level, but
`_hybrid_confidence()` caps it against the actual citation count and whether any gaps were
raised (`>=3` citations and no gaps -> cap `high`; `>=1` -> cap `medium`; `0` -> cap `low`). The
final level is the minimum of the LLM's claim and this cap, so a model cannot talk its way to
"high confidence" on thin evidence.

## 7. Commitment 4 — Fail gracefully

`src/failsafe.py` checks, in this fixed order, so an earlier trigger always wins:

| Order | Condition | Action |
|-------|-----------|--------|
| 1 | LLM call failed (bad/missing key, timeout, rate limit, network error, malformed JSON) | Escalate, with a named reason from `LLM_ERROR_MESSAGES` |
| 2 | Zero passages retrieved in the selected domain | Refuse |
| 3 | Grounding verification discarded the draft (§5) | Escalate |
| 4 | Retrieved trial-registry passages disagree on outcome for the same `topic` | Escalate, both outcomes named in the reason |
| 5 | A source used this request has a stale allowlist entry (>12 months) | Non-blocking: append a gap, still answer |

Query-time ambiguity (a question too short or with no domain-keyword match) is caught earlier, in
`src/query_planner.py`, before retrieval even runs, and returns `status: clarify` instead of
reaching the fail-safe gate at all.

Nothing here silently guesses: every branch that isn't a full "answer" ends in `refuse`,
`escalate`, or `clarify`, each with a concrete, logged reason.

## 8. Human review

Unlike the prior prototype's web path (which auto-approved every composed answer, contradicting
its own design intent), this build makes review a real gate: a `pending_review` result is held in
an in-process store (`PENDING_REVIEWS` in `app.py`) and only reaches the audit trail as "released"
after an explicit approve/reject action in the UI, recorded via
`audit.record_reviewer_decision()`. The audit log is append-only, so a reviewer decision is a
second JSONL line, not a mutation of the original request entry — the full history is
reconstructable.

## 9. Auditability

`src/audit.py` appends one JSONL line per request to `audit_log.jsonl`, capturing user, domain,
model, question, retrieval hook log, retrieved-passage count, decision status, and reason — and,
separately, one line per reviewer decision. The API key is never a parameter this module accepts,
so there is no code path by which it could end up in the log by mistake.

## 10. Design vs. implementation

A few places where the build is intentionally simpler than a production system, matching this
prototype's own documented scope:

- **Retrieval is keyword-set intersection over an in-memory mock corpus** (`src/mock_corpus.py`),
  not a real embeddings/vector index or live external APIs. This was an explicit scope decision
  for this capstone (mock corpus over live APIs), not an oversight.
- **Semantic entailment is not checked.** Grounding verification confirms a cited ID was actually
  retrieved; it does not confirm the cited passage *semantically supports* the specific claim
  next to it. A model could cite a real, retrieved passage for a claim that passage doesn't quite
  support. Catching that would need a secondary LLM call (adding latency and cost) and was left
  out of this build, same tradeoff called out in the prior prototype's design doc.
- **The custom MCP server (`mcp_lit_review_server.py`) is a dev-time/agent-orchestration
  artifact**, matching this repo's established convention — the Flask app calls `src/` modules
  directly rather than round-tripping through the MCP protocol at request time. The MCP server
  exists so Claude Code (and other MCP clients) can query the same corpus during development.
- **The API key handling is a local-demo pattern**, not a production secrets flow: no HTTPS
  enforcement, no key rotation, no per-user key vault — it is a plain form field held in a
  server-side session for the lifetime of one login. A real deployment would need at minimum
  HTTPS termination and a managed-secrets integration instead of a raw form POST.
