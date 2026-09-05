---
name: component-dev
description: Develop React components following project standards
skills:
  - React component development
  - Tailwind CSS styling
  - Component composition
  - Hooks usage
---

# Component Development Skill

Guidelines for building React components in this project.

## Component Structure

### File Organization

```
src/components/
├── MyComponent.jsx       # Component file
├── index.js             # Export file (optional)
└── MyComponent.css      # Scoped styles (if needed)
```

### Basic Component Template

```javascript
import React, { useState, useEffect } from 'react'
import { Icon } from 'lucide-react'

export default function MyComponent({ title, onAction }) {
  const [state, setState] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Initialize or fetch data
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      // Load data
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4">
        <button onClick={onAction} className="btn-primary">
          Action
        </button>
      </div>
    </div>
  )
}
```

## Styling with Tailwind

### Use Tailwind Utilities
```javascript
// ✅ Use utility classes
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  <h2 className="text-lg font-semibold text-gray-900">Title</h2>
  <p className="text-gray-600 text-sm mt-2">Description</p>
</div>

// ❌ Avoid inline styles
<div style={{ background: 'white', borderRadius: '8px', padding: '24px' }}>
  Content
</div>
```

### Use Project Color Palette
```javascript
// ✅ Use custom colors
<div className="bg-eli-navy text-white p-4">
  Header
</div>

<button className="bg-eli-blue hover:bg-eli-navy">
  Primary Button
</button>

// Available colors:
// eli-navy (#001F3F)
// eli-blue (#0066CC)
// eli-light (#E8F1F8)
// eli-accent (#00A8E8)
```

### Responsive Design
```javascript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (
    <div key={item.id} className="card p-4">
      {item.title}
    </div>
  ))}
</div>
```

## Hooks Usage

### useState for State
```javascript
const [count, setCount] = useState(0)
const [isOpen, setIsOpen] = useState(false)
const [data, setData] = useState(null)
```

### useEffect for Side Effects
```javascript
// Run on mount
useEffect(() => {
  loadInitialData()
}, [])

// Run on dependency change
useEffect(() => {
  updateData(id)
}, [id])

// Cleanup on unmount
useEffect(() => {
  const handler = () => handleResize()
  window.addEventListener('resize', handler)
  return () => window.removeEventListener('resize', handler)
}, [])
```

### useMemo for Expensive Calculations
```javascript
const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(data)
}, [data])
```

### useCallback for Stable References
```javascript
const handleClick = useCallback(() => {
  performAction()
}, [dependency])
```

## Component Patterns

### Controlled Input
```javascript
function SearchInput({ value, onChange }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 border rounded"
      placeholder="Search..."
    />
  )
}
```

### Loading State
```javascript
function DataLoader({ onLoad }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await onLoad()
        setData(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [onLoad])

  if (loading) return <Spinner />
  if (error) return <Error message={error} />
  return <Content />
}
```

### Conditional Rendering
```javascript
// ✅ Use conditional rendering
{isReady && <Component />}
{showModal && <Modal onClose={() => setShowModal(false)} />}

// ✅ Use ternary for if/else
{loading ? <Spinner /> : <Content />}

// ✅ Use logical AND for show/hide
{items.length > 0 && <List items={items} />}
```

## Best Practices

### DO ✅
- Keep components under 200 lines
- Use meaningful variable names
- Extract complex logic to separate functions
- Use TypeScript/PropTypes (when available)
- Test components with scenarios
- Use Tailwind utility classes
- Keep prop drilling minimal
- Memoize expensive computations
- Handle loading & error states

### DON'T ❌
- Create massive components (>300 lines)
- Use inline functions as callbacks (use useCallback)
- Create object literals in render
- Use `any` types
- Skip error handling
- Use hardcoded values
- Leave console.log in production
- Ignore accessibility (a11y)
- Create deeply nested JSX

## Accessibility

### Use Semantic HTML
```javascript
// ✅ Good
<button onClick={handleSubmit}>Submit</button>
<form onSubmit={handleSubmit}>...</form>
<nav>Navigation</nav>
<header>Header</header>

// ❌ Avoid
<div onClick={handleSubmit}>Submit</div>
<div role="button">Submit</div>
```

### Add ARIA Labels
```javascript
<button
  aria-label="Close dialog"
  onClick={onClose}
>
  <X className="w-5 h-5" />
</button>
```

## Component Export

### Use Named Exports for Utilities
```javascript
// ✅ Preferred for components
export default function MyComponent() {
  // Component code
}

// ✅ Also good for multiple exports
export function HelperComponent() {
  // Helper
}
```

## Icons

Using lucide-react icons:

```javascript
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react'

function StatusIcon({ status }) {
  const iconProps = { className: 'w-5 h-5' }
  
  if (status === 'success') return <CheckCircle2 {...iconProps} />
  if (status === 'error') return <XCircle {...iconProps} />
  if (status === 'warning') return <AlertCircle {...iconProps} />
}
```

## Testing Components

```javascript
import { render, screen } from '@testing-library/react'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  it('should render with title', () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('should call onAction on button click', () => {
    const onAction = jest.fn()
    render(<MyComponent onAction={onAction} />)
    screen.getByRole('button').click()
    expect(onAction).toHaveBeenCalled()
  })
})
```

## Performance Optimization

### Memoize Components
```javascript
import { memo } from 'react'

const MyComponent = memo(function MyComponent({ data }) {
  return <div>{data.title}</div>
})

export default MyComponent
```

### Code Splitting
```javascript
import { lazy, Suspense } from 'react'

const LargeComponent = lazy(() => import('./LargeComponent'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <LargeComponent />
    </Suspense>
  )
}
```

## Documentation Reference

- Tailwind CSS: `tailwind.config.js`
- Icons: `lucide-react` (20+ icons used)
- Hooks: React Hooks API
- State Management: Local hooks
