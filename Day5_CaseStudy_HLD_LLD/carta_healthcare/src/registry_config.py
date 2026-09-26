"""Loads config/registries.yaml - the set of registries/programs a user can select."""

import os

import yaml

_CONFIG_PATH = os.path.join(os.path.dirname(__file__), "..", "config", "registries.yaml")


def load_registries(path=_CONFIG_PATH):
    with open(path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    registries = data.get("registries", [])
    for registry in registries:
        if "id" not in registry or "name" not in registry:
            raise ValueError(f"Registry entry missing required 'id'/'name': {registry}")
    return registries


def get_registry(registry_id, path=_CONFIG_PATH):
    for registry in load_registries(path):
        if registry["id"] == registry_id:
            return registry
    return None
