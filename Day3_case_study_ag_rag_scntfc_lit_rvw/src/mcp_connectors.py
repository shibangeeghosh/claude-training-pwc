from src.mock_corpus import MockCorpus
from src.allowlist import check_target

class MCPConnector:
    def __init__(self, name, source_type, allowed_pattern, corpus_search_method, allowlist):
        self.name = name
        self.source_type = source_type
        self.allowed_pattern = allowed_pattern
        self.corpus_search_method = corpus_search_method
        self.allowlist = allowlist

    def query(self, q):
        call_log = {
            "connector": self.name,
            "query": q,
            "target": self.allowed_pattern,
        }

        allowed, entry = check_target(self.allowed_pattern, self.allowlist)
        call_log["allowlist_decision"] = "ALLOWED" if allowed else "DENIED"

        if not allowed:
            return [], call_log

        results = self.corpus_search_method(q)
        call_log["result_count"] = len(results)
        return results, call_log

class MCPConnectorSet:
    def __init__(self, allowlist):
        self.corpus = MockCorpus()
        self.allowlist = allowlist

        self.pubmed = MCPConnector(
            "mcp-pubmed",
            "literature",
            "eutils.ncbi.nlm.nih.gov/*",
            self.corpus.search_literature,
            allowlist
        )

        self.clinicaltrials = MCPConnector(
            "mcp-clinicaltrials",
            "trial_registry",
            "clinicaltrials.gov/api/*",
            self.corpus.search_trials,
            allowlist
        )

        self.patents = MCPConnector(
            "mcp-patents",
            "patent",
            "data.epo.org/patent/*",
            self.corpus.search_patents,
            allowlist
        )

        self.internal = MCPConnector(
            "mcp-internal-reports",
            "internal",
            "reports.internal.corp/*",
            self.corpus.search_internal_reports,
            allowlist
        )
