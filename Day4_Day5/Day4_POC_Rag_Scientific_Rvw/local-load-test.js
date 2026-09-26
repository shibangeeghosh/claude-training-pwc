/*
 * Load test for the full login -> domain -> api-key -> question flow.
 *
 * Target: k6 run local-load-test.js -e BASE_URL=http://localhost:5000 \
 *           -e GROQ_API_KEY=gsk_... -e MODEL=openai/gpt-oss-120b
 *
 * If GROQ_API_KEY is omitted, the /api/review calls will hit the fail-safe
 * escalate path (invalid key) instead of a real LLM call -- still useful for
 * exercising the whole request path and the escalate branch under load, but
 * tokens_consumed will read 0 in that case.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';
const GROQ_API_KEY = __ENV.GROQ_API_KEY || '';
const MODEL = __ENV.MODEL || 'openai/gpt-oss-120b';
const USERNAME = __ENV.USERNAME || 'analyst';
const PASSWORD = __ENV.PASSWORD || 'demo1234';
const DOMAIN_ID = __ENV.DOMAIN_ID || 'diabetes_metabolic';
const QUESTION =
  __ENV.QUESTION ||
  'Does extended-release metformin reduce GI adverse events versus immediate-release formulations?';

const errorRate = new Rate('errors');

// Tokens consumed per /api/review call, parsed from Groq's real usage.total_tokens
// (surfaced by the app at result.usage.total_tokens). Falls back to a rough char/4 estimate
// only if that field is missing (e.g. the call short-circuited before reaching the LLM).
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

  const domainRes = http.post(`${BASE_URL}/domain`, { domain_id: DOMAIN_ID });
  ok = check(domainRes, { 'domain select succeeded': (r) => r.status === 200 || r.status === 302 }) && ok;

  const apiKeyRes = http.post(`${BASE_URL}/api-key`, { api_key: GROQ_API_KEY, model: MODEL });
  ok = check(apiKeyRes, { 'api-key step succeeded': (r) => r.status === 200 || r.status === 302 }) && ok;

  const reviewRes = http.post(
    `${BASE_URL}/api/review`,
    JSON.stringify({ question: QUESTION }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  ok =
    check(reviewRes, {
      'review request succeeded': (r) => r.status === 200,
      'response has a status field': (r) => {
        try {
          return typeof r.json().status === 'string';
        } catch (_) {
          return false;
        }
      },
    }) && ok;

  errorRate.add(!ok);
  recordTokenUsage(reviewRes);

  sleep(1);
}
