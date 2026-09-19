from src.domains import get_domain, load_domains
from src.mock_corpus import MockCorpus

from conftest import DATA_DIR, DOMAINS_PATH


def test_load_domains_has_five_areas():
    domains = load_domains(DOMAINS_PATH)
    ids = {d["id"] for d in domains}
    assert ids == {"oncology", "cardiovascular", "diabetes_metabolic", "neurology", "infectious_disease"}


def test_get_domain_returns_none_for_unknown_id():
    domains = load_domains(DOMAINS_PATH)
    assert get_domain(domains, "not-a-domain") is None


def test_search_only_returns_docs_in_selected_domain():
    corpus = MockCorpus(DATA_DIR)
    results = corpus.search("trial_registry", "metformin diabetes glucose", "diabetes_metabolic")
    assert len(results) > 0
    assert all(r["domain"] == "diabetes_metabolic" for r in results)


def test_search_excludes_other_domains_even_with_matching_keywords():
    corpus = MockCorpus(DATA_DIR)
    # "cardiac"/"cardiovascular" keywords only exist on cardiovascular-domain trial docs.
    results = corpus.search("trial_registry", "cardiac cardiovascular hypertension", "oncology")
    assert results == []


def test_neurology_domain_has_no_patent_or_internal_docs():
    corpus = MockCorpus(DATA_DIR)
    for source_type in ("patent", "internal"):
        docs = [d for d in corpus.docs[source_type] if d.get("domain") == "neurology"]
        assert docs == []
