from flask import Flask, jsonify, render_template, request

from otel_setup import setup_telemetry
from sip_calculator import calculate_sip

app = Flask(__name__)
setup_telemetry(app)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/calculate", methods=["POST"])
def calculate():
    payload = request.get_json(silent=True) or {}
    try:
        monthly_investment = float(payload["monthly_investment"])
        annual_return_pct = float(payload["annual_return_pct"])
        years = float(payload["years"])
    except (KeyError, TypeError, ValueError):
        return jsonify({"error": "monthly_investment, annual_return_pct and years are required numbers"}), 400

    try:
        result = calculate_sip(monthly_investment, annual_return_pct, years)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
