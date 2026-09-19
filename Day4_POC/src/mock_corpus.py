"""In-memory mock corpus, standing in for real literature/patent/trial/internal indices.

Retrieval is domain-scoped keyword matching -- no embeddings/vector store, consistent with
Day3_case_study_ag_rag_scntfc_lit_rvw's documented simplification.
"""
from __future__ import annotations

import json
import os

DATA_FILES = {
    "literature": "literature.json",
    "trial_registry": "trials.json",
    "patent": "patents.json",
    "internal": "internal_reports.json",
}


class MockCorpus:
    def __init__(self, data_dir: str):
        self.docs: dict[str, list[dict]] = {}
        for source_type, filename in DATA_FILES.items():
            path = os.path.join(data_dir, filename)
            with open(path, "r") as f:
                self.docs[source_type] = json.load(f)

    def search(self, source_type: str, query: str, domain_id: str) -> list[dict]:
        docs = [d for d in self.docs.get(source_type, []) if d.get("domain") == domain_id]
        return _keyword_search(docs, query)


def _keyword_search(docs: list[dict], query: str) -> list[dict]:
    words = {w.lower() for w in query.split() if len(w) > 3}
    if not words:
        return []
    results = []
    for doc in docs:
        doc_keywords = {k.lower() for k in doc.get("keywords", [])}
        if words & doc_keywords:
            results.append(doc)
    return results
