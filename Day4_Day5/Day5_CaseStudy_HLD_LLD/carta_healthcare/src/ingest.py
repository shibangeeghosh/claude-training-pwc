"""Loads a sample SourceDocument. OCR/FHIR ingestion are stubbed for Phase B - this
POC ingests pre-transcribed synthetic .txt files only."""

import os
import re

_SAMPLE_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "sample_documents")

_PATIENT_REF_RE = re.compile(r"Patient Reference:\s*(\S+)")


def list_sample_documents(sample_dir=_SAMPLE_DIR):
    """Returns [{"filename": ..., "label": ...}] for every .txt file, for the UI picker."""
    docs = []
    for filename in sorted(os.listdir(sample_dir)):
        if not filename.endswith(".txt"):
            continue
        label = filename.replace(".txt", "").replace("_", " ").title()
        docs.append({"filename": filename, "label": label})
    return docs


def load_sample_document(filename, sample_dir=_SAMPLE_DIR):
    """Returns {"raw_text": str, "patient_ref": str|None, "source_filename": str}."""
    path = os.path.join(sample_dir, filename)
    if not os.path.exists(path):
        raise FileNotFoundError(f"Sample document not found: {filename}")
    with open(path, "r", encoding="utf-8") as f:
        raw_text = f.read()

    match = _PATIENT_REF_RE.search(raw_text)
    patient_ref = match.group(1) if match else None

    return {"raw_text": raw_text, "patient_ref": patient_ref, "source_filename": filename}
