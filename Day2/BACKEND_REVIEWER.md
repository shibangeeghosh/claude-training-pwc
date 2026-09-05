# Backend Reviewer Subagent Guide

Comprehensive guide for using the Backend Reviewer subagent for code review, debugging, and report generation.

## Overview

The Backend Reviewer is a specialized subagent designed to:
- ✅ Review backend code for security vulnerabilities
- ✅ Debug API issues and performance problems
- ✅ Analyze architecture and design patterns
- ✅ Generate comprehensive reports
- ✅ Provide remediation recommendations

## Capabilities

### Security Review
- Detects hardcoded secrets and API keys
- Identifies SQL/NoSQL injection vulnerabilities
- Verifies authentication and authorization implementation
- Checks for sensitive data exposure
- Validates input validation and output encoding
- Reviews CORS configuration
- Ensures HTTPS enforcement
- Analyzes password handling
- Audits dependency vulnerabilities

### Performance Analysis
- Identifies N+1 query problems
- Detects missing database indexes
- Finds memory leaks and resource exhaustion
- Analyzes async/await patterns
- Evaluates caching opportunities
- Reviews connection pooling
- Suggests optimization strategies

### Architecture Review
- Validates API design consistency
- Reviews error handling patterns
- Checks logging standards
- Analyzes transaction handling
- Evaluates data validation approach
- Assesses separation of concerns
- Reviews dependency management

### Debugging
- Traces execution flow through code
- Identifies logic errors
- Analyzes async/await issues
- Debugs database queries
- Tests API endpoints
- Detects race conditions
- Profiles performance

## Using the Backend Reviewer

### Integration with Claude Code

In VS Code or Claude IDE:

```bash
# Review entire backend
> Backend Reviewer: Review backend code

# Specific focus
> Backend Reviewer: Security review
> Backend Reviewer: Performance debug
> Backend Reviewer: Generate report

# Interactive
> Backend Reviewer: Start interactive debug session
```

### Via Command Line

```bash
# Comprehensive review
claude-backend-reviewer review backend/

# Security-focused
claude-backend-reviewer review backend/ --focus=security

# Performance analysis
claude-backend-reviewer debug backend/ --focus=performance

# Generate reports
claude-backend-reviewer report backend/ --output=review.md
```

### In Code

```javascript
import backendDebugger from '../utils/backend-debug'
import reportGenerator from '../utils/report-generator'

// Track API calls
backendDebugger.traceRequest(endpoint, method, body, response, duration)

// Get performance metrics
const metrics = backendDebugger.getPerformanceMetrics()

// Generate report
reportGenerator.addFinding({
  category: 'security',
  severity: 'critical',
  title: 'SQL Injection Vulnerability',
  file: 'backend/routes/records.js',
  line: 45,
  remediation: 'Use parameterized queries',
  cwe: 'CWE-89'
})

const report = reportGenerator.toMarkdown()
```

## Report Types

### Security Report

Focuses on:
- Vulnerability detection
- Security best practices
- Compliance issues
- Data protection

**Command:**
```bash
claude-backend-reviewer report backend/ --type=security --output=security.md
```

**Example Finding:**
```
Critical: SQL Injection in records.js:45
- Direct string concatenation in query
- Remediation: Use parameterized queries
- CWE: CWE-89
```

### Performance Report

Focuses on:
- Query optimization
- Caching opportunities
- Resource usage
- Scalability

**Command:**
```bash
claude-backend-reviewer report backend/ --type=performance --output=perf.md
```

**Example Finding:**
```
High: N+1 Query Problem in recordService.js:120
- Loop with database query inside
- Remediation: Use batch query or JOIN
- Impact: 100x slower with 100 records
```

### Architecture Report

Focuses on:
- Design patterns
- Code organization
- Best practices
- Maintainability

**Command:**
```bash
claude-backend-reviewer report backend/ --type=architecture --output=arch.md
```

### Comprehensive Report

All categories combined.

**Command:**
```bash
claude-backend-reviewer report backend/ --output=full-review.md
```

## Report Formats

### Markdown (Default)
```bash
claude-backend-reviewer report backend/ --format=markdown --output=report.md
```

**Output:**
- Human-readable with sections
- Severity indicators
- Code examples
- Remediation steps

### JSON
```bash
claude-backend-reviewer report backend/ --format=json --output=report.json
```

**Output:**
```json
{
  "summary": { "total": 15, "critical": 2, "high": 5 },
  "findings": [
    {
      "id": "FINDING-1",
      "severity": "critical",
      "title": "SQL Injection"
    }
  ]
}
```

### HTML
```bash
claude-backend-reviewer report backend/ --format=html --output=report.html
```

**Output:**
- Interactive dashboard
- Sortable tables
- Severity indicators
- Drill-down capability

### CSV
```bash
claude-backend-reviewer report backend/ --format=csv --output=report.csv
```

**Output:**
- Spreadsheet-compatible
- Easy import to tools
- Summary statistics

## Backend Debug Utilities

### API Call Tracking

```javascript
import backendDebugger from '../utils/backend-debug'

// Trace an API call
const response = await fetch('/api/records')
const duration = Date.now() - startTime
backendDebugger.traceRequest('/api/records', 'GET', null, response, duration)

// Get all requests
const requests = backendDebugger.getRequests()

// Filter by endpoint
const recordRequests = backendDebugger.getRequests({ 
  endpoint: '/api/records'
})

// Get errors
const errors = backendDebugger.getErrors()

// Performance metrics
const metrics = backendDebugger.getPerformanceMetrics()
// { average: 234, min: 45, max: 890, median: 200, count: 42 }

// Endpoints summary
const summary = backendDebugger.getEndpointsSummary()

// Slowest requests
const slow = backendDebugger.getSlowestRequests(10)

// Generate report
const report = backendDebugger.generateReport()

// Export
const md = backendDebugger.exportMarkdown()
const json = backendDebugger.exportJSON()

// Print to console
backendDebugger.printReport()

// Download
backendDebugger.downloadReport('debug.md')
```

### Report Generation

```javascript
import reportGenerator from '../utils/report-generator'

// Add finding
reportGenerator.addFinding({
  category: 'security',
  severity: 'critical',
  title: 'SQL Injection',
  description: 'Direct string concatenation...',
  file: 'backend/routes.js',
  line: 45,
  remediation: 'Use parameterized queries',
  cwe: 'CWE-89'
})

// Add metrics
reportGenerator.setMetrics({
  'Code Complexity': 'High',
  'Error Coverage': '85%',
  'Security Score': '72%'
})

// Get summary
const summary = reportGenerator.getSummary()
// { total: 15, critical: 2, high: 5, medium: 6, low: 2 }

// Export
const md = reportGenerator.toMarkdown()
const json = reportGenerator.toJSON()
const html = reportGenerator.toHTML()
const csv = reportGenerator.toCSV()

// Download
reportGenerator.download('report.md', 'markdown')
reportGenerator.download('report.html', 'html')
reportGenerator.download('report.json', 'json')
reportGenerator.download('report.csv', 'csv')
```

## Workflow

### Complete Review Workflow

1. **Initial Review**
   ```bash
   claude-backend-reviewer review backend/
   ```

2. **Identify Critical Issues**
   - Review critical findings first
   - Prioritize security vulnerabilities

3. **Targeted Debug**
   ```bash
   claude-backend-reviewer debug backend/ --issue="N+1 queries"
   ```

4. **Generate Report**
   ```bash
   claude-backend-reviewer report backend/ --output=findings.md
   ```

5. **Export for Sharing**
   ```bash
   claude-backend-reviewer export --format=html --output=review-report.html
   ```

## Configuration

### .backend-review.json

```json
{
  "severity": ["critical", "high", "medium"],
  "categories": ["security", "performance", "architecture"],
  "exclude": ["node_modules", "dist", "*.test.js"],
  "rules": {
    "security": true,
    "performance": true,
    "async": true,
    "errorHandling": true
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
name: Backend Review
on: [pull_request]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Backend Review
        run: |
          claude-backend-reviewer review backend/ \
            --output-report=review.md \
            --format=markdown
      - name: Upload Report
        uses: actions/upload-artifact@v3
        with:
          name: backend-review
          path: review.md
```

### Pre-Push Hook

```bash
#!/bin/bash
# .git/hooks/pre-push

if [ -d "backend" ]; then
  claude-backend-reviewer review backend/ --format=json | jq '.summary'
  if [ $? -ne 0 ]; then
    echo "⚠️  Backend review failed"
    exit 1
  fi
fi
```

## Example Reports

### Sample Finding Format

```
## 🔴 Critical Issue: SQL Injection Vulnerability

**ID:** FINDING-1  
**File:** backend/routes/records.js:45  
**Category:** Security  
**Severity:** Critical  

### Description
Direct string concatenation in SQL query allows injection attacks.

```javascript
const query = `SELECT * FROM records WHERE id = ${req.params.id}`
```

### Remediation
Use parameterized queries to prevent injection:

```javascript
const query = 'SELECT * FROM records WHERE id = ?'
db.query(query, [req.params.id])
```

**Reference:** [CWE-89: SQL Injection](https://cwe.mitre.org/data/definitions/89.html)
```

## Best Practices

### DO ✅
- Run review on every major change
- Address critical issues immediately
- Include findings in code review process
- Track remediation progress
- Generate reports for stakeholder review

### DON'T ❌
- Ignore security findings
- Delay critical issue resolution
- Skip performance analysis
- Merge code with unreviewed vulnerabilities
- Ignore architectural recommendations

## Troubleshooting

### No findings reported
- Check file paths and syntax
- Verify backend directory exists
- Review configuration file
- Check exclusion patterns

### Incomplete report
- Ensure all dependencies are installed
- Check file permissions
- Verify database connectivity (if testing)
- Review agent logs

### Performance issues
- Large codebases may take longer
- Disable unnecessary checks
- Review in smaller chunks
- Check system resources

## Integration Points

### With Backend Template
Uses patterns from: `BACKEND_TEMPLATE.md`

### With Security Guidelines
References: `BACKEND_SECURITY.md`

### With Code Standards
Follows: `CODE_QUALITY.md`

## Support

For issues with the Backend Reviewer:
1. Check configuration file
2. Review exclusion patterns
3. Enable verbose logging
4. Check documentation
5. Contact backend team

## Next Steps

After review:
1. Create tickets for findings
2. Prioritize by severity
3. Assign to team members
4. Track resolution
5. Re-run review to verify

---

**Agent Configuration:** `.claude/agents/backend-reviewer.md`  
**Debug Utilities:** `src/utils/backend-debug.js`  
**Report Generator:** `src/utils/report-generator.js`
