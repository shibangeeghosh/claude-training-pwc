"""Demo login: a small hardcoded user list with hashed passwords and Flask session auth.

This is intentionally minimal for a local POC -- no password reset, no roles, no persistence
beyond the process's session store. Not a production auth system.
"""
from __future__ import annotations

import json

from werkzeug.security import check_password_hash


def load_users(path: str) -> list[dict]:
    with open(path, "r") as f:
        return json.load(f)["users"]


def verify_login(users: list[dict], username: str, password: str) -> dict | None:
    for user in users:
        if user["username"] == username and check_password_hash(user["password_hash"], password):
            return user
    return None
