"""Orchestrates the full agent loop for one research question: plan -> retrieve -> ground ->
compose -> fail-safe gate -> audit. Human review (approve/reject) happens one layer up, in
app.py, since it's a separate user action taken after this function returns.
"""
from __future__ import annotations

from . import audit, failsafe, grounding, query_planner, structured_output
from .mcp_connectors import MCPConnectorSet


def run_review_loop(
    question: str,
    domain: dict,
    api_key: str,
    model: str,
    user: str,
    connector_set: MCPConnectorSet,
) -> dict:
    question = (question or "").strip()
    if not question:
        return {"status": "error", "reason": "Question must not be empty."}

    plan = query_planner.plan_query(question, domain, api_key, model)
    if plan["ambiguous"]:
        request_id = audit.record_request(
            user, domain["id"], model, question, [], 0, "clarify", plan["clarify_message"]
        )
        return {"status": "clarify", "reason": plan["clarify_message"], "request_id": request_id}

    from .retriever import retrieve  # local import avoids a cycle with mcp_connectors at module load

    retrieved_passages, hook_log = retrieve(plan["sub_queries"], domain["id"], connector_set)

    if not retrieved_passages:
        decision = {"status": "refuse", "reason": "No evidence was found for this question in the selected domain."}
        request_id = audit.record_request(
            user, domain["id"], model, question, hook_log, 0, decision["status"], decision["reason"]
        )
        return {**decision, "request_id": request_id}

    ground_result = grounding.draft_and_verify(question, retrieved_passages, api_key, model)
    decision = failsafe.apply_failsafe_gate(retrieved_passages, hook_log, ground_result)

    if decision["status"] != "answer":
        request_id = audit.record_request(
            user, domain["id"], model, question, hook_log, len(retrieved_passages),
            decision["status"], decision["reason"],
        )
        return {"status": decision["status"], "reason": decision["reason"], "request_id": request_id}

    output = structured_output.compose_structured_output(
        ground_result, domain["label"], model, extra_gaps=decision["gaps"]
    )
    request_id = audit.record_request(
        user, domain["id"], model, question, hook_log, len(retrieved_passages), "pending_review", None
    )
    return {
        "status": "pending_review",
        "request_id": request_id,
        "usage": ground_result.get("usage", {}),
        **output,
    }
