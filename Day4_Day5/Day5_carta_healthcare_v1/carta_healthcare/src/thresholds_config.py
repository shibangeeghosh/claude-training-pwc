"""Loads config/thresholds.yaml - shared by app.py and scripts/run_pipeline_cli.py so
tuning/validating thresholds only happens in one place."""

import os

import yaml

_CONFIG_PATH = os.path.join(os.path.dirname(__file__), "..", "config", "thresholds.yaml")

_REQUIRED_KEYS = (
    "classification_confidence_min",
    "extraction_confidence_min",
    "cross_check_sample_rate",
    "rag_min_score",
)


def load_thresholds(path=_CONFIG_PATH):
    with open(path, "r", encoding="utf-8") as f:
        thresholds = yaml.safe_load(f)
    for key in _REQUIRED_KEYS:
        if key not in thresholds:
            raise ValueError(f"Thresholds config {path} missing required '{key}'")
    return thresholds
