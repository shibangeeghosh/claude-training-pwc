def is_ambiguous(question):
    words = question.strip().split()
    concrete_keywords = {
        "aspirin", "metformin", "drug", "diabetes", "cardiovascular",
        "disease", "efficacy", "safety", "prevention", "treatment",
        "patent", "formulation", "compound", "trial", "study",
        "formulations", "release", "patients", "adults", "children"
    }
    topic_words = [w.lower() for w in words if w.lower() in concrete_keywords]
    return len(words) < 6 or len(topic_words) < 1

def decompose_question(question):
    if is_ambiguous(question):
        return None, "Question is too ambiguous to scope. Please specify: what drug/compound, what outcome (efficacy/safety/etc), what population (if applicable), and what timeframe."

    sub_queries = {
        "literature": question,
        "trials": question,
        "patents": question.replace("trials", "patents").replace("trial", "patent"),
        "internal_reports": question,
    }

    return sub_queries, None
