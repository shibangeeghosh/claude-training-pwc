import pytest

from src import registry_config


def test_load_registries_from_real_config():
    registries = registry_config.load_registries()
    ids = {r["id"] for r in registries}
    assert ids == {"cardiac_surgery", "oncology", "trauma"}


def test_get_registry_returns_matching_entry():
    registry = registry_config.get_registry("oncology")
    assert registry["name"] == "Oncology Registry"
    assert "pathology_report" in registry["document_types"]


def test_get_registry_returns_none_for_unknown_id():
    assert registry_config.get_registry("not_a_real_registry") is None


def test_load_registries_rejects_entry_missing_id(tmp_path):
    bad_config = tmp_path / "registries.yaml"
    bad_config.write_text("registries:\n  - name: \"No Id Registry\"\n")
    with pytest.raises(ValueError):
        registry_config.load_registries(str(bad_config))
