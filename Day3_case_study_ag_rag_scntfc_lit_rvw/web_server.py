#!/usr/bin/env python3

from flask import Flask, render_template, request, jsonify
from src.review_loop import run_review_loop as original_review_loop
from src.query_planner import decompose_question
from src.retriever import retrieve
from src.grounding import ground_claims
from src.structured_output import compose_structured_output
from src.failsafe import apply_failsafe_gate
from src.audit import record_request
from src.mcp_connectors import MCPConnectorSet
from src.allowlist import load_allowlist
from datetime import datetime
import json

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/review", methods=["POST"])
def api_review():
    data = request.get_json()
    question = data.get("question", "").strip()

    if not question:
        return jsonify({"status": "error", "message": "Empty question"}), 400

    # Load allowlist and MCP connectors
    allowlist = load_allowlist("allowlist.yaml")
    mcp_connectors = MCPConnectorSet(allowlist)

    # Step 2: Decompose
    sub_queries, clarify_msg = decompose_question(question)
    if not sub_queries:
        return jsonify({
            "status": "clarify",
            "message": clarify_msg,
            "question": question
        }), 200

    # Step 3-4: Retrieve
    retrieved_passages, hook_log = retrieve(sub_queries, mcp_connectors)

    # Step 5: Ground
    draft_answer, grounding_log = ground_claims(retrieved_passages)

    # Step 7: Fail-safe gate
    failsafe_decision = apply_failsafe_gate(retrieved_passages, hook_log, allowlist, mcp_connectors)

    if failsafe_decision["action"] == "refuse":
        record_request(question, hook_log, len(retrieved_passages), failsafe_decision)
        return jsonify({
            "status": "refuse",
            "message": failsafe_decision["message"],
            "question": question
        }), 200

    if failsafe_decision["action"] == "escalate":
        record_request(question, hook_log, len(retrieved_passages), failsafe_decision)
        return jsonify({
            "status": "escalate",
            "reason": failsafe_decision["reason"],
            "conflicts": failsafe_decision.get("conflicts", []),
            "question": question
        }), 200

    # Step 6: Compose structured output
    structured = compose_structured_output(draft_answer, retrieved_passages, failsafe_decision.get("gaps", []))
    if not structured:
        record_request(question, hook_log, len(retrieved_passages), failsafe_decision)
        return jsonify({"status": "error", "message": "Failed to compose output"}), 500

    # Step 8: Human review (auto-approve for web demo)
    reviewer_decision = {
        "approved": True,
        "timestamp": datetime.now().isoformat(),
        "note": "Auto-approved via web interface"
    }

    # Step 9: Record
    request_id = record_request(question, hook_log, len(retrieved_passages), failsafe_decision, reviewer_decision)

    return jsonify({
        "status": "success",
        "question": question,
        "request_id": request_id,
        "output": structured,
        "audit": {
            "retrieved_count": len(retrieved_passages),
            "allowlist_checks": len(hook_log),
            "hook_log": hook_log
        }
    }), 200

if __name__ == "__main__":
    print("\n" + "="*60)
    print("Starting Agentic RAG Web Server")
    print("="*60)
    print("\n🌐 Open your browser: http://localhost:5000")
    print("\nAPI endpoint: POST http://localhost:5000/api/review")
    print("  Body: {\"question\": \"your research question\"}")
    print("\n" + "="*60 + "\n")
    app.run(debug=False, host="127.0.0.1", port=5000)
