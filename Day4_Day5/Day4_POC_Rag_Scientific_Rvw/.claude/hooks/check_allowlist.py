#!/usr/bin/env python3
"""PreToolUse gate for the lit-review MCP server's real tool shape.

Unlike a URL-fetching tool, search_literature/search_trials/search_patents/search_internal_reports
take a domain_id + query, not a target URL -- the actual source URL each maps to is fixed at
MCPConnectorSet construction time (src/mcp_connectors.py) and is enforced there via check_target()
on every query. This hook is the second, INDEPENDENT layer: it re-reads allowlist.yaml from disk
on every tool call (rather than trusting the long-running app process's in-memory copy) and denies
the call outright if no allowlist entry of the matching source type exists anymore. That catches
allowlist drift a live process wouldn't notice until restart -- e.g. an entry being pulled after
a security review, while an app process built before the edit is still running.
"""

import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from src.allowlist import load_allowlist

ALLOWLIST_PATH = "allowlist.yaml"
AUDIT_LOG = "retrieval_audit.log"

TOOL_TO_SOURCE_TYPE = {
    "search_literature": "literature",
    "search_trials": "trial_registry",
    "search_patents": "patent",
    "search_internal_reports": "internal",
}


def main():
    payload = json.load(sys.stdin)
    tool_name = payload.get("tool_name", "")
    tool_input = payload.get("tool_input", {}) or {}

    source_type = TOOL_TO_SOURCE_TYPE.get(tool_name)

    # Not a retrieval tool this hook governs -- allow silently.
    if source_type is None:
        sys.exit(0)

    domain_id = tool_input.get("domain_id", "")

    if not os.path.exists(ALLOWLIST_PATH):
        print(json.dumps({
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": f"No allowlist.yaml found at {ALLOWLIST_PATH}; cannot proceed."
            }
        }))
        sys.exit(0)

    allowlist = load_allowlist(ALLOWLIST_PATH)
    matching_entries = [e for e in allowlist if e.get("type") == source_type]

    try:
        with open(AUDIT_LOG, "a") as log:
            status = "ALLOWED" if matching_entries else "DENIED"
            log.write(f"{status}: {tool_name} -> type={source_type} domain={domain_id}\n")
    except Exception:
        pass

    if not matching_entries:
        print(json.dumps({
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": (
                    f"Blocked: no allowlist.yaml entry of type '{source_type}' exists for tool "
                    f"'{tool_name}'. Add one with an owner and review date before this tool can run."
                )
            }
        }))
        sys.exit(0)

    sys.exit(0)


if __name__ == "__main__":
    main()
