# Frontend Reviewer Subagent Guide

Comprehensive guide for using the Frontend Reviewer subagent for React component review, performance debugging, accessibility auditing, and report generation.

## Overview

The Frontend Reviewer is a specialized subagent designed to:
- ✅ Review React components for best practices
- ✅ Debug performance issues and optimize rendering
- ✅ Audit accessibility and WCAG compliance
- ✅ Analyze state management patterns
- ✅ Review styling and responsive design
- ✅ Generate comprehensive reports
- ✅ Provide optimization recommendations

## Capabilities

### Component Review
- Validates React best practices
- Detects props drilling patterns
- Verifies key prop usage in lists
- Checks event handler patterns
- Validates JSX syntax
- Reviews component composition
- Analyzes fragment usage
- Checks component naming and size

### Performance Analysis
- Identifies unnecessary re-renders
- Detects missing memoization opportunities
- Finds inefficient list rendering
- Analyzes bundle size issues
- Suggests code splitting opportunities
- Identifies lazy loading possibilities
- Evaluates CSS-in-JS performance
- Profiles component rendering times

### Accessibility Auditing
- WCAG 2.1 Level AA compliance checking
- Semantic HTML validation
- ARIA labels and roles verification
- Keyboard navigation testing
- Focus management analysis
- Alt text verification
- Form label checking
- Screen reader compatibility assessment
- Color contrast analysis
- Heading hierarchy validation

### State Management Review
- Validates useState placement and patterns
- Checks useEffect dependencies
- Reviews custom hook implementations
- Detects Context API misuse
- Identifies state lifting opportunities
- Analyzes props drilling
- Evaluates memoization effectiveness
- Checks hook ordering

### Styling & Design
- Tailwind CSS best practices
- Responsive design validation
- Media query effectiveness
- CSS specificity analysis
- Theme consistency checking
- Class organization
- Utility usage patterns
- Dark mode support

### Testing Coverage
- Test file presence validation
- Coverage percentage analysis
- Mock data usage review
- Assertion quality assessment
- Test isolation checking
- Edge case coverage
- Integration test identification

## Using the Frontend Reviewer

### Integration with Claude Code

In VS Code or Claude IDE:

```bash
# Review entire frontend
> Frontend Reviewer: Review frontend code

# Specific focus
> Frontend Reviewer: Performance debug
> Frontend Reviewer: Accessibility audit
> Frontend Reviewer: Generate report

# Interactive
> Frontend Reviewer: Start interactive debug session
```

### Via Command Line

```bash
# Comprehensive review
claude-frontend-reviewer review src/components/

# Performance-focused
claude-frontend-reviewer debug src/ --focus=performance

# Accessibility audit
claude-frontend-reviewer audit src/ --wcag-level=AA

# Generate reports
claude-frontend-reviewer report src/ --output=review.md
```

### In Code

```javascript
import frontendDebugger from '../utils/frontend-debug'

// Track component renders
frontendDebugger.trackRender('Dashboard', props, duration)

// Detect re-render loops
const loops = frontendDebugger.detectRerenderLoops()

// Detect props drilling
const drilling = frontendDebugger.detectPropsDrilling()

// Scan accessibility
frontendDebugger.scanAccessibility()

// Get performance metrics
const metrics = frontendDebugger.getPerformanceMetrics()

// Generate report
const report = frontendDebugger.generateReport()
```

## Report Types

### Component Review Report

Focuses on:
- React best practices
- Component structure and composition
- Props validation and usage
- Code organization
- Naming conventions
- Component size and complexity

**Command:**
```bash
claude-frontend-reviewer review src/components/ --output=component-review.md
```

### Performance Report

Focuses on:
- Rendering performance
- Re-render frequency
- Memoization opportunities
- Bundle size
- Code splitting suggestions
- Image optimization

**Command:**
```bash
claude-frontend-reviewer report src/ --type=performance --output=perf-report.md
```

### Accessibility Report

Focuses on:
- WCAG AA compliance
- Semantic HTML
- ARIA implementation
- Keyboard navigation
- Focus management
- Color contrast

**Command:**
```bash
claude-frontend-reviewer audit src/ --wcag-level=AA --output=a11y-report.md
```

### State Management Report

Focuses on:
- useState patterns
- useEffect dependencies
- Custom hook implementation
- Context usage
- Props drilling
- State lifting opportunities

**Command:**
```bash
claude-frontend-reviewer review src/ --focus=state --output=state-report.md
```

### Comprehensive Report

All categories combined.

**Command:**
```bash
claude-frontend-reviewer report src/ --output=full-review.md
```

## Report Formats

### Markdown (Default)
```bash
claude-frontend-reviewer report src/ --format=markdown --output=report.md
```

**Output:**
- Human-readable sections
- Severity indicators
- Code examples
- Remediation steps
- Metrics summary

### JSON
```bash
claude-frontend-reviewer report src/ --format=json --output=report.json
```

**Output:**
```json
{
  "summary": {
    "filesReviewed": 15,
    "issuesFound": 23,
    "scores": {
      "performance": 72,
      "accessibility": 85,
      "componentQuality": 78
    }
  },
  "findings": [...]
}
```

### HTML
```bash
claude-frontend-reviewer report src/ --format=html --output=report.html
```

**Output:**
- Interactive dashboard
- Charts and visualizations
- Sortable tables
- Drill-down capability
- Score trends

### CSV
```bash
claude-frontend-reviewer report src/ --format=csv --output=report.csv
```

**Output:**
- Spreadsheet-compatible
- Easy import to tools
- Summary statistics

## Frontend Debug Utilities

### Component Performance Tracking

```javascript
import frontendDebugger from '../utils/frontend-debug'

// Track component render
const startTime = performance.now()
// ... component render logic
const duration = performance.now() - startTime
frontendDebugger.trackRender('Dashboard', props, duration, isMemoized)

// Get slow components
const slow = frontendDebugger.getSlowComponents(16)
// [{ component: 'Dashboard', averageDuration: 45, renderCount: 120 }]

// Get re-render loops
const loops = frontendDebugger.detectRerenderLoops(5)

// Get props drilling issues
const drilling = frontendDebugger.detectPropsDrilling()

// Get performance metrics
const metrics = frontendDebugger.getPerformanceMetrics()
// { averageRenderTime: 12, slowestRender: 450, totalRenders: 523 }
```

### Accessibility Scanning

```javascript
import frontendDebugger from '../utils/frontend-debug'

// Record accessibility issue
frontendDebugger.recordA11yIssue(
  'missing-alt',
  'high',
  imageElement,
  'Image missing alt text',
  'A'
)

// Scan page for common issues
frontendDebugger.scanAccessibility()

// Get accessibility summary
const summary = frontendDebugger.getA11ySummary()
// { total: 5, critical: 1, high: 2, medium: 2, wcagAAIssues: 3 }

// Get all accessibility issues
const issues = frontendDebugger.getA11yIssues()
```

### State Change Tracking

```javascript
import frontendDebugger from '../utils/frontend-debug'

// Track state change
frontendDebugger.trackStateChange(
  'DataRecords',
  'searchTerm',
  oldValue,
  newValue,
  'user input'
)

// Get state history
const history = frontendDebugger.getStateHistory('DataRecords', 'searchTerm')
```

### Report Generation

```javascript
import frontendDebugger from '../utils/frontend-debug'

// Generate report
const report = frontendDebugger.generateReport()

// Export formats
const markdown = frontendDebugger.exportMarkdown()
const json = frontendDebugger.exportJSON()

// Print to console
frontendDebugger.printReport()

// Download report
frontendDebugger.downloadReport('debug-report.md')
```

## Workflow

### Complete Frontend Review Workflow

1. **Initial Component Review**
   ```bash
   claude-frontend-reviewer review src/components/
   ```

2. **Identify Performance Issues**
   - Review slow rendering components
   - Check for re-render loops
   - Analyze props drilling

3. **Accessibility Audit**
   ```bash
   claude-frontend-reviewer audit src/ --wcag-level=AA
   ```

4. **Performance Profiling**
   ```bash
   claude-frontend-reviewer debug src/ --profile=true
   ```

5. **Generate Report**
   ```bash
   claude-frontend-reviewer report src/ --output=findings.md
   ```

6. **Export for Sharing**
   ```bash
   claude-frontend-reviewer export --format=html --output=review-report.html
   ```

## Configuration

### .frontend-review.json

```json
{
  "severity": ["critical", "high", "medium"],
  "categories": ["components", "performance", "accessibility", "state"],
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
    "rerenderThreshold": 5,
    "performanceScore": 80,
    "accessibilityScore": 90
  },
  "accessibility": {
    "wcagLevel": "AA",
    "contrastRatio": 4.5
  },
  "reporting": {
    "format": "markdown",
    "includeMetrics": true,
    "includeSuggestions": true
  }
}
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Frontend Review
on: [pull_request]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Component Review
        run: |
          claude-frontend-reviewer review src/components/ \
            --output-report=component-review.md
      
      - name: Accessibility Audit
        run: |
          claude-frontend-reviewer audit src/ \
            --wcag-level=AA \
            --output-report=a11y-audit.md
      
      - name: Performance Check
        run: |
          claude-frontend-reviewer debug src/ \
            --focus=performance \
            --output-report=perf-report.md
      
      - name: Upload Reports
        uses: actions/upload-artifact@v3
        with:
          name: frontend-review
          path: |
            component-review.md
            a11y-audit.md
            perf-report.md
```

### Pre-Push Hook

```bash
#!/bin/bash
# .git/hooks/pre-push

if [ -d "src" ]; then
  claude-frontend-reviewer review src/ --format=json > /tmp/review.json
  if [ $? -ne 0 ]; then
    echo "⚠️  Frontend review failed"
    exit 1
  fi
fi
```

## Example Reports

### Performance Issue

```
FILE: src/components/ComplianceTracker.jsx:45
SEVERITY: High
ISSUE: Unnecessary Re-renders

PATTERN: Missing dependency in useEffect
  useEffect(() => {
    loadData()
  }, []) // ← Missing dependencies

REMEDIATION: Include all dependencies
  useEffect(() => {
    loadData()
  }, [principleId, userId])

IMPACT: Component re-renders 10x per second
```

### Accessibility Issue

```
FILE: src/components/Header.jsx:12
SEVERITY: High
ISSUE: Missing Alt Text for Logo

PATTERN: Image without accessible alternative
  <img src="logo.svg" />

REMEDIATION: Add meaningful alt text
  <img 
    src="logo.svg" 
    alt="Eli Lilly ALCOA+ QA Compliance System" 
  />

WCAG: 1.1.1 Non-text Content (Level A)
```

### Component Review Issue

```
FILE: src/components/DataRecords.jsx:30
SEVERITY: Medium
ISSUE: Props Drilling Anti-pattern

PATTERN: Passing multiple props through layers
  <DataTable
    records={records}
    setRecords={setRecords}
    filters={filters}
    setFilters={setFilters}
    sortBy={sortBy}
    setSortBy={setSortBy}
  />

REMEDIATION: Use Context API
  const { records, filters, sortBy } = useRecordsContext()

BENEFIT: Simplified component tree, easier maintenance
```

## Best Practices

### DO ✅
- Run review on every major component change
- Address critical and high issues immediately
- Include findings in code review process
- Track performance over time
- Test accessibility with assistive technology
- Prioritize WCAG AA compliance
- Use memoization strategically
- Test responsive design across devices

### DON'T ❌
- Ignore accessibility findings
- Delay performance optimization indefinitely
- Over-memoize (useMemo for everything)
- Neglect mobile experience
- Use inline styles for styling
- Forget to test keyboard navigation
- Ignore console warnings
- Skip accessibility testing

## Troubleshooting

### No findings reported
- Check file paths and syntax
- Verify components exist
- Review configuration file
- Check exclusion patterns
- Verify React version compatibility

### Incomplete performance data
- Ensure components are rendering
- Check profiling setup
- Verify timing API available
- Check for blocking scripts
- Review memory constraints

### Accessibility scan missing issues
- Verify DOM is fully rendered
- Check element selectors
- Review dynamic content loading
- Enable verbose logging
- Check for shadow DOM elements

## Integration Points

### With Component Testing
Uses patterns from test files to validate coverage

### With Code Standards
References: `CODE_QUALITY.md`

### With Styling System
References: Tailwind configuration and custom CSS

### With Hooks Documentation
References: `HOOKS.md`

## Support

For issues with the Frontend Reviewer:
1. Check configuration file
2. Verify all components are properly exported
3. Review exclusion patterns
4. Enable verbose logging
5. Check browser console for errors

## Next Steps

After review:
1. Prioritize findings by severity
2. Create tasks/issues for findings
3. Assign to team members
4. Apply fixes based on recommendations
5. Re-run review to verify improvements
6. Set up continuous monitoring
7. Track performance trends over time

---

**Agent Configuration:** `.claude/agents/frontend-reviewer.md`  
**Debug Utilities:** `src/utils/frontend-debug.js`  
**Report Generator:** `src/utils/report-generator.js`  
**Code Standards:** `CODE_QUALITY.md`  
**Hooks Documentation:** `HOOKS.md`
