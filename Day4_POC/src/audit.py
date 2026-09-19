"""Step 9 of the agent loop: append-only JSONL audit trail. Never receives or writes the raw
Groq API key -- only user/domain/model metadata plus the decision trail.
"""
from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone

AUDIT_LOG_PATH = "audit_log.jsonl"


def record_request(
    user: str,
    domain: str,
    model: str,
    question: str,
    hook_log: list[dict],
    retrieved_count: int,
    status: str,
    reason: str | None,
    reviewer_decision: dict | None = None,
    path: str = AUDIT_LOG_PATH,
) -> str:
    request_id = uuid.uuid4().hex[:8]
    entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "request_id": request_id,
        "user": user,
        "domain": domain,
        "model": model,
        "question": question,
        "allowlist_gate_log": [
            {k: v for k, v in log.items() if k != "allowlist_entry"} for log in hook_log
        ],
        "retrieved_count": retrieved_count,
        "status": status,
        "reason": reason,
        "reviewer_decision": reviewer_decision,
    }
    with open(path, "a") as f:
        f.write(json.dumps(entry) + "\n")
    return request_id


def record_reviewer_decision(request_id: str, approved: bool, note: str, path: str = AUDIT_LOG_PATH) -> None:
    """Best-effort append of a follow-up decision line, keyed to the original request_id.

    audit_log.jsonl is append-only, so the reviewer decision is written as its own line rather
    than mutating the original entry in place.
    """
    entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "request_id": request_id,
        "reviewer_decision": {
            "approved": approved,
            "note": note,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    }
    with open(path, "a") as f:
        f.write(json.dumps(entry) + "\n")
