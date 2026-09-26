import requests

from src import llm_client


class _FakeResponse:
    def __init__(self, status_code, json_data=None, text=""):
        self.status_code = status_code
        self._json_data = json_data
        self.text = text

    def json(self):
        if self._json_data is None:
            raise ValueError("no json")
        return self._json_data


def test_missing_api_key_short_circuits(monkeypatch):
    def _fail_post(*args, **kwargs):
        raise AssertionError("requests.post should not be called without an API key")
    monkeypatch.setattr(requests, "post", _fail_post)

    result = llm_client.chat_completion(api_key=None, model="m", messages=[])
    assert result == {"ok": False, "error_type": "MISSING_API_KEY", "detail": "No Groq API key provided."}


def test_successful_call_returns_content(monkeypatch):
    def _fake_post(url, headers, json, timeout):
        assert url == llm_client.GROQ_URL
        assert headers["Authorization"] == "Bearer secret"
        return _FakeResponse(200, {"choices": [{"message": {"content": "hello"}}]})
    monkeypatch.setattr(requests, "post", _fake_post)

    result = llm_client.chat_completion(api_key="secret", model="m", messages=[{"role": "user", "content": "hi"}])
    assert result == {"ok": True, "content": "hello"}


def test_401_maps_to_invalid_api_key(monkeypatch):
    monkeypatch.setattr(requests, "post", lambda *a, **k: _FakeResponse(401, text="unauthorized"))
    result = llm_client.chat_completion(api_key="bad", model="m", messages=[])
    assert result["ok"] is False
    assert result["error_type"] == "INVALID_API_KEY"


def test_429_maps_to_rate_limited(monkeypatch):
    monkeypatch.setattr(requests, "post", lambda *a, **k: _FakeResponse(429, text="slow down"))
    result = llm_client.chat_completion(api_key="k", model="m", messages=[])
    assert result["error_type"] == "RATE_LIMITED"


def test_402_maps_to_insufficient_credits(monkeypatch):
    monkeypatch.setattr(requests, "post", lambda *a, **k: _FakeResponse(402, text="no credits"))
    result = llm_client.chat_completion(api_key="k", model="m", messages=[])
    assert result["error_type"] == "INSUFFICIENT_CREDITS"


def test_unmapped_status_is_api_error(monkeypatch):
    monkeypatch.setattr(requests, "post", lambda *a, **k: _FakeResponse(500, text="boom"))
    result = llm_client.chat_completion(api_key="k", model="m", messages=[])
    assert result["error_type"] == "API_ERROR"


def test_timeout_is_reported(monkeypatch):
    def _raise_timeout(*a, **k):
        raise requests.exceptions.Timeout()
    monkeypatch.setattr(requests, "post", _raise_timeout)
    result = llm_client.chat_completion(api_key="k", model="m", messages=[])
    assert result["error_type"] == "TIMEOUT"


def test_network_error_is_reported(monkeypatch):
    def _raise_network(*a, **k):
        raise requests.exceptions.ConnectionError("dns failure")
    monkeypatch.setattr(requests, "post", _raise_network)
    result = llm_client.chat_completion(api_key="k", model="m", messages=[])
    assert result["error_type"] == "NETWORK_ERROR"


def test_malformed_response_body_is_reported(monkeypatch):
    monkeypatch.setattr(requests, "post", lambda *a, **k: _FakeResponse(200, {"choices": []}))
    result = llm_client.chat_completion(api_key="k", model="m", messages=[])
    assert result["error_type"] == "MALFORMED_RESPONSE"


def test_parse_json_content_handles_fenced_json():
    content = '```json\n{"a": 1}\n```'
    assert llm_client.parse_json_content(content) == {"a": 1}


def test_parse_json_content_handles_plain_json():
    assert llm_client.parse_json_content('{"a": 1}') == {"a": 1}


def test_parse_json_content_returns_none_for_garbage():
    assert llm_client.parse_json_content("not json") is None


def test_parse_json_content_returns_none_for_none():
    assert llm_client.parse_json_content(None) is None
