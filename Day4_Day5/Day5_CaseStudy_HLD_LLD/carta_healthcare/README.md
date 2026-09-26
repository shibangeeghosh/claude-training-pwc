# Carta Healthcare — Clinical Data Extraction POC

A locally-runnable proof-of-concept implementing the design in [HLD.md](HLD.md) /
[LLD.md](LLD.md): login → select a registry → provide a Groq API key → submit a clinical
document and get a structured, source-verified, coding-grounded extraction, with anything
uncertain routed to a human abstractor for review.

## Quick start

```bash
pip install -r requirements.txt
python3 app.py
```

Open **http://localhost:5000** — it redirects to `/login`.

1. **Log in** with a demo user from `users.json`: `abstractor1` / `demo1234` or
   `abstractor2` / `demo1234`. Each abstractor only ever sees their own submitted documents
   and the exceptions assigned to them.
2. **Select a registry** — Cardiac Surgery, Oncology, or Trauma/General Surgery. This
   scopes which sample document types make sense for the session.
3. **Enter a Groq API key** (get one at [console.groq.com/keys](https://console.groq.com/keys))
   and pick a model — default `openai/gpt-oss-120b`. The key is held only in the
   server-side session for this login — never written to disk, a log file, or the audit
   trail.
4. **Pick a sample document.** The app classifies it, extracts each spec'd field with a
   verified source excerpt, normalizes values against a RAG-grounded coding lookup
   (ICD-10/CPT/SNOMED), and runs an ordered validation gate. Fields that pass are
   `accepted`; anything that fails confidence, format, or a sampled cross-check becomes an
   `exception` for you to `confirm` or `correct`.

Sample documents live in `data/sample_documents/`. `discharge_summary_002_ambiguous.txt`
is deliberately ambiguous — expect at least one field to land in the exception queue
rather than being auto-accepted, exercising the fail-safe path.

## What this demonstrates

1. **Verified source citations** — `extraction_engine.py` independently re-checks that
   every extracted field's quoted excerpt actually occurs verbatim in the raw document
   text before it can be marked `verified`; nothing is accepted without one.
2. **RAG-grounded normalization** — `rag_index.py` is a dependency-light TF-IDF + cosine
   index over `data/coding_reference/*.json`. `normalization_engine.py` never lets the LLM
   emit a coding-standard code that wasn't among the retrieved candidates — a guess is
   always `no_confident_coding_match`, not a fabricated code.
3. **Ordered, override-aware validation gate** — `validation_engine.py` checks
   classification confidence, extraction confidence, and rule/format, but a sampled
   cross-check disagreement always forces `exception` regardless of what the earlier
   checks concluded.
4. **Full provenance** — every `NormalizedField` records both the `coding_reference_version`
   and the `spec_version` that produced it, so a registry submission stays reproducible
   under audit.
5. **Human review restored** — exception fields require an abstractor's explicit
   `confirm`/`correct` action via `exception_queue.py`; nothing auto-resolves.
6. **Per-abstractor isolation** — submitted documents and exceptions are scoped to the
   submitting/assigned abstractor; `app.py` returns `403` if one abstractor's session
   tries to read or resolve another's.
7. **Full audit trail** — `audit_log.jsonl`, one line per pipeline stage and per abstractor
   resolution, never containing the Groq API key.
8. **Config-driven, not hardcoded** — registries, document types/specs, and coding
   reference entries all live under `config/`/`data/`; adding one never requires touching
   `src/`.
9. **PHI guard** — `.claude/hooks/check_phi_guard.py` independently re-reads
   `config/phi_guard_patterns.yaml` on every `Write`/`Edit` into `data/`, denying anything
   that looks like real PHI regardless of what an editing agent believes is fine. All
   sample/reference data here is synthetic.

See [HLD.md](HLD.md) and [LLD.md](LLD.md) for the full design, including the LLM provider
contract, the RAG retrieval contract, and the POC route list.

## Tests

```bash
pytest tests/
```

One test file per `src/` module; the Groq boundary (`llm_client.chat_completion`) is
monkeypatched throughout, so the suite runs with no network access and no API key.

## Manual pipeline run (no Flask)

```bash
GROQ_API_KEY=gsk_... python3 scripts/run_pipeline_cli.py --sample discharge_summary_001.txt
```

Runs classify → extract → normalize → validate → structured-output against a sample
document and prints the resulting JSON — useful for checking a backend change without
going through the UI. Without a real key, extraction fails gracefully and every field
routes to the exception queue with `reason: extraction_failed:INVALID_API_KEY`.

## Sub-agents

`.claude/agents/` defines three scoped Claude Code sub-agents: `carta-backend` (`app.py`,
`src/*`, `config/*`, `data/coding_reference/*.json`, `data/sample_documents/*.txt`,
`scripts/*`, `tests/*`), `carta-frontend` (`templates/*` only), and `carta-triage` (a
read-only reviewer that checks diffs against the non-negotiable invariants below). See
[CLAUDE.md](CLAUDE.md) for delegation rules, isolation, and context-trimming guidance.

## Security notes

- The Groq API key is never read from an environment variable server-side, never written
  to disk, and never appears in `audit_log.jsonl` — see `src/llm_client.py`'s docstring.
- `app.secret_key` is generated fresh at process start if `FLASK_SECRET_KEY` isn't set, so
  an unset secret only costs you sessions on restart, never a known-to-everyone signing
  key that could forge a session (and its embedded Groq key/registry).
- This is a local-demo auth pattern (hardcoded users in `users.json`, no HTTPS enforcement,
  no key rotation) — production would need real identity, TLS, and secret management on
  top of this.

## Phase B — Custom MCP server

`mcp_clinical_server.py` (registered in `.mcp.json` as `carta-clinical`) exposes
read-only introspection over the config-driven pipeline as MCP tools, for agent
tooling during development — it is not called by the Flask app at request time:

- `list_document_types()`, `get_extraction_spec(document_type)` — over
  `config/extraction_specs/*.yaml`.
- `list_registries()` — over `config/registries.yaml`.
- `search_coding_reference(coding_standard, query, top_k=5)` — over `rag_index.search`.
- `list_sample_documents()` — over `data/sample_documents/`.
- `list_exceptions(document_id=None, assigned_to=None)` — over the in-memory exception
  queue.

Run standalone with `python3 mcp_clinical_server.py` (stdio transport), or let a
compatible MCP client (e.g. Claude Code, via the checked-in `.mcp.json`) launch it.

## Phase B — Observability

`otel_setup.py` instruments the Flask app (`FlaskInstrumentor`), outbound Groq calls
(`RequestsInstrumentor`, traces the `requests.post` call in `src/llm_client.py` for
free), and process metrics (`SystemMetricsInstrumentor`), exporting via OTLP/gRPC to an
OTel Collector → Tempo (traces) + Prometheus (metrics), visualized in Grafana —
mirroring `Day4_POC/`'s stack, with host ports remapped so both can run at once:

```bash
./start_observability.sh   # docker compose up -d, then python3 app.py with OTEL env vars set
```

Grafana: **http://localhost:3001** (anonymous admin, local demo only). Provisioned with
a k6 load-test dashboard (VUs, request rate, error rate, p95 latency, and an
*estimated* Groq token-consumption panel — see the Load testing section below for why
it's an estimate). Bring the stack down afterward with `docker compose down`.

## Phase B — Load testing

`local-load-test.js` (k6) exercises the full
login → registry → api-key → `/api/documents` flow under a ramping-VU load (0→10→0
over one minute), checking the 202 response and its `status` field, and recording
p95 latency and an approximate token-consumption metric:

```bash
k6 run local-load-test.js --out influxdb=http://localhost:8096/k6 \
  -e BASE_URL=http://localhost:5051 -e GROQ_API_KEY=gsk_... -e MODEL=openai/gpt-oss-120b
```

**Token-usage caveat**: `src/llm_client.chat_completion()` only returns
`{"ok", "content"}` — Groq's real `usage.total_tokens` is never surfaced in
`/api/documents`'s response, and a single document triggers many separate Groq calls
(classification, per-field extraction, per-field normalization, cross-check
resampling), so real accounting would mean threading token counts through every one of
those call sites. Rather than that invasive change, the script falls back to a
response-body-length/4 estimate (tagged `source: estimated` in the `tokens_consumed`
metric) — a known simplification, not a bug to silently fix later.

## Phase B — Graphify knowledge graph

A codebase knowledge graph over this project's modules, config, tests, and docs, built
with the `graphify` skill (`/graphify`) — AST extraction for code, host-agent semantic
extraction for `HLD.md`/`LLD.md`/`README.md` (no API key required). Output lives in
`graphify-out/` (`graph.json`, `graph.html`, `GRAPH_REPORT.md`), not checked into the
main tree.

## Phase B (deferred, not built)

This POC covers steps 1–12 of the AI-DLC methodology (problem framing through code
review), plus the MCP server, observability, and load-testing above. The following
remain documented but not implemented:

- **Knowledge vault** — an Obsidian vault capturing the extraction spec, coding-reference
  curation decisions, and validation-gate rationale as linked notes.
- **Prompt-engineering iteration** — tuning the classification/extraction/normalization
  prompts against a larger, curated eval set (beyond the four bundled sample documents).
- **Live stakeholder demo** — a scripted walkthrough for a non-engineering audience.
