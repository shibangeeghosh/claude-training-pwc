---
type: community
cohesion: 0.25
members: 8
---

# Fund CAGR MCP Code

**Cohesion:** 0.25 - loosely connected
**Members:** 8 nodes

## Members
- [[Estimate a fund's annualized return (CAGR) over the trailing N years using its…]] - rationale - fund_data_mcp_server.py
- [[MCP server that fetches live Indian mutual fund data from api.mfapi.in (free,…]] - rationale - fund_data_mcp_server.py
- [[datetime]] - concept
- [[fund_data_mcp_server.py]] - code - fund_data_mcp_server.py
- [[get_fund_cagr()]] - code - fund_data_mcp_server.py
- [[mcp_server_mcpserver]] - concept
- [[parse()]] - code - fund_data_mcp_server.py
- [[requests]] - concept

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Fund_CAGR_MCP_Code
SORT file.name ASC
```

## Connections to other communities
- 4 edges to [[_COMMUNITY_Fund Search & NAV Tools]]
- 1 edge to [[_COMMUNITY_App & Docs Overview]]

## Top bridge nodes
- [[get_fund_cagr()]] - degree 6, connects to 2 communities
- [[fund_data_mcp_server.py]] - degree 7, connects to 1 community