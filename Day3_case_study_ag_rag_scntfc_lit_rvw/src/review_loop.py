import json
from src.query_planner import decompose_question
from src.retriever import retrieve
from src.grounding import ground_claims
from src.structured_output import compose_structured_output
from src.failsafe import apply_failsafe_gate
from src.audit import record_request
from src.mcp_connectors import MCPConnectorSet
from src.allowlist import load_allowlist

def run_review_loop(question):
    print("\n" + "="*60)
    print("LITERATURE REVIEW LOOP STARTED")
    print("="*60)

    # Step 1: Receive & validate question
    print(f"\n[Step 1] Received question: {question}")
    if not question or not question.strip():
        print("[ERROR] Empty question. Refusing.")
        return None

    # Load allowlist and MCP connectors
    allowlist = load_allowlist("allowlist.yaml")
    mcp_connectors = MCPConnectorSet(allowlist)

    # Step 2: Decompose into sub-queries
    print("\n[Step 2] Decomposing question into sub-queries...")
    sub_queries, clarify_msg = decompose_question(question)
    if not sub_queries:
        print(f"[CLARIFY] {clarify_msg}")
        return {
            "status": "CLARIFY",
            "message": clarify_msg,
            "request_id": None
        }

    for source, subq in sub_queries.items():
        print(f"  {source}: {subq}")

    # Step 3-4: Connect and retrieve
    print("\n[Step 3-4] Retrieving documents through allowlist gate...")
    retrieved_passages, hook_log = retrieve(sub_queries, mcp_connectors)
    print(f"  Total passages retrieved: {len(retrieved_passages)}")
    for log in hook_log:
        decision_str = "✓ ALLOWED" if log["allowlist_decision"] == "ALLOWED" else "✗ DENIED"
        print(f"    {log['connector']}: {decision_str} ({log['result_count']} results)")

    # Step 5: Ground claims
    print("\n[Step 5] Grounding claims...")
    draft_answer, grounding_log = ground_claims(retrieved_passages)
    if draft_answer:
        print(f"  Draft answer ({len(grounding_log)} grounded sentences):")
        for i, sent in enumerate(grounding_log, 1):
            print(f"    [{i}] Citation {sent['citation_id']}: {sent['status']}")
    else:
        print("  No answer could be drafted (no retrieved passages to ground from).")

    # Step 7: Apply fail-safe gate
    print("\n[Step 7] Applying fail-safe gate...")
    failsafe_decision = apply_failsafe_gate(retrieved_passages, hook_log, allowlist, mcp_connectors)
    print(f"  Decision: {failsafe_decision['status']} (action: {failsafe_decision['action']})")
    if failsafe_decision.get("reason"):
        print(f"  Reason: {failsafe_decision['reason']}")

    if failsafe_decision["action"] == "refuse":
        print(f"  Message: {failsafe_decision['message']}")
        record_request(question, hook_log, len(retrieved_passages), failsafe_decision)
        return {
            "status": "REFUSE",
            "message": failsafe_decision["message"],
            "request_id": None
        }

    if failsafe_decision["action"] == "escalate":
        print(f"  Escalating to human reviewer...")
        if failsafe_decision.get("conflicts"):
            for conf in failsafe_decision["conflicts"]:
                print(f"    - {conf}")
        record_request(question, hook_log, len(retrieved_passages), failsafe_decision)
        return {
            "status": "ESCALATE",
            "reason": failsafe_decision["reason"],
            "conflicts": failsafe_decision.get("conflicts", []),
            "request_id": None
        }

    # Step 6: Compose structured output
    print("\n[Step 6] Composing structured output...")
    structured = compose_structured_output(draft_answer, retrieved_passages, failsafe_decision.get("gaps", []))
    if not structured:
        print("  Failed to compose structured output.")
        record_request(question, hook_log, len(retrieved_passages), failsafe_decision)
        return {"status": "ERROR", "request_id": None}

    print(f"  Confidence level: {structured['confidence']['level']}")
    print(f"  Confidence basis: {structured['confidence']['basis']}")
    print(f"  Citations: {len(structured['citations'])}")
    print(f"  Gaps: {len(structured['gaps'])}")

    # Step 8: Human review
    print("\n[Step 8] HUMAN REVIEW - Candidate output ready for approval")
    print("\n--- CANDIDATE STRUCTURED OUTPUT ---")
    print(json.dumps(structured, indent=2))
    print("\n--- AUDIT TRAIL SUMMARY ---")
    print(f"Question: {question}")
    print(f"Sources queried: {len(hook_log)}")
    for log in hook_log:
        print(f"  {log['connector']}: {log['allowlist_decision']} ({log['result_count']} results)")
    print(f"Retrieved passages: {len(retrieved_passages)}")

    approval = input("\nApprove and release to requester? (y/n): ").strip().lower()

    reviewer_decision = {
        "approved": approval == "y",
        "timestamp": __import__("datetime").datetime.now().isoformat()
    }

    if approval != "y":
        print("\n[Step 8] Output REJECTED. Not released to requester.")
        record_request(question, hook_log, len(retrieved_passages), failsafe_decision, reviewer_decision)
        return {
            "status": "REJECTED",
            "message": "Reviewer rejected the output.",
            "request_id": None
        }

    # Step 9: Record
    print("\n[Step 9] Recording audit trail...")
    request_id = record_request(question, hook_log, len(retrieved_passages), failsafe_decision, reviewer_decision)
    print(f"  Request ID: {request_id}")

    print("\n" + "="*60)
    print("✓ OUTPUT RELEASED TO REQUESTER")
    print("="*60)
    print("\n--- FINAL STRUCTURED OUTPUT ---")
    print(json.dumps(structured, indent=2))

    return {
        "status": "SUCCESS",
        "output": structured,
        "request_id": request_id
    }
