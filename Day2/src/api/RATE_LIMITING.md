# API Client Rate Limiting

## Overview

The API client implements comprehensive rate limiting to prevent abuse and DoS attacks. It includes:

1. **Per-Second Rate Limiting** - Throttles requests to a configurable limit per second
2. **Batch Concurrency Limiting** - Controls simultaneous requests in batch operations
3. **Endpoint-Specific Limits** - Allows stricter limits for sensitive endpoints
4. **Automatic Retry** - Queues requests and retries when rate limit is exceeded
5. **Development Logging** - Provides feedback on rate limit events

## Features

### Per-Second Rate Limiting

Prevents overwhelming the API by limiting the number of requests per second.

**Default:** 10 requests/second
**Applies to:** GET, POST, PUT, PATCH, DELETE

**How it works:**
- Tracks request timestamps within a 1-second window
- If limit is reached, queues request and waits for the oldest request to expire
- Automatically retries after waiting

**Example:**
```javascript
import apiClient from './api/client'

// With default 10 req/sec, this will be throttled
for (let i = 0; i < 25; i++) {
  await apiClient.get(`/api/data/${i}`)
}
// Takes ~2.5 seconds total
```

### Batch Concurrency Limiting

Controls the maximum number of simultaneous requests in batch operations.

**Default:** 5 concurrent requests
**Applies to:** batch() method

**How it works:**
- Queues requests and processes them in parallel up to the limit
- Maintains order of results even though execution is concurrent
- Prevents resource exhaustion from large batch operations

**Example:**
```javascript
import apiClient from './api/client'

// Create 100 records with max 5 concurrent
const requests = Array(100).fill(null).map((_, i) =>
  apiClient.post('/api/records', { title: `Record ${i}` })
)

const results = await apiClient.batch(requests)
// Processes 100 requests with max 5 simultaneous
```

### Endpoint-Specific Limits

Some endpoints may need stricter limits (e.g., uploads, expensive operations).

**Example:**
```javascript
import { ApiClient } from './api/client'

const client = new ApiClient('http://api.example.com', {
  requestsPerSecond: 10,
  endpointLimits: {
    '/api/upload': { requestsPerSecond: 2 },
    '/api/export': { requestsPerSecond: 1 }
  }
})

// This endpoint limited to 2 req/sec
await client.post('/api/upload', fileData)

// This endpoint limited to 1 req/sec
await client.get('/api/export')

// This endpoint limited to 10 req/sec (default)
await client.get('/api/data')
```

## Configuration

### Constructor Options

```javascript
import { ApiClient } from './api/client'

const client = new ApiClient(baseURL, {
  // Max requests per second (default: 10)
  requestsPerSecond: 10,

  // Max concurrent batch requests (default: 5)
  maxConcurrentRequests: 5,

  // Endpoint-specific rate limits
  endpointLimits: {
    '/api/upload': { requestsPerSecond: 2 },
    '/api/export': { requestsPerSecond: 1 }
  },

  // Enable development logging (auto-detected)
  isDev: true
})
```

### Runtime Configuration

Change rate limits after initialization:

```javascript
// Reconfigure global limits
client.configureRateLimiting({
  requestsPerSecond: 20,
  maxConcurrentRequests: 10
})

// Set or update endpoint-specific limit
client.setEndpointLimit('/api/upload', 3)
```

## API Response

All API responses include rate limit information:

```javascript
const response = await apiClient.get('/api/data')

// Response structure
{
  success: true,
  data: { ... },
  status: 200,
  error: null,
  timestamp: '2024-01-15T10:30:00.000Z',
  retryAfter: 0  // milliseconds to wait before retry (0 if no throttle)
}
```

## Error Handling

Rate limiting is transparent - requests are automatically queued and retried:

```javascript
// This will automatically wait and retry if rate limited
try {
  const response = await apiClient.get('/api/data')
  if (!response.success) {
    console.error('Request failed:', response.error)
  }
} catch (error) {
  console.error('Unexpected error:', error)
}
```

For batch operations, individual request errors are captured:

```javascript
const results = await apiClient.batch(requests)

results.forEach((response, index) => {
  if (!response.success) {
    console.error(`Request ${index} failed:`, response.error)
  }
})
```

## Development Logging

When in development mode (`isDev: true`), rate limit events are logged:

```
[RateLimit] GET /api/data throttled. Wait 45ms before retry.
[Batch] Processing 20 requests with max 5 concurrent
```

Disable logging for production:

```javascript
const client = new ApiClient(baseURL, { isDev: false })
```

## HTTP Method Rate Limiting

All HTTP methods respect rate limiting:

```javascript
// GET - rate limited
await client.get('/api/data')

// POST - rate limited
await client.post('/api/records', data)

// PUT - rate limited
await client.put('/api/records/1', data)

// PATCH - rate limited
await client.patch('/api/records/1', updates)

// DELETE - rate limited
await client.delete('/api/records/1')
```

## Batch Operation Example

Process large datasets efficiently with concurrency control:

```javascript
import { recordsAPI } from './api'

// Bulk create 100 records
const recordsList = Array(100).fill(null).map((_, i) => ({
  title: `Record ${i}`,
  status: 'active',
  date: new Date().toISOString()
}))

const results = await recordsAPI.bulkCreateRecords(recordsList)

console.log(`Created: ${results.successful.length}`)
console.log(`Failed: ${results.failed.length}`)

// With rate limiting applied automatically:
// - Per-second limit: 10 req/sec
// - Batch concurrency: max 5 simultaneous
// - Total time for 100: ~10 seconds (10 rounds of 5 concurrent requests)
```

## Performance Considerations

### Tuning Rate Limits

Adjust limits based on your API capabilities:

```javascript
// Conservative (older/slower API)
{ requestsPerSecond: 5, maxConcurrentRequests: 2 }

// Moderate (typical API)
{ requestsPerSecond: 10, maxConcurrentRequests: 5 }

// Aggressive (high-performance API)
{ requestsPerSecond: 50, maxConcurrentRequests: 20 }
```

### Endpoint-Specific Tuning

Apply stricter limits to expensive operations:

```javascript
{
  requestsPerSecond: 10,           // Default
  endpointLimits: {
    '/api/upload': { requestsPerSecond: 2 },      // File uploads
    '/api/export': { requestsPerSecond: 1 },      // Large exports
    '/api/analytics': { requestsPerSecond: 5 },   // Compute-heavy
    '/api/data': { requestsPerSecond: 50 }        // Lightweight
  }
}
```

## Implementation Details

### Rate Limiter (Per-Second)

- Uses a sliding 1-second window
- Tracks request timestamps
- Automatically cleans up old timestamps
- Calculates optimal wait time before retry

### Concurrency Limiter (Batch)

- Maintains active request count
- Queues waiting requests with callbacks
- Atomically acquires and releases slots
- Preserves result order from original request array

### Async/Await Pattern

All rate limiting uses async/await:

```javascript
// Automatic queue and retry
await client.enforceRateLimit(endpoint, method)

// No callbacks or .then() chains
```

## Backward Compatibility

Rate limiting is transparent to existing code:

```javascript
// Old code works without changes
const response = await apiClient.get('/api/data')

// Requests are now automatically throttled
```

## Troubleshooting

### Requests Taking Too Long

Check if rate limit is too strict:

```javascript
client.configureRateLimiting({
  requestsPerSecond: 20  // Increase from 10
})
```

### Batch Operations Slow

Increase concurrency limit:

```javascript
client.configureRateLimiting({
  maxConcurrentRequests: 10  // Increase from 5
})
```

### Development Logging Issues

Check isDev flag and NODE_ENV:

```javascript
// Enable logging explicitly
const client = new ApiClient(baseURL, { isDev: true })

// Or set environment
process.env.NODE_ENV = 'development'
```

## API Reference

### RateLimiter Class

```javascript
new RateLimiter(maxRequestsPerSecond)
  .acquire() → Promise<{ allowed: boolean, retryAfter: number }>
```

### ConcurrencyLimiter Class

```javascript
new ConcurrencyLimiter(maxConcurrent)
  .acquire() → Promise<void>
  .release() → void
```

### ApiClient Methods

```javascript
configureRateLimiting(options)
setEndpointLimit(endpoint, requestsPerSecond)
enforceRateLimit(endpoint, method) → Promise<Object>
batch(requests, options) → Promise<Array<ApiResponse>>
```

## Best Practices

1. **Set appropriate limits** for your API and use case
2. **Use endpoint-specific limits** for sensitive operations
3. **Monitor rate limit logs** in development
4. **Test with realistic load** to find optimal settings
5. **Increase limits gradually** in production
6. **Document limits** for API consumers
