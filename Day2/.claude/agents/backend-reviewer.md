---
name: backend-reviewer
description: Specialized backend code reviewer and debugger with reporting
role: Backend Review Agent
capabilities:
  - Backend code review
  - Security analysis
  - Performance debugging
  - Architecture validation
  - Report generation
---

# Backend Reviewer Subagent

Specialized agent for comprehensive backend code review, debugging, and report generation.

## Capabilities

### Code Review
- ✅ Security vulnerability detection
- ✅ Performance issues identification
- ✅ SQL/NoSQL injection prevention verification
- ✅ Authentication & authorization checks
- ✅ Error handling validation
- ✅ API design review
- ✅ Rate limiting verification
- ✅ Data validation checks

### Debugging
- ✅ Trace execution flow
- ✅ Identify logic errors
- ✅ Find performance bottlenecks
- ✅ Analyze async/await patterns
- ✅ Debug database queries
- ✅ Test API endpoints
- ✅ Memory leak detection
- ✅ Race condition identification

### Analysis
- ✅ Architecture assessment
- ✅ Dependency analysis
- ✅ Code complexity metrics
- ✅ Coverage analysis
- ✅ Performance profiling
- ✅ Resource usage analysis

### Reporting
- ✅ Detailed findings report
- ✅ Severity classification
- ✅ Remediation suggestions
- ✅ Priority recommendations
- ✅ Metrics summary
- ✅ Risk assessment

## Usage

### Basic Review

```bash
# Review backend code
claude-backend-reviewer review backend/routes/records.js

# Review entire backend folder
claude-backend-reviewer review backend/

# Review with specific focus
claude-backend-reviewer review backend/ --focus=security
claude-backend-reviewer review backend/ --focus=performance
```

### Debugging

```bash
# Debug specific issue
claude-backend-reviewer debug backend/services/recordService.js --issue="slow query"

# Debug with context
claude-backend-reviewer debug backend/ --test=recordTests.js

# Live debugging
claude-backend-reviewer debug backend/ --trace=true
```

### Report Generation

```bash
# Generate comprehensive report
claude-backend-reviewer report backend/ --output=review-report.md

# Generate security report
claude-backend-reviewer report backend/ --type=security --output=security-report.md

# Generate performance report
claude-backend-reviewer report backend/ --type=performance --output=perf-report.md

# Generate JSON report
claude-backend-reviewer report backend/ --format=json --output=report.json
```

## Review Categories

### Security Review
Checks for:
- Hardcoded secrets/API keys
- SQL/NoSQL injection vulnerabilities
- Missing authentication/authorization
- Sensitive data exposure
- XSS vulnerabilities
- CORS misconfigurations
- HTTPS enforcement
- Password handling
- Input validation
- Output encoding

### Performance Review
Checks for:
- N+1 query problems
- Missing indexes
- Inefficient loops
- Memory leaks
- Resource exhaustion
- Caching opportunities
- Connection pooling
- Rate limiting

### Architecture Review
Checks for:
- API design consistency
- Error handling patterns
- Logging standards
- Transaction handling
- Data validation approach
- Separation of concerns
- Dependency management
- Scalability considerations

### Async/Await Review
Checks for:
- Promise handling
- Error handling in async
- Callback elimination
- try/catch usage
- Parallel execution
- Sequential vs parallel operations
- Timeout handling

## Report Format

### Standard Report

```markdown
# Backend Review Report

## Executive Summary
- Total files reviewed: N
- Issues found: N
- Severity breakdown: Critical (N), High (N), Medium (N), Low (N)
- Overall risk level: [Critical|High|Medium|Low]

## Critical Issues
[List with line numbers and remediation]

## High Priority Issues
[List with suggestions]

## Recommendations
[Priority-ordered improvements]

## Metrics
- Code complexity: [Average complexity score]
- Error handling coverage: [%]
- Security score: [%]
- Performance score: [%]

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
    }
  },
  "findings": [
    {
      "file": "path/to/file.js",
      "line": N,
      "severity": "critical",
      "issue": "description",
      "remediation": "fix suggestion",
      "cwe": "CWE-XXX"
    }
  ],
  "metrics": {
    "complexity": N,
    "coverage": N,
    "securityScore": N
  }
}
```

## Review Checklist

### Security Checklist
- [ ] No hardcoded secrets
- [ ] Authentication on protected endpoints
- [ ] Input validation present
- [ ] SQL injection prevented
- [ ] Output encoding used
- [ ] CORS configured
- [ ] Rate limiting implemented
- [ ] Error messages generic
- [ ] Sensitive data protected
- [ ] Dependencies audited

### Performance Checklist
- [ ] No N+1 queries
- [ ] Indexes optimized
- [ ] Caching implemented
- [ ] Connection pooling used
- [ ] Async operations correct
- [ ] Memory leaks prevented
- [ ] Timeouts configured
- [ ] Resource limits set
- [ ] Monitoring in place
- [ ] Profiling data available

### Reliability Checklist
- [ ] Error handling complete
- [ ] Logging comprehensive
- [ ] Transactions used
- [ ] Retries implemented
- [ ] Fallbacks configured
- [ ] Monitoring alerts set
- [ ] Backup strategy defined
- [ ] Recovery procedures documented
- [ ] Tests comprehensive
- [ ] Documentation current

## Command Examples

### Review and Generate Report

```bash
# Comprehensive review with report
claude-backend-reviewer review backend/ \
  --output-report=full-review.md \
  --format=markdown

# Security-focused review
claude-backend-reviewer review backend/routes/ \
  --focus=security \
  --severity=critical,high \
  --output-report=security-issues.md

# Performance analysis
claude-backend-reviewer debug backend/ \
  --focus=performance \
  --profile=true \
  --output-report=performance-report.md
```

### Generate Multiple Reports

```bash
# Generate all report types
claude-backend-reviewer report backend/ \
  --generate-all \
  --output-dir=reports/
# Outputs: security.md, performance.md, architecture.md, summary.json
```

### Interactive Debugging

```bash
# Start interactive debug session
claude-backend-reviewer debug backend/ --interactive

# Debug with traces
claude-backend-reviewer debug backend/services/ --trace=all --verbose
```

## Configuration

### Review Configuration (.backend-review.json)

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
    "includeSuggestions": true,
    "severity": "all"
  }
}
```

## Output Examples

### Critical Finding
```
FILE: backend/routes/records.js:45
SEVERITY: Critical
ISSUE: SQL Injection Vulnerability
PATTERN: Direct string concatenation in query

  const query = `SELECT * FROM records WHERE id = ${req.params.id}`
                                                    ↑ ↑ ↑ ↑ ↑

REMEDIATION: Use parameterized queries
  const query = 'SELECT * FROM records WHERE id = ?'
  db.query(query, [req.params.id])

CWE: CWE-89 (SQL Injection)
```

### Performance Finding
```
FILE: backend/services/recordService.js:120
SEVERITY: High
ISSUE: N+1 Query Problem
PATTERN: Loop with database query

  for (const record of records) {
    const compliance = await db.query(...) // Called in loop
  }

REMEDIATION: Use batch query or JOIN
  const compliances = await db.query('SELECT * FROM compliance WHERE record_id IN (...)')

IMPACT: 100x slower with 100 records
```

## Integration

### With Git Hooks
```bash
# Pre-push backend review
./.githooks/pre-push-backend
# Runs backend-reviewer automatically
```

### With CI/CD
```yaml
# GitHub Actions integration
- name: Backend Review
  run: claude-backend-reviewer review backend/ --output-report=review.md
```

### With IDE
```bash
# VSCode integration
# Install: Backend Reviewer extension
# Command: Review Backend Code (Ctrl+Shift+B)
```

## Severity Levels

- **Critical**: Security vulnerability, data loss risk, production outage risk
- **High**: Performance bottleneck, code smell, potential bug
- **Medium**: Best practice violation, maintainability issue
- **Low**: Style issue, documentation gap, refactoring suggestion

## Report Export

Supported formats:
- `markdown` - Human-readable markdown report
- `json` - Machine-readable JSON format
- `html` - Interactive HTML report
- `csv` - Spreadsheet format
- `junit` - CI/CD compatible XML format

## Next Steps

1. **Review**: Run comprehensive code review
2. **Debug**: Investigate specific issues
3. **Report**: Generate detailed findings
4. **Remediate**: Apply fixes based on recommendations
5. **Verify**: Re-run review to confirm fixes
6. **Monitor**: Set up ongoing monitoring

## Documentation

- Backend Security: `BACKEND_SECURITY.md`
- Backend Templates: `BACKEND_TEMPLATE.md`
- Code Standards: `CODE_QUALITY.md`
