#!/usr/bin/env python3
"""PreToolUse gate on Write|Edit into data/ - an independent, second enforcement layer
(mirrors Day4_POC's check_allowlist.py) that a write introducing PHI-shaped content
into data/sample_documents/ or data/coding_reference/ gets denied, regardless of what
any agent believes it's allowed to do. Re-reads phi_guard_patterns.yaml from disk on
every call rather than trusting an in-memory copy, so a pattern-list edit takes effect
immediately.
"""

import json
import os
import re
import sys

PATTERNS_PATH = "config/phi_guard_patterns.yaml"
AUDIT_LOG = "phi_guard_audit.log"
GUARDED_PREFIXES = ("data/sample_documents/", "data/coding_reference/")


def _load_patterns(path):
    try:
        import yaml
    except ImportError:
        return []
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f) or {}
    return [(p["name"], p["regex"]) for p in data.get("patterns", []) if "regex" in p]


def _is_guarded_path(file_path):
    normalized = file_path.replace("\\", "/")
    return any(prefix in normalized for prefix in GUARDED_PREFIXES)


def _content_to_scan(tool_name, tool_input):
    if tool_name == "Write":
        return tool_input.get("content", "")
    if tool_name == "Edit":
        return tool_input.get("new_string", "")
    return ""


def _deny(reason):
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": reason,
        }
    }))
    sys.exit(0)


def main():
    payload = json.load(sys.stdin)
    tool_name = payload.get("tool_name", "")
    tool_input = payload.get("tool_input", {}) or {}

    file_path = tool_input.get("file_path", "")
    if not _is_guarded_path(file_path):
        sys.exit(0)

    content = _content_to_scan(tool_name, tool_input)
    patterns = _load_patterns(PATTERNS_PATH)

    matched = None
    for name, regex in patterns:
        if re.search(regex, content):
            matched = name
            break

    try:
        with open(AUDIT_LOG, "a", encoding="utf-8") as log:
            status = "DENIED" if matched else "ALLOWED"
            log.write(f"{status}: {tool_name} -> {file_path} (pattern={matched})\n")
    except OSError:
        pass

    if matched:
        _deny(
            f"Blocked: content written to {file_path} matches PHI-shaped pattern "
            f"'{matched}'. Sample/reference data in this repo must stay synthetic."
        )

    sys.exit(0)


if __name__ == "__main__":
    main()
