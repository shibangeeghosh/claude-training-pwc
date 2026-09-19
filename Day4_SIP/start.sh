#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

# `usermod -aG docker` only takes effect after a fresh login/shell. Until then,
# `docker` without sudo fails with "permission denied" even though the user is
# nominally in the group - fall back to sudo transparently in that case.
DOCKER_COMPOSE="docker compose"
if ! docker ps >/dev/null 2>&1; then
    DOCKER_COMPOSE="sudo docker compose"
fi

echo "Starting observability backend (otel-collector, tempo, influxdb, prometheus, grafana)..."
$DOCKER_COMPOSE up -d

export OTEL_EXPORTER_OTLP_ENDPOINT="${OTEL_EXPORTER_OTLP_ENDPOINT:-http://localhost:4317}"
export OTEL_SERVICE_NAME="${OTEL_SERVICE_NAME:-sip-calculator}"

echo "Starting SIP Calculator with OpenTelemetry instrumentation on http://localhost:5000 ..."
python3 app.py
