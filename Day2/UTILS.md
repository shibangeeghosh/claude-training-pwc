# Utility Functions Reference

Centralized utility functions for formatting, URL parameters, and data manipulation.

## Location

`src/utils/format.js` - All utility functions for the application

## Import Examples

```jsx
// Import specific functions
import { parseQueryString, buildQueryString, formatPercentage } from '../utils/format'

// Import all utilities
import * as format from '../utils/format'

// Import from utils index
import { formatDate, formatStatus } from '../utils'
```

## Query String Functions

### parseQueryString(queryString)

Parse query string into an object.

```jsx
const params = parseQueryString('?tab=tracker&status=compliant')
// { tab: 'tracker', status: 'compliant' }

const params2 = parseQueryString('tab=tracker&status=compliant')
// { tab: 'tracker', status: 'compliant' }
```

**Parameters:**
- `queryString` (string) - Query string with or without `?`

**Returns:** Object with parsed parameters

---

### buildQueryString(params)

Build query string from object.

```jsx
const query = buildQueryString({ tab: 'tracker', status: 'compliant' })
// '?tab=tracker&status=compliant'

const empty = buildQueryString({ key: null, empty: '' })
// '' (null/empty values filtered out)
```

**Parameters:**
- `params` (object) - Parameters to encode

**Returns:** Query string with `?` prefix, or empty string

---

### updateQueryParam(key, value)

Update single query parameter in current URL.

```jsx
const newUrl = updateQueryParam('tab', 'records')
// Updates current URL with tab=records parameter

// Remove parameter by setting null
const cleaned = updateQueryParam('filter', null)
```

**Parameters:**
- `key` (string) - Parameter name
- `value` (string|null) - Parameter value (null to remove)

**Returns:** Updated URL string

---

### getQueryParam(key, defaultValue)

Get query parameter from current URL.

```jsx
const tab = getQueryParam('tab')
// Returns 'tracker' if present, null if not

const status = getQueryParam('status', 'all')
// Returns parameter or 'all' if not found
```

**Parameters:**
- `key` (string) - Parameter name
- `defaultValue` (any) - Default if not found (optional)

**Returns:** Parameter value or default

---

## Formatting Functions

### formatPercentage(percentage)

Format number as percentage string.

```jsx
formatPercentage(95)        // '95%'
formatPercentage(87.5)      // '88%' (rounded)
formatPercentage('invalid') // 'N/A'
```

**Parameters:**
- `percentage` (number) - Percentage value

**Returns:** Formatted string with % symbol

---

### formatDate(date, format)

Format date to readable string.

```jsx
formatDate('2024-12-15')              // 'Dec 15, 2024'
formatDate(new Date(), 'long')        // 'December 15, 2024'
formatDate('2024-12-15', 'time')      // 'Dec 15, 2024, 02:30 PM'
```

**Parameters:**
- `date` (string|Date) - Date to format
- `format` (string) - Format style: 'short' (default), 'long', 'time'

**Returns:** Formatted date string

---

### formatStatus(status)

Format status to readable label.

```jsx
formatStatus('pass')        // 'Compliant'
formatStatus('warning')     // 'Warning'
formatStatus('fail')        // 'Non-Compliant'
formatStatus('compliant')   // 'Compliant'
```

**Parameters:**
- `status` (string) - Status value

**Returns:** Human-readable status label

---

### formatPrinciple(principle)

Format ALCOA+ principle ID to full name.

```jsx
formatPrinciple('attributable')     // 'Attributable'
formatPrinciple('contemporaneous')  // 'Contemporaneous'
formatPrinciple('original')         // 'Original'
```

**Parameters:**
- `principle` (string) - Principle ID

**Returns:** Full principle name

---

### formatDatabaseInfo(host, port, name)

Format database connection info safely for display.

```jsx
formatDatabaseInfo('localhost', 5432, 'alcoa_qa_dev')
// 'localhost:5432/alcoa_qa_dev'

formatDatabaseInfo('db.example.com', 5432, 'prod_db')
// 'db.example.com:5432/prod_db'
```

**Parameters:**
- `host` (string) - Database hostname
- `port` (number) - Database port
- `name` (string) - Database name

**Returns:** Formatted connection string

---

### formatNumber(num)

Format number with thousands separator.

```jsx
formatNumber(1000)      // '1,000'
formatNumber(1000000)   // '1,000,000'
formatNumber(156)       // '156'
```

**Parameters:**
- `num` (number) - Number to format

**Returns:** Formatted number string

---

## String Manipulation

### capitalize(str)

Capitalize first letter, lowercase rest.

```jsx
capitalize('HELLO')     // 'Hello'
capitalize('hello')     // 'Hello'
capitalize('hELLO')     // 'Hello'
```

**Parameters:**
- `str` (string) - String to capitalize

**Returns:** Capitalized string

---

### slugify(str)

Convert string to URL-safe slug.

```jsx
slugify('ALCOA+ Compliance')      // 'alcoa-compliance'
slugify('Hello   World!')         // 'hello-world'
slugify('compliance-tracker')     // 'compliance-tracker'
```

**Parameters:**
- `str` (string) - String to slugify

**Returns:** URL-safe slug

---

### truncate(str, length)

Truncate string with ellipsis.

```jsx
truncate('This is a long string', 10)  // 'This is a ...'
truncate('Short', 50)                   // 'Short' (no truncation)
truncate('Clinical Trial Data Entry', 15) // 'Clinical Trial D...'
```

**Parameters:**
- `str` (string) - String to truncate
- `length` (number) - Max length before truncation (default: 50)

**Returns:** Truncated string with '...'

---

## Time Functions

### getTimeAgo(date)

Get relative time string (e.g., "2 hours ago").

```jsx
getTimeAgo(new Date())                    // 'Just now'
getTimeAgo(Date.now() - 3600000)         // '1 hour ago'
getTimeAgo(new Date('2024-12-13'))       // '2 days ago'
```

**Parameters:**
- `date` (Date|string) - Date to compare

**Returns:** Relative time string

---

## Validation Functions

### isValidEmail(email)

Validate email address format.

```jsx
isValidEmail('user@example.com')    // true
isValidEmail('invalid.email')       // false
isValidEmail('user@domain')         // false
```

**Parameters:**
- `email` (string) - Email to validate

**Returns:** Boolean

---

### isValidUrl(url)

Validate URL format.

```jsx
isValidUrl('http://localhost:3000')     // true
isValidUrl('https://example.com')       // true
isValidUrl('not a url')                 // false
```

**Parameters:**
- `url` (string) - URL to validate

**Returns:** Boolean

---

## Usage in Components

### Example 1: Search & Filter Component

```jsx
import { parseQueryString, buildQueryString, formatStatus } from '../utils'

function DataRecords() {
  const params = parseQueryString(window.location.search)
  const status = params.status || 'all'

  const handleFilterChange = (newStatus) => {
    const newUrl = buildQueryString({ ...params, status: newStatus })
    window.history.pushState({}, '', newUrl)
  }

  return (
    <div>
      <select value={status} onChange={(e) => handleFilterChange(e.target.value)}>
        <option value="all">All</option>
        <option value="compliant">{formatStatus('compliant')}</option>
        <option value="warning">{formatStatus('warning')}</option>
      </select>
    </div>
  )
}
```

### Example 2: Display Formatted Data

```jsx
import { formatDate, formatPercentage, getTimeAgo, formatPrinciple } from '../utils'

function RecordCard({ record }) {
  return (
    <div>
      <h3>{record.title}</h3>
      <p>Principle: {formatPrinciple(record.principle)}</p>
      <p>Compliance: {formatPercentage(record.percentage)}</p>
      <p>Date: {formatDate(record.date, 'long')}</p>
      <p>Added: {getTimeAgo(record.date)}</p>
    </div>
  )
}
```

### Example 3: Validation

```jsx
import { isValidEmail, isValidUrl, formatNumber } from '../utils'

function SettingsForm() {
  const handleSubmit = (e) => {
    e.preventDefault()
    const email = e.target.email.value
    const url = e.target.url.value

    if (!isValidEmail(email)) {
      alert('Invalid email format')
      return
    }

    if (!isValidUrl(url)) {
      alert('Invalid URL format')
      return
    }

    // Submit form
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" placeholder="Email" />
      <input type="text" name="url" placeholder="API URL" />
      <button type="submit">Save Settings</button>
    </form>
  )
}
```

---

## Code Quality Hooks

### pre-push Hook

Validates code before pushing to prevent unformatted code:

**Checks for:**
- ✓ console.log statements (debug code)
- ✓ var declarations (use const/let)
- ✓ TODO/FIXME comments (incomplete work)
- ✓ Build success

**To bypass (not recommended):**
```bash
git push --no-verify
```

---

## Best Practices

### 1. Use consistent formatting
```jsx
// Good - Using format utilities
<p>Compliance: {formatPercentage(95)}</p>

// Avoid - Manual formatting
<p>Compliance: {Math.round(95)}%</p>
```

### 2. Validate user input
```jsx
// Good - Validate before use
if (isValidEmail(email)) {
  sendEmail(email)
}

// Avoid - No validation
sendEmail(email)
```

### 3. Use slug for URLs
```jsx
// Good - URL-safe slug
const recordUrl = `/record/${slugify(record.title)}`

// Avoid - Raw string
const recordUrl = `/record/${record.title}`
```

### 4. Maintain consistency
All formatting functions follow these patterns:
- Return 'N/A' for invalid input
- Handle null/undefined gracefully
- Use localized formatting where appropriate

---

## Testing Utilities

All utilities are pure functions suitable for unit testing:

```jsx
import { formatPercentage, parseQueryString, capitalize } from '../utils'

describe('format utilities', () => {
  it('should format percentage', () => {
    expect(formatPercentage(95)).toBe('95%')
    expect(formatPercentage(87.5)).toBe('88%')
  })

  it('should parse query string', () => {
    const result = parseQueryString('?tab=tracker&status=compliant')
    expect(result.tab).toBe('tracker')
    expect(result.status).toBe('compliant')
  })

  it('should capitalize string', () => {
    expect(capitalize('hello')).toBe('Hello')
  })
})
```

---

## Performance Notes

- All functions are **lightweight** and **synchronous**
- URL operations use native `URL` and `URLSearchParams` APIs
- Date formatting uses native `toLocaleDateString()`
- No external dependencies required
