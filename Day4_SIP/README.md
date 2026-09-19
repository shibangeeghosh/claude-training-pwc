# SIP Calculator

Small Flask app that computes SIP (Systematic Investment Plan) maturity value from a
monthly investment, expected annual return, and tenure.

## Run

```bash
pip install -r requirements.txt
python3 app.py
# open http://127.0.0.1:5000
```

## Files

- `sip_calculator.py` - pure SIP maturity formula, no Flask dependency.
- `app.py` - Flask routes: `GET /` (form) and `POST /api/calculate`.
- `templates/index.html` - single-page form + fetch call.
- `.claude/agents/sip-backend.md` - subagent scoped to backend changes (`app.py`, `sip_calculator.py`).
- `fund_data_mcp_server.py` + `.mcp.json` - MCP server exposing live Indian mutual fund
  data (via [mfapi.in](https://www.mfapi.in), free/no-auth) so an agent can look up a
  real fund's trailing CAGR instead of guessing an "expected annual return".

## MCP tools (`fund-data` server)

- `search_fund(scheme_name)` - find scheme codes by fund name.
- `get_fund_nav(scheme_code)` - latest NAV for a scheme.
- `get_fund_cagr(scheme_code, years)` - trailing annualized return, usable as the
  calculator's `annual_return_pct` input.
