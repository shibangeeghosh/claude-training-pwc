"""Carta Healthcare clinical-extraction POC. Session-driven flow:
/login -> /registry -> /api-key -> / -> /api/documents, /api/exceptions.

The Groq API key is stored ONLY in the Flask session for the lifetime of the browser
session - it is never written to disk, logs, or the audit trail (see CLAUDE.md).
"""

import hmac
import json
import os
import secrets
import uuid

from flask import Flask, abort, jsonify, redirect, render_template, request, session, url_for
from werkzeug.security import check_password_hash

from otel_setup import setup_telemetry
from src import audit, exception_queue, ingest, llm_client, pipeline, registry_config, thresholds_config

app = Flask(__name__)
# A hardcoded fallback secret would let anyone who reads this source forge session
# cookies (including a forged groq_key/registry_id). Generating one at process start
# means an unset FLASK_SECRET_KEY only costs you your sessions on restart, never a
# known-to-everyone signing key.
app.secret_key = os.environ.get("FLASK_SECRET_KEY") or secrets.token_hex(32)

setup_telemetry(app)

_BASE_DIR = os.path.dirname(__file__)

with open(os.path.join(_BASE_DIR, "users.json"), "r", encoding="utf-8") as f:
    USERS = json.load(f)

THRESHOLDS = thresholds_config.load_thresholds()

REGISTRIES = registry_config.load_registries()

# In-process store of completed structured-output records, keyed by document_id.
# Not durable - matches this POC's synchronous, single-process scope (Phase B concern
# to make this a real queue/datastore once there's real document volume).
DOCUMENTS = {}


def _logged_in():
    return "user" in session


def _ready_for_pipeline():
    return _logged_in() and "registry_id" in session and "groq_key" in session


def _ensure_csrf_token():
    """Every form/page GET call this to get the token to embed - the matching POST
    must echo it back (form field ``csrf_token``, or header ``X-CSRFToken`` for the
    JSON APIs called from index.html's fetch()) or _enforce_csrf below rejects it."""
    if "csrf_token" not in session:
        session["csrf_token"] = secrets.token_hex(16)
    return session["csrf_token"]


def _csrf_token_valid():
    expected = session.get("csrf_token")
    supplied = request.headers.get("X-CSRFToken") or request.form.get("csrf_token")
    return bool(expected) and bool(supplied) and hmac.compare_digest(expected, supplied)


@app.before_request
def _enforce_csrf():
    if request.method == "POST" and not _csrf_token_valid():
        if request.path.startswith("/api/"):
            return jsonify({"error": "invalid_csrf_token"}), 400
        abort(400, description="Invalid or missing CSRF token.")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")
        user = USERS.get(username)
        if user and check_password_hash(user["password_hash"], password):
            session.clear()
            session["user"] = username
            return redirect(url_for("select_registry"))
        return render_template("login.html", error="Invalid username or password.", csrf_token=_ensure_csrf_token())
    return render_template("login.html", error=None, csrf_token=_ensure_csrf_token())


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


@app.route("/registry", methods=["GET", "POST"])
def select_registry():
    if not _logged_in():
        return redirect(url_for("login"))
    if request.method == "POST":
        registry_id = request.form.get("registry_id")
        if not registry_config.get_registry(registry_id):
            return render_template(
                "select_registry.html", registries=REGISTRIES, error="Unknown registry.", csrf_token=_ensure_csrf_token()
            )
        session["registry_id"] = registry_id
        return redirect(url_for("api_key"))
    return render_template("select_registry.html", registries=REGISTRIES, error=None, csrf_token=_ensure_csrf_token())


@app.route("/api-key", methods=["GET", "POST"])
def api_key():
    if not _logged_in() or "registry_id" not in session:
        return redirect(url_for("login"))
    if request.method == "POST":
        key = request.form.get("api_key", "").strip()
        model = request.form.get("model") or llm_client.DEFAULT_MODEL
        if not key:
            return render_template(
                "api_key.html",
                models=llm_client.MODEL_CHOICES,
                default_model=llm_client.DEFAULT_MODEL,
                error="Groq API key is required.",
                csrf_token=_ensure_csrf_token(),
            )
        session["groq_key"] = key
        session["model"] = model
        return redirect(url_for("index"))
    return render_template(
        "api_key.html",
        models=llm_client.MODEL_CHOICES,
        default_model=llm_client.DEFAULT_MODEL,
        error=None,
        csrf_token=_ensure_csrf_token(),
    )


@app.route("/")
def index():
    if not _ready_for_pipeline():
        return redirect(url_for("login"))
    registry = registry_config.get_registry(session["registry_id"])
    sample_docs = ingest.list_sample_documents()
    owner_docs = [d["structured"] for d in DOCUMENTS.values() if d["owner"] == session["user"]]
    return render_template(
        "index.html",
        registry=registry,
        sample_docs=sample_docs,
        model=session.get("model"),
        documents=owner_docs,
        csrf_token=_ensure_csrf_token(),
    )


@app.route("/api/documents", methods=["POST"])
def api_submit_document():
    if not _ready_for_pipeline():
        return jsonify({"error": "not_authenticated"}), 401

    payload = request.get_json(silent=True) or {}
    filename = payload.get("filename")
    if not filename:
        return jsonify({"error": "filename_required"}), 400

    try:
        source = ingest.load_sample_document(filename)
    except FileNotFoundError:
        return jsonify({"error": "document_not_found"}), 404

    document_id = uuid.uuid4().hex[:8]
    owner = session["user"]
    structured = pipeline.run_pipeline(
        document_id,
        source["raw_text"],
        THRESHOLDS,
        session["groq_key"],
        session.get("model", llm_client.DEFAULT_MODEL),
        owner=owner,
    )
    DOCUMENTS[document_id] = {"owner": owner, "structured": structured}
    return jsonify(structured), 202


@app.route("/api/documents/<document_id>")
def api_get_document(document_id):
    if not _logged_in():
        return jsonify({"error": "not_authenticated"}), 401
    doc = DOCUMENTS.get(document_id)
    if not doc:
        return jsonify({"error": "not_found"}), 404
    if doc["owner"] != session["user"]:
        return jsonify({"error": "forbidden"}), 403
    return jsonify(doc["structured"])


@app.route("/api/exceptions")
def api_list_exceptions():
    if not _logged_in():
        return jsonify({"error": "not_authenticated"}), 401
    document_id = request.args.get("document_id")
    return jsonify(exception_queue.list_exceptions(document_id=document_id, assigned_to=session["user"]))


@app.route("/api/exceptions/<exception_id>/resolve", methods=["POST"])
def api_resolve_exception(exception_id):
    if not _logged_in():
        return jsonify({"error": "not_authenticated"}), 401

    existing = exception_queue.get_exception(exception_id)
    if not existing:
        return jsonify({"error": f"No exception found for id {exception_id!r}"}), 400
    if existing["assigned_to"] != session["user"]:
        return jsonify({"error": "forbidden"}), 403

    payload = request.get_json(silent=True) or {}
    resolution = payload.get("resolution")
    corrected_value = payload.get("corrected_value")
    resolver = session.get("user", "unknown")

    try:
        item = exception_queue.resolve_exception(exception_id, resolution, resolver, corrected_value=corrected_value)
    except (KeyError, ValueError) as exc:
        return jsonify({"error": str(exc)}), 400

    audit.record_event(
        "exception_resolved",
        item["document_id"],
        field_name=item["field_name"],
        actor=resolver,
        detail={"resolution": resolution},
    )
    return jsonify(item)


if __name__ == "__main__":
    debug = os.environ.get("FLASK_DEBUG", "").lower() in ("1", "true", "yes")
    app.run(debug=debug, port=5000)
