---
name: debug-mode
description: Enable and use debug mode for development
skills:
  - Debug logging
  - Performance monitoring
  - Inspection tools
  - Error tracking
---

# Debug Mode Skill

Comprehensive debugging for development and issue diagnosis.

## Enable Debug Mode

### CLI Method
```bash
npm run dev -- --debug
npm run dev -- --debug=verbose
npm run dev -- --debug=profile
```

### Browser Console
```javascript
debug.enable()
debug.disable()
debug.toggle()
```

### Environment Variable
```bash
export DEBUG=true
npm run dev
```

## Debug Functions

### Logging

```javascript
import debug from '../utils/debug'

// Debug level - detailed info
debug.log('Message', { data: 'value' }, 'CONTEXT')

// Info level - general info
debug.info('Information', data, 'API')

// Warning level - warnings
debug.warn('Warning message', data, 'WARN')

// Error level - errors
debug.error('Error occurred', error, 'ERROR')
```

### Performance Timing

```javascript
debug.time('operation')
// ... do work ...
debug.timeEnd('operation')
// Output: ⏱️ operation: 234.56ms
```

### Object Inspection

```javascript
debug.inspect('label', object)
// Outputs formatted table
```

### Stack Trace

```javascript
debug.trace('Called from here')
// Prints full stack
```

### Assertions

```javascript
debug.assert(condition, 'Assertion message', data)
// Logs error if condition fails
```

## Log Organization

```javascript
debug.group('Operation Name')
  debug.log('Step 1', data)
  debug.log('Step 2', data)
  debug.log('Step 3', data)
debug.groupEnd()
```

## Log Management

### Get Logs
```javascript
const logs = debug.getLogs()
console.log(logs)
```

### Clear Logs
```javascript
debug.clearLogs()
```

### Export
```javascript
const json = debug.exportLogs('json')
const csv = debug.exportLogs('csv')
```

### Download
```javascript
debug.downloadLogs('debug-logs.json')
debug.downloadLogs('debug-logs.csv')
```

## Status & Analytics

```javascript
// Get status object
const status = debug.getStatus()
// { enabled, uptime, logs, timers, environment }

// Print status to console
debug.printStatus()

// Analyze performance
const metrics = debug.analyzePerformance()
```

## Use Cases

### API Debugging

```javascript
async function fetchData() {
  debug.time('fetch')
  debug.log('Starting fetch', { endpoint: '/api/records' })
  
  try {
    const result = await fetch('/api/records')
    debug.info('Got response', { status: result.status })
    return result
  } catch (error) {
    debug.error('Fetch failed', error)
    throw error
  } finally {
    debug.timeEnd('fetch')
  }
}
```

### Component Lifecycle

```javascript
import { useEffect } from 'react'

function MyComponent() {
  useEffect(() => {
    debug.log('Mounted', { component: 'MyComponent' })
    
    return () => {
      debug.log('Unmounted', { component: 'MyComponent' })
    }
  }, [])
}
```

### State Changes

```javascript
function handleStateChange(newState) {
  debug.group('State Update')
  debug.log('Old state', oldState)
  debug.log('New state', newState)
  debug.log('Changes', { diff: '...' })
  debug.groupEnd()
  setState(newState)
}
```

## Pre-Commit Validation

Debug statements automatically removed before commit:

```javascript
// ❌ Will be blocked
function example() {
  debug.log('Test')
  console.log('Debug')
}

// ✅ Allowed in test files
// example.test.js
debug.log('Testing')
```

### Force-add Debug (Not Recommended)
```bash
git commit --no-verify
```

## Output Examples

### Console Output
```
[125ms] AUTH User logged in { userId: 123 }
[234ms] API Response received { status: 200 }
[345ms] WARN Token expiring soon { expiresIn: '5m' }
[456ms] ERROR Request failed Error: 500
```

### Timed Output
```
⏱️ fetchRecords: 234.56ms
⏱️ updateUI: 45.23ms
⏱️ render: 12.34ms
```

## Performance Profiling

```javascript
debug.profile('complexFunction')
complexFunction()
debug.profileEnd('complexFunction')
// Opens devtools profiler
```

## Best Practices

### DO ✅
- Enable debug during development
- Add context labels for clarity
- Group related operations
- Use appropriate log levels
- Clean up debug before commit

### DON'T ❌
- Leave debug enabled in production
- Log sensitive data (passwords, tokens)
- Create debug output spam
- Use in critical paths
- Forget to remove debug code

## Keyboard Shortcuts

In browser console with debug enabled:

```javascript
// Quick commands
debug.enable()           // Enable
debug.disable()          // Disable
debug.printStatus()      // Show status
debug.getLogs()          // Get all logs
debug.downloadLogs()     // Download logs
```

## Troubleshooting

### Debug Not Working
```bash
# Check if enabled
> debug.enabled

# Manually enable
> debug.enable()

# Check status
> debug.printStatus()
```

### Too Much Logging
```javascript
// Clear logs periodically
setInterval(() => {
  if (debug.getLogs().length > 500) {
    debug.clearLogs()
  }
}, 60000)
```

### Performance Impact
- Debug disabled by default
- Zero overhead when disabled
- Minimal impact when enabled
- Don't leave enabled in production

## Integration with Testing

```javascript
describe('MyFeature', () => {
  beforeEach(() => {
    localStorage.setItem('DEBUG_MODE', 'true')
  })

  it('should work', async () => {
    const result = await myFunction()
    expect(result).toBe(true)
    // Debug logs captured
  })

  afterEach(() => {
    debug.clearLogs()
    localStorage.removeItem('DEBUG_MODE')
  })
})
```

## Documentation

Full reference: `DEBUG.md`
