# Code Review Workflow Guide

Complete workflow for using the Frontend and Backend Reviewer subagents to maintain code quality, performance, and accessibility standards in the ALCOA+ QA Compliance project.

## Overview

The project includes two specialized review agents:
- **Frontend Reviewer** - React component review, performance, accessibility, state management
- **Backend Reviewer** - API security, architecture, performance, debugging

Together they provide comprehensive coverage of the entire application stack.

## Quick Start

### For Frontend Changes

```bash
# 1. Review components
claude-frontend-reviewer review src/components/ --output=review.md

# 2. Audit accessibility
claude-frontend-reviewer audit src/ --wcag-level=AA

# 3. Check performance
claude-frontend-reviewer debug src/ --focus=performance

# 4. Generate report
claude-frontend-reviewer report src/ --output=final-report.html
```

### For Backend Changes

```bash
# 1. Review API code
claude-backend-reviewer review src/api/ --output=review.md

# 2. Security check
claude-backend-reviewer review src/api/ --focus=security

# 3. Performance analysis
claude-backend-reviewer debug src/api/ --focus=performance

# 4. Generate report
claude-backend-reviewer report src/api/ --output=final-report.html
```

### For Full Stack Review

```bash
# Review everything
./scripts/full-review.sh

# Or individual steps:
claude-frontend-reviewer report src/ --output-dir=reports/frontend/
claude-backend-reviewer report src/api/ --output-dir=reports/backend/
```

## Detailed Workflow

### Phase 1: Pre-Commit Review

Before committing code:

#### Frontend
```bash
# Check component structure
claude-frontend-reviewer review src/components/MyComponent.jsx

# Quick accessibility check
claude-frontend-reviewer audit src/components/MyComponent.jsx --quick

# Performance check
claude-frontend-reviewer debug src/components/MyComponent.jsx --focus=performance
```

#### Backend
```bash
# Check API endpoints
claude-frontend-reviewer review src/api/handlers.js

# Security validation
claude-backend-reviewer review src/api/handlers.js --focus=security --severity=critical

# Async/await check
./.githooks/pre-commit-async
```

### Phase 2: Pull Request Review

When creating a pull request:

#### Generate Comprehensive Reports

```bash
# Frontend report
claude-frontend-reviewer report src/ \
  --type=comprehensive \
  --format=markdown \
  --output=frontend-review.md

# Backend report
claude-backend-reviewer report src/api/ \
  --type=comprehensive \
  --format=markdown \
  --output=backend-review.md
```

#### Include in PR Description

```markdown
## Code Review Summary

### Frontend
- Component Quality: ✅ Passed
- Performance: ⚠️ 3 optimization opportunities
- Accessibility: ✅ WCAG AA compliant

[Frontend Review Report](frontend-review.md)

### Backend
- Security: ✅ Passed all checks
- Performance: ✅ Good
- Architecture: ✅ Compliant

[Backend Review Report](backend-review.md)
```

### Phase 3: Continuous Integration

In CI/CD pipeline (GitHub Actions):

```yaml
name: Code Review
on: [pull_request, push]

jobs:
  frontend-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm install
      - name: Frontend Review
        run: claude-frontend-reviewer review src/components/
      - name: Accessibility Audit
        run: claude-frontend-reviewer audit src/ --wcag-level=AA
      - name: Upload Report
        uses: actions/upload-artifact@v3
        with:
          name: frontend-review
          path: reports/

  backend-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm install
      - name: Backend Review
        run: claude-backend-reviewer review src/api/
      - name: Security Check
        run: claude-backend-reviewer review src/api/ --focus=security
      - name: Upload Report
        uses: actions/upload-artifact@v3
        with:
          name: backend-review
          path: reports/
```

### Phase 4: Post-Merge Monitoring

After code is merged:

```bash
# Weekly performance report
claude-frontend-reviewer report src/ \
  --type=performance \
  --output=weekly-performance.md

# Monthly security audit
claude-backend-reviewer audit src/api/ \
  --focus=security \
  --output=monthly-security.md

# Overall health check
./scripts/health-check.sh
```

## Common Scenarios

### Scenario 1: Adding a New Component

```bash
# 1. Create component with best practices
# src/components/NewFeature.jsx

# 2. Run review
claude-frontend-reviewer review src/components/NewFeature.jsx

# 3. Check accessibility
claude-frontend-reviewer audit src/components/NewFeature.jsx

# 4. Optimize if needed
# Review suggestions and apply fixes

# 5. Run tests
npm test src/components/NewFeature.jsx

# 6. Commit with sign-off
git commit -m "feat: Add NewFeature component

- Implements [description]
- Passes accessibility audit (WCAG AA)
- Performance: [metrics]
- Test coverage: [%]"
```

### Scenario 2: Performance Optimization

```bash
# 1. Identify slow components
claude-frontend-reviewer debug src/components/ --focus=performance

# 2. Get detailed analysis
claude-frontend-reviewer report src/components/ \
  --type=performance \
  --format=markdown

# 3. Review recommendations
# Apply memoization, lazy loading, etc.

# 4. Verify improvements
claude-frontend-reviewer debug src/components/ --profile=true

# 5. Compare metrics
# Before: [metrics]
# After: [metrics]
```

### Scenario 3: Accessibility Compliance

```bash
# 1. Run accessibility audit
claude-frontend-reviewer audit src/ --wcag-level=AA

# 2. Get issues breakdown
# Critical: X issues
# High: Y issues
# Medium: Z issues

# 3. Fix critical issues
# - Add alt text
# - Fix color contrast
# - Add ARIA labels

# 4. Verify fixes
claude-frontend-reviewer audit src/ --wcag-level=AA

# 5. Generate compliance report
claude-frontend-reviewer report src/ \
  --type=accessibility \
  --format=html
```

### Scenario 4: Security Review

```bash
# 1. Review API changes
claude-backend-reviewer review src/api/ --focus=security

# 2. Check for vulnerabilities
# - Hardcoded secrets
# - SQL injection risks
# - Missing authentication

# 3. Run pre-commit security hook
./.githooks/pre-commit-backend

# 4. Generate security report
claude-backend-reviewer report src/api/ \
  --type=security \
  --format=markdown

# 5. Address all critical findings
```

### Scenario 5: Performance Investigation

```bash
# 1. Profile backend API
claude-backend-reviewer debug src/api/ \
  --focus=performance \
  --profile=true

# 2. Identify slow endpoints
# - GET /api/records: 450ms average
# - POST /api/compliance: 1200ms average

# 3. Debug specific endpoint
claude-backend-reviewer debug src/api/records.js \
  --issue="slow query"

# 4. Apply optimizations
# - Add database indexes
# - Implement caching
# - Batch operations

# 5. Re-profile and verify
claude-backend-reviewer debug src/api/ --profile=true
```

## Review Standards by Category

### Frontend Review Standards

| Category | Standard | Tool |
|----------|----------|------|
| Components | < 200 lines, props validation | `frontend-reviewer review` |
| Performance | 60 FPS (16ms renders), 80+ score | `frontend-reviewer debug --focus=performance` |
| Accessibility | WCAG AA compliant, no critical issues | `frontend-reviewer audit --wcag-level=AA` |
| State | useState at component level, custom hooks | `frontend-reviewer review --focus=state` |
| Styling | Tailwind utilities, responsive | `frontend-reviewer review --focus=styling` |
| Testing | 80%+ coverage, meaningful tests | Code review + `npm test` |

### Backend Review Standards

| Category | Standard | Tool |
|----------|----------|------|
| Security | No hardcoded secrets, all auth checks | `backend-reviewer review --focus=security` |
| Performance | < 200ms API response, 100+ score | `backend-reviewer debug --focus=performance` |
| Architecture | Async/await patterns, error handling | `backend-reviewer review --focus=architecture` |
| Async | No .then() chains, all async/await | `./.githooks/pre-commit-async` |
| Testing | Integration tests with real DB | Code review + `npm test` |

## Reporting

### Frontend Reports

Available reports:
- **Component Quality** - Structure, composition, best practices
- **Performance** - Rendering, memoization, optimization opportunities
- **Accessibility** - WCAG compliance, semantic HTML, ARIA
- **State Management** - useState, useEffect, custom hooks
- **Comprehensive** - All categories combined

### Backend Reports

Available reports:
- **Security** - Vulnerabilities, best practices, compliance
- **Performance** - Query optimization, caching, scalability
- **Architecture** - Design patterns, error handling, structure
- **Async/Await** - Promise handling, error management
- **Comprehensive** - All categories combined

### Report Formats

All reviewers support:
- **Markdown** - Human-readable, shareable
- **JSON** - Machine-parseable, for automation
- **HTML** - Interactive dashboards, charts
- **CSV** - Spreadsheet compatible, for tracking

### Sample Report Command

```bash
# Generate all formats
mkdir -p reports/{frontend,backend}

# Frontend reports
for format in markdown json html csv; do
  claude-frontend-reviewer report src/ \
    --format=$format \
    --output=reports/frontend/report.$format
done

# Backend reports
for format in markdown json html csv; do
  claude-backend-reviewer report src/api/ \
    --format=$format \
    --output=reports/backend/report.$format
done

# View HTML report
open reports/frontend/report.html
open reports/backend/report.html
```

## Metrics Tracking

### Dashboard Setup

Create a `metrics.json` file to track trends:

```json
{
  "date": "2026-09-05",
  "frontend": {
    "performance_score": 78,
    "accessibility_score": 92,
    "component_quality": 85,
    "issues": { "critical": 1, "high": 3, "medium": 5 }
  },
  "backend": {
    "security_score": 95,
    "performance_score": 88,
    "architecture_score": 90,
    "issues": { "critical": 0, "high": 1, "medium": 2 }
  }
}
```

### Tracking Script

```bash
#!/bin/bash
# scripts/track-metrics.sh

DATE=$(date +%Y-%m-%d)
REPORT_DIR="metrics/$DATE"
mkdir -p "$REPORT_DIR"

# Frontend metrics
claude-frontend-reviewer report src/ --format=json > "$REPORT_DIR/frontend.json"

# Backend metrics
claude-backend-reviewer report src/api/ --format=json > "$REPORT_DIR/backend.json"

# Generate trends
node scripts/analyze-trends.js
```

## Issue Prioritization

### Critical Issues (Fix Immediately)
- Security vulnerabilities
- Broken functionality
- Accessibility barriers (WCAG A)
- Major performance issues (>1s)
- Data loss risks

### High Priority (Fix in Sprint)
- Performance issues (100-1000ms)
- Code quality concerns
- Accessibility issues (WCAG AA)
- Technical debt
- Testing gaps

### Medium Priority (Fix in Backlog)
- Code style improvements
- Minor performance tuning
- Documentation gaps
- Refactoring opportunities

### Low Priority (Future Enhancement)
- Code organization suggestions
- Performance microoptimizations
- Nice-to-have improvements

## Integration Checklist

Before using reviewers:

- [ ] Agents are installed in `.claude/agents/`
- [ ] Frontend debug utilities installed in `src/utils/frontend-debug.js`
- [ ] Backend debug utilities installed in `src/utils/backend-debug.js`
- [ ] Report generator installed in `src/utils/report-generator.js`
- [ ] Configuration files created (`.frontend-review.json`, `.backend-review.json`)
- [ ] Git hooks configured (`.githooks/`)
- [ ] CI/CD pipeline configured
- [ ] Team trained on workflow
- [ ] Documentation updated
- [ ] Baseline metrics collected

## Documentation References

- **Frontend Reviewer:** `FRONTEND_REVIEWER.md`
- **Backend Reviewer:** `BACKEND_REVIEWER.md`
- **Code Standards:** `CODE_QUALITY.md`
- **Hooks:** `HOOKS.md`
- **Utils:** `UTILS.md`
- **Backend Security:** `BACKEND_SECURITY.md`
- **Backend Template:** `BACKEND_TEMPLATE.md`
- **Debug Mode:** `DEBUG.md`
- **API Handlers:** `API_HANDLERS.md`
- **Environment Setup:** `ENVIRONMENT.md`

## Support

### For Issues

1. Check the relevant reviewer documentation
2. Review configuration files
3. Check exclusion patterns
4. Enable verbose logging
5. Contact the team

### For Training

- Read `FRONTEND_REVIEWER.md` for frontend review
- Read `BACKEND_REVIEWER.md` for backend review
- Follow examples in this workflow guide
- Practice with sample components/APIs

### For Customization

- Modify `.frontend-review.json` for frontend settings
- Modify `.backend-review.json` for backend settings
- Adjust thresholds and rules as needed
- Update team standards document
- Run baseline metrics after changes

---

**Last Updated:** 2026-09-05  
**Version:** 1.0  
**Status:** Active
