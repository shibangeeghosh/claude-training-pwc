/*
 * Load test for the full login -> registry -> api-key -> submit-document flow.
 *
 * Target: k6 run local-load-test.js -e BASE_URL=http://localhost:5051 \
 *           -e GROQ_API_KEY=gsk_... -e MODEL=openai/gpt-oss-120b
 *
 * If GROQ_API_KEY is omitted, the /api/documents calls will hit the fail-safe
 * exception path (invalid key) instead of a real LLM call -- still useful for
 * exercising the whole request path and the exception branch under load, but
 * tokens_consumed will read close to 0 in that case.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5051';
const GROQ_API_KEY = __ENV.GROQ_API_KEY || '';
const MODEL = __ENV.MODEL || 'openai/gpt-oss-120b';
const USERNAME = __ENV.USERNAME || 'abstractor1';
const PASSWORD = __ENV.PASSWORD || 'demo1234';
const REGISTRY_ID = __ENV.REGISTRY_ID || 'cardiac_surgery';
const FILENAME = __ENV.FILENAME || 'discharge_summary_001.txt';

const errorRate = new Rate('errors');

// Tokens consumed per /api/documents call. carta's llm_client.chat_completion() only returns
// {"ok", "content"} -- Groq's real usage.total_tokens is never surfaced in the structured-output
// response -- so unlike the reference script, this always takes the char/4 estimate branch below.
// Kept as a fallback (rather than hardcoded) so it activates for free if usage is ever surfaced.
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
    http_req_duration: ['p(95)<10000'], // generous: real LLM calls are slow relative to a static page
    errors: ['rate<0.02'],
  },
};

export default function () {
  // k6's http module maintains one cookie jar per VU by default, so the session cookie set
  // by /login carries through the rest of this iteration's requests automatically.
  const loginRes = http.post(`${BASE_URL}/login`, { username: USERNAME, password: PASSWORD });
  let ok = check(loginRes, { 'login succeeded (redirect)': (r) => r.status === 200 || r.status === 302 });

  const registryRes = http.post(`${BASE_URL}/registry`, { registry_id: REGISTRY_ID });
  ok = check(registryRes, { 'registry select succeeded': (r) => r.status === 200 || r.status === 302 }) && ok;

  const apiKeyRes = http.post(`${BASE_URL}/api-key`, { api_key: GROQ_API_KEY, model: MODEL });
  ok = check(apiKeyRes, { 'api-key step succeeded': (r) => r.status === 200 || r.status === 302 }) && ok;

  const submitRes = http.post(
    `${BASE_URL}/api/documents`,
    JSON.stringify({ filename: FILENAME }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  ok =
    check(submitRes, {
      'document submission accepted (202)': (r) => r.status === 202,
      'response has a status field': (r) => {
        try {
          return typeof r.json().status === 'string';
        } catch (_) {
          return false;
        }
      },
    }) && ok;

  errorRate.add(!ok);
  recordTokenUsage(submitRes);

  sleep(1);
}
