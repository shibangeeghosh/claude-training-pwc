#!/usr/bin/env python3
"""Rebuilds and validates the RAG index over data/coding_reference/*.json.

Run this after editing the coding-reference corpus to catch malformed entries before
they'd otherwise fail silently at first request time.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src import rag_index  # noqa: E402


def main():
    index = rag_index.RagIndex()
    for coding_standard, data in index._indexes.items():
        entries = data["entries"]
        print(f"{coding_standard}: {len(entries)} entries")
        for entry in entries:
            missing = [k for k in ("code", "description") if k not in entry]
            if missing:
                print(f"  WARNING: entry missing {missing}: {entry}")

    probe = index.search("acute myocardial infarction", "icd10", top_k=3)
    print("\nProbe search 'acute myocardial infarction' (icd10):")
    for r in probe:
        print(f"  {r['code']}  score={r['score']:.3f}  {r['description']}")


if __name__ == "__main__":
    main()
