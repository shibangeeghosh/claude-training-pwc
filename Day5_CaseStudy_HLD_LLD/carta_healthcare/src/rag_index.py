"""Pure-stdlib TF-IDF + cosine similarity index over the curated coding-standard corpus.

Deliberately dependency-light (re/math/collections only, no numpy/embeddings API) -
this is a small, curated reference set (not a full code-set mirror), and TF-IDF is
more discriminative than plain keyword overlap for medical text where common words
("acute", "chronic") would otherwise over-match. This is the RAG engine that makes
normalization's coding-standard choice grounded rather than an ungrounded LLM guess.
"""

import json
import math
import os
import re
from collections import Counter

CODING_REFERENCE_VERSION = "coding_reference_v1"

_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "coding_reference")

_TOKEN_RE = re.compile(r"[a-z]{2,}")


def _tokenize(text):
    return _TOKEN_RE.findall(text.lower())


def _entry_text(entry):
    return " ".join([entry.get("description", "")] + entry.get("synonyms", []))


def _load_corpus(coding_standard, data_dir):
    path = os.path.join(data_dir, f"{coding_standard}.json")
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


class RagIndex:
    """A TF-IDF index, built once per coding_standard, over its reference entries."""

    def __init__(self, data_dir=_DATA_DIR):
        self.data_dir = data_dir
        self._indexes = {}  # coding_standard -> {"entries": [...], "vectors": [...], "idf": {...}}
        for coding_standard in ("icd10", "cpt", "snomed"):
            entries = _load_corpus(coding_standard, data_dir)
            self._indexes[coding_standard] = self._build_index(entries)

    def _build_index(self, entries):
        doc_tokens = [_tokenize(_entry_text(e)) for e in entries]
        n_docs = len(entries)

        doc_freq = Counter()
        for tokens in doc_tokens:
            for term in set(tokens):
                doc_freq[term] += 1

        idf = {
            term: math.log((1 + n_docs) / (1 + df)) + 1.0
            for term, df in doc_freq.items()
        }

        vectors = []
        for tokens in doc_tokens:
            tf = Counter(tokens)
            vec = {term: count * idf.get(term, 0.0) for term, count in tf.items()}
            vectors.append(vec)

        return {"entries": entries, "vectors": vectors, "idf": idf}

    @staticmethod
    def _cosine(vec_a, vec_b):
        common = set(vec_a) & set(vec_b)
        if not common:
            return 0.0
        dot = sum(vec_a[t] * vec_b[t] for t in common)
        norm_a = math.sqrt(sum(v * v for v in vec_a.values()))
        norm_b = math.sqrt(sum(v * v for v in vec_b.values()))
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return dot / (norm_a * norm_b)

    def search(self, query_text, coding_standard, top_k=5):
        """Returns up to top_k [{code, description, score}], sorted by score desc."""
        index = self._indexes.get(coding_standard)
        if not index or not index["entries"]:
            return []

        query_tokens = _tokenize(query_text)
        query_tf = Counter(query_tokens)
        query_vec = {
            term: count * index["idf"].get(term, 0.0)
            for term, count in query_tf.items()
        }

        scored = []
        for entry, doc_vec in zip(index["entries"], index["vectors"]):
            score = self._cosine(query_vec, doc_vec)
            scored.append(
                {"code": entry["code"], "description": entry["description"], "score": score}
            )

        scored.sort(key=lambda r: r["score"], reverse=True)
        return scored[:top_k]


_default_index = None


def get_default_index():
    global _default_index
    if _default_index is None:
        _default_index = RagIndex()
    return _default_index


def search(query_text, coding_standard, top_k=5):
    return get_default_index().search(query_text, coding_standard, top_k=top_k)
