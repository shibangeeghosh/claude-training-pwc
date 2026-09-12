# Agentic RAG for R&D Scientific Literature Review — Design Spec

## 1. Problem framing

R&D teams support their decisions with evidence from multiple disconnected sources: peer-reviewed literature (PubMed, indexed journals), patents (USPTO, EPO), trial registries (ClinicalTrials.gov, ISRCTN), and internal reports (lab data, prior analysis, failed experiments). A single research question often surfaces hundreds or thousands of papers. No one reads them all. Worse, a stale or incorrect internal report can circulate as fact and influence decisions without anyone cross-checking it against the primary literature.

The problem the system addresses: **Given a research question, which evidence is relevant, how confident can the team be in that evidence, and what's the complete source trail?**

Critical non-goal: **This system does not make the scientific judgment itself.** It surfaces evidence and confidence estimates for a human decision-maker to weigh. An agent that answers "the evidence supports hypothesis X" and then gets picked up and acted on without human review is worse than no system at all.

## 2. Architecture overview

```
Research question
      |
      v
Query Planner
  (decomposes question into sub-queries scoped per source type)
      |
      v
Retriever with Allowlist Gate (hook intercepts every fetch)
      |
      +-----> [Literature index — PubMed/PMC]
      |
      +-----> [Patent index — USPTO/EPO]
      |
      +-----> [Trial registry — ClinicalTrials.gov, ISRCTN]
      |
      +-----> [Internal report store — access-controlled]
      |
      v
Grounding / Citation Checker
  (validates every claim sentence against retrieved passages)
      |
      v
Structured Output Composer
  (fills: answer, confidence, citations, gaps)
      |
      v
Fail-safe Gate
  (refuse / escalate / deliver-with-gaps based on evidence quality)
      |
      v
Response to requester + Audit log entry
```

**Query Planner** takes a research question ("What is the efficacy of X in population Y?") and decomposes it into retrieval queries scoped to each source category (e.g., "efficacy X population Y" for literature, "X AND Y patent" for patents, structured trial matching for registries, and "X Y efficacy" for internal reports).

**Retriever** executes these queries against each source. Every fetch or index query is a tool call that passes through an **Allowlist Gate hook** before execution — this hook checks the target source against a configuration file and denies the call if the source is not pre-approved. Only allowlisted sources proceed.

**Grounding / Citation Checker** receives the raw retrieved passages and the agent's draft answer. It verifies that every sentence in the answer carries a citation ID and that the cited ID exists in the actual retrieved set (not hallucinated). Sentences without a citation or with invalid citation IDs are stripped and moved to `gaps`.

**Structured Output Composer** fills a fixed schema with the answer, confidence level and its factual basis, citations, and gaps. This is not freeform prose — the schema is the contract.

**Fail-safe Gate** applies final checks: Is there any evidence at all? Do sources conflict? Is the allowlist stale? If any trigger fires, the response either refuses to answer, escalates to a human, or delivers with explicit gaps highlighted — never silently.

## 3. Commitment 1 — Retrieve only from approved sources

### Definition of approved sources

For this domain, approved sources are:

1. **Peer-reviewed literature** — Indexed via a named API (e.g., PubMed/PMC with API credentials)
2. **Official patent databases** — USPTO and European Patent Office public APIs
3. **Registered trial registries** — ClinicalTrials.gov, ISRCTN public APIs
4. **Internal report store** — The organization's own access-controlled document repository with role-based retrieval

**Explicitly excluded**: open web search results, unvetted preprint servers, user-uploaded PDFs, scraped web content, any source not appearing in the allowlist configuration.

### Enforcement mechanism

The allowlist is enforced by a **hook that intercepts tool calls before they execute** — not by instructing the agent in a prompt to "only use approved sources." A prompt instruction is a guideline the model can drift from, especially under pressure to answer a question that lands on an unapproved source. A hook is a gate the call cannot pass without approval.

When a tool call to fetch or query a document reaches the hook, the hook checks:
1. Is this a retrieval tool? (e.g., `FetchDocument`, `QuerySourceIndex`)
2. What is the target source identifier (domain, database name, URL pattern)?
3. Does the target match any entry in the allowlist configuration?

If yes to all three: allow. Otherwise: deny with a clear reason, and log the denial.

### Allowlist configuration

The allowlist lives as a configuration file, `allowlist.yaml`, in the project root:

```yaml
sources:
  - id: pubmed
    type: literature
    pattern: "eutils.ncbi.nlm.nih.gov/*"
    owner: "lit-review-team"
    last_reviewed: "2026-06-01"
    
  - id: clinicaltrials_gov
    type: trial_registry
    pattern: "clinicaltrials.gov/api/*"
    owner: "clin-ops"
    last_reviewed: "2026-06-01"
    
  - id: eppatent
    type: patent
    pattern: "data.epo.org/patent/*"
    owner: "ip-team"
    last_reviewed: "2026-04-20"
    
  - id: uspto
    type: patent
    pattern: "developer.uspto.gov/*"
    owner: "ip-team"
    last_reviewed: "2026-05-15"
    
  - id: internal_reports
    type: internal
    pattern: "reports.internal.corp/*"
    owner: "rd-informatics"
    last_reviewed: "2026-06-10"
```

**Every entry must include:**
- `id`: a unique identifier for this source
- `type`: one of `literature`, `patent`, `trial_registry`, `internal`
- `pattern`: a wildcard pattern (fnmatch style) that URLs must match
- `owner`: the person or team responsible for this source
- `last_reviewed`: a date in YYYY-MM-DD format of the last allowlist review

The `owner` and `last_reviewed` fields are deliberate: they make staleness visible and auditable. A source whose `last_reviewed` date is 18 months old is not implicitly trustworthy anymore — that staleness must be acknowledged when deciding to use it.

### Hook implementation

The hook lives at `.claude/hooks/check_allowlist.py` and is wired via `.claude/settings.json`. Here is the complete, runnable implementation:

**`.claude/hooks/check_allowlist.py`:**

```python
#!/usr/bin/env python3

import json
import sys
import yaml
import fnmatch
from pathlib import Path

ALLOWLIST_PATH = Path("allowlist.yaml")
AUDIT_LOG = Path("retrieval_audit.log")

def main():
    payload = json.load(sys.stdin)
    tool_name = payload.get("tool_name", "")
    tool_input = payload.get("tool_input", {}) or {}
    
    # Extract the target source from tool input
    # (exact field names depend on tool design; these are illustrative)
    target = tool_input.get("source_url", "") or tool_input.get("query_target", "")
    
    is_retrieval_tool = tool_name in ["FetchDocument", "QuerySourceIndex"]
    
    # If not a retrieval tool, allow silently
    if not is_retrieval_tool:
        sys.exit(0)
    
    # Load the allowlist
    if not ALLOWLIST_PATH.exists():
        print(json.dumps({
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": f"No allowlist.yaml found at {ALLOWLIST_PATH}; cannot proceed."
            }
        }))
        sys.exit(0)
    
    with open(ALLOWLIST_PATH) as f:
        config = yaml.safe_load(f) or {}
    allowlist = config.get("sources", [])
    
    # Find a matching allowlist entry
    matched = None
    for entry in allowlist:
        pattern = entry.get("pattern", "")
        if fnmatch.fnmatch(target, pattern):
            matched = entry
            break
    
    # Log the attempt
    try:
        with open(AUDIT_LOG, "a") as log:
            status = "ALLOWED" if matched else "DENIED"
            log.write(f"{status}: {tool_name} -> {target}\n")
    except Exception as e:
        # Logging failure should not block retrieval; log and continue
        pass
    
    # Deny if not matched
    if not matched:
        print(json.dumps({
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": (
                    f"Blocked: source '{target}' is not on the approved allowlist. "
                    "Add it to allowlist.yaml with an owner and review date first."
                )
            }
        }))
        sys.exit(0)
    
    # Allow
    sys.exit(0)

if __name__ == "__main__":
    main()
```

**`.claude/settings.json`:**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "FetchDocument|QuerySourceIndex",
        "hooks": [
          {
            "type": "command",
            "command": "python3 .claude/hooks/check_allowlist.py"
          }
        ]
      }
    ]
  }
}
```

This ensures every call to `FetchDocument` or `QuerySourceIndex` passes through the allowlist check before executing.

### Defense in depth: MCP + hook

The corpus is accessed exclusively through a set of **MCP (Model Context Protocol) servers**, one per source type:
- `mcp-pubmed`: Scoped to PubMed/PMC literature APIs only
- `mcp-clinicaltrials`: Scoped to ClinicalTrials.gov and ISRCTN APIs only
- `mcp-patents`: Scoped to USPTO and EPO patent APIs only
- `mcp-internal-reports`: Scoped to the organization's internal report store only

Each MCP server is configured at deployment time with a fixed set of credentials and endpoint URLs for its approved sources — it has no code path to any other source. An agent cannot tell the `mcp-pubmed` connector to query a patent database; the connector doesn't have that capability.

The `PreToolUse` allowlist hook (described above) is a **second, independent check** that runs on every call. The hook validates that the target of the tool call matches an entry in `allowlist.yaml` before the call executes, regardless of which MCP connector initiated it.

This is defense in depth: for an unapproved source to be reached, *both* failures would have to occur simultaneously (a misconfigured MCP connector exposing an off-limits endpoint *and* a bypassed allowlist hook), which is exponentially less likely than a single failure. The MCP connector provides the primary boundary; the hook provides the auditability and the second gate.

## 4. Commitment 2 — Ground every claim

### The rule

Every sentence in the final answer must carry a citation ID that resolves to a specific passage actually retrieved through the allowlist gate. A sentence without a citation, or with a citation ID that doesn't exist in the session's retrieved set, is not a valid part of the answer — it is moved to `gaps`.

### Mechanism

After the agent drafts its answer text, a **grounding verification pass** runs:

1. **Sentence splitting**: Split the draft answer into sentences using a simple heuristic or NLP library.
2. **Citation audit**: For each sentence, check for an embedded citation ID (e.g., a JSON structure or a structured field like `[1]` or `{citation_id: "..."}`).
3. **Validation**: Check that every cited ID exists in the session's `citations` array (section 5). If not, reject the sentence.
4. **Semantic entailment (optional)**: Use a secondary model call to verify that the cited passage actually supports the claim, not just that the ID is present. This adds latency but catches cases where a citation ID is present but semantically mismatched.
5. **Strip ungrounded claims**: Any sentence that fails validation is removed from the answer and logged in `gaps` with a reason (e.g., "claimed but not cited", "citation ID not found").

### Failure mode prevented

This prevents fluent, confident-sounding synthesis that quietly goes beyond the retrieved evidence. An ungrounded agent can write "the treatment was effective in 85% of cases" even if the retrieved papers only mention "effectiveness was observed" — the grounding check catches this.

## 5. Commitment 3 — Structured output contract

Every response uses this fixed schema:

```json
{
  "answer": "string. A synthesized narrative answer to the research question. Every sentence must carry a citation ID to a passage in the citations array. No uncited claims.",
  "confidence": {
    "level": "high | medium | low",
    "basis": "string. A concrete explanation of the confidence level, e.g., '5 concordant peer-reviewed sources + 1 trial registry entry; all published in last 2 years' or 'only 1 internal report found; no peer-reviewed literature hit; allowlist last reviewed 18 months ago'."
  },
  "citations": [
    {
      "id": "string. A unique identifier for this citation (e.g., 'pubmed-12345678' or 'internal-report-2024-Q2').",
      "source": "string. One of: 'literature', 'patent', 'trial_registry', 'internal'.",
      "locator": "string. A source-specific unique identifier (e.g., PMID, patent number, NCT number, internal report ID).",
      "snippet": "string. The actual retrieved passage text, at least one sentence."
    }
  ],
  "gaps": [
    "string. A list of gaps, uncertainties, or conflicts in the evidence base, e.g., 'no trial registry entries found for this patient population', 'two internal reports conflict on the dosage threshold; cannot reconcile', 'literature last reviewed 8 months ago; FDA may have issued guidance since'."
  ]
}
```

### Key constraints

- **`answer`**: Prose narrative, every sentence tied to a citation in the `citations` array. Not a list of facts; not an abstract. A coherent argument backed by evidence.
- **`confidence.basis`**: Must name a concrete factor or factors: source count, cross-source agreement, publication recency, conflict detection, or allowlist staleness. Never a bare number (e.g., "0.87 confidence") with no explanation.
- **`gaps`**: A mandatory field, never omitted or empty-with-silence. If no gaps are found, the field is present with a brief statement like `["No gaps identified; evidence base is current and consistent across sources."]`. Why mandatory? Because an empty gaps field still prompts a human to think "what am I missing?" whereas no gaps field at all invites them to assume completeness.

## 6. Commitment 4 — Fail gracefully

The system does not try to answer every question. Instead, it applies a set of concrete checks to decide whether to answer, escalate, or refuse.

### Fail-safe trigger conditions

| Condition | Action |
|-----------|--------|
| **Zero hits from allowlisted sources** | Refuse to answer. Include in response: which source categories were queried and what search terms were used. Do not speculate. |
| **High-confidence conflicts** (e.g., two trial registry entries directly contradict each other) | Do not average or pick a side. Report both positions in `gaps`. Escalate to a human reviewer with the conflicting evidence trail attached. Do not issue an answer. |
| **Ambiguous research question** (e.g., "Is X good?" without specifying population, outcome, or timeframe) | Ask a clarifying question back instead of guessing. Do not execute retrieval if the question cannot be scoped. |
| **Allowlist staleness** (all matching sources in allowlist.yaml have `last_reviewed` >12 months ago) | Escalate to the owner(s) named in the allowlist entries before answering from those sources. Do not answer from stale-allowlist sources. |
| **Retrieval hook denial** (the allowlist gate denied access to a source the query needed) | Log the denial and treat it as a retrieval gap. If too many sources are unavailable, escalate rather than answer from too-thin evidence. |

### Define "escalate" operationally

Escalation is not a silent drop. Escalation means:
1. Package the partial evidence trail gathered so far: the original research question, which sources were queried and what was found (or not found), which sources were denied by the allowlist, and what the conflict or staleness issue is.
2. Route this package to a named human reviewer (e.g., "send to the research-ops-team Slack channel with context tag").
3. Log the escalation with a timestamp and the reason.
4. Return a response to the requester acknowledging the escalation and providing an ETA for human review.

Silent refusal is unacceptable because it incentivizes the requester to route around the system, defeating the allowlist control entirely.

### Define "refuse" operationally

Refusal is a direct, clear response to the requester:
- State exactly why the question cannot be answered: "No literature found. No trial registry entries found. Patent search pending."
- Do not speculate about what the answer might be.
- Provide a suggested next action: "Try a broader population definition." "Wait for patent search to complete." "Escalate to the team listed in allowlist.yaml as the owner for patent sources."

## 7. Source trail & auditability

Every request generates an audit trail sufficient to reconstruct the request after the fact.

### What is logged

For each request, log:
1. **Original question** — the exact research question asked.
2. **Allowlist gate log** — every retrieval tool call attempted: (tool name, target source, allowed/denied, timestamp).
3. **Retrieved passages** — every passage actually fetched, with source type, locator, snippet, and retrieval timestamp.
4. **Generated answer** — the draft answer before grounding verification.
5. **Grounding verification log** — for each sentence, whether it passed/failed validation and why.
6. **Final response** — the final answer after stripping ungrounded claims, plus citations array and gaps array.
7. **Decision gate log** — the fail-safe gate decisions: any condition that fired (ambiguous question, conflicts, staleness, zero hits), the decision (answer/escalate/refuse), and the reason.

### Audit format

Audit entries are JSON objects appended to an audit log file (e.g., `literature_review_audit.jsonl`). Each line is a complete entry:

```json
{
  "timestamp": "2026-06-15T14:32:01Z",
  "request_id": "req-abc123",
  "question": "What is the efficacy of metformin in preventing type 2 diabetes in prediabetic adults?",
  "sources_queried": ["literature", "trial_registry", "internal_reports"],
  "allowlist_gate_log": [
    {"tool": "FetchDocument", "target": "eutils.ncbi.nlm.nih.gov/...", "decision": "ALLOWED"},
    {"tool": "QuerySourceIndex", "target": "clinicaltrials.gov/api/...", "decision": "ALLOWED"}
  ],
  "retrieved_count": 12,
  "grounding_verified_sentences": 8,
  "grounding_rejected_sentences": 2,
  "final_decision": "ANSWER",
  "confidence_level": "high",
  "citations_count": 12,
  "gaps_count": 1
}
```

### How audit trail enforces the commitments

A reviewer reading this audit can verify:
1. **Allowlist enforcement**: Every retrieval tool call in `allowlist_gate_log` was allowed (not denied) by the hook, proving retrieval stayed inside approved sources.
2. **Grounding**: Comparing `grounding_rejected_sentences` > 0 proves the grounding checker stripped claims; the full ungrounded sentences can be logged separately for review.
3. **Structured output**: The response schema fields (confidence_level, citations_count, gaps_count) confirm structured output was produced.
4. **Fail-safe decision**: The `final_decision` field and any escalation reason are logged, proving a decision gate ran.

## 8. Open risks & tradeoffs

### Allowlist maintenance burden

The allowlist requires ongoing curation: someone must keep `last_reviewed` dates current and verify that sources listed still serve their intended purpose. A neglected allowlist (all entries with `last_reviewed` > 12 months old) will trigger the staleness escalation condition (section 6), blocking answers, until it is refreshed. This is intentional, but it does mean the allowlist is a maintenance responsibility, not a one-time configuration.

### Confidence calibration is hard to validate

The `confidence.basis` field makes the reasoning behind a confidence score transparent and inspectable — but does not guarantee the score is correct. Calibration requires ongoing feedback: did high-confidence answers later turn out wrong? Did low-confidence refusals later get overridden by human reviewers and turn out correct? A confidence calibration loop requires ground truth and retrospective analysis.

### Gaps field does not guarantee completeness

Even with a well-written `gaps` field, a human reviewer can skim past gaps and act as if the evidence is complete. The `gaps` field reduces this risk (it's explicit, hard to miss) but does not eliminate it. Organizational discipline and review process matter.

### Grounding verification adds latency

The grounding-verification pass (section 4) requires a secondary model call or a semantic-entailment check, adding latency to every response. A real deployment trades this latency cost against the cost of shipping ungrounded claims. For a high-stakes decision (e.g., clinical trial design), the latency is worth it. For a preliminary research question, it may not be.

## 9. Agent operating loop

This section formalizes one complete review cycle: what starts it, the steps the agent takes in order (and which approved tool each uses), every way the loop can stop, and where a human makes the final decision.

### Trigger

**Valid trigger only**: A named requester (an R&D scientist, analyst, or clinician with authentication to the review interface) submits one scoped research question through the approved request interface.

Examples of valid triggers:
- "What is the efficacy of metformin in preventing type 2 diabetes in prediabetic adults, per published trials?"
- "Has the FDA issued guidance on device labeling for product X since 2024?"

Examples of *invalid* attempts to trigger (the agent does not respond to these):
- An automated agent self-initiates a review based on a timer or external event — the agent never starts its own investigations.
- A scheduled re-run of a previously-asked question to "catch new literature" — each new question, or a resubmission after a clarifying request, is a fresh trigger, not a continuation or re-run.

### Steps in order (each with its approved tool)

1. **Receive & validate question** (no external tool)  
   Intake check: is the question non-empty and well-formed enough to attempt scoping? If the question is empty or malformed, reject it with a clear message and end the loop. This is the only step with no external tool call.

2. **Decompose into sub-queries** (Query Planner — internal reasoning, no external tool)  
   Break the research question into sub-queries, one per source type: What do I ask the literature index? The patent database? The trial registry? The internal reports? This step is pure reasoning; no external retrieval occurs yet.

3. **Connect to approved corpus** (MCP source connectors: `mcp-pubmed`, `mcp-clinicaltrials`, `mcp-patents`, `mcp-internal-reports`)  
   Establish connections to the four MCP servers, one per source type (see section 3's "Defense in depth"). Each connector is pre-scoped to its own corpus only; the agent cannot tell a connector to query outside its bounds.

4. **Retrieve documents** (`FetchDocument`/`QuerySourceIndex` through MCP connectors)  
   Execute the sub-queries from step 2 against the connectors. Every call passes the `PreToolUse` allowlist hook (`check_allowlist.py` from section 3) before execution — the hook validates the target and allows/denies independently.

5. **Ground claims** (Grounding/Citation Checker — section 4)  
   Take whatever was actually retrieved in step 4 and check that every sentence in a draft answer carries a valid citation ID to a retrieved passage. Strip ungrounded claims and move them to `gaps`.

6. **Compose structured output** (Structured Output Composer — section 5)  
   Fill the fixed schema: `answer` (with every sentence citation-tagged), `confidence` (level + basis), `citations` (array of ID/source/locator/snippet), `gaps` (mandatory list of holes, conflicts, or uncertainties).

7. **Apply fail-safe gate** (Fail-safe Gate logic — section 6)  
   Check the concrete trigger conditions: zero allowlisted hits? High-confidence conflicts? Ambiguous question? Stale allowlist? Hook denials? For each condition that fires, decide: proceed with answer, escalate to human, or refuse. The output of this step is a candidate answer (either a structured response or a refusal/escalation notice).

8. **Route to human reviewer** (no tool call; human-in-the-loop gate)  
   The candidate output (from step 7) is never released directly to the requester. Instead, it is routed to a named, domain-qualified reviewer (e.g., team lead, literature-review lead for that domain) for sign-off. The reviewer has access to the full structured output and the audit trail to date.

9. **Record** (Audit logger — section 7)  
   Append the full step-by-step trail to the audit log, capturing prompts at each reasoning step, MCP connectors used and their scopes, hook allow/deny decisions, the reviewer's identity and decision, and per-step timestamps. The entire loop is reconstructable from the audit trail alone.

### Stop conditions: success and every way the loop halts short of success

**Success — loop ends with release to requester:**
- The named reviewer approves the candidate output at step 8. The output is released to the original requester with the reviewer's sign-off attached and logged (with reviewer name, timestamp, and decision). Loop ends. The requester may now use the output to inform their decision.

**Halts short of success — loop ends without release to requester (each halt condition ends the loop entirely):**

| Condition | Outcome |
|-----------|---------|
| **Zero allowlisted sources return any hit** | Refuse: the agent states which source categories were queried, what search terms were used, and that no allowlisted sources produced a result. No answer is issued. Loop ends. |
| **High-confidence source conflict** (e.g., two trial registry entries directly contradict on a key parameter) | Escalate: the agent escalates to a human (not the requester) with the conflicting evidence trail attached. No answer is issued. Loop ends pending human input. |
| **Question is too ambiguous to scope** (e.g., "Is X good?" with no population, outcome, or timeframe specified) | Clarify: the agent sends a clarifying question back to the requester, asking them to specify the missing details. Loop ends. A resubmission is a new trigger (step 1 again). |
| **Allowlist stale for needed domain** (all matching entries in `allowlist.yaml` have `last_reviewed` > 12 months ago) | Escalate: the agent escalates to the named owner(s) of those allowlist entries, requesting a refresh. No answer is issued from stale sources. Loop ends pending allowlist refresh. |
| **Retrieval hook denies access to needed source** (the allowlist gate blocks access to a source the query needed) | Refuse: the agent logs the denial, treats it as a retrieval gap, and if too many sources are unavailable, refuses to answer and notifies the requester which sources were blocked. Loop ends. |
| **Named reviewer rejects the candidate output** (at step 8) | Reject: the reviewer's rejection reason is logged. Nothing is released to the requester. The requester may submit a fresh trigger (step 1 again) if they wish. Loop ends. |

### Human handoff point — where, who, why, what they see

**Where**: Between step 7 (fail-safe gate produces a candidate structured output) and release to the requester. The candidate output is *never* released directly — it must pass human review first.

**Who**: A named, domain-qualified reviewer (e.g., a literature-review team lead, principal investigator, or designated domain expert for that topic). Not the requester themselves — there must be an independent reviewer to prevent confirmation bias and ensure the answer meets the standards outlined in this spec.

**Why**: Section 1's critical non-goal: this system does not make the scientific decision. A human must confirm that (1) the answer is properly grounded in the retrieved evidence, (2) the confidence basis is reasonable and honest, and (3) the gaps are meaningfully stated. Only after this review can the output be treated as a decision-grade input to a scientific discussion.

**What they see**:
- The full structured output (answer, confidence, citations, gaps) from step 6.
- The audit trail from steps 1–7: the original question, sub-queries generated in step 2, which MCP connectors and sources were queried, the hook's allow/deny log, every retrieved passage, the grounding check decisions, and which fail-safe conditions (if any) were considered.
- The reviewer approves or rejects with a comment (e.g., "Grounding looks solid; confidence basis is honest" or "Gaps are too thin; I'm concerned the data from 2023 will be outdated").

### Recording — what audit trail must capture

Extend section 7's concept: the audit log must capture enough detail that the *entire loop*, not just the retrieval leg, is reconstructable after the fact. For every step above, log:

1. **Step entry/exit**: timestamp and which step.
2. **Prompts sent to the model**: the exact text/JSON prompt given to the model at each reasoning step (planner, grounding checker, output composer, fail-safe gate).
3. **Model responses**: the model's output at each step (sub-queries, grounding decisions, composed output).
4. **Tool calls**: which tool was invoked, its input parameters, which MCP connector (if applicable) and its configured scope.
5. **Hook decisions**: every `PreToolUse` hook invocation: the tool name, target, and allow/deny decision with reason.
6. **Decision gates**: at step 7, which fail-safe conditions were checked and what the gate decided (answer/escalate/refuse/clarify).
7. **Human review**: at step 8, the reviewer's identity, approval/rejection decision, and any comment.

Audit format: JSON lines (`.jsonl`), one complete entry per request. Each entry includes a `request_id` to link all steps together, and within it, an ordered array of `steps` capturing the above details. This makes it possible to replay or audit any request end-to-end.
