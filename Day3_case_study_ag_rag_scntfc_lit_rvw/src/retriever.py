def retrieve(sub_queries, mcp_connectors):
    retrieved_passages = []
    hook_log = []

    for source_type, query in sub_queries.items():
        if source_type == "literature":
            results, log = mcp_connectors.pubmed.query(query)
        elif source_type == "trials":
            results, log = mcp_connectors.clinicaltrials.query(query)
        elif source_type == "patents":
            results, log = mcp_connectors.patents.query(query)
        elif source_type == "internal_reports":
            results, log = mcp_connectors.internal.query(query)
        else:
            continue

        hook_log.append(log)

        for i, result in enumerate(results):
            citation_id = f"{source_type}-{result['id']}"
            retrieved_passages.append({
                "citation_id": citation_id,
                "source": result.get("source", source_type),
                "source_type": source_type,
                "locator": result.get("locator", ""),
                "snippet": result.get("snippet", ""),
                "title": result.get("title", ""),
                "full_doc": result
            })

    return retrieved_passages, hook_log
