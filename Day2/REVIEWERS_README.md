# Code Review System - Quick Reference

Your ALCOA+ QA Compliance project includes two specialized AI-powered review agents for comprehensive code quality assurance.

## 🎯 What You Have

### Frontend Reviewer (`frontend-reviewer`)
Reviews React components, performance, accessibility, and state management.

**Quick Commands:**
```bash
# Review components
claude-frontend-reviewer review src/components/

# Audit accessibility (WCAG AA)
claude-frontend-reviewer audit src/

# Debug performance issues
claude-frontend-reviewer debug src/ --focus=performance

# Generate full report
claude-frontend-reviewer report src/ --output=report.html
```

**Focuses on:**
- React best practices and component composition
- Performance (re-renders, memoization, bundle size)
- Accessibility (WCAG 2.1 compliance, keyboard nav, screen readers)
- State management (hooks, Context API, props drilling)
- Styling (Tailwind, responsive design, theming)
- Testing coverage

---

### Backend Reviewer (`backend-reviewer`)
Reviews API code, security, architecture, and performance.

**Quick Commands:**
```bash
# Review API code
claude-backend-reviewer review src/api/

# Security-focused review
claude-backend-reviewer review src/api/ --focus=security

# Debug performance
claude-backend-reviewer debug src/api/ --focus=performance

# Generate full report
claude-backend-reviewer report src/api/ --output=report.html
```

**Focuses on:**
- Security (SQL injection, hardcoded secrets, auth)
- API design and architecture patterns
- Async/await patterns and error handling
- Performance (N+1 queries, indexing, caching)
- Compliance with backend security rules

---

## 📊 Report Types

| Type | Command | Output |
|------|---------|--------|
| Component Review | `review src/components/` | Component structure, best practices |
| Performance | `debug src/ --focus=performance` | Render times, optimization opportunities |
| Accessibility | `audit src/` | WCAG compliance, keyboard nav, alt text |
| Security | `review src/api/ --focus=security` | Vulnerabilities, hardcoded secrets |
| Comprehensive | `report src/` | All categories combined |

**Formats:** Markdown (default) • JSON • HTML • CSV

---

## 🚀 Common Workflows

### Quick Component Check
```bash
claude-frontend-reviewer review src/components/MyComponent.jsx
```

### Full Stack Review (Before PR)
```bash
# Frontend
claude-frontend-reviewer report src/ --format=markdown --output=frontend-review.md

# Backend
claude-backend-reviewer report src/api/ --format=markdown --output=backend-review.md
```

### Performance Optimization
```bash
# Find slow components
claude-frontend-reviewer debug src/ --focus=performance

# Find slow endpoints
claude-backend-reviewer debug src/api/ --focus=performance
```

### Accessibility Compliance
```bash
# Check WCAG AA compliance
claude-frontend-reviewer audit src/ --wcag-level=AA
```

### Security Review
```bash
# Check for vulnerabilities
claude-backend-reviewer review src/api/ --focus=security
```

---

## 📁 Files Overview

### Agents
- **`/.claude/agents/frontend-reviewer.md`** - Frontend review agent documentation
- **`/.claude/agents/backend-reviewer.md`** - Backend review agent documentation

### Debug Utilities
- **`/src/utils/frontend-debug.js`** - Component render tracking, performance, accessibility scanning
- **`/src/utils/backend-debug.js`** - API request tracing, performance metrics
- **`/src/utils/report-generator.js`** - Multi-format report generation (Markdown, JSON, HTML, CSV)

### Documentation
- **`FRONTEND_REVIEWER.md`** - Complete frontend reviewer guide
- **`BACKEND_REVIEWER.md`** - Complete backend reviewer guide
- **`REVIEW_WORKFLOW.md`** - Detailed workflow for using both reviewers
- **`REVIEWERS_README.md`** - This file (quick reference)

---

## 📈 Scoring System

### Performance Scores
- **90-100** ✅ Excellent (minimal re-renders, good memoization)
- **70-89** ⚠️ Good (some optimization needed)
- **50-69** ❌ Fair (multiple performance issues)
- **0-49** 🔴 Poor (major concerns)

### Accessibility Scores
- **90-100** ✅ WCAG AAA compliant
- **80-89** ✅ WCAG AA with minor issues
- **60-79** ✅ WCAG A level
- **0-59** ❌ Significant barriers

### Severity Levels
- 🔴 **Critical** - Security risk, broken functionality, major accessibility barrier
- 🟠 **High** - Performance issue (100-1000ms), code quality concern
- 🟡 **Medium** - Code style, minor accessibility issue, technical debt
- 🟢 **Low** - Nice-to-have improvements, documentation gaps

---

## 🔍 Key Features

### Frontend Reviewer Capabilities
✅ React best practices validation  
✅ Unnecessary re-render detection  
✅ WCAG 2.1 accessibility auditing  
✅ Semantic HTML verification  
✅ Props drilling detection  
✅ State management review  
✅ Bundle size analysis  
✅ Keyboard navigation testing  

### Backend Reviewer Capabilities
✅ Security vulnerability detection  
✅ SQL/NoSQL injection prevention  
✅ Authentication & authorization checks  
✅ N+1 query identification  
✅ Performance profiling  
✅ Async/await pattern validation  
✅ Error handling review  
✅ Rate limiting verification  

---

## 🛠️ In-Code Usage

### Frontend Debugging

```javascript
import frontendDebugger from '../utils/frontend-debug'

// Track component renders
frontendDebugger.trackRender('Dashboard', props, 25)

// Find performance issues
const slow = frontendDebugger.getSlowComponents(16)
const loops = frontendDebugger.detectRerenderLoops()

// Scan accessibility
frontendDebugger.scanAccessibility()
const issues = frontendDebugger.getA11yIssues()

// Generate report
const report = frontendDebugger.exportMarkdown()
frontendDebugger.downloadReport('debug.md')
```

### Backend Debugging

```javascript
import backendDebugger from '../utils/backend-debug'

// Track API calls
const duration = Date.now() - startTime
backendDebugger.traceRequest('/api/records', 'GET', null, response, duration)

// Get metrics
const metrics = backendDebugger.getPerformanceMetrics()
const slow = backendDebugger.getSlowestRequests(10)

// Generate report
const report = backendDebugger.generateReport()
const md = backendDebugger.exportMarkdown()
```

---

## 📝 Configuration

### Frontend Configuration (`.frontend-review.json`)
```json
{
  "rules": {
    "components": true,
    "performance": true,
    "accessibility": true
  },
  "thresholds": {
    "maxComponentSize": 200,
    "performanceScore": 80,
    "accessibilityScore": 90
  },
  "accessibility": {
    "wcagLevel": "AA"
  }
}
```

### Backend Configuration (`.backend-review.json`)
```json
{
  "rules": {
    "security": true,
    "performance": true,
    "async": true
  },
  "severity": ["critical", "high", "medium"]
}
```

---

## 🔗 Integration Points

### Pre-Commit Hooks
- Runs frontend review on staged files
- Validates backend security rules
- Checks async/await patterns
- Prevents debug code commits

### GitHub Actions
- Automatic review on pull requests
- Generates reports as artifacts
- Blocks merge on critical issues
- Comments with findings

### IDE Integration
- VSCode commands for quick review
- Real-time component analysis
- Performance warnings
- Accessibility suggestions

---

## 📊 Report Examples

### Component Performance Issue
```
FILE: src/components/Dashboard.jsx:45
SEVERITY: High
ISSUE: List items without stable keys

IMPACT: 10x re-renders per update
REMEDIATION: Use item.id instead of index
```

### Accessibility Issue
```
FILE: src/components/Header.jsx:12
SEVERITY: High
ISSUE: Image missing alt text

WCAG: 1.1.1 Non-text Content (Level A)
REMEDIATION: Add meaningful alt text
```

### Security Issue
```
FILE: src/api/records.js:45
SEVERITY: Critical
ISSUE: SQL Injection vulnerability

REMEDIATION: Use parameterized queries
CWE: CWE-89 (SQL Injection)
```

---

## 🎓 Getting Started

### Step 1: Review Your Components
```bash
claude-frontend-reviewer review src/components/
```

### Step 2: Check Accessibility
```bash
claude-frontend-reviewer audit src/ --wcag-level=AA
```

### Step 3: Profile Performance
```bash
claude-frontend-reviewer debug src/ --profile=true
```

### Step 4: Review Backend
```bash
claude-backend-reviewer review src/api/
```

### Step 5: Generate Report
```bash
claude-frontend-reviewer report src/ --format=html --output=report.html
```

---

## 📚 Full Documentation

For detailed information, see:

| Document | Purpose |
|----------|---------|
| `FRONTEND_REVIEWER.md` | Complete frontend reviewer guide with all commands |
| `BACKEND_REVIEWER.md` | Complete backend reviewer guide with all commands |
| `REVIEW_WORKFLOW.md` | Detailed workflow for using both in your process |
| `CODE_QUALITY.md` | General code standards and best practices |
| `BACKEND_SECURITY.md` | Mandatory backend security rules |
| `HOOKS.md` | Custom React hooks documentation |
| `API_HANDLERS.md` | API handler patterns and usage |

---

## 💡 Tips & Tricks

### Pro Tips
1. Run reviewers before creating PRs to catch issues early
2. Use JSON reports for automation and tracking trends
3. Generate HTML reports for stakeholder reviews
4. Track scores over time to monitor improvement
5. Configure thresholds to match your standards

### Common Patterns
- Use `--focus=security` for critical reviews
- Use `--profile=true` for performance investigation
- Use `--wcag-level=AA` for accessibility compliance
- Use `--format=json` for CI/CD automation
- Use `--format=html` for team presentations

### Troubleshooting
- No findings? Check file paths and configuration
- Missing data? Verify components are rendering
- Slow reports? Check for large file exclusions
- Configuration issues? Verify JSON syntax

---

## 🚨 Critical Issues Priority

Always address immediately:
1. **Security vulnerabilities** (hardcoded secrets, SQL injection, missing auth)
2. **Accessibility barriers** (WCAG A violations, missing alt text)
3. **Broken functionality** (components not rendering, APIs returning errors)
4. **Major performance issues** (>1 second response time)

---

## ✅ Checklist Before PR

- [ ] Frontend review passed (no critical issues)
- [ ] Accessibility audit passed (WCAG AA compliant)
- [ ] Performance metrics acceptable (no slow components)
- [ ] Backend security review passed (no vulnerabilities)
- [ ] Tests passing (80%+ coverage)
- [ ] No console errors or warnings
- [ ] Responsive design verified
- [ ] Documentation updated

---

## 📞 Support

**For issues:**
1. Check the relevant documentation
2. Verify configuration files
3. Review command syntax
4. Check browser/node console for errors
5. Refer to specific reviewer documentation

**For questions:**
- Frontend: See `FRONTEND_REVIEWER.md`
- Backend: See `BACKEND_REVIEWER.md`
- Workflow: See `REVIEW_WORKFLOW.md`
- Standards: See `CODE_QUALITY.md`

---

## 📈 Next Steps

1. ✅ **Run initial review** on your components
2. ✅ **Fix critical findings** from reports
3. ✅ **Set up CI/CD integration** for automated reviews
4. ✅ **Track metrics over time** to monitor improvement
5. ✅ **Train team** on review workflow
6. ✅ **Establish standards** from baseline metrics

---

**Last Updated:** 2026-09-05  
**Version:** 1.0  
**Project:** ALCOA+ QA Compliance Management System  
**Status:** ✅ Production Ready
