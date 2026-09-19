# Graph Report - Day4_SIP  (2026-09-19)

## Corpus Check
- Corpus is ~1,146 words - fits in a single context window. You may not need a graph.

## Summary
- 37 nodes · 46 edges · 5 communities (4 shown, 1 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App & Docs Overview
- Fund Search & NAV Tools
- Flask Calculator Code
- Fund CAGR MCP Code
- MCP Server Config

## God Nodes (most connected - your core abstractions)
1. `fund_data_mcp_server.py (fund-data MCP server)` - 7 edges
2. `get_fund_cagr()` - 6 edges
3. `SIP Calculator project` - 6 edges
4. `sip-backend Subagent (Backend Specialist)` - 5 edges
5. `search_fund()` - 4 edges
6. `get_fund_nav()` - 4 edges
7. `calculate_sip()` - 4 edges
8. `calculate()` - 3 edges
9. `app.py (Flask application)` - 3 edges
10. `POST /api/calculate route` - 3 edges

## Surprising Connections (you probably didn't know these)
- `get_fund_cagr()` --shares_data_with--> `POST /api/calculate route`  [EXTRACTED]
  fund_data_mcp_server.py → README.md
- `fund_data_mcp_server.py (fund-data MCP server)` --references--> `get_fund_cagr()`  [EXTRACTED]
  README.md → fund_data_mcp_server.py
- `sip-backend Subagent (Backend Specialist)` --references--> `calculate_sip()`  [EXTRACTED]
  .claude/agents/sip-backend.md → sip_calculator.py
- `fund_data_mcp_server.py (fund-data MCP server)` --references--> `search_fund()`  [EXTRACTED]
  README.md → fund_data_mcp_server.py
- `fund_data_mcp_server.py (fund-data MCP server)` --references--> `get_fund_nav()`  [EXTRACTED]
  README.md → fund_data_mcp_server.py

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **sip-backend agent's declared backend scope** — claude_agents_sip_backend_agent, app_module, sip_calculator_module, app_api_calculate_route [EXTRACTED 1.00]
- **Core SIP Calculator app files (formula, routes, UI)** — sip_calculator_module, app_module, templates_index_page [EXTRACTED 1.00]
- **fund-data MCP server tool set** — fund_data_mcp_server_module, fund_data_mcp_server_search_fund, fund_data_mcp_server_get_fund_nav, fund_data_mcp_server_get_fund_cagr [EXTRACTED 1.00]

## Communities (5 total, 1 thin omitted)

### Community 0 - "App & Docs Overview"
Cohesion: 0.31
Nodes (9): POST /api/calculate route, app.py (Flask application), sip-backend Subagent (Backend Specialist), .mcp.json (MCP server registration), SIP Calculator project, flask (dependency), sip_calculator.py (SIP maturity formula module), Calculate button click handler (+1 more)

### Community 1 - "Fund Search & NAV Tools"
Cohesion: 0.25
Nodes (9): get_fund_nav(), fund_data_mcp_server.py (fund-data MCP server), Search for mutual fund schemes by (partial) name. Returns matching…, Get the latest available NAV (net asset value, in INR per unit) for a scheme…, search_fund(), mfapi.in (free, no-auth mutual fund data API), mcp (dependency), requests (dependency) (+1 more)

### Community 2 - "Flask Calculator Code"
Cohesion: 0.36
Nodes (6): calculate(), index(), flask, route, calculate_sip(), Core SIP maturity math, kept separate from the Flask routes so it can be unit…

### Community 3 - "Fund CAGR MCP Code"
Cohesion: 0.25
Nodes (6): datetime, get_fund_cagr(), MCP server that fetches live Indian mutual fund data from api.mfapi.in (free,…, Estimate a fund's annualized return (CAGR) over the trailing N years using its…, mcp_server_mcpserver, requests

## Knowledge Gaps
- **6 isolated node(s):** `python3`, `.mcp.json (MCP server registration)`, `mfapi.in (free, no-auth mutual fund data API)`, `flask (dependency)`, `requests (dependency)` (+1 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 17 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `sip-backend Subagent (Backend Specialist)` connect `App & Docs Overview` to `Flask Calculator Code`?**
  _High betweenness centrality (0.344) - this node is a cross-community bridge._
- **Why does `fund_data_mcp_server.py (fund-data MCP server)` connect `Fund Search & NAV Tools` to `App & Docs Overview`, `Fund CAGR MCP Code`?**
  _High betweenness centrality (0.323) - this node is a cross-community bridge._
- **Why does `calculate_sip()` connect `Flask Calculator Code` to `App & Docs Overview`?**
  _High betweenness centrality (0.292) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `fund_data_mcp_server.py (fund-data MCP server)` (e.g. with `mcp (dependency)` and `requests (dependency)`) actually correct?**
  _`fund_data_mcp_server.py (fund-data MCP server)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `python3`, `.mcp.json (MCP server registration)`, `mfapi.in (free, no-auth mutual fund data API)` to the rest of the system?**
  _6 weakly-connected nodes found - possible documentation gaps or missing edges._