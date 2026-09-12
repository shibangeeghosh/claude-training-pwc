import json
import os
from datetime import datetime
import uuid

AUDIT_LOG_PATH = "audit_log.jsonl"

def record_request(question, hook_log, retrieved_count, failsafe_decision, reviewer_decision=None):
    request_id = str(uuid.uuid4())[:8]
    timestamp = datetime.now().isoformat()

    entry = {
        "timestamp": timestamp,
        "request_id": request_id,
        "question": question,
        "allowlist_gate_log": hook_log,
        "retrieved_count": retrieved_count,
        "final_decision": failsafe_decision.get("action", "unknown"),
        "decision_reason": failsafe_decision.get("reason"),
        "reviewer_decision": reviewer_decision
    }

    with open(AUDIT_LOG_PATH, "a") as f:
        f.write(json.dumps(entry) + "\n")

    return request_id
