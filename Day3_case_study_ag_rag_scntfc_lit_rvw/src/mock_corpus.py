import json
import os

class MockCorpus:
    def __init__(self, data_dir="data"):
        self.data_dir = data_dir
        self.literature = self._load_json("literature.json")
        self.trials = self._load_json("trials.json")
        self.patents = self._load_json("patents.json")
        self.internal_reports = self._load_json("internal_reports.json")

    def _load_json(self, filename):
        path = os.path.join(self.data_dir, filename)
        if os.path.exists(path):
            with open(path) as f:
                return json.load(f)
        return []

    def search_literature(self, query):
        return self._keyword_search(self.literature, query)

    def search_trials(self, query):
        return self._keyword_search(self.trials, query)

    def search_patents(self, query):
        return self._keyword_search(self.patents, query)

    def search_internal_reports(self, query):
        return self._keyword_search(self.internal_reports, query)

    def _keyword_search(self, corpus, query):
        query_words = set(w.lower() for w in query.split() if len(w) > 3)
        results = []
        for doc in corpus:
            doc_keywords = set(doc.get("keywords", []))
            doc_text = (doc.get("title", "") + " " + doc.get("snippet", "")).lower()
            keyword_matches = len(query_words & doc_keywords)
            if keyword_matches >= 1:
                results.append(doc)
        return results
