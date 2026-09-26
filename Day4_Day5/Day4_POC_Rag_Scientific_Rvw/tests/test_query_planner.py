from src import llm_client, query_planner

DOMAIN = {
    "id": "diabetes_metabolic",
    "label": "Diabetes / Metabolic",
    "keywords": ["diabetes", "metformin", "glucose", "insulin", "metabolic"],
}


def test_llm_failure_surfaces_error_detail_not_just_error_type(monkeypatch):
    # Question is short and has no concrete domain keyword, so the heuristic fallback also
    # judges it ambiguous -- the clarify message should still surface *why* the LLM was
    # unavailable, not just the bare error_type string.
    def _fake_chat_completion(api_key, model, messages, json_mode=False, timeout=30, temperature=0.2):
        return {
            "ok": False,
            "error_type": "API_ERROR",
            "error": "Groq returned HTTP 402: {\"error\": \"insufficient credits\"}",
        }

    monkeypatch.setattr(llm_client, "chat_completion", _fake_chat_completion)
    result = query_planner.plan_query("tell me about it", DOMAIN, "key", "model")

    assert result["ambiguous"] is True
    assert "API_ERROR" in result["clarify_message"]
    # The real failure detail must be present, not just the bare error_type.
    assert "insufficient credits" in result["clarify_message"]
    assert "402" in result["clarify_message"]


def test_llm_failure_without_detail_still_shows_error_type(monkeypatch):
    def _fake_chat_completion(api_key, model, messages, json_mode=False, timeout=30, temperature=0.2):
        return {"ok": False, "error_type": "TIMEOUT", "error": "Groq request timed out after 30s."}

    monkeypatch.setattr(llm_client, "chat_completion", _fake_chat_completion)
    result = query_planner.plan_query("tell me about it", DOMAIN, "key", "model")

    assert result["ambiguous"] is True
    assert "TIMEOUT" in result["clarify_message"]
    assert "timed out" in result["clarify_message"]
