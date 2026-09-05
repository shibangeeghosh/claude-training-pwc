---
name: code-standards
description: Follow project code standards and quality guidelines
skills:
  - Code quality
  - Security practices
  - Git workflow
  - Commit standards
---

# Code Standards Skill

Project code quality and development standards.

## Pre-Commit Validation

Automatic checks before each commit:

### Code Quality Hook
- ❌ No debug code (console.log, debugger;)
- ❌ No var declarations (use const/let)
- ❌ No TODO/FIXME without context
- ✅ Build must pass

Run manually:
```bash
./.githooks/pre-commit
```

### Backend Security Hook
- ❌ No hardcoded secrets
- ❌ No SQL concatenation
- ❌ Missing authentication
- ❌ No sensitive data logging
- ✅ All security rules verified

Run manually:
```bash
./.githooks/pre-commit-backend
```

### Async/Await Hook
- ❌ No .then() chains
- ❌ No .catch() calls
- ❌ No new Promise()
- ❌ No callback patterns
- ✅ All handlers use async/await

Run manually:
```bash
./.githooks/pre-commit-async
```

### Debug Code Hook
- ❌ No debug statements in staged files
- ❌ No console.log (outside comments)
- ✅ Clean code for production

Run manually:
```bash
./.githooks/pre-commit-debug
```

## Naming Conventions

```javascript
// Components - PascalCase
function MyComponent() {}
class UserService {}

// Variables/Functions - camelCase
const userName = 'Alice'
const handleClick = () => {}
function fetchData() {}

// Constants - UPPER_SNAKE_CASE
const MAX_ITEMS = 100
const API_TIMEOUT = 30000

// CSS Classes - kebab-case
className="compliance-badge"
className="stat-card"

// Files - kebab-case
my-component.js
user-service.js
api-client.js
```

## Code Style

### Imports Organization
```javascript
// 1. React imports
import React, { useState } from 'react'

// 2. Third-party libraries
import { Icon } from 'lucide-react'
import { Button } from 'component-lib'

// 3. Local utilities
import { formatDate, parseQuery } from '../utils'

// 4. Local components
import Header from './Header'
import Footer from './Footer'
```

### Import Statements
```javascript
// ✅ Named imports for utilities
import { formatDate, parseQuery } from '../utils'

// ✅ Default import for components
import MyComponent from './MyComponent'

// ✅ Namespace imports
import * as recordsAPI from '../api/records'

// ❌ Avoid
import * as utils from '../utils'
import Comp from './MyComponent'
```

## File Size Guidelines

- Components: < 200 lines
- Utilities: < 300 lines
- Hooks: < 150 lines

## Comments

### Good Comments
```javascript
// Use comments to explain WHY, not WHAT

// Retry with exponential backoff to handle temporary failures
for (let attempt = 0; attempt < maxRetries; attempt++) {
  try {
    return await fetch(url)
  } catch (err) {
    const delay = 1000 * Math.pow(2, attempt)
    await new Promise(r => setTimeout(r, delay))
  }
}

// Cache data to avoid repeated API calls
const cachedData = useMemo(() => calculateData(source), [source])
```

### Bad Comments
```javascript
// ❌ Don't comment obvious code
const x = 5 // Set x to 5
return x // Return x
if (user) { // Check if user exists

// ❌ Don't leave TODO without context
// TODO: fix this

// ✅ Do this instead
// TODO: optimize query performance (issue #123)
```

## Error Handling

```javascript
// ✅ Handle all promises
async function loadData() {
  try {
    const result = await fetchData()
    return result
  } catch (error) {
    console.error('Failed to load:', error)
    throw error
  }
}

// ✅ Handle API calls
const result = await api.get('/endpoint')
if (!result.success) {
  handleError(result.error)
  return
}

// ❌ Avoid
const result = await api.get('/endpoint')
// No error handling

// ❌ Avoid
fetchData().then(...)
// No .catch()
```

## Testing Standards

### Unit Tests
```javascript
describe('Component', () => {
  it('should render with props', () => {
    render(<Component title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('should handle user interaction', () => {
    render(<Component onAction={jest.fn()} />)
    fireEvent.click(screen.getByRole('button'))
    expect(Component).toBeCalled()
  })
})
```

### Integration Tests
```javascript
describe('Feature Flow', () => {
  it('should complete full user flow', async () => {
    // Setup
    render(<App />)
    
    // Act
    await userEvent.type(input, 'query')
    fireEvent.click(screen.getByText('Search'))
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText('Results')).toBeInTheDocument()
    })
  })
})
```

## Git Workflow

### Commit Messages
```bash
# Format
[type] Brief description (50 chars max)

Longer explanation (wrap at 72 chars)
Explain why, not what

Fixes #123

# Types
feat:     New feature
fix:      Bug fix
refactor: Code restructuring
style:    Formatting/styling
docs:     Documentation
test:     Test additions
chore:    Maintenance
```

### Example Commits
```bash
git commit -m "feat: Add ALCOA+ compliance tracker

Implement comprehensive compliance tracking dashboard
with real-time updates and audit logging.

Fixes #456"

git commit -m "fix: Handle API errors gracefully

Wrap all API calls in try-catch with user feedback"
```

### Branch Naming
```
feature/add-compliance-dashboard
fix/api-error-handling
docs/update-readme
refactor/extract-utils
```

## Security Checklist

Before committing code:

- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] No sensitive data logged
- [ ] Input validation present
- [ ] SQL/NoSQL injection prevented
- [ ] Authentication required (when needed)
- [ ] CORS properly configured
- [ ] HTTPS enforced in production
- [ ] No eval() or dynamic code execution
- [ ] Dependencies up-to-date (npm audit)
- [ ] No known vulnerabilities

## Performance Checklist

- [ ] No unnecessary re-renders
- [ ] useMemo for expensive calculations
- [ ] useCallback for stable references
- [ ] Code splitting for large components
- [ ] Images optimized
- [ ] Bundle size acceptable
- [ ] No memory leaks
- [ ] Async operations properly handled
- [ ] Debouncing for frequent events
- [ ] Caching implemented where appropriate

## Accessibility Checklist

- [ ] Semantic HTML used
- [ ] ARIA labels where needed
- [ ] Color not sole differentiator
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Alt text for images
- [ ] Links have meaningful text
- [ ] Forms properly labeled
- [ ] Sufficient contrast ratio
- [ ] Tested with screen readers

## Code Review Checklist

When reviewing code:

- [ ] Follows naming conventions
- [ ] No debug code
- [ ] Error handling present
- [ ] Tests included
- [ ] Comments explain WHY
- [ ] No security issues
- [ ] Performance acceptable
- [ ] Accessibility considered
- [ ] Responsive design works
- [ ] Commit message clear

## Before Merging

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] No build warnings
- [ ] No console errors
- [ ] No breaking changes
- [ ] Documentation updated
- [ ] Pre-commit hooks pass
- [ ] Security review complete
- [ ] Performance acceptable
- [ ] Ready for production

## Tools & Commands

```bash
# Run tests
npm test

# Build project
npm run build

# Dev server
npm run dev

# Run with debug
npm run dev -- --debug

# Lint code
npm run lint

# Type check (if available)
npm run type-check

# Run security audit
npm audit

# Git hooks
./.githooks/pre-commit
./.githooks/pre-push
./.githooks/pre-commit-debug
```

## Documentation Location

- Code standards: This file
- API integration: `API_HANDLERS.md`
- Debug mode: `DEBUG.md`
- Security: `BACKEND_SECURITY.md`
- Quality: `CODE_QUALITY.md`
- Backend templates: `BACKEND_TEMPLATE.md`
- Utilities: `UTILS.md`
