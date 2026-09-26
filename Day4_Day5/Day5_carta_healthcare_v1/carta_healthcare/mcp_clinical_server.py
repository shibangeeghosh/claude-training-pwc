"""Custom MCP server exposing read-only introspection over Carta's config-driven pipeline
(registries, extraction specs, coding-reference RAG index, sample documents, exceptions) --
same {"ok": bool, ...} return-shape convention as Day4_POC's mcp_lit_review_server.py. This is
a dev-time/agent-orchestration artifact: the Flask app itself calls src/ directly rather than
going over the MCP protocol at request time.
"""
import os
import sys

from mcp.server.mcpserver import MCPServer

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src import exception_queue, extraction_spec, ingest, rag_index, registry_config  # noqa: E402

mcp = MCPServer("carta-clinical")


@mcp.tool()
def list_document_types() -> dict:
    """List the clinical document types with a loaded extraction spec (document_type, spec_id, version)."""
    specs = extraction_spec.load_all_specs()
    return {
        "ok": True,
        "document_types": [
            {"document_type": dt, "spec_id": spec["spec_id"], "version": spec["version"]}
            for dt, spec in specs.items()
        ],
    }


@mcp.tool()
def get_extraction_spec(document_type: str) -> dict:
    """Return the full extraction spec (fields, coding standards, criticality) for one document_type."""
    try:
        spec = extraction_spec.load_spec(document_type)
    except ValueError:
        return {"ok": False, "error_type": "UNKNOWN_DOCUMENT_TYPE", "document_type": document_type}
    return {"ok": True, "spec": spec}


@mcp.tool()
def list_registries() -> dict:
    """List the clinical registries a submitting abstractor can select (id, name, document_types)."""
    return {"ok": True, "registries": registry_config.load_registries()}


@mcp.tool()
def search_coding_reference(coding_standard: str, query: str, top_k: int = 5) -> dict:
    """RAG-search the icd10/cpt/snomed coding reference for candidates matching query text."""
    candidates = rag_index.search(query, coding_standard, top_k=top_k)
    return {"ok": True, "candidates": candidates}


@mcp.tool()
def list_sample_documents() -> dict:
    """List the synthetic sample documents available under data/sample_documents/."""
    return {"ok": True, "documents": ingest.list_sample_documents()}


@mcp.tool()
def list_exceptions(document_id: str = None, assigned_to: str = None) -> dict:
    """List ExceptionItems currently in the queue, optionally filtered by document_id/assigned_to."""
    return {"ok": True, "exceptions": exception_queue.list_exceptions(document_id=document_id, assigned_to=assigned_to)}


if __name__ == "__main__":
    mcp.run()
