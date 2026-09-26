---
type: community
cohesion: 0.25
members: 9
---

# Fund Search & NAV Tools

**Cohesion:** 0.25 - loosely connected
**Members:** 9 nodes

## Members
- [[Get the latest available NAV (net asset value, in INR per unit) for a scheme…]] - rationale - fund_data_mcp_server.py
- [[Search for mutual fund schemes by (partial) name. Returns matching…]] - rationale - fund_data_mcp_server.py
- [[fund_data_mcp_server.py (fund-data MCP server)]] - code - README.md
- [[get_fund_nav()]] - code - fund_data_mcp_server.py
- [[mcp (dependency)]] - code - requirements.txt
- [[mfapi.in (free, no-auth mutual fund data API)]] - document - README.md
- [[requests (dependency)]] - code - requirements.txt
- [[search_fund()]] - code - fund_data_mcp_server.py
- [[tool]] - code

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Fund_Search__NAV_Tools
SORT file.name ASC
```

## Connections to other communities
- 4 edges to [[_COMMUNITY_Fund CAGR MCP Code]]
- 1 edge to [[_COMMUNITY_App & Docs Overview]]

## Top bridge nodes
- [[fund_data_mcp_server.py (fund-data MCP server)]] - degree 7, connects to 2 communities
- [[get_fund_nav()]] - degree 4, connects to 1 community
- [[search_fund()]] - degree 4, connects to 1 community
- [[tool]] - degree 3, connects to 1 community