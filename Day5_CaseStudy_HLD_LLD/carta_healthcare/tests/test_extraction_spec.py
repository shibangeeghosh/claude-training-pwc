import pytest

from src import extraction_spec


def test_load_all_specs_from_real_config():
    specs = extraction_spec.load_all_specs()
    assert set(specs) == {"discharge_summary", "operative_note", "pathology_report"}
    assert specs["discharge_summary"]["version"] == 1


def test_load_spec_returns_matching_spec():
    spec = extraction_spec.load_spec("pathology_report")
    assert spec["spec_id"] == "pathology_report_v1"
    field_names = {f["field_name"] for f in spec["fields"]}
    assert "specimen_diagnosis" in field_names


def test_load_spec_raises_for_unknown_document_type():
    with pytest.raises(ValueError):
        extraction_spec.load_spec("not_a_real_document_type")


def test_missing_version_fails_loudly(tmp_path):
    spec_file = tmp_path / "broken.yaml"
    spec_file.write_text(
        "spec_id: broken_v1\n"
        "document_type: broken\n"
        "fields:\n"
        "  - field_name: some_field\n"
    )
    with pytest.raises(ValueError):
        extraction_spec.load_all_specs(str(tmp_path))


def test_field_missing_field_name_fails_loudly(tmp_path):
    spec_file = tmp_path / "broken.yaml"
    spec_file.write_text(
        "spec_id: broken_v1\n"
        "document_type: broken\n"
        "version: 1\n"
        "fields:\n"
        "  - data_type: string\n"
    )
    with pytest.raises(ValueError):
        extraction_spec.load_all_specs(str(tmp_path))
