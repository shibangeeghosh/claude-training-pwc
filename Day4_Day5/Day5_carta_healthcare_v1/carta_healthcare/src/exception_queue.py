"""In-process ExceptionItem store. A document's structured-output is never blocked as
a batch by a backlog here - individually-completed fields remain available even while
other fields on the same document await abstractor resolution (LLD S5)."""

_EXCEPTIONS = {}


def add_exception(document_id, field_name, validation_result, assigned_to=None):
    exception_id = f"{document_id}:{field_name}"
    item = {
        "exception_id": exception_id,
        "document_id": document_id,
        "field_name": field_name,
        "validation_result": validation_result,
        "assigned_to": assigned_to,
        "resolution": None,
        "resolved_by": None,
        "corrected_value": None,
    }
    _EXCEPTIONS[exception_id] = item
    return item


def list_exceptions(document_id=None, assigned_to=None):
    items = list(_EXCEPTIONS.values())
    if document_id is not None:
        items = [i for i in items if i["document_id"] == document_id]
    if assigned_to is not None:
        items = [i for i in items if i["assigned_to"] == assigned_to]
    return items


def get_exception(exception_id):
    return _EXCEPTIONS.get(exception_id)


def resolve_exception(exception_id, resolution, resolver, corrected_value=None):
    """resolution must be 'corrected' or 'confirmed' - never auto-resolved."""
    item = _EXCEPTIONS.get(exception_id)
    if not item:
        raise KeyError(f"No exception found for id {exception_id!r}")
    if resolution not in ("corrected", "confirmed"):
        raise ValueError(f"Invalid resolution: {resolution!r}")

    item["resolution"] = resolution
    item["resolved_by"] = resolver
    if resolution == "corrected":
        item["corrected_value"] = corrected_value
    return item


def open_exceptions_for_document(document_id):
    return [i for i in list_exceptions(document_id=document_id) if i["resolution"] is None]


def reset():
    """Test/demo helper - clears all in-process exceptions."""
    _EXCEPTIONS.clear()
