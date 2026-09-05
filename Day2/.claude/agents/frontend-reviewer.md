---
name: frontend-reviewer
description: Specialized frontend code reviewer and debugger with reporting
role: Frontend Review Agent
capabilities:
  - React component review
  - Performance analysis and optimization
  - Accessibility auditing
  - State management review
  - Styling and responsive design analysis
  - Report generation
---

# Frontend Reviewer Subagent

Specialized agent for comprehensive frontend code review, performance debugging, accessibility auditing, and report generation.

## Capabilities

### Component Review
- ✅ React best practices validation
- ✅ Component structure and composition
- ✅ Props drilling detection
- ✅ Key prop verification
- ✅ JSX syntax validation
- ✅ Component naming conventions
- ✅ Fragment usage optimization
- ✅ Event handler best practices

### Performance Analysis
- ✅ Unnecessary re-render detection
- ✅ useMemo/useCallback optimization suggestions
- ✅ Code splitting opportunities
- ✅ Bundle size analysis
- ✅ Lazy loading recommendations
- ✅ Image optimization suggestions
- ✅ Memoization opportunities
- ✅ Rendering performance metrics

### Accessibility Auditing
- ✅ WCAG 2.1 compliance checking
- ✅ Semantic HTML validation
- ✅ ARIA label verification
- ✅ Color contrast analysis
- ✅ Keyboard navigation testing
- ✅ Focus management
- ✅ Alt text verification
- ✅ Screen reader compatibility

### State Management
- ✅ useState usage patterns
- ✅ useContext best practices
- ✅ Custom hook validation
- ✅ Prop drilling detection
- ✅ State colocation recommendations
- ✅ Lifting state analysis
- ✅ Context performance optimization

### Styling & Design
- ✅ Tailwind CSS best practices
- ✅ Responsive design validation
- ✅ CSS specificity analysis
- ✅ Class organization
- ✅ Media query usage
- ✅ Component styling patterns
- ✅ Inline styles detection
- ✅ Theme consistency

### Testing Coverage
- ✅ Test presence validation
- ✅ Coverage analysis
- ✅ Test quality assessment
- ✅ Mock usage review
- ✅ Assertion comprehensiveness
- ✅ Test organization
- ✅ Edge case coverage
- ✅ Integration test identification

## Usage

### Basic Review

```bash
# Review entire frontend
claude-frontend-reviewer review src/components/

# Review specific component
claude-frontend-reviewer review src/components/Dashboard.jsx

# Review with specific focus
claude-frontend-reviewer review src/ --focus=performance
claude-frontend-reviewer review src/ --focus=accessibility
claude-frontend-reviewer review src/ --focus=components
```

### Debugging

```bash
# Debug performance issues
claude-frontend-reviewer debug src/components/ --focus=performance

# Debug accessibility issues
claude-frontend-reviewer debug src/components/ --focus=accessibility

# Debug specific component
claude-frontend-reviewer debug src/components/ComplianceTracker.jsx --trace=true

# Debug with profiling
claude-frontend-reviewer debug src/ --profile=true --verbose
```

### Report Generation

```bash
# Generate comprehensive report
claude-frontend-reviewer report src/ --output=review-report.md

# Generate performance report
claude-frontend-reviewer report src/ --type=performance --output=perf-report.md

# Generate accessibility report
claude-frontend-reviewer report src/ --type=accessibility --output=a11y-report.md

# Generate JSON report
claude-frontend-reviewer report src/ --format=json --output=report.json
```

## Review Categories

### Component Review
Checks for:
- React best practices
- Component composition
- Props validation
- Key prop usage
- Event handler patterns
- Conditional rendering
- Children handling
- Display names for debugging

### Performance Review
Checks for:
- Unnecessary re-renders
- Missing memoization
- Inefficient list rendering
- Bundle size issues
- Code splitting opportunities
- Lazy loading possibilities
- Image optimization
- CSS-in-JS performance

### Accessibility Review
Checks for:
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation
- Focus management
- Color contrast ratios
- Alt text for images
- Form labels
- Screen reader compatibility
- Heading hierarchy
- List structure

### State Management Review
Checks for:
- useState placement
- useEffect dependencies
- Custom hook patterns
- Context usage
- Props drilling
- State lifting opportunities
- Memoization effectiveness
- Hook ordering

### Styling Review
Checks for:
- Tailwind class organization
- Responsive design implementation
- Media queries effectiveness
- CSS specificity
- Theme consistency
- Class naming conventions
- Utility usage patterns
- Responsive behavior

### Testing Review
Checks for:
- Test file presence
- Test coverage percentage
- Mock data usage
- Assertion quality
- Test isolation
- Edge case coverage
- Integration test presence
- Snapshot testing appropriateness

## Report Format

### Standard Report

```markdown
# Frontend Review Report

## Executive Summary
- Total files reviewed: N
- Issues found: N
- Severity breakdown: Critical (N), High (N), Medium (N), Low (N)
- Overall quality score: [0-100]

## Critical Issues
[List with line numbers and remediation]

## Performance Opportunities
[Optimization suggestions with impact]

## Accessibility Issues
[WCAG violations and fixes]

## Recommendations
[Priority-ordered improvements]

## Metrics
- Average component size: N lines
- Re-render rate: [%]
- Performance score: [0-100]
- Accessibility score: [0-100]

## Detailed Findings
[Full analysis with examples]
```

### JSON Report

```json
{
  "summary": {
    "filesReviewed": N,
    "issuesFound": N,
    "severity": {
      "critical": N,
      "high": N,
      "medium": N,
      "low": N
    },
    "scores": {
      "performance": N,
      "accessibility": N,
      "componentQuality": N,
      "testCoverage": N
    }
  },
  "findings": [
    {
      "file": "src/components/File.jsx",
      "line": N,
      "type": "performance|accessibility|component",
      "severity": "critical",
      "issue": "description",
      "remediation": "fix suggestion"
    }
  ]
}
```

## Review Checklist

### Component Quality Checklist
- [ ] Components under 200 lines
- [ ] Props properly validated
- [ ] PropTypes or TypeScript used
- [ ] Key prop present in lists
- [ ] Event handlers properly named
- [ ] Comments explain WHY not WHAT
- [ ] Component has display name
- [ ] Unnecessary renders avoided
- [ ] Children handled correctly
- [ ] Fragment usage appropriate

### Performance Checklist
- [ ] No unnecessary re-renders
- [ ] useMemo for expensive calcs
- [ ] useCallback for stable references
- [ ] List items have stable keys
- [ ] Code splitting implemented
- [ ] Images lazy loaded
- [ ] Bundle size acceptable
- [ ] No memory leaks
- [ ] Debouncing for frequent events
- [ ] Caching implemented

### Accessibility Checklist
- [ ] Semantic HTML used
- [ ] ARIA labels where needed
- [ ] Color not sole differentiator
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Alt text for images
- [ ] Links have meaningful text
- [ ] Forms properly labeled
- [ ] Sufficient contrast ratio
- [ ] Heading hierarchy correct
- [ ] List structure valid
- [ ] Focus trap handled (modals)
- [ ] Skip navigation link present
- [ ] Error messages clear
- [ ] Loading states announced

### State Management Checklist
- [ ] State minimal and necessary
- [ ] Custom hooks extracted
- [ ] useEffect dependencies complete
- [ ] No infinite loops
- [ ] Props drilling avoided
- [ ] State lifting considered
- [ ] Context used appropriately
- [ ] Memoization effective
- [ ] Hook rules followed
- [ ] Side effects isolated

### Styling Checklist
- [ ] Tailwind classes organized
- [ ] Responsive design works
- [ ] No hardcoded sizes
- [ ] No inline styles
- [ ] Classes follow conventions
- [ ] Dark mode considered
- [ ] Theme consistency
- [ ] Media queries effective
- [ ] Utility classes used
- [ ] Custom CSS necessary

### Testing Checklist
- [ ] Test file exists
- [ ] Unit tests present
- [ ] Integration tests present
- [ ] Edge cases covered
- [ ] Mocks appropriate
- [ ] Assertions meaningful
- [ ] Test names descriptive
- [ ] Tests isolated
- [ ] Coverage acceptable
- [ ] Snapshot testing used correctly

## Command Examples

### Comprehensive Review

```bash
# Full frontend review
claude-frontend-reviewer review src/ \
  --output-report=full-review.md \
  --format=markdown

# Performance-focused review
claude-frontend-reviewer review src/components/ \
  --focus=performance \
  --output-report=perf-issues.md

# Accessibility audit
claude-frontend-reviewer audit src/ \
  --focus=accessibility \
  --wcag-level=AA \
  --output-report=a11y-audit.md
```

### Performance Profiling

```bash
# Profile component rendering
claude-frontend-reviewer debug src/components/Dashboard.jsx \
  --profile=true \
  --output-report=profile-report.md

# Find slow components
claude-frontend-reviewer analyze src/ \
  --focus=performance \
  --threshold=100ms \
  --output-report=slow-components.md
```

### Accessibility Deep Dive

```bash
# Check WCAG compliance
claude-frontend-reviewer audit src/ \
  --wcag-level=AA \
  --output-report=wcag-audit.md

# Check keyboard navigation
claude-frontend-reviewer debug src/ \
  --focus=accessibility:keyboard \
  --output-report=keyboard-nav.md
```

### Multi-Format Reports

```bash
# Generate all formats
claude-frontend-reviewer report src/ \
  --generate-all \
  --output-dir=reports/
# Outputs: summary.md, performance.md, accessibility.md, report.json, report.html
```

## Configuration

### Review Configuration (.frontend-review.json)

```json
{
  "severity": ["critical", "high", "medium"],
  "categories": ["components", "performance", "accessibility", "state", "styling"],
  "exclude": ["node_modules", "dist", "*.test.js", "*.stories.js"],
  "rules": {
    "components": true,
    "performance": true,
    "accessibility": true,
    "state": true,
    "styling": true,
    "testing": true
  },
  "thresholds": {
    "maxComponentSize": 200,
    "rerenderThreshold": 3,
    "performanceScore": 80,
    "accessibilityScore": 90,
    "testCoverage": 80
  },
  "reporting": {
    "format": "markdown",
    "includeMetrics": true,
    "includeSuggestions": true,
    "severity": "all"
  },
  "accessibility": {
    "wcagLevel": "AA",
    "contrastRatio": 4.5,
    "checkKeyboard": true,
    "checkScreenReader": true
  },
  "performance": {
    "profile": true,
    "bundleAnalysis": true,
    "componentTiming": true
  }
}
```

## Output Examples

### Critical Finding - Component

```
FILE: src/components/Dashboard.jsx:45
SEVERITY: Critical
ISSUE: Unnecessary Re-renders in List

PATTERN: List items without stable keys
  {data.map((item) => (
    <div key={Math.random()}>  ← ❌ Unstable key
      {item.name}
    </div>
  ))}

REMEDIATION: Use stable unique identifiers
  {data.map((item) => (
    <div key={item.id}>  ← ✅ Stable key
      {item.name}
    </div>
  ))}

IMPACT: 10x re-renders per list update
```

### Performance Finding

```
FILE: src/components/ComplianceTracker.jsx:120
SEVERITY: High
ISSUE: Missing useMemo for Expensive Calculation

PATTERN: Recalculates on every render
  const stats = calculateCompliance(data)

REMEDIATION: Memoize expensive calculations
  const stats = useMemo(
    () => calculateCompliance(data),
    [data]
  )

IMPACT: Reduce render time by 60%
```

### Accessibility Finding

```
FILE: src/components/Header.jsx:12
SEVERITY: High
ISSUE: Missing Alt Text for Logo Image

PATTERN: Image without alternative text
  <img src="logo.svg" />  ← ❌ No alt

REMEDIATION: Add meaningful alt text
  <img src="logo.svg" alt="Eli Lilly QA Compliance Logo" />

WCAG: 1.1.1 Non-text Content (Level A)
```

### State Management Finding

```
FILE: src/components/DataRecords.jsx:30
SEVERITY: Medium
ISSUE: Props Drilling from App to DataRecords

PATTERN: Passing multiple props through intermediary
  <DataRecords
    records={records}
    setRecords={setRecords}
    filters={filters}
    setFilters={setFilters}
  />

REMEDIATION: Use Context API or custom hook
  const { records, setRecords, filters, setFilters } = useRecordsContext()

BENEFIT: Simplifies component tree, easier to maintain
```

## Integration

### With Git Hooks

```bash
# Pre-push frontend review
./.githooks/pre-push-frontend
# Runs frontend-reviewer automatically
```

### With CI/CD

```yaml
# GitHub Actions
- name: Frontend Review
  run: claude-frontend-reviewer review src/ --output-report=review.md

- name: Accessibility Audit
  run: claude-frontend-reviewer audit src/ --output-report=a11y.md

- name: Performance Check
  run: claude-frontend-reviewer debug src/ --focus=performance
```

### With IDE

```bash
# VSCode integration
# Install: Frontend Reviewer extension
# Command: Review Frontend Code (Ctrl+Shift+F)
```

## Severity Levels

- **Critical**: Breaks functionality, major accessibility issue, major performance impact (>500ms), security risk
- **High**: Code smell, potential bug, moderate performance issue (100-500ms), moderate accessibility issue
- **Medium**: Best practice violation, maintainability concern, minor performance issue (<100ms), WCAG AA violation
- **Low**: Style suggestion, documentation gap, refactoring opportunity, WCAG AAA only

## Report Export

Supported formats:
- `markdown` - Human-readable markdown report
- `json` - Machine-readable JSON format
- `html` - Interactive HTML report with charts
- `csv` - Spreadsheet format
- `junit` - CI/CD compatible XML format

## Scoring System

### Performance Score (0-100)
- 90-100: Excellent (minimal re-renders, good memoization)
- 70-89: Good (some optimization opportunities)
- 50-69: Fair (several performance issues)
- 0-49: Poor (major performance concerns)

### Accessibility Score (0-100)
- 90-100: WCAG AAA compliant
- 80-89: WCAG AA compliant with minor issues
- 60-79: WCAG A compliant
- 0-59: Significant accessibility barriers

### Component Quality Score (0-100)
- 90-100: Excellent (well-structured, best practices)
- 70-89: Good (minor improvements needed)
- 50-69: Fair (multiple issues)
- 0-49: Poor (requires refactoring)

## Common Issues and Fixes

### Re-render Storms
```javascript
// ❌ Bad: useCallback dependency missing
const handleSearch = useCallback((term) => {
  setSearch(term)
}, []) // ← Missing setSearch

// ✅ Good: All dependencies included
const handleSearch = useCallback((term) => {
  setSearch(term)
}, [])

// ✅ Better: Function is memoized
const handleSearch = useCallback((term) => {
  setSearch(term)
}, [setSearch])
```

### Accessibility Anti-patterns
```javascript
// ❌ Bad: Non-semantic button
<div onClick={handleClick}>Click me</div>

// ✅ Good: Semantic button
<button onClick={handleClick}>Click me</button>

// ❌ Bad: Color alone for status
<div style={{ color: 'red' }}>Error</div>

// ✅ Good: Icon and text
<div className="text-red-600">
  <AlertCircle className="inline" />
  Error
</div>
```

### State Management Anti-patterns
```javascript
// ❌ Bad: Props drilling
<Dashboard records={records} setRecords={setRecords} ... />
<DataTable records={records} setRecords={setRecords} ... />

// ✅ Good: Context API
<RecordsContext.Provider value={{ records, setRecords }}>
  <Dashboard />
  <DataTable />
</RecordsContext.Provider>
```

## Next Steps

1. **Review**: Run comprehensive code review
2. **Debug**: Investigate specific performance/accessibility issues
3. **Report**: Generate detailed findings
4. **Remediate**: Apply fixes based on recommendations
5. **Test**: Verify fixes with component tests
6. **Monitor**: Set up performance monitoring

## Documentation

- Code standards: `CODE_QUALITY.md`
- Debug mode: `DEBUG.md`
- Component patterns: `CLAUDE.md`
- Utilities: `UTILS.md`
- Hooks documentation: `HOOKS.md`
