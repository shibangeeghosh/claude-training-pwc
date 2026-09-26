"""Append-only JSONL audit trail. Never writes the Groq API key - callers only ever
pass document/field-level event data here, so there's nothing to persist by accident.
"""

import datetime
import json
import os

_AUDIT_LOG_PATH = os.path.join(os.path.dirname(__file__), "..", "audit_log.jsonl")


def record_event(event_type, document_id, field_name=None, actor=None, detail=None, log_path=_AUDIT_LOG_PATH):
    event = {
        "event_type": event_type,
        "document_id": document_id,
        "field_name": field_name,
        "actor": actor,
        "detail": detail,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }
    with open(log_path, "a", encoding="utf-8") as f:
        f.write(json.dumps(event) + "\n")
    return event


def read_events(document_id=None, log_path=_AUDIT_LOG_PATH):
    if not os.path.exists(log_path):
        return []
    events = []
    with open(log_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            event = json.loads(line)
            if document_id is None or event.get("document_id") == document_id:
                events.append(event)
    return events
