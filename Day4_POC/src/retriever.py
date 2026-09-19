"""Steps 3-4 of the agent loop: run every connector (allowlist- and domain-gated) and collect
retrieved passages, each tagged with a citation_id that grounding/structured-output rely on.
"""
from __future__ import annotations

from .mcp_connectors import MCPConnectorSet


def retrieve(sub_queries: dict, domain_id: str, connector_set: MCPConnectorSet) -> tuple[list[dict], list[dict]]:
    retrieved_passages = []
    hook_log = []
    for connector in connector_set.connectors:
        query = sub_queries.get(connector.source_type)
        if not query:
            continue
        outcome = connector.query(query, domain_id)
        hook_log.append(outcome["log"])
        for result in outcome["results"]:
            citation_id = f"{connector.source_type}-{result['id']}"
            retrieved_passages.append(
                {
                    "citation_id": citation_id,
                    "source": result["source"],
                    "source_type": connector.source_type,
                    "locator": result["locator"],
                    "title": result.get("title"),
                    "snippet": result["snippet"],
                    "full_doc": result,
                }
            )
    return retrieved_passages, hook_log
