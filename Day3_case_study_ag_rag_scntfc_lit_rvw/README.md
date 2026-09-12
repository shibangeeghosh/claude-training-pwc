# Agentic RAG for R&D Scientific Literature Review — Working Prototype

This is a fully functional, locally-runnable implementation of the design from [DESIGN.md](DESIGN.md). It demonstrates all nine steps of the agent operating loop (section 9) in action.

## Quick Start

```bash
pip install -r requirements.txt
python3 cli.py "What is the efficacy of metformin in preventing type 2 diabetes in prediabetic adults?"
```

At the final review step, enter `y` to approve the candidate output or `n` to reject it.

## What This Demonstrates

### 1. **Allowlist-Enforced Retrieval (Commitment 1)**
- Every MCP connector is pre-scoped to one corpus type only (`mcp-pubmed`, `mcp-clinicaltrials`, `mcp-patents`, `mcp-internal-reports`).
- Before each retrieval, the PreToolUse hook (`check_allowlist.py`) validates the target against `allowlist.yaml`.
- Hook decisions (allow/deny) are logged and visible in the audit trail.

### 2. **Grounded Claims (Commitment 2)**
- Every sentence in the answer carries a citation ID.
- Citations are validated to actual retrieved passages.
- The grounding check runs deterministically: no ungrounded claims can appear in the output.

### 3. **Structured Output (Commitment 3)**
- Response follows the exact schema: `answer`, `confidence` (level + basis), `citations`, `gaps`.
- `gaps` is mandatory and lists uncertainties, conflicts, or allowlist staleness.

### 4. **Fail Gracefully (Commitment 4)**
- Concrete trigger conditions cause refusal, escalation, or clarification instead of guessing:
  - **Zero hits** → refuse with explanation
  - **Source conflicts** → escalate (conflicting trial outcomes)
  - **Ambiguous question** → ask for clarification before retrieval
  - **Stale allowlist** → report in gaps (and would escalate in production)

### 5. **Agent Operating Loop (9 Steps)**
1. **Receive & validate** question
2. **Decompose** into per-source sub-queries
3. **Connect** to MCP connectors
4. **Retrieve** documents (hook-gated)
5. **Ground** claims to citations
6. **Compose** structured output
7. **Apply** fail-safe gate
8. **Human review** → approve/reject before release
9. **Record** audit trail (JSONL)

## Test Scenarios

Run each from the project directory:

### Scenario 1: Successful review with approval
```bash
echo "y" | python3 cli.py "Are there patents covering slow-release formulations of drug Y filed after 2020?"
```
✓ Reaches human review step, shows full structured output with citations and gaps.

### Scenario 2: Ambiguous question
```bash
python3 cli.py "Is it good?"
```
✓ Returns clarification request immediately, no retrieval.

### Scenario 3: Source conflicts
```bash
python3 cli.py "What is the efficacy of metformin in preventing type 2 diabetes in prediabetic adults?"
```
✓ Detects conflicting trial outcomes (one trial says effective, another says not significant), escalates.

### Scenario 4: Stale allowlist
(Integrated into scenario 1 test — patent query detects that USPTO entry has `last_reviewed: 2024-12-01`, >12 months old, and reports it in gaps.)

### Scenario 5: Rejection at human review
```bash
echo "n" | python3 cli.py "Are there patents covering slow-release formulations of drug Y filed after 2020?"
```
✓ Reviewer rejects, nothing is released to requester, decision is logged to audit trail.

## File Structure

```
allowlist.yaml                  # Source allowlist config (id, type, pattern, owner, last_reviewed)
requirements.txt                # Dependencies: pyyaml only
cli.py                          # Entry point

data/
  literature.json               # Mock PubMed-style documents
  trials.json                   # Mock trial registry (includes conflicting metformin trials)
  patents.json                  # Mock patent documents
  internal_reports.json         # Mock internal reports

src/
  allowlist.py                  # Load/check allowlist config, staleness detection
  mock_corpus.py                # In-memory corpus search (keyword-based)
  mcp_connectors.py             # 4 MCP connector objects, pre-scoped + allowlist-gated
  query_planner.py              # Step 2: decompose question, detect ambiguity
  retriever.py                  # Step 3-4: drive MCP connectors, collect results + hook log
  grounding.py                  # Step 5: build citation-tagged answer
  structured_output.py          # Step 6: compose answer/confidence/citations/gaps schema
  failsafe.py                   # Step 7: zero-hits / conflicts / staleness checks
  audit.py                      # Step 9: record to audit_log.jsonl
  review_loop.py                # Orchestrate all 9 steps

.claude/
  hooks/check_allowlist.py      # PreToolUse hook (faithful to DESIGN.md, deployable)
  settings.json                 # Wires the hook

.gitignore                      # Ignores audit_log.jsonl (generated test output)
```

## Audit Trail

Each request generates one line in `audit_log.jsonl` (created on first run):
```json
{
  "timestamp": "...",
  "request_id": "...",
  "question": "...",
  "allowlist_gate_log": [{"connector": "...", "allowlist_decision": "ALLOWED|DENIED", "result_count": N}, ...],
  "retrieved_count": N,
  "final_decision": "answer|refuse|escalate|clarify",
  "decision_reason": "...",
  "reviewer_decision": {"approved": true/false, "timestamp": "..."}
}
```

## Design vs. Implementation

This prototype is a **faithful but simplified** reference implementation:

### What's implemented as designed:
- ✅ Allowlist hook enforcement (PreToolUse gate on every retrieval)
- ✅ MCP connector pre-scoping to approved corpora
- ✅ Grounding check (every claim must cite a retrieved passage)
- ✅ Structured output schema (answer, confidence, citations, gaps)
- ✅ Fail-safe gate conditions (conflicts, staleness, ambiguity, zero-hits)
- ✅ Human review step (approve/reject gate before release)
- ✅ Audit trail (one entry per request)

### What's simplified for offline demo:
- **No live LLM**: Query decomposition and answer drafting use deterministic heuristics (keyword extraction, template-based sentences) instead of model calls. This keeps the prototype offline and reproducible.
- **Ambiguity detection**: A simple word-count heuristic instead of a real scoping-confidence model.
- **Keyword search**: Simple overlap matching instead of semantic search or embeddings.
- **Conflicts**: Checked by comparing outcomes for the same topic across trials (works for the mock data).

These simplifications are **intentional and documented**, not hidden. They stand in for their production equivalents without changing the contract or the audit trail.

## Design Document

See [DESIGN.md](DESIGN.md) for the full architecture, commitment definitions, and all implementation notes.
