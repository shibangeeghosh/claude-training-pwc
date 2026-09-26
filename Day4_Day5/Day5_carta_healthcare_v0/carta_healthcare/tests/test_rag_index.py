from src.rag_index import RagIndex


def test_search_finds_matching_icd10_entry_by_synonym():
    index = RagIndex()
    results = index.search("acute myocardial infarction", "icd10", top_k=3)
    assert results
    assert results[0]["code"] == "I21.3"
    assert results[0]["score"] > 0


def test_search_results_sorted_by_score_descending():
    index = RagIndex()
    results = index.search("acute appendicitis inflamed appendix", "icd10", top_k=6)
    scores = [r["score"] for r in results]
    assert scores == sorted(scores, reverse=True)


def test_search_respects_top_k():
    index = RagIndex()
    results = index.search("infection", "icd10", top_k=2)
    assert len(results) <= 2


def test_search_returns_empty_for_unknown_coding_standard():
    index = RagIndex()
    assert index.search("anything", "not_a_real_standard") == []


def test_search_returns_low_or_no_score_for_unrelated_query():
    index = RagIndex()
    results = index.search("zzz qqq nonsense term", "icd10", top_k=1)
    assert not results or results[0]["score"] == 0.0


def test_get_default_index_is_a_singleton():
    from src import rag_index
    first = rag_index.get_default_index()
    second = rag_index.get_default_index()
    assert first is second
