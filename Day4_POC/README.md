# Agentic RAG for Literature Review & Drug-Discovery Intelligence

A locally-runnable capstone implementing the design in [DESIGN.md](DESIGN.md): login → select a
therapeutic/research domain → provide a Groq API key → ask a research question and get a
structured, grounded, human-reviewed answer over a mock literature/patent/trial/internal-report
corpus.

## Quick start

```bash
pip install -r requirements.txt
python3 app.py
```

Open **http://localhost:5000** — it redirects to `/login`.

1. **Log in** with a demo user from `users.json`: `analyst` / `demo1234` or `reviewer` /
   `review1234`.
2. **Select a domain** — Oncology, Cardiovascular, Diabetes/Metabolic, Neurology, or Infectious
   Disease. This scopes every retrieval for the rest of the session.
3. **Enter a Groq API key** (get one at [console.groq.com/keys](https://console.groq.com/keys)) and pick a
   model. The key is held only in the server-side session for this login — never written to disk,
   a log file, or the audit trail.
4. **Ask a research question.** The app plans sub-queries, retrieves from the mock corpus,
   drafts a grounded answer, verifies every citation, applies the fail-safe gate, and shows you a
   confidence score, citations, and gaps. **Approve or reject** the result before it's considered
   released — this is logged to `audit_log.jsonl`.

Three example questions are pre-wired in the UI to exercise the three main paths:
- A well-covered question in your selected domain → grounded answer with citations.
- The metformin extended-release question in **Diabetes/Metabolic** → conflicting trial evidence
  → `escalate` (two mock trials deliberately disagree — see `data/trials.json`, `NCT020`/`NCT021`).
- A short/vague question → `clarify` (the query planner asks you to be more specific).

To see the zero-hit `refuse` path, ask something with no domain-relevant keywords at all. To see
the LLM-failure `escalate` path, enter a garbage API key at step 3.

## What this demonstrates

1. **Allowlist-enforced retrieval** — `allowlist.yaml` + `.claude/hooks/check_allowlist.py`
   (defense in depth: pre-scoped MCP connectors *and* an independent `PreToolUse` hook).
2. **Domain-scoped retrieval** — every mock document is tagged with a `domain`; a session can
   only ever see evidence from its selected therapeutic area.
3. **Real LLM grounding, verified in code** — `src/grounding.py` lets a Groq model draft
   freely with inline `[citation_id]` tags, then discards the whole draft if any tag doesn't
   resolve to an actually-retrieved passage.
4. **Fixed structured output** — `answer` / `confidence{level,basis}` / `citations[]` / `gaps[]`,
   every time, `gaps` never silently empty.
5. **Fail-safe gate, never fabricate** — LLM failure, zero hits, unverifiable draft, conflicting
   evidence, and stale allowlist entries each route to a named, logged outcome.
6. **Human review restored** — every answer requires an explicit approve/reject action; nothing
   auto-approves.
7. **Full audit trail** — `audit_log.jsonl`, one line per request and one per reviewer decision,
   never containing the API key.

See [DESIGN.md](DESIGN.md) for the full spec, including what's intentionally simplified for this
prototype (§10, "Design vs. implementation").

## Tests

```bash
pytest tests/
```

Covers allowlist staleness/matching, domain-filtered retrieval, grounding verification
(trusted/discarded/fabricated-citation/LLM-failure cases), and every fail-safe trigger.

## Sub-agents

`.claude/agents/` defines three scoped Claude Code sub-agents for working on this project:
`poc-backend` (`app.py`, `src/*`, the MCP server, tests), `poc-frontend` (`templates/*`), and
`poc-triage` (a read-only reviewer that checks diffs against the four design commitments). See
[CLAUDE.md](CLAUDE.md) for delegation rules and context-trimming guidance.

## Observability

```bash
./start.sh
```

Brings up the OpenTelemetry Collector, Tempo, Prometheus, InfluxDB, and Grafana
(`docker-compose.yaml`), instruments the Flask app and its outbound Groq calls
(`otel_setup.py`), and starts `app.py`. Grafana is at **http://localhost:3000** (anonymous auth
enabled for this local demo) with a pre-provisioned k6 load-test dashboard.

## Load testing

```bash
k6 run local-load-test.js -e BASE_URL=http://localhost:5000 \
  -e GROQ_API_KEY=gsk_... -e MODEL=openai/gpt-oss-120b
```

Exercises the full login → domain → api-key → `/api/review` flow under ramping virtual users and
reports a `tokens_consumed` trend parsed from Groq's real `usage.total_tokens` field. If
`GROQ_API_KEY` is omitted, requests still exercise the whole path but hit the
LLM-failure `escalate` branch instead of a real model call.

## Custom MCP server

`mcp_lit_review_server.py` exposes the same domain-aware search tools
(`search_literature`, `search_trials`, `search_patents`, `search_internal_reports`,
`list_domains`) over MCP, registered in `.mcp.json`. It's a dev-time/agent-orchestration
artifact — the Flask app itself calls `src/` modules directly rather than going through MCP at
request time, matching this repo's established convention.

## Security notes

- The Groq API key is never read from an environment variable, never written to disk, and
  never appears in `audit_log.jsonl` — see `src/llm_client.py`'s docstring and `.env.example`.
- This is a local-demo auth pattern (hardcoded users, no HTTPS enforcement, no key rotation) —
  see DESIGN.md §10 for what a production deployment would need on top of this.
