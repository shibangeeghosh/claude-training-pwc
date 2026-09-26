"""OpenTelemetry bootstrap for the SIP Calculator.

Configures a global TracerProvider and MeterProvider that export to the local
OTel Collector (see otel-collector-config.yaml / docker-compose.yaml), and turns
on auto-instrumentation for Flask (HTTP server spans), requests (HTTP client spans
- used by fund_data_mcp_server.py's calls to mfapi.in), and host system metrics.

Call setup_telemetry(app) once, before the Flask app starts serving requests.
"""

import os

from opentelemetry import metrics, trace
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.instrumentation.system_metrics import SystemMetricsInstrumentor
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

OTLP_ENDPOINT = os.environ.get("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4317")
SERVICE_NAME_VALUE = os.environ.get("OTEL_SERVICE_NAME", "sip-calculator")

_initialized = False


def setup_telemetry(app=None):
    global _initialized
    if _initialized:
        return
    _initialized = True

    resource = Resource.create({SERVICE_NAME: SERVICE_NAME_VALUE})

    tracer_provider = TracerProvider(resource=resource)
    tracer_provider.add_span_processor(
        BatchSpanProcessor(OTLPSpanExporter(endpoint=OTLP_ENDPOINT, insecure=True))
    )
    trace.set_tracer_provider(tracer_provider)

    metric_reader = PeriodicExportingMetricReader(
        OTLPMetricExporter(endpoint=OTLP_ENDPOINT, insecure=True)
    )
    meter_provider = MeterProvider(resource=resource, metric_readers=[metric_reader])
    metrics.set_meter_provider(meter_provider)

    SystemMetricsInstrumentor().instrument()
    RequestsInstrumentor().instrument()
    if app is not None:
        FlaskInstrumentor().instrument_app(app)
