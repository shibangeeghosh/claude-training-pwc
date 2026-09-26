"""Core SIP maturity math, kept separate from the Flask routes so it can be unit tested standalone."""


def calculate_sip(monthly_investment: float, annual_return_pct: float, years: float) -> dict:
    if monthly_investment <= 0:
        raise ValueError("monthly_investment must be positive")
    if years <= 0:
        raise ValueError("years must be positive")
    if annual_return_pct < 0:
        raise ValueError("annual_return_pct cannot be negative")

    months = round(years * 12)
    monthly_rate = annual_return_pct / 100 / 12

    if monthly_rate == 0:
        maturity_value = monthly_investment * months
    else:
        maturity_value = (
            monthly_investment
            * (((1 + monthly_rate) ** months - 1) / monthly_rate)
            * (1 + monthly_rate)
        )

    invested_amount = monthly_investment * months
    estimated_returns = maturity_value - invested_amount

    return {
        "invested_amount": round(invested_amount, 2),
        "estimated_returns": round(estimated_returns, 2),
        "maturity_value": round(maturity_value, 2),
        "months": months,
    }
