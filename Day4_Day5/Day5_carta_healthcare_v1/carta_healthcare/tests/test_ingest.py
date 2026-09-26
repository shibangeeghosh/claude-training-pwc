import pytest

from src import ingest


def test_list_sample_documents_includes_known_samples():
    docs = ingest.list_sample_documents()
    filenames = {d["filename"] for d in docs}
    assert "discharge_summary_001.txt" in filenames
    assert "operative_note_001.txt" in filenames


def test_load_sample_document_extracts_patient_ref():
    doc = ingest.load_sample_document("discharge_summary_001.txt")
    assert doc["patient_ref"] == "SYN-0001"
    assert "SYNTHETIC" in doc["raw_text"]
    assert doc["source_filename"] == "discharge_summary_001.txt"


def test_load_sample_document_raises_for_missing_file():
    with pytest.raises(FileNotFoundError):
        ingest.load_sample_document("does_not_exist.txt")


def test_load_sample_document_rejects_path_traversal(tmp_path):
    secret = tmp_path / "secret.txt"
    secret.write_text("not a sample document")
    with pytest.raises(FileNotFoundError):
        ingest.load_sample_document(f"../{secret.name}")


def test_load_sample_document_rejects_absolute_path(tmp_path):
    secret = tmp_path / "secret.txt"
    secret.write_text("not a sample document")
    with pytest.raises(FileNotFoundError):
        ingest.load_sample_document(str(secret))


def test_load_sample_document_handles_missing_patient_ref(tmp_path):
    doc_path = tmp_path / "no_ref.txt"
    doc_path.write_text("SYNTHETIC CLINICAL DOCUMENT - NOT REAL PHI\nNo patient ref here.")
    doc = ingest.load_sample_document("no_ref.txt", sample_dir=str(tmp_path))
    assert doc["patient_ref"] is None
