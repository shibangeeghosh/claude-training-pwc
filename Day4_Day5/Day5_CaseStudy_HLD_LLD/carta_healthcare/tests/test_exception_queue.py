import pytest

from src import exception_queue

VALIDATION_RESULT = {"field_name": "primary_diagnosis", "status": "exception", "checks": {}, "reason": "low_extraction_confidence"}


def test_add_exception_creates_item_with_composite_id():
    item = exception_queue.add_exception("doc-1", "primary_diagnosis", VALIDATION_RESULT)
    assert item["exception_id"] == "doc-1:primary_diagnosis"
    assert item["resolution"] is None


def test_list_exceptions_filters_by_document_id():
    exception_queue.add_exception("doc-1", "primary_diagnosis", VALIDATION_RESULT)
    exception_queue.add_exception("doc-2", "primary_diagnosis", VALIDATION_RESULT)
    assert len(exception_queue.list_exceptions(document_id="doc-1")) == 1


def test_get_exception_returns_none_for_unknown_id():
    assert exception_queue.get_exception("doc-99:missing") is None


def test_resolve_exception_confirmed_does_not_set_corrected_value():
    exception_queue.add_exception("doc-1", "primary_diagnosis", VALIDATION_RESULT)
    resolved = exception_queue.resolve_exception("doc-1:primary_diagnosis", "confirmed", "abstractor1")
    assert resolved["resolution"] == "confirmed"
    assert resolved["resolved_by"] == "abstractor1"
    assert resolved["corrected_value"] is None


def test_resolve_exception_corrected_sets_corrected_value():
    exception_queue.add_exception("doc-1", "primary_diagnosis", VALIDATION_RESULT)
    resolved = exception_queue.resolve_exception("doc-1:primary_diagnosis", "corrected", "abstractor1", corrected_value="STEMI")
    assert resolved["resolution"] == "corrected"
    assert resolved["corrected_value"] == "STEMI"


def test_resolve_exception_rejects_invalid_resolution():
    exception_queue.add_exception("doc-1", "primary_diagnosis", VALIDATION_RESULT)
    with pytest.raises(ValueError):
        exception_queue.resolve_exception("doc-1:primary_diagnosis", "auto_accepted", "system")


def test_resolve_exception_raises_for_unknown_id():
    with pytest.raises(KeyError):
        exception_queue.resolve_exception("doc-99:missing", "confirmed", "abstractor1")


def test_open_exceptions_for_document_excludes_resolved():
    exception_queue.add_exception("doc-1", "field_a", VALIDATION_RESULT)
    exception_queue.add_exception("doc-1", "field_b", VALIDATION_RESULT)
    exception_queue.resolve_exception("doc-1:field_a", "confirmed", "abstractor1")
    open_items = exception_queue.open_exceptions_for_document("doc-1")
    assert len(open_items) == 1
    assert open_items[0]["field_name"] == "field_b"
