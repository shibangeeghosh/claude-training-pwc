"""MCP server that fetches live Indian mutual fund data from api.mfapi.in (free, no auth)
so an agent can pull a real fund's NAV/CAGR to use as the SIP calculator's return-rate input.
"""

from datetime import datetime

import requests
from mcp.server.mcpserver import MCPServer

mcp = MCPServer("fund-data")

BASE_URL = "https://api.mfapi.in/mf"


@mcp.tool()
def search_fund(scheme_name: str) -> dict:
    """
    Search for mutual fund schemes by (partial) name.
    Returns matching scheme_code/scheme_name pairs to feed into get_fund_nav or get_fund_cagr.
    """
    resp = requests.get(f"{BASE_URL}/search", params={"q": scheme_name}, timeout=10)
    resp.raise_for_status()
    matches = resp.json()
    if not matches:
        return {"ok": False, "error_type": "NO_MATCH", "query": scheme_name}
    return {"ok": True, "matches": matches[:15]}


@mcp.tool()
def get_fund_nav(scheme_code: int) -> dict:
    """
    Get the latest available NAV (net asset value, in INR per unit) for a scheme code.
    Use search_fund first if you only know the fund's name.
    """
    resp = requests.get(f"{BASE_URL}/{scheme_code}", timeout=10)
    if resp.status_code != 200:
        return {"ok": False, "error_type": "SCHEME_NOT_FOUND", "scheme_code": scheme_code}
    payload = resp.json()
    data = payload.get("data") or []
    if not data:
        return {"ok": False, "error_type": "NO_NAV_DATA", "scheme_code": scheme_code}
    latest = data[0]
    return {
        "ok": True,
        "scheme_code": scheme_code,
        "scheme_name": payload.get("meta", {}).get("scheme_name"),
        "date": latest["date"],
        "nav": float(latest["nav"]),
    }


@mcp.tool()
def get_fund_cagr(scheme_code: int, years: int = 3) -> dict:
    """
    Estimate a fund's annualized return (CAGR) over the trailing N years using its
    historical NAV series. Useful as a realistic "expected annual return" input
    for the SIP calculator instead of a guessed number.
    """
    resp = requests.get(f"{BASE_URL}/{scheme_code}", timeout=10)
    if resp.status_code != 200:
        return {"ok": False, "error_type": "SCHEME_NOT_FOUND", "scheme_code": scheme_code}
    payload = resp.json()
    data = payload.get("data") or []
    if len(data) < 2:
        return {"ok": False, "error_type": "INSUFFICIENT_DATA", "scheme_code": scheme_code}

    def parse(entry):
        return datetime.strptime(entry["date"], "%d-%m-%Y"), float(entry["nav"])

    latest_date, latest_nav = parse(data[0])
    target_date = latest_date.replace(year=latest_date.year - years)

    past_entry = min(data, key=lambda e: abs(parse(e)[0] - target_date))
    past_date, past_nav = parse(past_entry)

    actual_years = (latest_date - past_date).days / 365.25
    if actual_years <= 0 or past_nav <= 0:
        return {"ok": False, "error_type": "INSUFFICIENT_DATA", "scheme_code": scheme_code}

    cagr_pct = ((latest_nav / past_nav) ** (1 / actual_years) - 1) * 100

    return {
        "ok": True,
        "scheme_code": scheme_code,
        "scheme_name": payload.get("meta", {}).get("scheme_name"),
        "from_date": past_entry["date"],
        "to_date": data[0]["date"],
        "years_used": round(actual_years, 2),
        "cagr_pct": round(cagr_pct, 2),
    }


if __name__ == "__main__":
    mcp.run()
