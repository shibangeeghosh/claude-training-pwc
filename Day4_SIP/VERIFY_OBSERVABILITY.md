# Verifying traces and metrics in Grafana

## 1. Start everything

```bash
./start.sh
```

This brings up `otel-collector`, `tempo`, `prometheus`, and `grafana` via `docker compose`,
then starts the Flask app on `http://localhost:5000` with OpenTelemetry instrumentation
(`otel_setup.py`) pointed at the collector.

## 2. Generate some traffic

```bash
curl -s http://localhost:5000/ > /dev/null
curl -s -X POST http://localhost:5000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"monthly_investment":5000,"annual_return_pct":12,"years":10}'
```

Each request produces an HTTP server span (Flask instrumentation) and, every ~60s, a
batch of system metrics (CPU, memory) plus HTTP metrics get exported to the collector.

## 3. Log into Grafana

Open **http://localhost:3000**.

- Anonymous access is enabled (`GF_AUTH_ANONYMOUS_ENABLED=true`) - you'll land straight
  in as Admin, no login needed.
- If anonymous access is off in your environment, use the Grafana default
  `admin` / `admin` (you'll be prompted to change it on first login).

## 4. Verify metrics (Prometheus datasource)

1. Go to **Explore** (compass icon in the left sidebar).
2. Select the **Prometheus** datasource (pre-provisioned as default).
3. Run a query, e.g.:
   - `up{job="otel-collector"}` - confirms Prometheus is scraping the collector.
   - `system_cpu_time_seconds_total` or `system_memory_usage_bytes` - system metrics
     from `SystemMetricsInstrumentor`.
   - `http_server_duration_milliseconds_count` - Flask request counts.
4. If the query returns no data, check `docker compose logs otel-collector` and confirm
   `curl http://localhost:8889/metrics` shows OTLP-received data.

## 5. Verify traces (Tempo datasource)

1. In **Explore**, switch to the **Tempo** datasource.
2. Use the **Search** tab, filter by `service.name = sip-calculator`.
3. You should see spans for `GET /` and `POST /api/calculate` with timing breakdowns.
4. Click a trace to see the span waterfall.

## 6. Tear down

```bash
docker compose down
```
