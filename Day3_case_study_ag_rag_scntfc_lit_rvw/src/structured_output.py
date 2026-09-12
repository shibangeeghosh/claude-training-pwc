import json

def compose_structured_output(draft_answer, retrieved_passages, gaps):
    if not draft_answer or not retrieved_passages:
        return None

    citations = []
    for passage in retrieved_passages:
        citations.append({
            "id": passage["citation_id"],
            "source": passage["source_type"],
            "locator": passage["locator"],
            "snippet": passage["snippet"]
        })

    source_types = set(p["source_type"] for p in retrieved_passages)
    confidence_level = "high" if len(citations) >= 2 else "medium"
    confidence_basis = f"{len(citations)} source(s) found across {', '.join(sorted(source_types))}."

    output = {
        "answer": draft_answer,
        "confidence": {
            "level": confidence_level,
            "basis": confidence_basis
        },
        "citations": citations,
        "gaps": gaps if gaps else ["No additional gaps identified from retrieved sources."]
    }

    return output
