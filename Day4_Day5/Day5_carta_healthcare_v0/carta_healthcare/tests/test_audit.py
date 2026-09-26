from src import audit


def test_record_event_writes_a_json_line(tmp_path):
    log_path = str(tmp_path / "audit_log.jsonl")
    audit.record_event("classified", "doc-1", detail={"confidence": 0.9}, log_path=log_path)

    events = audit.read_events(log_path=log_path)
    assert len(events) == 1
    assert events[0]["event_type"] == "classified"
    assert events[0]["document_id"] == "doc-1"
    assert "timestamp" in events[0]


def test_read_events_filters_by_document_id(tmp_path):
    log_path = str(tmp_path / "audit_log.jsonl")
    audit.record_event("classified", "doc-1", log_path=log_path)
    audit.record_event("classified", "doc-2", log_path=log_path)

    events = audit.read_events(document_id="doc-1", log_path=log_path)
    assert len(events) == 1
    assert events[0]["document_id"] == "doc-1"


def test_read_events_returns_empty_list_when_log_missing(tmp_path):
    missing_path = str(tmp_path / "does_not_exist.jsonl")
    assert audit.read_events(log_path=missing_path) == []


def test_record_event_never_persists_an_api_key(tmp_path):
    log_path = str(tmp_path / "audit_log.jsonl")
    audit.record_event("classified", "doc-1", detail={"confidence": 0.9}, actor="abstractor1", log_path=log_path)

    with open(log_path, "r", encoding="utf-8") as f:
        raw = f.read()
    assert "api_key" not in raw
    assert "groq_key" not in raw
