def ground_claims(retrieved_passages):
    if not retrieved_passages:
        return None, []

    grounding_log = []
    answer_sentences = []

    for i, passage in enumerate(retrieved_passages):
        sentence = f"According to {passage['source']}: {passage['snippet']}"
        answer_sentences.append({
            "sentence": sentence,
            "citation_id": passage["citation_id"],
            "source": passage["source"],
            "locator": passage["locator"],
        })
        grounding_log.append({
            "sentence_idx": i,
            "status": "CITED",
            "citation_id": passage["citation_id"]
        })

    if not answer_sentences:
        return None, grounding_log

    draft_answer = " ".join([s["sentence"] for s in answer_sentences])
    return draft_answer, grounding_log
