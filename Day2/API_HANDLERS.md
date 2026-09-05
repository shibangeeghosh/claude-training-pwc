# API Handlers Documentation

All API handlers in `src/api/` use **async/await pattern** for clean, readable asynchronous code.

## 📁 API Handler Structure

```
src/api/
├── client.js         # Main API client (all requests go through here)
├── records.js        # Records endpoint handlers
├── compliance.js     # Compliance endpoint handlers
├── auth.js           # Authentication handlers
└── index.js          # Module exports
```

## 🔄 Async/Await Pattern

All handlers use async/await instead of callbacks or promise chains:

### ✅ CORRECT Pattern (Async/Await)
```javascript
export const fetchRecords = async (page = 1, pageSize = 20) => {
  try {
    const response = await apiClient.get(`/api/v1/records?page=${page}&pageSize=${pageSize}`)

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch records')
    }

    return {
      success: true,
      data: response.data.data || []
    }
  } catch (error) {
    console.error('Error fetching records:', error.message)
    return {
      success: false,
      error: error.message,
      data: []
    }
  }
}
```

### ❌ WRONG Patterns (Callbacks/Promises)
```javascript
// Don't use .then() chains
export const fetchRecords = (page = 1) => {
  return apiClient.get(`/api/v1/records?page=${page}`)
    .then(response => response.data)
    .catch(err => console.error(err))
}

// Don't use Promise constructor
export const fetchRecords = (page = 1) => {
  return new Promise((resolve, reject) => {
    apiClient.get(`/api/v1/records?page=${page}`)
      .then(response => resolve(response.data))
      .catch(err => reject(err))
  })
}

// Don't use callbacks
export const fetchRecords = (page = 1, callback) => {
  apiClient.get(`/api/v1/records?page=${page}`, (err, response) => {
    if (err) callback(err, null)
    else callback(null, response.data)
  })
}
```

---

## 📚 Available Handlers

### Records API (`src/api/records.js`)

#### `fetchRecords(page, pageSize, filters)`
Fetch all records with pagination.

```javascript
import { fetchRecords } from '../api/records'

// Usage
const result = await fetchRecords(1, 20, { status: 'compliant' })
if (result.success) {
  console.log(result.data)
}
```

#### `fetchRecord(recordId)`
Fetch single record by ID.

```javascript
import { fetchRecord } from '../api/records'

const result = await fetchRecord('rec-001')
if (result.success) {
  console.log(result.data)
}
```

#### `createRecord(recordData)`
Create new record.

```javascript
import { createRecord } from '../api/records'

const result = await createRecord({
  title: 'New Record',
  status: 'compliant',
  percentage: 95
})
```

#### `updateRecord(recordId, updates)`
Update entire record.

```javascript
import { updateRecord } from '../api/records'

const result = await updateRecord('rec-001', {
  title: 'Updated Title',
  status: 'warning',
  percentage: 85
})
```

#### `patchRecord(recordId, updates)`
Partially update record.

```javascript
import { patchRecord } from '../api/records'

const result = await patchRecord('rec-001', { status: 'compliant' })
```

#### `deleteRecord(recordId)`
Delete record.

```javascript
import { deleteRecord } from '../api/records'

const result = await deleteRecord('rec-001')
```

#### `bulkCreateRecords(recordsList)`
Create multiple records in parallel.

```javascript
import { bulkCreateRecords } from '../api/records'

const result = await bulkCreateRecords([
  { title: 'Record 1', status: 'compliant' },
  { title: 'Record 2', status: 'warning' }
])
console.log(result.summary) // { total: 2, successCount: 2, failCount: 0 }
```

#### `searchRecords(query, filters)`
Search records.

```javascript
import { searchRecords } from '../api/records'

const result = await searchRecords('compliance', { status: 'warning' })
console.log(result.results) // Array of matching records
```

#### `exportRecords(format, filters)`
Export records to CSV/JSON/XLSX.

```javascript
import { exportRecords } from '../api/records'

const result = await exportRecords('csv', { status: 'compliant' })
```

---

### Compliance API (`src/api/compliance.js`)

#### `fetchComplianceChecks(recordId)`
Get compliance checks for a record.

```javascript
import { fetchComplianceChecks } from '../api/compliance'

const result = await fetchComplianceChecks('rec-001')
```

#### `fetchOverallCompliance()`
Get overall compliance score.

```javascript
import { fetchOverallCompliance } from '../api/compliance'

const result = await fetchOverallCompliance()
console.log(result.score) // 91
```

#### `fetchComplianceTrend(period)`
Get historical compliance trend.

```javascript
import { fetchComplianceTrend } from '../api/compliance'

const result = await fetchComplianceTrend('6months')
console.log(result.trend) // Array of monthly scores
```

#### `fetchComplianceByPrinciple()`
Get compliance breakdown by ALCOA+ principle.

```javascript
import { fetchComplianceByPrinciple } from '../api/compliance'

const result = await fetchComplianceByPrinciple()
// Returns: { Attributable: 95, Legible: 92, ... }
```

#### `fetchComplianceStats()`
Get compliance statistics.

```javascript
import { fetchComplianceStats } from '../api/compliance'

const result = await fetchComplianceStats()
// Returns: { total: 156, compliant: 150, warning: 4, nonCompliant: 2 }
```

#### `generateComplianceReport(filters)`
Generate compliance report.

```javascript
import { generateComplianceReport } from '../api/compliance'

const result = await generateComplianceReport({ status: 'compliant' })
```

---

### Authentication API (`src/api/auth.js`)

#### `login(email, password)`
Authenticate user and get token.

```javascript
import { login } from '../api/auth'

const result = await login('user@example.com', 'password')
if (result.success) {
  console.log(result.token) // JWT token
  console.log(result.user)  // User object
}
```

#### `logout()`
Logout user and clear tokens.

```javascript
import { logout } from '../api/auth'

await logout()
```

#### `register(userData)`
Register new user.

```javascript
import { register } from '../api/auth'

const result = await register({
  email: 'newuser@example.com',
  password: 'secure-password',
  firstName: 'John',
  lastName: 'Doe'
})
```

#### `verifyUser()`
Get current authenticated user.

```javascript
import { verifyUser } from '../api/auth'

const result = await verifyUser()
if (result.success) {
  console.log(result.user)
}
```

#### `refreshToken()`
Refresh authentication token.

```javascript
import { refreshToken } from '../api/auth'

const result = await refreshToken()
if (result.success) {
  // Token automatically stored in localStorage
}
```

#### `isAuthenticated()`
Check if user is currently authenticated.

```javascript
import { isAuthenticated } from '../api/auth'

const authenticated = await isAuthenticated()
if (authenticated) {
  // User is logged in
}
```

---

## 🎯 API Client Features

### Main API Client (`src/api/client.js`)

#### Request Methods
- `get(endpoint, options)` - GET request
- `post(endpoint, body, options)` - POST request
- `put(endpoint, body, options)` - PUT request
- `patch(endpoint, body, options)` - PATCH request
- `delete(endpoint, options)` - DELETE request

#### Automatic Features
- ✅ JWT token injection
- ✅ Idempotency keys for POST
- ✅ Request timeout (30s default)
- ✅ AbortController support
- ✅ Error handling
- ✅ Response parsing

#### Retry with Exponential Backoff
```javascript
import { apiClient } from '../api'

const result = await apiClient.retry(
  () => apiClient.get('/api/v1/records'),
  3,  // max retries
  1000 // initial delay
)
```

#### Batch Requests (Parallel)
```javascript
import { apiClient } from '../api'

const results = await apiClient.batch([
  apiClient.get('/api/v1/records'),
  apiClient.get('/api/v1/compliance/overall'),
  apiClient.get('/api/v1/compliance/stats')
])
```

---

## 💡 Usage in Components

### React Hook Pattern (with async/await)
```jsx
import { useState, useEffect } from 'react'
import { fetchRecords } from '../api/records'

function RecordsComponent() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadRecords = async () => {
      try {
        setLoading(true)
        const result = await fetchRecords(1, 20)
        
        if (result.success) {
          setRecords(result.data)
          setError(null)
        } else {
          setError(result.error)
          setRecords([])
        }
      } finally {
        setLoading(false)
      }
    }

    loadRecords()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  return <div>{records.map(r => <div key={r.id}>{r.title}</div>)}</div>
}
```

### Event Handler Pattern
```jsx
import { createRecord } from '../api/records'

function CreateRecordForm() {
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const result = await createRecord({
      title: e.target.title.value,
      status: e.target.status.value
    })

    if (result.success) {
      alert('Record created!')
      e.target.reset()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

---

## 🔐 Error Handling

All handlers return consistent error responses:

```javascript
{
  success: false,
  error: 'Error message',
  data: null
}
```

### Example Error Handling
```javascript
const result = await fetchRecord('invalid-id')

if (!result.success) {
  console.error('Failed to fetch:', result.error)
  // Handle error appropriately
} else {
  // Process result.data
}
```

---

## 🧪 Testing Handlers

### Unit Test Example
```javascript
import { fetchRecords } from '../api/records'

describe('fetchRecords', () => {
  it('should fetch records successfully', async () => {
    const result = await fetchRecords(1, 20)
    
    expect(result.success).toBe(true)
    expect(Array.isArray(result.data)).toBe(true)
  })

  it('should handle errors', async () => {
    // Mock error scenario
    const result = await fetchRecords(-1)
    
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})
```

---

## ✅ Pre-commit Hook Validation

The `pre-commit-async` hook validates:
- ✓ No `.then()` chains
- ✓ No `.catch()` methods
- ✓ No `new Promise()` constructors
- ✓ No callback patterns
- ✓ All handlers use async/await

Run manually:
```bash
./.githooks/pre-commit-async
```

---

## 📝 Guidelines

### DO ✅
- Use `async`/`await` for all API calls
- Use `try`/`catch` for error handling
- Return consistent response objects
- Validate input parameters
- Include meaningful error messages

### DON'T ❌
- Use `.then()` chains
- Use `.catch()` without async/await
- Use `new Promise()` constructor
- Use callback pattern
- Mix promise chains with async/await

---

## 🚀 Quick Start

1. **Import handlers:**
   ```javascript
   import { fetchRecords, createRecord } from '../api/records'
   import { login, logout } from '../api/auth'
   ```

2. **Use with await:**
   ```javascript
   const result = await fetchRecords(1, 20)
   ```

3. **Handle response:**
   ```javascript
   if (result.success) {
     // Use result.data
   } else {
     // Handle result.error
   }
   ```

4. **Commit with validation:**
   ```bash
   git commit -m "Add new API handler"
   # Pre-commit-async hook validates async/await usage
   ```

---

**All API handlers enforce async/await pattern. Commits violating this will be blocked.**
