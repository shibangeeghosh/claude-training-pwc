---
name: api-integration
description: Integrate and manage API calls using async/await handlers
skills:
  - API client usage
  - Async/await patterns
  - Error handling
  - Request management
---

# API Integration Skill

Guides integration with backend APIs using the async/await handler system.

## API Handler Location

All API handlers in: `src/api/`

```
src/api/
├── client.js      # Main API client
├── records.js     # Record endpoints
├── compliance.js  # Compliance endpoints
├── auth.js        # Authentication endpoints
└── index.js       # Exports
```

## Import Handlers

```javascript
// Option 1: Import specific handlers
import { fetchRecords, createRecord } from '../api/records'
import { login, logout } from '../api/auth'

// Option 2: Import all as namespace
import * as recordsAPI from '../api/records'
import * as authAPI from '../api/auth'

// Option 3: Import from index
import { api } from '../api'
// Usage: api.records.fetchRecords()
```

## Using API Handlers

### Records API

```javascript
import { fetchRecords, createRecord } from '../api/records'

// Fetch with pagination
const result = await fetchRecords(1, 20, { status: 'compliant' })
if (result.success) {
  console.log(result.data)
}

// Create record
const newRecord = await createRecord({
  title: 'New Record',
  status: 'compliant',
  percentage: 95
})
```

### Authentication API

```javascript
import { login, logout, verifyUser } from '../api/auth'

// Login
const result = await login('user@example.com', 'password')
if (result.success) {
  console.log(result.user)
}

// Verify current user
const user = await verifyUser()

// Logout
await logout()
```

### Compliance API

```javascript
import { fetchOverallCompliance, generateComplianceReport } from '../api/compliance'

// Get overall score
const score = await fetchOverallCompliance()
console.log(score.score) // 91

// Generate report
const report = await generateComplianceReport({ status: 'warning' })
```

## React Integration

### With useEffect

```javascript
import { useEffect, useState } from 'react'
import { fetchRecords } from '../api/records'

function RecordsList() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchRecords(1, 20)
        if (result.success) {
          setRecords(result.data)
        } else {
          setError(result.error)
        }
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  return <div>{records.map(r => <div key={r.id}>{r.title}</div>)}</div>
}
```

### Event Handlers

```javascript
import { createRecord } from '../api/records'

function CreateForm() {
  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await createRecord({
      title: e.target.title.value,
      status: e.target.status.value
    })
    if (result.success) {
      alert('Created!')
    }
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

## Error Handling

All handlers return consistent structure:

```javascript
// Success
{
  success: true,
  data: { /* result data */ },
  message: 'Operation successful'
}

// Error
{
  success: false,
  error: 'Error message',
  data: null
}
```

### Handle Errors

```javascript
const result = await fetchRecords()

if (!result.success) {
  console.error('Failed:', result.error)
  // Show error to user
} else {
  // Process result.data
}
```

## API Client Features

Main API client in `src/api/client.js`:

```javascript
import { apiClient } from '../api'

// HTTP methods
await apiClient.get(endpoint)
await apiClient.post(endpoint, body)
await apiClient.put(endpoint, body)
await apiClient.patch(endpoint, body)
await apiClient.delete(endpoint)

// Retry with backoff
await apiClient.retry(() => apiClient.get('/api/endpoint'), 3, 1000)

// Batch requests
const results = await apiClient.batch([
  apiClient.get('/api/records'),
  apiClient.get('/api/compliance'),
  apiClient.get('/api/users')
])
```

## Authentication

Automatic JWT token handling:

```javascript
// Token stored in localStorage
// Automatically injected in Authorization header

// Manual token access
import { getToken, isAuthenticated } from '../api/auth'

const token = await getToken()
const authenticated = await isAuthenticated()
```

## Best Practices

### DO ✅
- Use async/await with await operator
- Handle success and error cases
- Provide user feedback
- Validate data before sending
- Check result.success before using data

### DON'T ❌
- Use .then() chains
- Ignore errors
- Send sensitive data
- Make unchecked requests
- Mix callbacks with async

## Testing API Handlers

```javascript
import { fetchRecords } from '../api/records'

describe('Records API', () => {
  it('should fetch records', async () => {
    const result = await fetchRecords(1, 20)
    expect(result.success).toBe(true)
    expect(Array.isArray(result.data)).toBe(true)
  })
})
```

## Rate Limiting

- Default: 100 requests/minute
- Auth endpoints: 5 requests/15 minutes
- Returns 429 on limit exceeded

## Debugging API Calls

Enable debug mode to log API traffic:

```bash
npm run dev -- --debug
```

In browser console:

```javascript
debug.enable()
debug.log('API call', { endpoint, body })
// Logs all API calls
debug.downloadLogs()
```

## Common Patterns

### Polling Data

```javascript
useEffect(() => {
  const interval = setInterval(async () => {
    const result = await fetchRecords()
    if (result.success) {
      setRecords(result.data)
    }
  }, 5000)
  return () => clearInterval(interval)
}, [])
```

### Conditional Requests

```javascript
if (needsRefresh) {
  const result = await fetchRecords()
  if (result.success) {
    update(result.data)
  }
}
```

### Error Retry

```javascript
for (let i = 0; i < 3; i++) {
  const result = await fetchRecords()
  if (result.success) return result
  await new Promise(r => setTimeout(r, 1000 * i))
}
```

## Documentation

Full API reference: `API_HANDLERS.md`
