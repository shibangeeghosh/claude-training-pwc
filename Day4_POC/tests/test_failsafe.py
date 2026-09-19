from src.failsafe import apply_failsafe_gate

TRUSTED_GROUNDING = {"grounded": True, "trusted": True, "gaps": []}
UNTRUSTED_GROUNDING = {"grounded": True, "trusted": False, "gaps": []}
FAILED_GROUNDING = {"grounded": False, "llm_error": "INVALID_API_KEY"}

CONFLICTING_PASSAGES = [
    {
        "citation_id": "trial_registry-NCT020",
        "full_doc": {"topic": "metformin-diabetes", "outcome": "extended-release non-inferior, better tolerability"},
    },
    {
        "citation_id": "trial_registry-NCT021",
        "full_doc": {"topic": "metformin-diabetes", "outcome": "extended-release underperformed immediate-release"},
    },
]

NON_CONFLICTING_PASSAGES = [
    {
        "citation_id": "trial_registry-NCT001",
        "full_doc": {"topic": "parp-ovarian-cancer", "outcome": "combination arm improved progression-free survival"},
    },
]

STALE_HOOK_LOG = [
    {"allowlist_entry": {"id": "uspto", "last_reviewed": "2024-12-01"}},
]

FRESH_HOOK_LOG = [
    {"allowlist_entry": {"id": "pubmed", "last_reviewed": "2026-06-01"}},
]


def test_llm_failure_escalates():
    decision = apply_failsafe_gate(NON_CONFLICTING_PASSAGES, FRESH_HOOK_LOG, FAILED_GROUNDING)
    assert decision["status"] == "escalate"
    assert "API key" in decision["reason"]


def test_zero_hits_refuses():
    decision = apply_failsafe_gate([], FRESH_HOOK_LOG, TRUSTED_GROUNDING)
    assert decision["status"] == "refuse"


def test_untrusted_grounding_escalates():
    decision = apply_failsafe_gate(NON_CONFLICTING_PASSAGES, FRESH_HOOK_LOG, UNTRUSTED_GROUNDING)
    assert decision["status"] == "escalate"


def test_conflicting_trial_outcomes_escalate():
    decision = apply_failsafe_gate(CONFLICTING_PASSAGES, FRESH_HOOK_LOG, TRUSTED_GROUNDING)
    assert decision["status"] == "escalate"
    assert "metformin-diabetes" in decision["reason"]


def test_stale_source_is_a_non_blocking_gap():
    decision = apply_failsafe_gate(NON_CONFLICTING_PASSAGES, STALE_HOOK_LOG, TRUSTED_GROUNDING)
    assert decision["status"] == "answer"
    assert any("stale" in gap for gap in decision["gaps"])


def test_clean_case_answers_with_no_gaps():
    decision = apply_failsafe_gate(NON_CONFLICTING_PASSAGES, FRESH_HOOK_LOG, TRUSTED_GROUNDING)
    assert decision["status"] == "answer"
    assert decision["gaps"] == []
