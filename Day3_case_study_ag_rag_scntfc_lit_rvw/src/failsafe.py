from src.allowlist import is_stale

def apply_failsafe_gate(retrieved_passages, hook_log, allowlist, mcp_connectors):
    decision = {
        "status": "PROCEED",
        "reason": None,
        "action": None,
        "gaps": []
    }

    if not retrieved_passages:
        decision["status"] = "REFUSE"
        decision["reason"] = "Zero allowlisted sources returned any relevant hit."
        decision["action"] = "refuse"
        queried_sources = list(set(log["connector"] for log in hook_log))
        decision["message"] = f"No results found. Searched sources: {', '.join(queried_sources)}. Try a broader search or different keywords."
        return decision

    source_types_present = set(p["source_type"] for p in retrieved_passages)
    conflicts = _check_conflicts(retrieved_passages)
    if conflicts:
        decision["status"] = "ESCALATE"
        decision["reason"] = "High-confidence source conflicts detected."
        decision["action"] = "escalate"
        decision["conflicts"] = conflicts
        decision["gaps"] = [f"CONFLICT: {c}" for c in conflicts]
        return decision

    stale_sources = _check_stale_allowlist(allowlist)
    if stale_sources:
        decision["gaps"].append(f"Allowlist staleness: {', '.join(stale_sources)} - last reviewed >12 months ago")

    decision["action"] = "answer"
    return decision

def _check_conflicts(retrieved_passages):
    topic_outcomes = {}
    for passage in retrieved_passages:
        if passage["source_type"] == "trials" and "topic" in passage["full_doc"]:
            topic = passage["full_doc"]["topic"]
            outcome = passage["full_doc"]["outcome"]
            if topic not in topic_outcomes:
                topic_outcomes[topic] = []
            topic_outcomes[topic].append(outcome)

    conflicts = []
    for topic, outcomes in topic_outcomes.items():
        if len(set(outcomes)) > 1:
            conflicts.append(f"{topic}: conflicting outcomes found across trials")
    return conflicts

def _check_stale_allowlist(allowlist):
    stale = []
    for source in allowlist.get("sources", []):
        if is_stale(source):
            stale.append(f"{source['id']} (owner: {source['owner']}, last_reviewed: {source['last_reviewed']})")
    return stale
