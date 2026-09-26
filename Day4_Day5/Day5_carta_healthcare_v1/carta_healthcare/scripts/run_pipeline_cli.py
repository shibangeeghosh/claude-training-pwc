#!/usr/bin/env python3
"""Runs the extraction pipeline against a sample document without Flask - useful for
quick manual verification after a backend change.

Usage:
  GROQ_API_KEY=... python3 scripts/run_pipeline_cli.py --sample discharge_summary_001.txt
"""

import argparse
import json
import os
import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src import ingest, llm_client, pipeline, thresholds_config  # noqa: E402

_BASE_DIR = Path(__file__).resolve().parent.parent


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--sample", required=True, help="filename under data/sample_documents/")
    parser.add_argument("--model", default=llm_client.DEFAULT_MODEL)
    parser.add_argument("--api-key", default=os.environ.get("GROQ_API_KEY"))
    args = parser.parse_args()

    if not args.api_key:
        print("No API key: set GROQ_API_KEY or pass --api-key.", file=sys.stderr)
        sys.exit(1)

    thresholds = thresholds_config.load_thresholds()

    source = ingest.load_sample_document(args.sample)
    document_id = uuid.uuid4().hex[:8]
    structured = pipeline.run_pipeline(document_id, source["raw_text"], thresholds, args.api_key, args.model)

    print(json.dumps(structured, indent=2))


if __name__ == "__main__":
    main()
