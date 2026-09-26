"""Loads config/extraction_specs/*.yaml - the data-dictionary field lists per document type.

Fails loudly (ValueError) if a spec is missing a version, since NormalizedField records
must always be traceable to the exact spec_version that produced them (LLD S6).
"""

import os
from functools import lru_cache

import yaml

_SPECS_DIR = os.path.join(os.path.dirname(__file__), "..", "config", "extraction_specs")


def _validate_spec(spec, source_path):
    for required in ("spec_id", "document_type", "version", "fields"):
        if required not in spec:
            raise ValueError(f"Extraction spec {source_path} missing required '{required}'")
    for field in spec["fields"]:
        if "field_name" not in field:
            raise ValueError(f"Extraction spec {source_path} has a field with no field_name")
    return spec


@lru_cache(maxsize=None)
def load_all_specs(specs_dir=_SPECS_DIR):
    """Returns {document_type: spec_dict} for every *.yaml file in specs_dir.

    Cached per specs_dir - this is called on every pipeline run (once for
    classification's known-types list, once for the matched spec), and the spec files
    only change via a deploy, not mid-session."""
    specs = {}
    for filename in sorted(os.listdir(specs_dir)):
        if not filename.endswith(".yaml"):
            continue
        path = os.path.join(specs_dir, filename)
        with open(path, "r", encoding="utf-8") as f:
            spec = yaml.safe_load(f)
        _validate_spec(spec, path)
        specs[spec["document_type"]] = spec
    return specs


def load_spec(document_type, specs_dir=_SPECS_DIR):
    specs = load_all_specs(specs_dir)
    if document_type not in specs:
        raise ValueError(f"No extraction spec found for document_type={document_type!r}")
    return specs[document_type]
