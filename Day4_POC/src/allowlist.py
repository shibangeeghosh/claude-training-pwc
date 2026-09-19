"""Source allowlist loading and enforcement (retrieve-only-from-approved-sources commitment)."""
from __future__ import annotations

import fnmatch
from datetime import datetime
from typing import Optional

import yaml


def load_allowlist(path: str) -> list[dict]:
    with open(path, "r") as f:
        data = yaml.safe_load(f)
    return data.get("sources", [])


def check_target(target: str, allowlist: list[dict]) -> tuple[bool, Optional[dict]]:
    """Return (allowed, matching entry) for a connector's declared target URL pattern."""
    for entry in allowlist:
        if fnmatch.fnmatch(target, entry["pattern"]):
            return True, entry
    return False, None


def is_stale(entry: dict, months: int = 12) -> bool:
    last_reviewed = datetime.strptime(entry["last_reviewed"], "%Y-%m-%d")
    age_days = (datetime.now() - last_reviewed).days
    return age_days > months * 30
