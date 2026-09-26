import re

import pytest

from app import app as flask_app


@pytest.fixture
def client():
    flask_app.config["TESTING"] = True
    return flask_app.test_client()


def _csrf_token_from(html, attr="name=\"csrf_token\" value"):
    match = re.search(attr + r'="([0-9a-f]+)"', html)
    assert match, f"no csrf token found via {attr!r} in response body"
    return match.group(1)


def test_post_without_csrf_token_is_rejected(client):
    resp = client.post("/login", data={"username": "abstractor1", "password": "demo1234"})
    assert resp.status_code == 400


def test_post_with_tampered_csrf_token_is_rejected(client):
    get_resp = client.get("/login")
    token = _csrf_token_from(get_resp.get_data(as_text=True))
    resp = client.post(
        "/login", data={"username": "abstractor1", "password": "demo1234", "csrf_token": token + "x"}
    )
    assert resp.status_code == 400


def test_post_with_valid_csrf_token_succeeds(client):
    get_resp = client.get("/login")
    token = _csrf_token_from(get_resp.get_data(as_text=True))
    resp = client.post(
        "/login", data={"username": "abstractor1", "password": "demo1234", "csrf_token": token}
    )
    assert resp.status_code == 302
    assert resp.headers["Location"] == "/registry"


def test_api_documents_requires_csrf_header(client):
    get_resp = client.get("/login")
    token = _csrf_token_from(get_resp.get_data(as_text=True))
    client.post("/login", data={"username": "abstractor1", "password": "demo1234", "csrf_token": token})

    get_resp = client.get("/registry")
    token = _csrf_token_from(get_resp.get_data(as_text=True))
    client.post("/registry", data={"registry_id": "cardiac_surgery", "csrf_token": token})

    get_resp = client.get("/api-key")
    token = _csrf_token_from(get_resp.get_data(as_text=True))
    client.post("/api-key", data={"api_key": "fake-key", "model": "openai/gpt-oss-120b", "csrf_token": token})

    index_resp = client.get("/")
    page_token = _csrf_token_from(index_resp.get_data(as_text=True), attr='data-csrf-token')

    no_header = client.post("/api/documents", json={"filename": "discharge_summary_001.txt"})
    assert no_header.status_code == 400
    assert no_header.get_json()["error"] == "invalid_csrf_token"

    with_header = client.post(
        "/api/documents",
        json={"filename": "discharge_summary_001.txt"},
        headers={"X-CSRFToken": page_token},
    )
    assert with_header.status_code == 202
