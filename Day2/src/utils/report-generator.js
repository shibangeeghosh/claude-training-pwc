// Report Generator
// Generates comprehensive backend review and debug reports

/**
 * Report Generator for backend analysis
 */
class ReportGenerator {
  constructor() {
    this.timestamp = new Date().toISOString()
    this.findings = []
    this.metrics = {}
  }

  /**
   * Add finding
   */
  addFinding(finding) {
    const normalized = {
      id: `FINDING-${this.findings.length + 1}`,
      timestamp: new Date().toISOString(),
      category: finding.category || 'general',
      severity: finding.severity || 'medium',
      title: finding.title,
      description: finding.description,
      file: finding.file,
      line: finding.line,
      remediation: finding.remediation,
      cwe: finding.cwe,
      status: finding.status || 'open'
    }

    this.findings.push(normalized)
    return normalized.id
  }

  /**
   * Add metrics
   */
  setMetrics(metrics) {
    this.metrics = { ...this.metrics, ...metrics }
  }

  /**
   * Get findings by severity
   */
  getBysSeverity(severity) {
    return this.findings.filter(f => f.severity === severity)
  }

  /**
   * Get findings by category
   */
  getByCategory(category) {
    return this.findings.filter(f => f.category === category)
  }

  /**
   * Summary statistics
   */
  getSummary() {
    return {
      total: this.findings.length,
      critical: this.findings.filter(f => f.severity === 'critical').length,
      high: this.findings.filter(f => f.severity === 'high').length,
      medium: this.findings.filter(f => f.severity === 'medium').length,
      low: this.findings.filter(f => f.severity === 'low').length,
      categories: [...new Set(this.findings.map(f => f.category))],
      timestamp: this.timestamp
    }
  }

  /**
   * Generate markdown report
   */
  toMarkdown() {
    const summary = this.getSummary()

    let md = `# Backend Review Report\n\n`
    md += `**Generated:** ${this.timestamp}\n\n`

    // Executive Summary
    md += `## Executive Summary\n`
    md += `- **Total Issues:** ${summary.total}\n`
    md += `- **Critical:** ${summary.critical}\n`
    md += `- **High:** ${summary.high}\n`
    md += `- **Medium:** ${summary.medium}\n`
    md += `- **Low:** ${summary.low}\n`
    md += `- **Risk Level:** ${this.getRiskLevel(summary)}\n\n`

    // Metrics
    if (Object.keys(this.metrics).length > 0) {
      md += `## Metrics\n`
      for (const [key, value] of Object.entries(this.metrics)) {
        md += `- **${key}:** ${value}\n`
      }
      md += `\n`
    }

    // Critical Issues
    const critical = this.getBysSeverity('critical')
    if (critical.length > 0) {
      md += `## 🔴 Critical Issues\n\n`
      for (const finding of critical) {
        md += this.formatFinding(finding)
      }
    }

    // High Priority
    const high = this.getBysSeverity('high')
    if (high.length > 0) {
      md += `## 🟠 High Priority Issues\n\n`
      for (const finding of high) {
        md += this.formatFinding(finding)
      }
    }

    // Medium Priority
    const medium = this.getBysSeverity('medium')
    if (medium.length > 0) {
      md += `## 🟡 Medium Priority Issues\n\n`
      for (const finding of medium) {
        md += this.formatFinding(finding)
      }
    }

    // Low Priority
    const low = this.getBysSeverity('low')
    if (low.length > 0) {
      md += `## 🟢 Low Priority Issues\n\n`
      for (const finding of low) {
        md += this.formatFinding(finding)
      }
    }

    // Recommendations
    md += `## Recommendations\n\n`
    md += `1. Address all critical issues immediately\n`
    md += `2. Schedule remediation for high-priority issues within sprint\n`
    md += `3. Include medium-priority items in backlog\n`
    md += `4. Review low-priority suggestions in code reviews\n\n`

    return md
  }

  /**
   * Format individual finding
   */
  formatFinding(finding) {
    let md = `### ${finding.title}\n\n`
    md += `**ID:** ${finding.id}\n`
    md += `**Category:** ${finding.category}\n`
    md += `**Severity:** ${finding.severity.toUpperCase()}\n`

    if (finding.file) {
      md += `**File:** \`${finding.file}`
      if (finding.line) md += `:${finding.line}`
      md += `\`\n`
    }

    md += `\n**Description:**\n${finding.description}\n\n`

    if (finding.remediation) {
      md += `**Remediation:**\n${finding.remediation}\n\n`
    }

    if (finding.cwe) {
      md += `**Reference:** [${finding.cwe}](https://cwe.mitre.org/)\n\n`
    }

    return md
  }

  /**
   * Get risk level
   */
  getRiskLevel(summary) {
    if (summary.critical > 0) return '🔴 CRITICAL'
    if (summary.high > 2) return '🟠 HIGH'
    if (summary.high > 0) return '🟡 MEDIUM'
    return '🟢 LOW'
  }

  /**
   * Generate JSON report
   */
  toJSON() {
    return {
      timestamp: this.timestamp,
      summary: this.getSummary(),
      metrics: this.metrics,
      findings: this.findings.map(f => ({
        id: f.id,
        category: f.category,
        severity: f.severity,
        title: f.title,
        description: f.description,
        file: f.file,
        line: f.line,
        remediation: f.remediation,
        cwe: f.cwe,
        status: f.status
      }))
    }
  }

  /**
   * Export as CSV
   */
  toCSV() {
    const headers = ['ID', 'Severity', 'Category', 'Title', 'File', 'Line', 'Status']
    const rows = this.findings.map(f => [
      f.id,
      f.severity,
      f.category,
      f.title,
      f.file || '',
      f.line || '',
      f.status
    ])

    const csv = [headers, ...rows].map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n')

    return csv
  }

  /**
   * Export as HTML report
   */
  toHTML() {
    const summary = this.getSummary()
    const findings = this.findings

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Backend Review Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
    h1 { color: #001F3F; border-bottom: 3px solid #0066CC; padding-bottom: 10px; }
    h2 { color: #0066CC; margin-top: 30px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
    .summary-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
    .summary-value { font-size: 28px; font-weight: bold; color: #0066CC; }
    .summary-label { font-size: 12px; color: #999; margin-top: 5px; }
    .finding { border-left: 4px solid; margin: 15px 0; padding: 15px; background: #f9f9f9; }
    .critical { border-left-color: #ef4444; background: #fef2f2; }
    .high { border-left-color: #f59e0b; background: #fffbf0; }
    .medium { border-left-color: #eab308; background: #fefce8; }
    .low { border-left-color: #10b981; background: #f0fdf4; }
    .finding-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; }
    .finding-meta { font-size: 12px; color: #666; margin: 5px 0; }
    .remediation { margin-top: 10px; padding: 10px; background: white; border-radius: 4px; font-style: italic; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f5f5f5; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Backend Review Report</h1>
    <p><strong>Generated:</strong> ${this.timestamp}</p>

    <h2>Summary</h2>
    <div class="summary">
      <div class="summary-card">
        <div class="summary-value">${summary.total}</div>
        <div class="summary-label">Total Issues</div>
      </div>
      <div class="summary-card">
        <div class="summary-value" style="color: #ef4444;">${summary.critical}</div>
        <div class="summary-label">Critical</div>
      </div>
      <div class="summary-card">
        <div class="summary-value" style="color: #f59e0b;">${summary.high}</div>
        <div class="summary-label">High</div>
      </div>
      <div class="summary-card">
        <div class="summary-value" style="color: #eab308;">${summary.medium}</div>
        <div class="summary-label">Medium</div>
      </div>
      <div class="summary-card">
        <div class="summary-value" style="color: #10b981;">${summary.low}</div>
        <div class="summary-label">Low</div>
      </div>
    </div>

    <h2>Findings</h2>
    ${findings.map(f => `
      <div class="finding ${f.severity}">
        <div class="finding-title">${f.title}</div>
        <div class="finding-meta"><strong>ID:</strong> ${f.id}</div>
        <div class="finding-meta"><strong>Category:</strong> ${f.category}</div>
        ${f.file ? `<div class="finding-meta"><strong>File:</strong> ${f.file}${f.line ? `:${f.line}` : ''}</div>` : ''}
        <p>${f.description}</p>
        ${f.remediation ? `<div class="remediation"><strong>Remediation:</strong> ${f.remediation}</div>` : ''}
      </div>
    `).join('')}
  </div>
</body>
</html>`
  }

  /**
   * Download report
   */
  download(filename, format = 'markdown') {
    let content, mimeType

    switch (format) {
      case 'json':
        content = JSON.stringify(this.toJSON(), null, 2)
        mimeType = 'application/json'
        break
      case 'csv':
        content = this.toCSV()
        mimeType = 'text/csv'
        break
      case 'html':
        content = this.toHTML()
        mimeType = 'text/html'
        break
      default:
        content = this.toMarkdown()
        mimeType = 'text/markdown'
    }

    if (typeof window !== 'undefined') {
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  /**
   * Clear report
   */
  clear() {
    this.findings = []
    this.metrics = {}
  }
}

export default new ReportGenerator()
export { ReportGenerator }
