"""Therapeutic/research-area domain registry (scopes retrieval to a session's chosen domain)."""
from __future__ import annotations

import yaml


def load_domains(path: str) -> list[dict]:
    with open(path, "r") as f:
        data = yaml.safe_load(f)
    return data.get("domains", [])


def get_domain(domains: list[dict], domain_id: str) -> dict | None:
    for d in domains:
        if d["id"] == domain_id:
            return d
    return None
