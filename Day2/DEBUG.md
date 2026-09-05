# Claude Debug Mode Documentation

Comprehensive debugging system for ALCOA+ QA application development with Claude.

## 🚀 Quick Start

### Enable Debug Mode

```bash
# Start dev server with debug enabled
npm run dev -- --debug

# Or with verbose logging
npm run dev -- --debug=verbose

# Or with profiling
npm run dev -- --debug=profile
```

### Browser Console Debugging

```javascript
// In browser console
debug.enable()           // Enable debug mode
debug.log('msg', data)   // Log message
debug.disable()          // Disable debug mode
debug.printStatus()      // Show debug status
```

---

## 📋 Debug Module Location

**File:** `src/utils/debug.js`

Singleton debug manager available globally in development:

```javascript
import debug from '../utils/debug'

// Or in browser console
window.debug
```

---

## 🔍 Logging Functions

### Basic Logging

```javascript
import debug from '../utils/debug'

// Debug level (detailed information)
debug.log('User logged in', { userId: 123 }, 'AUTH')

// Info level (general information)
debug.info('API response received', response, 'API')

// Warning level (potential issues)
debug.warn('Token expiring soon', { expiresIn: '5m' }, 'AUTH')

// Error level (errors and exceptions)
debug.error('API request failed', error, 'API')
```

### Output Examples

```
[125ms] AUTH User logged in { userId: 123 }
[234ms] API API response received { status: 200, data: [...] }
[345ms] WARN Token expiring soon { expiresIn: '5m' }
[456ms] ERROR API request failed Error: 500 Server Error
```

---

## ⏱️ Performance Timing

### Time Operations

```javascript
debug.time('fetchRecords')
await fetchRecords()
debug.timeEnd('fetchRecords')
// Output: ⏱️ fetchRecords: 234.56ms
```

### Profile Functions

```javascript
debug.profile('complexFunction')
complexFunction()
debug.profileEnd('complexFunction')
// Opens browser devtools profiler
```

---

## 🔎 Object Inspection

### Inspect Values

```javascript
debug.inspect('User Object', user)
// Outputs formatted table with object properties

debug.inspect('API Response', response)
// Logs response structure
```

### Assert Conditions

```javascript
debug.assert(result.success, 'API call should succeed', result)
// Logs error if condition fails
```

### Stack Traces

```javascript
debug.trace('Error occurred at this point')
// Prints full stack trace to console
```

---

## 📦 Log Grouping

```javascript
debug.group('User Authentication')
  debug.log('User data loaded', user)
  debug.log('Token verified', token)
  debug.log('Session created', session)
debug.groupEnd()

// Output:
// 📦 User Authentication
//   [125ms] Log User data loaded
//   [134ms] Log Token verified
//   [142ms] Log Session created
```

---

## 💾 Log Management

### Get Logs

```javascript
const allLogs = debug.getLogs()
console.log(allLogs) // Array of log entries
```

### Clear Logs

```javascript
debug.clearLogs()
// Removes all logs from memory
```

### Export Logs

```javascript
// Export as JSON
const jsonLogs = debug.exportLogs('json')

// Export as CSV
const csvLogs = debug.exportLogs('csv')
```

### Download Logs

```javascript
// Download as JSON file
debug.downloadLogs('debug-logs.json')

// Download as CSV
debug.downloadLogs('debug-logs.csv')
```

---

## 📊 Debug Status

### Get Status

```javascript
const status = debug.getStatus()
// Returns: { enabled, uptime, logs, timers, environment }
```

### Print Status

```javascript
debug.printStatus()
// Outputs table with debug information
```

### Analyze Performance

```javascript
const metrics = debug.analyzePerformance()
// Returns performance timing data
```

---

## 🎯 Use Cases

### API Debugging

```javascript
import debug from '../utils/debug'
import { fetchRecords } from '../api/records'

async function loadRecords() {
  debug.time('fetchRecords')
  
  try {
    debug.log('Fetching records...', { page: 1 }, 'API')
    const result = await fetchRecords(1, 20)
    
    if (result.success) {
      debug.info('Records loaded', result.data, 'API')
    } else {
      debug.error('Failed to load records', result.error, 'API')
    }
  } finally {
    debug.timeEnd('fetchRecords')
  }
}
```

### Component Lifecycle Debugging

```javascript
import { useEffect } from 'react'
import debug from '../utils/debug'

function MyComponent() {
  useEffect(() => {
    debug.log('Component mounted', { name: 'MyComponent' })
    
    return () => {
      debug.log('Component unmounted', { name: 'MyComponent' })
    }
  }, [])

  return <div>...</div>
}
```

### Authentication Flow Debugging

```javascript
import debug from '../utils/debug'
import { login } from '../api/auth'

async function handleLogin(email, password) {
  debug.group('Login Process')
  
  try {
    debug.log('Starting login', { email }, 'AUTH')
    const result = await login(email, password)
    
    if (result.success) {
      debug.info('Login successful', { user: result.user }, 'AUTH')
    } else {
      debug.warn('Login failed', { error: result.error }, 'AUTH')
    }
  } catch (error) {
    debug.error('Login error', error, 'AUTH')
  }
  
  debug.groupEnd()
}
```

### Performance Monitoring

```javascript
import debug from '../utils/debug'

function measureComplexOperation() {
  debug.time('complexOp')
  debug.profile('complexOp')
  
  // Expensive operation
  for (let i = 0; i < 1000000; i++) {
    // Do something
  }
  
  debug.profileEnd('complexOp')
  debug.timeEnd('complexOp')
}
```

---

## 🔐 Pre-Commit Validation

**File:** `.githooks/pre-commit-debug`

Automatically checks staged files for debug code:

**Blocks:**
- ❌ `debugger;` statements
- ❌ `debug.log()` calls
- ❌ `console.log()` calls (outside comments)
- ❌ `__DEBUG` constants
- ❌ Debug utility imports

**Allows:**
- ✅ Comments containing debug info
- ✅ Test files (`*.test.js`, `*.spec.js`)
- ✅ Debug utility file itself

### Example Blocking

```javascript
// ❌ This will be blocked
function myFunction() {
  console.log('Debug info')  // <- Will block commit
  debug.log('Testing')       // <- Will block commit
  debugger;                  // <- Will block commit
}

// ✅ This is allowed
function myFunction() {
  // Debug: this helps diagnose issue #123
  if (error) {
    handleError(error)
  }
}
```

---

## 🌍 Environment Variables

### Enable Debug Mode via Env Var

```bash
# Set environment variable
export DEBUG=true

# Or
export DEBUG_MODE=true

# Then start dev server
npm run dev
```

### Browser LocalStorage

```javascript
// In browser console
localStorage.setItem('DEBUG_MODE', 'true')
// Refresh page
```

---

## 📝 CLI Usage

**File:** `src/utils/cli-debug.js`

### Command Line Arguments

```bash
npm run dev -- --debug                    # Basic debug
npm run dev -- --debug=verbose           # Verbose logging
npm run dev -- --debug=profile           # Performance profiling
npm run dev -- --debug=trace             # Stack traces
npm run dev -- --debug=inspect           # Object inspection
npm run dev -- --debug --help            # Show help
```

### Parse Arguments

```javascript
import { parseArgs, initDebugMode } from '../utils/cli-debug'

const args = process.argv.slice(2)
const config = initDebugMode(args)
// Prints header and applies config
```

---

## 🎨 Output Styling

Debug output uses color-coded styling:

```javascript
// Each context has its own color
debug.log(msg, data, 'AUTH')      // Blue - Authentication
debug.log(msg, data, 'API')       // Teal - API calls
debug.log(msg, data, 'COMPONENT') // Green - React components
debug.log(msg, data, 'STORE')     // Purple - State management
debug.log(msg, data, 'ERROR')     // Red - Errors
```

---

## 🔄 Integration with React

### useDebug Custom Hook

```javascript
import { useEffect, useRef } from 'react'
import debug from '../utils/debug'

export function useDebug(componentName) {
  const mounted = useRef(false)

  useEffect(() => {
    if (!mounted.current) {
      debug.log(`${componentName} mounted`)
      mounted.current = true
    }

    return () => {
      debug.log(`${componentName} unmounting`)
    }
  }, [componentName])

  return debug
}

// Usage
function MyComponent() {
  const debug = useDebug('MyComponent')
  
  const handleClick = () => {
    debug.log('Button clicked', { timestamp: Date.now() })
  }

  return <button onClick={handleClick}>Click</button>
}
```

---

## 🚫 Clean Code for Production

### Remove Debug Before Committing

**Wrong:**
```javascript
async function fetchData() {
  debug.log('Starting fetch')
  const result = await api.get('/data')
  debug.log('Got result', result)
  return result
}
```

**Right:**
```javascript
async function fetchData() {
  const result = await api.get('/data')
  return result
}
```

### For Development Only

```javascript
if (DEBUG) {
  debug.log('Development info', data)
}

// Or
if (process.env.DEBUG === 'true') {
  debug.profile('operation')
  // ... operation ...
  debug.profileEnd('operation')
}
```

---

## 🧪 Testing with Debug

### Enable Debug in Tests

```javascript
describe('User API', () => {
  beforeEach(() => {
    localStorage.setItem('DEBUG_MODE', 'true')
  })

  it('should fetch user', async () => {
    const result = await fetchUser(1)
    expect(result.success).toBe(true)
    // Debug logs available in console
  })

  afterEach(() => {
    localStorage.removeItem('DEBUG_MODE')
  })
})
```

---

## ✅ Best Practices

### DO ✅

- Use debug mode during development
- Add context labels for clarity
- Group related operations
- Monitor performance with timers
- Clean debug code before committing
- Use appropriate log levels (log/info/warn/error)

### DON'T ❌

- Commit debug code to main branch
- Use console.log without considering alternatives
- Leave `debugger;` statements in code
- Enable debug in production
- Spam logs with trivial information
- Mix debug with actual logic

---

## 🐛 Debugging Claude Development

Enable debug mode when working with Claude Code:

```bash
# Start with full debugging
npm run dev -- --debug=verbose --debug=profile

# In browser console
debug.enable()
debug.log('Testing feature X', featureData)
debug.downloadLogs() // Save logs for analysis
```

---

## 📞 Quick Reference

| Command | Purpose |
|---------|---------|
| `debug.enable()` | Turn on debugging |
| `debug.disable()` | Turn off debugging |
| `debug.log(msg, data)` | Log debug message |
| `debug.info(msg, data)` | Log info message |
| `debug.warn(msg, data)` | Log warning |
| `debug.error(msg, err)` | Log error |
| `debug.time(label)` | Start timer |
| `debug.timeEnd(label)` | End timer |
| `debug.inspect(label, val)` | Inspect object |
| `debug.trace(msg)` | Print stack trace |
| `debug.group(label)` | Start group |
| `debug.groupEnd()` | End group |
| `debug.getLogs()` | Get all logs |
| `debug.clearLogs()` | Clear logs |
| `debug.downloadLogs()` | Download logs |
| `debug.printStatus()` | Show status |

---

**Debug Mode Ready!** 🚀

Use `npm run dev -- --debug` to get started.
