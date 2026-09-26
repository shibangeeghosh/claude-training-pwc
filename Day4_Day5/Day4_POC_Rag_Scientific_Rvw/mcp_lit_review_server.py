"""Custom MCP server exposing domain-aware, allowlist-gated search over the mock literature
review corpus -- same tool shape/convention as Day4_SIP's fund_data_mcp_server.py
({"ok": bool, ...} return shape). This is a dev-time/agent-orchestration artifact: the Flask
app itself calls src/ directly rather than going over the MCP protocol (same convention as
Day3_case_study_ag_rag_scntfc_lit_rvw and Day4_SIP).
"""
import os
import sys

from mcp.server.mcpserver import MCPServer

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.allowlist import load_allowlist  # noqa: E402
from src.domains import get_domain, load_domains  # noqa: E402
from src.mcp_connectors import MCPConnectorSet  # noqa: E402
from src.mock_corpus import MockCorpus  # noqa: E402

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

mcp = MCPServer("lit-review")

_allowlist = load_allowlist(os.path.join(BASE_DIR, "allowlist.yaml"))
_domains = load_domains(os.path.join(BASE_DIR, "domains.yaml"))
_corpus = MockCorpus(os.path.join(BASE_DIR, "data"))
_connectors = MCPConnectorSet(_corpus, _allowlist)
_connector_by_type = {}
for c in _connectors.connectors:
    _connector_by_type.setdefault(c.source_type, []).append(c)


def _search(source_type: str, domain_id: str, query: str) -> dict:
    if get_domain(_domains, domain_id) is None:
        return {"ok": False, "error_type": "UNKNOWN_DOMAIN", "domain_id": domain_id}
    all_results = []
    denied = []
    for connector in _connector_by_type.get(source_type, []):
        outcome = connector.query(query, domain_id)
        if outcome["log"]["allowlist_decision"] == "DENIED":
            denied.append(connector.name)
        all_results.extend(outcome["results"])
    if not all_results and denied:
        return {"ok": False, "error_type": "ALLOWLIST_DENIED", "denied_connectors": denied}
    if not all_results:
        return {"ok": False, "error_type": "NO_MATCH", "domain_id": domain_id, "query": query}
    return {"ok": True, "results": all_results}


@mcp.tool()
def list_domains() -> dict:
    """List the therapeutic/research-area domains a search can be scoped to."""
    return {"ok": True, "domains": [{"id": d["id"], "label": d["label"]} for d in _domains]}


@mcp.tool()
def search_literature(domain_id: str, query: str) -> dict:
    """Search mock PubMed-style literature, scoped to one domain_id from list_domains()."""
    return _search("literature", domain_id, query)


@mcp.tool()
def search_trials(domain_id: str, query: str) -> dict:
    """Search mock ClinicalTrials.gov-style trial registry entries, scoped to a domain_id."""
    return _search("trial_registry", domain_id, query)


@mcp.tool()
def search_patents(domain_id: str, query: str) -> dict:
    """Search mock EPO/USPTO-style patent records, scoped to a domain_id."""
    return _search("patent", domain_id, query)


@mcp.tool()
def search_internal_reports(domain_id: str, query: str) -> dict:
    """Search mock internal R&D report records, scoped to a domain_id."""
    return _search("internal", domain_id, query)


if __name__ == "__main__":
    mcp.run()
