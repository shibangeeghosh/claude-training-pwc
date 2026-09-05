# Custom React Hooks

This document describes the custom React hooks available in the ALCOA+ QA application.

## useCompliance

Manages compliance data for the 8 ALCOA+ principles.

### Usage

```jsx
import { useCompliance } from './hooks'

function MyComponent() {
  const {
    checks,
    updateStatus,
    updatePercentage,
    updateIssues,
    getOverallCompliance,
    getTotalIssues,
    getComplianceBreakdown,
    resetToDefaults
  } = useCompliance()

  return (
    <div>
      <p>Overall: {getOverallCompliance()}%</p>
      <p>Total Issues: {getTotalIssues()}</p>
      <button onClick={() => updateStatus('attributable', 'warning')}>
        Flag Attributable
      </button>
    </div>
  )
}
```

### API

- **checks** - Object containing compliance state for all principles
- **updateStatus(principleId, status)** - Update compliance status ('pass'|'warning'|'fail')
- **updatePercentage(principleId, percentage)** - Update compliance percentage (0-100)
- **updateIssues(principleId, issues)** - Update number of outstanding issues
- **getOverallCompliance()** - Get average compliance across all principles
- **getTotalIssues()** - Get sum of all outstanding issues
- **getComplianceBreakdown()** - Get count of pass/warning/fail statuses
- **resetToDefaults()** - Reset to initial state

---

## useRecords

Manages data record operations (CRUD).

### Usage

```jsx
import { useRecords } from './hooks'

function RecordsManager() {
  const {
    records,
    addRecord,
    updateRecord,
    deleteRecord,
    getRecord,
    getStats,
    resetToDefaults
  } = useRecords()

  const handleAddRecord = () => {
    addRecord({
      title: 'New Record',
      principle: 'All Principles',
      status: 'compliant',
      author: 'User',
      date: new Date().toISOString().split('T')[0],
      issues: 0,
      percentage: 100
    })
  }

  return (
    <div>
      <p>Total Records: {records.length}</p>
      <p>Compliant: {getStats().compliant}</p>
      <button onClick={handleAddRecord}>Add Record</button>
    </div>
  )
}
```

### API

- **records** - Array of all data records
- **addRecord(newRecord)** - Add new record, returns generated ID
- **updateRecord(recordId, updates)** - Update specific record fields
- **deleteRecord(recordId)** - Remove a record
- **getRecord(recordId)** - Retrieve specific record by ID
- **getStats()** - Get statistics (total, compliant, warning, avgCompliance, totalIssues)
- **resetToDefaults()** - Reset to initial records

---

## useSearch

Simple search and filter hook with statistics.

### Usage

```jsx
import { useSearch } from './hooks'

function SearchableList({ items }) {
  const {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filtered,
    clearSearch,
    stats
  } = useSearch(items, ['title', 'id'])

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />
      <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
        <option value="all">All</option>
        <option value="compliant">Compliant</option>
        <option value="warning">Warning</option>
      </select>
      <p>Showing {filtered.length} of {stats.total}</p>
      {filtered.map(item => <div key={item.id}>{item.title}</div>)}
    </div>
  )
}
```

### API

- **searchTerm** - Current search input
- **setSearchTerm(value)** - Update search term
- **filterStatus** - Current filter value
- **setFilterStatus(value)** - Update filter status
- **filtered** - Array of filtered items
- **clearSearch()** - Clear search term
- **clearFilters()** - Clear all search and filters
- **stats** - Object with search statistics (total, filtered_count, compliant, warning, nonCompliant, matchRate)

---

## useLocalStorage

Persists state to browser localStorage.

### Usage

```jsx
import { useLocalStorage } from './hooks'

function RememberMyPreference() {
  const [userPreference, setUserPreference, clearPreference] = useLocalStorage(
    'userTheme',
    'light'
  )

  return (
    <div>
      <p>Current Theme: {userPreference}</p>
      <button onClick={() => setUserPreference('dark')}>
        Switch to Dark
      </button>
      <button onClick={clearPreference}>
        Reset
      </button>
    </div>
  )
}
```

### API

- **[storedValue, setValue, removeValue]** - Tuple similar to useState
- **storedValue** - Current persisted value
- **setValue(value)** - Update value (also persists to localStorage)
- **removeValue()** - Remove from localStorage and reset to initialValue

---

## useFilteredData

Advanced filtering with search, multiple filters, and sorting.

### Usage

```jsx
import { useFilteredData } from './hooks'

function AdvancedList({ records }) {
  const {
    searchTerm,
    setSearchTerm,
    filtered,
    addFilter,
    removeFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    clearAllFilters,
    getSummary
  } = useFilteredData(
    records,
    ['title', 'id', 'author'],
    'status'
  )

  const summary = getSummary()

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />
      <select onChange={(e) => setSortBy(e.target.value)} value={sortBy}>
        <option value="date">Sort by Date</option>
        <option value="percentage">Sort by Compliance</option>
        <option value="title">Sort by Title</option>
      </select>
      <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
        {sortOrder === 'asc' ? '↑' : '↓'}
      </button>
      <p>
        Showing {summary.filtered} of {summary.total} records
        ({summary.filterPercentage}%)
      </p>
      {filtered.map(record => (
        <div key={record.id}>{record.title}</div>
      ))}
      <button onClick={clearAllFilters}>Clear All</button>
    </div>
  )
}
```

### API

- **searchTerm** - Current search input
- **setSearchTerm(value)** - Update search
- **filters** - Object of active filters
- **addFilter(key, value)** - Add or update a filter
- **removeFilter(key)** - Remove a specific filter
- **clearAllFilters()** - Clear all search and filters
- **sortBy** - Current sort field
- **setSortBy(field)** - Change sort field
- **sortOrder** - 'asc' or 'desc'
- **setSortOrder(order)** - Change sort order
- **filtered** - Array of filtered and sorted results
- **getFilterOptions(fieldName)** - Get unique values for a field
- **getSummary()** - Get summary stats (total, filtered, reduction, filterPercentage)

---

## Migration Path

### Current Components (Before Hooks)

```jsx
// ComplianceTracker.jsx - Currently manages state inline
const [checks, setChecks] = useState(initialChecks)
const toggleStatus = (principleId) => { ... }
```

### Refactored Components (After Hooks)

```jsx
// ComplianceTracker.jsx - Using useCompliance hook
import { useCompliance } from '../hooks'

export default function ComplianceTracker() {
  const { checks, updateStatus } = useCompliance()
  // Component simplified and logic extracted
}
```

### Benefits

- **Reusable Logic** - Hooks can be used across multiple components
- **Testable** - Hooks are functions that can be unit tested independently
- **Composable** - Combine multiple hooks in a component
- **Cleaner Components** - Business logic separated from UI rendering
- **Shareable** - Easy to understand and maintain logic

---

## Future Hook Ideas

- **useFormData** - Handle form state with validation
- **useAsync** - Manage async data fetching with loading states
- **useDebounce** - Debounce search/filter inputs
- **useNotification** - Toast/notification manager
- **useComplianceReport** - Generate compliance reports and exports
- **useAuditLog** - Track changes and audit trail
