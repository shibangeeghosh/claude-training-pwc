from src.allowlist import check_target, is_stale, load_allowlist

from conftest import ALLOWLIST_PATH


def test_load_allowlist_has_five_sources():
    allowlist = load_allowlist(ALLOWLIST_PATH)
    ids = {e["id"] for e in allowlist}
    assert ids == {"pubmed", "clinicaltrials_gov", "eppatent", "uspto", "internal_reports"}


def test_check_target_matches_allowed_pattern():
    allowlist = load_allowlist(ALLOWLIST_PATH)
    allowed, matched = check_target("eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi", allowlist)
    assert allowed is True
    assert matched["id"] == "pubmed"


def test_check_target_denies_unlisted_source():
    allowlist = load_allowlist(ALLOWLIST_PATH)
    allowed, matched = check_target("evil.example.com/scrape", allowlist)
    assert allowed is False
    assert matched is None


def test_uspto_entry_is_stale():
    allowlist = load_allowlist(ALLOWLIST_PATH)
    uspto = next(e for e in allowlist if e["id"] == "uspto")
    assert is_stale(uspto) is True


def test_pubmed_entry_is_not_stale():
    allowlist = load_allowlist(ALLOWLIST_PATH)
    pubmed = next(e for e in allowlist if e["id"] == "pubmed")
    assert is_stale(pubmed) is False
