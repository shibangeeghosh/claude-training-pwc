# Graph Report - carta_healthcare  (2026-09-26)

## Corpus Check
- Corpus is ~15,880 words - fits in a single context window. You may not need a graph.

## Summary
- 401 nodes · 750 edges · 30 communities (24 shown, 6 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 69 edges (avg confidence: 0.88)
- Token cost: 0 input · 180,686 output

## Community Hubs (Navigation)
- Non-Negotiable Invariants & Sub-agents
- Classification & Extraction Engine
- Custom MCP Server
- Flask Routes (app.py)
- Groq LLM Client
- RAG Coding-Reference Index
- Ordered Validation Gate
- PHI Guard Hook
- Exception Queue
- Normalization Engine
- OpenTelemetry Instrumentation
- Document Classifier Tests
- Sample Document Ingest
- Observability Docker Stack
- CLI Scripts (pipeline runner, reindex)
- Results UI Rendering
- Structured Output Composition
- Test Fixtures & Conftest
- Registry Config Tests
- k6 Load Test Script
- Registry & Thresholds Config Loaders
- Document Ingestion & Classification (LLD)
- Observability Startup Script
- MCP Server Registration (.mcp.json)
- Phase B Deferred-Scope Notes
- Synchronous Pipeline & Route List (LLD)
- Context Trimming Policy
- Problem Framing Goal
- Per-Abstractor Data Isolation
- Graphify Knowledge Graph Note

## God Nodes (most connected - your core abstractions)
1. `run_pipeline()` - 19 edges
2. `README.md — Carta Healthcare POC` - 15 edges
3. `chat_completion()` - 14 edges
4. `normalize_field()` - 14 edges
5. `RagIndex` - 14 edges
6. `extract_fields()` - 13 edges
7. `apply_validation_gate()` - 13 edges
8. `classify_document()` - 12 edges
9. `load_all_specs()` - 9 edges
10. `parse_json_content()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `escapeHtml() Before DOM Insertion Convention` --semantically_similar_to--> `Source-Span Verification Invariant`  [INFERRED] [semantically similar]
  .claude/agents/carta-frontend.md → CLAUDE.md
- `apply_validation_gate() Override Priority` --semantically_similar_to--> `check_phi_guard.py Independent Enforcement Layer`  [INFERRED] [semantically similar]
  LLD.md → CLAUDE.md
- `Select Registry/Program Form (Step 2 of 3)` --references--> `select_registry()`  [EXTRACTED]
  templates/select_registry.html → app.py
- `Groq API Key & Model Selection Form (Step 3 of 3)` --references--> `api_key()`  [EXTRACTED]
  templates/api_key.html → app.py
- `Login Form (username/password, Step 1 of 3)` --references--> `login()`  [EXTRACTED]
  templates/login.html → app.py

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Ordered Validation Gate with Cross-Check Override** — lld_validationengine, lld_apply_validation_gate, claude_cross_check_override_invariant, _claude_agents_carta_triage_agent [INFERRED 0.85]
- **RAG-Grounded Normalization Constraint Group** — lld_ragindex, lld_normalizationengine, claude_rag_grounded_normalization_invariant, config_thresholds_values [INFERRED 0.85]
- **Non-Negotiable Invariants Restated Across Project Docs** — claude_overview, hld_overview, lld_overview, readme_overview, _claude_agents_carta_backend_agent, _claude_agents_carta_triage_agent [INFERRED 0.75]
- **OpenTelemetry Observability Pipeline (Collector -> Tempo/Prometheus -> Grafana)** — docker_compose_otel_collector, docker_compose_tempo, docker_compose_prometheus, docker_compose_grafana, docker_compose_influxdb, otel_collector_config, observability_tempo, observability_prometheus [EXTRACTED 1.00]
- **Three-Step Onboarding Flow (Login -> Select Registry -> API Key) into Main UI** — templates_login_loginform, templates_select_registry_selectregistryform, templates_api_key_apikeyform, templates_index_documentprocessingui [EXTRACTED 1.00]
- **Synthetic Clinical Document Test Corpus (Discharge Summaries, Operative Note, Pathology Report)** — data_sample_documents_discharge_summary_001, data_sample_documents_discharge_summary_002_ambiguous, data_sample_documents_operative_note_001, data_sample_documents_pathology_report_001 [INFERRED 0.75]

## Communities (30 total, 6 thin omitted)

### Community 0 - "Non-Negotiable Invariants & Sub-agents"
Cohesion: 0.07
Nodes (54): carta-backend Sub-agent, carta-frontend Sub-agent, escapeHtml() Before DOM Insertion Convention, carta-triage Sub-agent, Groq API Key Never Persisted Invariant, Config-Driven Design Principle, Cross-Check Disagreement Forces Exception Invariant, Explicit Abstractor Resolution Invariant (+46 more)

### Community 1 - "Classification & Extraction Engine"
Cohesion: 0.11
Nodes (28): random, src, Classifies a SourceDocument's document_type via LLM, with a heuristic fallback.…, _build_prompt(), extract_fields(), Extracts per-field values with a source_span, then independently verifies each…, Returns a list of ExtractedField dicts, one per field in spec["fields"]., unextracted_field() (+20 more)

### Community 2 - "Custom MCP Server"
Cohesion: 0.09
Nodes (29): functools, get_extraction_spec(), list_document_types(), list_exceptions(), list_registries(), list_sample_documents(), Custom MCP server exposing read-only introspection over Carta's config-driven…, List the clinical document types with a loaded extraction spec (document_type,… (+21 more)

### Community 3 - "Flask Routes (app.py)"
Cohesion: 0.11
Nodes (30): api_get_document(), api_key(), api_list_exceptions(), api_resolve_exception(), api_submit_document(), index(), _logged_in(), login() (+22 more)

### Community 4 - "Groq LLM Client"
Cohesion: 0.12
Nodes (22): requests, chat_completion(), parse_json_content(), Thin wrapper around Groq's OpenAI-compatible chat completions endpoint. Groq's…, Call the Groq chat completions endpoint. Returns a uniform ``{"ok": bool,…, Tolerant JSON parser for LLM output that may be wrapped in ```json ... ```…, _llm_pick_candidate(), _FakeResponse (+14 more)

### Community 5 - "RAG Coding-Reference Index"
Cohesion: 0.15
Nodes (16): collections, math, _entry_text(), get_default_index(), _load_corpus(), RagIndex, Pure-stdlib TF-IDF + cosine similarity index over the curated coding-standard…, A TF-IDF index, built once per coding_standard, over its reference entries. (+8 more)

### Community 6 - "Ordered Validation Gate"
Cohesion: 0.21
Nodes (19): apply_validation_gate(), check_classification_gate(), _check_rule(), Ordered validation gate, the failsafe.py analog for this domain. Per field:…, Returns True if the document may proceed to extraction., Returns a ValidationResult dict: {field_name, status, checks, reason}., _extracted(), _normalized() (+11 more)

### Community 7 - "PHI Guard Hook"
Cohesion: 0.18
Nodes (15): _content_to_scan(), _deny(), _is_guarded_path(), _load_patterns(), main(), PreToolUse gate on Write|Edit into data/ - an independent, second enforcement…, datetime, json (+7 more)

### Community 8 - "Exception Queue"
Cohesion: 0.23
Nodes (15): add_exception(), get_exception(), list_exceptions(), open_exceptions_for_document(), In-process ExceptionItem store. A document's structured-output is never blocked…, resolution must be 'corrected' or 'confirmed' - never auto-resolved., resolve_exception(), test_add_exception_creates_item_with_composite_id() (+7 more)

### Community 9 - "Normalization Engine"
Cohesion: 0.26
Nodes (13): normalize_field(), Returns a NormalizedField dict for one ExtractedField., test_every_method_records_spec_version(), test_llm_disambiguates_among_candidates_only(), test_llm_failure_falls_back_to_heuristic_top(), test_llm_never_receives_an_unretrieved_candidate(), test_llm_out_of_range_index_falls_back_to_heuristic_top(), test_low_top_score_yields_no_confident_coding_match() (+5 more)

### Community 10 - "OpenTelemetry Instrumentation"
Cohesion: 0.14
Nodes (13): opentelemetry, opentelemetry_exporter_otlp_proto_grpc_metric_exporter, opentelemetry_exporter_otlp_proto_grpc_trace_exporter, opentelemetry_instrumentation_flask, opentelemetry_instrumentation_requests, opentelemetry_instrumentation_system_metrics, opentelemetry_sdk_metrics, opentelemetry_sdk_metrics_export (+5 more)

### Community 11 - "Document Classifier Tests"
Cohesion: 0.28
Nodes (11): classify_document(), _heuristic_classify(), Returns {"document_type": str|None, "confidence": float, "method": str,…, _stub_llm(), _fake_chat_completion(), test_heuristic_returns_none_document_type_for_no_keyword_hits(), test_llm_classification_used_when_successful(), test_llm_confidence_defaults_when_not_numeric() (+3 more)

### Community 12 - "Sample Document Ingest"
Cohesion: 0.23
Nodes (10): re, list_sample_documents(), load_sample_document(), Loads a sample SourceDocument. OCR/FHIR ingestion are stubbed for Phase B -…, Returns [{"filename": ..., "label": ...}] for every .txt file, for the UI…, Returns {"raw_text": str, "patient_ref": str|None, "source_filename": str}., test_list_sample_documents_includes_known_samples(), test_load_sample_document_extracts_patient_ref() (+2 more)

### Community 13 - "Observability Docker Stack"
Cohesion: 0.33
Nodes (11): grafana service (docker-compose), influxdb service (k6 results store, docker-compose), otel-collector service (docker-compose), prometheus service (docker-compose), tempo service (docker-compose), Grafana Dashboard Provisioning Config (k6 folder), Grafana Datasources Provisioning Config (Prometheus, Tempo, k6-InfluxDB), Prometheus Scrape Config (otel-collector job) (+3 more)

### Community 14 - "CLI Scripts (pipeline runner, reindex)"
Cohesion: 0.20
Nodes (8): argparse, pathlib, main(), Rebuilds and validates the RAG index over data/coding_reference/*.json. Run…, main(), Runs the extraction pipeline against a sample document without Flask - useful…, load_thresholds(), uuid

### Community 15 - "Results UI Rendering"
Cohesion: 0.22
Nodes (9): /api/documents endpoint (referenced by UI), /api/exceptions/<id>/resolve endpoint (referenced by UI), codingCell() JS function, confidenceBadge() JS function, escapeHtml() JS function, Rendered NormalizedField Result Row (field_name, normalized_value, source_excerpt, extraction_confidence, coding_standard, status, exception_id, reason), Process Button Click Handler, renderResults() JS function (+1 more)

### Community 16 - "Structured Output Composition"
Cohesion: 0.39
Nodes (6): compose(), Composes the final per-document structured record from normalized fields and…, test_compose_builds_per_field_output_with_provenance(), test_compose_sets_exception_id_only_for_exceptions(), test_compose_status_is_complete_when_all_fields_accepted(), test_compose_status_is_exception_pending_when_any_field_has_exception()

### Community 17 - "Test Fixtures & Conftest"
Cohesion: 0.29
Nodes (6): fixture, pytest, Test/demo helper - clears all in-process exceptions., reset(), sys, _reset_exception_queue()

### Community 18 - "Registry Config Tests"
Cohesion: 0.43
Nodes (6): get_registry(), load_registries(), test_get_registry_returns_matching_entry(), test_get_registry_returns_none_for_unknown_id(), test_load_registries_from_real_config(), test_load_registries_rejects_entry_missing_id()

### Community 19 - "k6 Load Test Script"
Cohesion: 0.33
Nodes (4): errorRate, options, tokensConsumed, ref_k6

### Community 20 - "Registry & Thresholds Config Loaders"
Cohesion: 0.40
Nodes (4): os, Loads config/registries.yaml - the set of registries/programs a user can select., Loads config/thresholds.yaml - shared by app.py and scripts/run_pipeline_cli.py…, yaml

### Community 21 - "Document Ingestion & Classification (LLD)"
Cohesion: 0.67
Nodes (4): Document Ingestion & Classification, DocumentClassifier, DocumentIngestService, SourceDocument (data model)

### Community 22 - "Observability Startup Script"
Cohesion: 0.50
Nodes (3): OTEL_EXPORTER_OTLP_ENDPOINT, OTEL_SERVICE_NAME, start_observability.sh script

### Community 24 - "Phase B Deferred-Scope Notes"
Cohesion: 0.67
Nodes (3): Phase B: Load Testing (k6), Phase B: Observability (OTel/Grafana), Token-Usage Estimation Caveat

## Knowledge Gaps
- **35 isolated node(s):** `python3`, `errorRate`, `tokensConsumed`, `options`, `start_observability.sh script` (+30 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 116 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `run_pipeline()` connect `Classification & Extraction Engine` to `Custom MCP Server`, `Flask Routes (app.py)`, `Ordered Validation Gate`, `PHI Guard Hook`, `Exception Queue`, `Normalization Engine`, `Document Classifier Tests`, `CLI Scripts (pipeline runner, reindex)`, `Structured Output Composition`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Why does `Document Processing & Results UI (main app page)` connect `Flask Routes (app.py)` to `Results UI Rendering`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Why does `select_registry()` connect `Flask Routes (app.py)` to `Registry Config Tests`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Are the 10 inferred relationships involving `README.md — Carta Healthcare POC` (e.g. with `Groq API Key Never Persisted Invariant` and `Cross-Check Disagreement Forces Exception Invariant`) actually correct?**
  _`README.md — Carta Healthcare POC` has 10 INFERRED edges - model-reasoned connections that need verification._
- **What connects `python3`, `errorRate`, `tokensConsumed` to the rest of the system?**
  _35 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Non-Negotiable Invariants & Sub-agents` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `Classification & Extraction Engine` be split into smaller, more focused modules?**
  _Cohesion score 0.10510510510510511 - nodes in this community are weakly interconnected._