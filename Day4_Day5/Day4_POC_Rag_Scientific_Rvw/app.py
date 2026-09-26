"""Flask app: login -> select domain -> provide Groq API key -> agentic RAG review."""
from __future__ import annotations

import os

from flask import Flask, jsonify, redirect, render_template, request, session, url_for

from otel_setup import setup_telemetry
from src import audit as audit_mod
from src import auth
from src import domains as domains_mod
from src.allowlist import load_allowlist
from src.mcp_connectors import MCPConnectorSet
from src.mock_corpus import MockCorpus
from src.review_loop import run_review_loop

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", os.urandom(24))
setup_telemetry(app)

USERS = auth.load_users(os.path.join(BASE_DIR, "users.json"))
ALLOWLIST = load_allowlist(os.path.join(BASE_DIR, "allowlist.yaml"))
DOMAINS = domains_mod.load_domains(os.path.join(BASE_DIR, "domains.yaml"))
CORPUS = MockCorpus(DATA_DIR)
CONNECTOR_SET = MCPConnectorSet(CORPUS, ALLOWLIST)

MODEL_CHOICES = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "qwen/qwen3.8-27b",
]

# Composed-but-not-yet-approved results, held in process memory until a human reviewer
# approves or rejects them. This is a single-process demo store, not a durable queue.
PENDING_REVIEWS: dict[str, dict] = {}


def _require_session_keys(*keys: str) -> bool:
    return all(k in session for k in keys)


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username", "")
        password = request.form.get("password", "")
        user = auth.verify_login(USERS, username, password)
        if user:
            session.clear()
            session["user"] = user["username"]
            session["display_name"] = user["display_name"]
            return redirect(url_for("select_domain"))
        return render_template("login.html", error="Invalid username or password.")
    return render_template("login.html", error=None)


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


@app.route("/domain", methods=["GET", "POST"])
def select_domain():
    if "user" not in session:
        return redirect(url_for("login"))
    if request.method == "POST":
        domain_id = request.form.get("domain_id")
        if domains_mod.get_domain(DOMAINS, domain_id) is None:
            return render_template("select_domain.html", domains=DOMAINS, error="Please choose a valid domain.")
        session["domain_id"] = domain_id
        return redirect(url_for("api_key"))
    return render_template("select_domain.html", domains=DOMAINS, error=None)


@app.route("/api-key", methods=["GET", "POST"])
def api_key():
    if not _require_session_keys("user", "domain_id"):
        return redirect(url_for("login"))
    if request.method == "POST":
        key = request.form.get("api_key", "").strip()
        model = request.form.get("model", "").strip()
        if not key or not model:
            return render_template(
                "api_key.html", models=MODEL_CHOICES, error="An API key and model are both required."
            )
        session["groq_key"] = key
        session["model"] = model
        return redirect(url_for("index"))
    return render_template("api_key.html", models=MODEL_CHOICES, error=None)


@app.route("/")
def index():
    if not _require_session_keys("user", "domain_id", "groq_key", "model"):
        return redirect(url_for("login"))
    domain = domains_mod.get_domain(DOMAINS, session["domain_id"])
    return render_template(
        "index.html", display_name=session["display_name"], domain=domain, model=session["model"]
    )


@app.route("/api/review", methods=["POST"])
def api_review():
    if not _require_session_keys("user", "domain_id", "groq_key", "model"):
        return jsonify({"status": "error", "reason": "Session expired. Please log in again."}), 401
    payload = request.get_json(silent=True) or {}
    question = payload.get("question", "")
    domain = domains_mod.get_domain(DOMAINS, session["domain_id"])
    result = run_review_loop(
        question, domain, session["groq_key"], session["model"], session["user"], CONNECTOR_SET
    )
    if result["status"] == "pending_review":
        PENDING_REVIEWS[result["request_id"]] = result
    return jsonify(result)


@app.route("/api/review/<request_id>/decision", methods=["POST"])
def api_review_decision(request_id: str):
    if "user" not in session:
        return jsonify({"status": "error", "reason": "Session expired. Please log in again."}), 401
    payload = request.get_json(silent=True) or {}
    approved = bool(payload.get("approved"))
    note = payload.get("note", "") or ("Approved via web interface" if approved else "Rejected via web interface")
    pending = PENDING_REVIEWS.pop(request_id, None)
    if pending is None:
        return jsonify({"status": "error", "reason": "Unknown or already-decided request_id."}), 404
    audit_mod.record_reviewer_decision(request_id, approved, note)
    return jsonify({"status": "approved" if approved else "rejected", "request_id": request_id})


if __name__ == "__main__":
    # debug=True would expose session["groq_key"] in Werkzeug's interactive debugger on
    # any unhandled exception -- never enable it against a session holding a real API key.
    app.run(debug=False, port=5000)
