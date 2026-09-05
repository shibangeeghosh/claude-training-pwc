# Code Quality Guidelines

Standards and best practices for maintaining clean, well-formatted code in the ALCOA+ QA application.

## Formatting Standards

### 1. Code Style

**Do:**
- Use `const` for immutable variables (default)
- Use `let` for mutable variables
- Use arrow functions `() => {}`
- Use template literals for string interpolation
- Keep lines under 100 characters when possible

**Don't:**
- Use `var` declarations (use `const` or `let`)
- Use `function` keyword (use arrow functions)
- Use string concatenation (use template literals)
- Leave trailing semicolons inconsistent

**Good:**
```jsx
const userName = 'Alice'
const items = data.map(item => ({ ...item, formatted: true }))
const message = `Hello, ${userName}`
```

**Avoid:**
```jsx
var userName = 'Alice'
function getName() { return name }
const message = 'Hello, ' + userName
```

### 2. Component Structure

**Do:**
- Define imports at the top
- Place hooks before return statement
- Keep components under 200 lines (extract to sub-components if larger)
- Name components with PascalCase
- Keep JSX readable with proper indentation

**Don't:**
- Mix styles with logic
- Create complex nested JSX (extract to components)
- Use inline arrow functions in render (creates new function each render)
- Leave commented-out code

**Good:**
```jsx
export default function MyComponent() {
  const [state, setState] = useState(null)
  
  const handleClick = () => setState(true)
  
  return (
    <div className="component">
      <Button onClick={handleClick}>Click me</Button>
    </div>
  )
}
```

**Avoid:**
```jsx
export default function MyComponent() {
  // const [state, setState] = useState(null) // commented code
  
  return (
    <div className="component">
      <Button onClick={() => { /* inline logic */ }}>Click me</Button>
    </div>
  )
}
```

### 3. Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `ComplianceTracker`, `StatCard` |
| Variables/Functions | camelCase | `formatPercentage`, `isValidEmail` |
| Constants | UPPER_SNAKE_CASE | `MAX_ITEMS`, `DEFAULT_TIMEOUT` |
| Files | kebab-case | `use-compliance.js`, `format.js` |
| Directories | kebab-case | `src/utils/`, `src/hooks/` |
| CSS Classes | kebab-case | `compliance-badge`, `stat-card` |

### 4. Comments

**Do:**
- Use comments to explain *why*, not *what*
- Keep comments concise and accurate
- Use JSDoc for function documentation

**Don't:**
- Leave debug comments
- Comment obvious code
- Leave TODO/FIXME without context
- Use multiple comment lines for single thoughts

**Good:**
```jsx
// Cache compliance data to avoid repeated calculations
const complianceCache = useMemo(() => calculateCompliance(), [data])

// Compliance percentage calculated using weighted algorithm
export const getCompliance = (checks) => { ... }
```

**Avoid:**
```jsx
// Get the state
const [state, setState] = useState()

// TODO: fix this later
// FIXME: this doesn't work

// function that does something
const doSomething = () => { ... }
```

### 5. Imports/Exports

**Do:**
- Group imports: React first, then libraries, then local
- Use named imports for utilities
- Use default exports for components
- Keep imports alphabetically sorted per group

**Don't:**
- Import entire modules when you need specific items
- Mix default and named imports from same module
- Leave unused imports

**Good:**
```jsx
import React, { useState } from 'react'
import { BarChart, LineChart } from 'recharts'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

import { formatPercentage, formatDate } from '../utils'
import Header from './Header'
```

**Avoid:**
```jsx
import * as React from 'react'
import { utils } from '../'
import Header, { formatDate } from './Header'
```

## Pre-commit Validation

The pre-commit hook automatically checks:

✓ Environment files exist and are valid
✓ Required environment variables are set

## Pre-push Validation

The pre-push hook prevents pushing code with:

✗ Debug `console.log` statements
✗ `var` declarations (should be `const`/`let`)
✗ Unresolved TODO/FIXME comments
✗ Build failures

### Handling Pre-push Failures

**Issue: console.log detected**
```
Remove debug statements:
  grep -n "console.log" file.js
  Remove or comment out the line
  git add file.js
  git push (retry)
```

**Issue: Build failed**
```
Fix build errors:
  npm run build
  Review error messages
  Fix issues in source files
  git add .
  git push (retry)
```

**Override (only when necessary)**
```bash
git push --no-verify
```

## Testing Standards

### Unit Tests
- Test pure utility functions
- Test component behavior, not implementation
- Aim for >80% code coverage

### Integration Tests
- Test feature workflows
- Test component interactions
- Use realistic data

### Example Test Pattern
```jsx
describe('formatPercentage', () => {
  it('should format number as percentage', () => {
    expect(formatPercentage(95)).toBe('95%')
  })
  
  it('should handle invalid input', () => {
    expect(formatPercentage('invalid')).toBe('N/A')
  })
})
```

## Performance Guidelines

### Avoid:
- Unnecessary re-renders (use `useMemo`, `useCallback`)
- Large bundle sizes (use code splitting)
- Inline object/array creation (define outside render)
- Missing key props in lists

### Good Patterns:
```jsx
// Use useMemo for expensive calculations
const filtered = useMemo(() => 
  records.filter(r => r.status === 'compliant'),
  [records]
)

// Use useCallback for stable function references
const handleClick = useCallback(() => {
  setTab('tracker')
}, [])

// Define objects outside render
const containerStyle = {
  padding: '20px',
  borderRadius: '8px'
}

// Add keys to list items
{items.map(item => (
  <Item key={item.id} data={item} />
))}
```

## Documentation Standards

### README Functions
Every exported function should have clear documentation:

```jsx
/**
 * Format compliance percentage for display
 * @param {number} percentage - Percentage value (0-100)
 * @returns {string} Formatted percentage string
 * @example
 * formatPercentage(95)  // '95%'
 */
export const formatPercentage = (percentage) => { ... }
```

## Security Practices

### Do:
- Validate user input
- Escape output in templates
- Never commit secrets or API keys
- Use environment variables for configuration
- Sanitize URLs before using

### Don't:
- Store sensitive data in localStorage
- Use `eval()` or `Function()` constructor
- Trust user input
- Log sensitive information
- Hardcode credentials

## File Organization

### Suggested Structure
```
src/
├── config/           # Configuration files
│   └── env.js
├── utils/            # Utility functions
│   ├── format.js
│   └── index.js
├── hooks/            # Custom React hooks
│   ├── useCompliance.js
│   └── index.js
├── components/       # React components
│   ├── Header.jsx
│   ├── Dashboard.jsx
│   └── index.js
├── App.jsx           # Root component
├── main.jsx          # Entry point
└── index.css         # Global styles
```

## Git Workflow

### Commit Messages

**Format:**
```
[Type] Brief description (50 chars max)

Longer explanation of the change (wrap at 72 chars)
Explain why, not what

Fixes #123
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code restructuring
- `style` - Formatting/styling
- `docs` - Documentation
- `test` - Test additions
- `chore` - Maintenance

**Example:**
```
feat: Add query string utility functions

Added parseQueryString, buildQueryString, and related helpers to
centralize URL parameter handling. This eliminates duplicate code
across components and provides consistent parameter validation.

Fixes #456
```

## Code Review Checklist

Before committing, verify:

- [ ] Code follows naming conventions
- [ ] No `var` declarations (use `const`/`let`)
- [ ] No debug code (console.log, debugger)
- [ ] No commented-out code
- [ ] No TODO/FIXME without context
- [ ] Comments explain *why*, not *what*
- [ ] Functions are properly documented
- [ ] Components are under 200 lines
- [ ] Imports are organized and used
- [ ] Tests added/updated where appropriate
- [ ] No sensitive data in code/commits
- [ ] Build passes locally (`npm run build`)

## Enforcement

### Automatic Checks
- Pre-commit hook validates environment
- Pre-push hook validates code format and build

### Manual Review
- Code reviews by team members
- Adherence to standards in PRs

## Continuous Improvement

This document should be updated as the project evolves. If you encounter:

- Repeated code patterns → Consider refactoring or utilities
- Common errors → Add to pre-commit/pre-push hooks
- Style disagreements → Update guidelines collaboratively

## Resources

- [React Best Practices](https://react.dev)
- [JavaScript Style Guide](https://airbnb.io/javascript/)
- [Git Workflow](https://git-scm.com/book/en/v2)
- [Web Performance](https://web.dev/performance/)
