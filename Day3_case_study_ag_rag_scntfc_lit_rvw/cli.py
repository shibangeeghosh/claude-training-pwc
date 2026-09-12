#!/usr/bin/env python3
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from src.review_loop import run_review_loop

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 cli.py \"<research question>\"")
        print("\nExamples:")
        print('  python3 cli.py "What is the efficacy of aspirin in preventing cardiovascular events in adults over 50?"')
        print('  python3 cli.py "Is it good?"')
        sys.exit(1)

    question = sys.argv[1]
    result = run_review_loop(question)

    if result and result["status"] == "SUCCESS":
        sys.exit(0)
    else:
        sys.exit(1)
