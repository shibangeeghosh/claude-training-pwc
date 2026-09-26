/*
 * Baseline smoke/load test.
 *
 * Target: no internal endpoint was specified, so this points at the public
 * k6 test target (http://test.k6.io). Override with -e BASE_URL=... to point
 * at a real service, e.g.:
 *   k6 run -e BASE_URL=http://localhost:5000 local-load-test.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://test.k6.io';

// Custom metric so the error rate threshold below is explicit and not just
// inferred from http_req_failed (keeps it visible as its own series in Grafana too).
const errorRate = new Rate('errors');

// LLM/API token usage per request. If the response is JSON with a
// `usage.total_tokens` field (the common shape for OpenAI/Anthropic-style
// APIs), use that real count. Otherwise fall back to a rough estimate
// (~4 chars/token) so the metric still reports something meaningful when
// hitting a non-LLM endpoint like this project's SIP calculator.
const tokensConsumed = new Trend('tokens_consumed');

function recordTokenUsage(res) {
  let tokens = null;
  try {
    const body = res.json();
    tokens = body && body.usage && body.usage.total_tokens;
  } catch (_) {
    // non-JSON body - fall through to the estimate below
  }

  if (typeof tokens === 'number') {
    tokensConsumed.add(tokens, { source: 'usage_field' });
  } else {
    const estimate = Math.ceil((res.body ? res.body.length : 0) / 4);
    tokensConsumed.add(estimate, { source: 'estimated' });
  }
}

export const options = {
  scenarios: {
    baseline: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '15s', target: 10 }, // ramp up
        { duration: '30s', target: 10 }, // hold at 10 VUs
        { duration: '15s', target: 0 },  // ramp down
      ],
      gracefulRampDown: '5s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'], // error rate under 1%
    http_req_duration: ['p(95)<500'], // p95 latency under 500ms
    errors: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/`);

  const ok = check(res, {
    'status is 200': (r) => r.status === 200,
    'body is non-empty': (r) => r.body && r.body.length > 0,
  });
  errorRate.add(!ok);
  recordTokenUsage(res);

  sleep(1);
}
