#!/usr/bin/env python3

import json
import sys
import os

# Make sure we can import from src/
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from src.allowlist import load_allowlist, check_target

ALLOWLIST_PATH = "allowlist.yaml"
AUDIT_LOG = "retrieval_audit.log"

def main():
    payload = json.load(sys.stdin)
    tool_name = payload.get("tool_name", "")
    tool_input = payload.get("tool_input", {}) or {}

    # Extract the target source from tool input
    target = tool_input.get("source_url", "") or tool_input.get("query_target", "")

    is_retrieval_tool = tool_name in ["FetchDocument", "QuerySourceIndex"]

    # If not a retrieval tool, allow silently
    if not is_retrieval_tool:
        sys.exit(0)

    # Load the allowlist
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

    # Check target against allowlist
    allowed, matched = check_target(target, allowlist)

    # Log the attempt
    try:
        with open(AUDIT_LOG, "a") as log:
            status = "ALLOWED" if allowed else "DENIED"
            log.write(f"{status}: {tool_name} -> {target}\n")
    except Exception as e:
        pass

    # Deny if not matched
    if not allowed:
        print(json.dumps({
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": (
                    f"Blocked: source '{target}' is not on the approved allowlist. "
                    "Add it to allowlist.yaml with an owner and review date first."
                )
            }
        }))
        sys.exit(0)

    # Allow
    sys.exit(0)

if __name__ == "__main__":
    main()
