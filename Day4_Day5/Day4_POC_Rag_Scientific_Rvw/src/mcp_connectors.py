"""Pre-scoped connectors, each bound to exactly one allowlist pattern (defense in depth:
a connector cannot reach outside its declared target even before the allowlist check runs).
"""
from __future__ import annotations

from .allowlist import check_target
from .mock_corpus import MockCorpus


class MCPConnector:
    def __init__(self, name: str, source_type: str, target: str, corpus: MockCorpus, allowlist: list[dict]):
        self.name = name
        self.source_type = source_type
        self.target = target
        self.corpus = corpus
        self.allowlist = allowlist

    def query(self, query: str, domain_id: str) -> dict:
        allowed, entry = check_target(self.target, self.allowlist)
        log_entry = {
            "connector": self.name,
            "query": query,
            "target": self.target,
            "allowlist_decision": "ALLOWED" if allowed else "DENIED",
            "allowlist_entry": entry,
            "result_count": 0,
        }
        if not allowed:
            return {"results": [], "log": log_entry}
        results = self.corpus.search(self.source_type, query, domain_id)
        log_entry["result_count"] = len(results)
        return {"results": results, "log": log_entry}


class MCPConnectorSet:
    def __init__(self, corpus: MockCorpus, allowlist: list[dict]):
        self.connectors = [
            MCPConnector("mcp-pubmed", "literature", "eutils.ncbi.nlm.nih.gov/*", corpus, allowlist),
            MCPConnector("mcp-clinicaltrials", "trial_registry", "clinicaltrials.gov/api/*", corpus, allowlist),
            MCPConnector("mcp-patents-epo", "patent", "data.epo.org/patent/*", corpus, allowlist),
            MCPConnector("mcp-patents-uspto", "patent", "developer.uspto.gov/*", corpus, allowlist),
            MCPConnector("mcp-internal-reports", "internal", "reports.internal.corp/*", corpus, allowlist),
        ]
