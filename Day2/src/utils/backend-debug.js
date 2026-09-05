// Backend Debug Utilities
// Utilities for debugging backend APIs and analyzing responses

/**
 * Backend request tracer
 */
class BackendDebugger {
  constructor() {
    this.requests = []
    this.errors = []
    this.performance = []
    this.maxRequests = 100
  }

  /**
   * Trace API request
   */
  traceRequest(endpoint, method, body, response, duration) {
    const request = {
      timestamp: new Date().toISOString(),
      endpoint,
      method,
      body: this.sanitize(body),
      status: response?.status,
      statusText: response?.statusText,
      duration,
      success: response?.ok
    }

    this.requests.push(request)
    if (this.requests.length > this.maxRequests) {
      this.requests.shift()
    }

    if (!response?.ok) {
      this.errors.push({
        ...request,
        error: response?.statusText,
        timestamp: new Date().toISOString()
      })
    }

    this.performance.push({
      endpoint,
      method,
      duration,
      status: response?.status,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Sanitize sensitive data from request body
   */
  sanitize(data) {
    if (!data) return data

    const sensitiveKeys = ['password', 'token', 'apiKey', 'secret']
    const sanitized = { ...data }

    for (const key of sensitiveKeys) {
      if (key in sanitized) {
        sanitized[key] = '[REDACTED]'
      }
    }

    return sanitized
  }

  /**
   * Get all requests
   */
  getRequests(filter = {}) {
    let filtered = [...this.requests]

    if (filter.method) {
      filtered = filtered.filter(r => r.method === filter.method)
    }

    if (filter.endpoint) {
      filtered = filtered.filter(r => r.endpoint.includes(filter.endpoint))
    }

    if (filter.status) {
      filtered = filtered.filter(r => r.status === filter.status)
    }

    if (filter.success !== undefined) {
      filtered = filtered.filter(r => r.success === filter.success)
    }

    return filtered
  }

  /**
   * Get errors
   */
  getErrors() {
    return [...this.errors]
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    if (this.performance.length === 0) {
      return {
        average: 0,
        min: 0,
        max: 0,
        median: 0,
        count: 0
      }
    }

    const durations = this.performance.map(p => p.duration).sort((a, b) => a - b)
    const sum = durations.reduce((a, b) => a + b, 0)

    return {
      average: Math.round(sum / durations.length),
      min: durations[0],
      max: durations[durations.length - 1],
      median: durations[Math.floor(durations.length / 2)],
      count: durations.length
    }
  }

  /**
   * Get slowest requests
   */
  getSlowestRequests(limit = 10) {
    return [...this.performance]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit)
  }

  /**
   * Get endpoints summary
   */
  getEndpointsSummary() {
    const summary = {}

    for (const req of this.requests) {
      const key = `${req.method} ${req.endpoint}`
      if (!summary[key]) {
        summary[key] = {
          count: 0,
          success: 0,
          errors: 0,
          avgDuration: 0,
          totalDuration: 0
        }
      }
      summary[key].count++
      if (req.success) summary[key].success++
      else summary[key].errors++
      summary[key].totalDuration += req.duration
      summary[key].avgDuration = Math.round(summary[key].totalDuration / summary[key].count)
    }

    return summary
  }

  /**
   * Generate detailed report
   */
  generateReport() {
    const summary = this.getEndpointsSummary()
    const perf = this.getPerformanceMetrics()
    const errors = this.getErrors()

    return {
      summary: {
        totalRequests: this.requests.length,
        successfulRequests: this.requests.filter(r => r.success).length,
        failedRequests: errors.length,
        successRate: Math.round((this.requests.filter(r => r.success).length / this.requests.length) * 100),
        timeRange: this.requests.length > 0 ? {
          start: this.requests[0].timestamp,
          end: this.requests[this.requests.length - 1].timestamp
        } : null
      },
      endpoints: summary,
      performance: perf,
      slowestEndpoints: this.getSlowestRequests(5),
      errors: errors.slice(-10) // Last 10 errors
    }
  }

  /**
   * Export as markdown report
   */
  exportMarkdown() {
    const report = this.generateReport()

    let md = `# Backend Debug Report\n\n`
    md += `Generated: ${new Date().toISOString()}\n\n`

    md += `## Summary\n`
    md += `- Total Requests: ${report.summary.totalRequests}\n`
    md += `- Successful: ${report.summary.successfulRequests}\n`
    md += `- Failed: ${report.summary.failedRequests}\n`
    md += `- Success Rate: ${report.summary.successRate}%\n\n`

    md += `## Performance Metrics\n`
    md += `- Average Duration: ${report.performance.average}ms\n`
    md += `- Min Duration: ${report.performance.min}ms\n`
    md += `- Max Duration: ${report.performance.max}ms\n`
    md += `- Median Duration: ${report.performance.median}ms\n\n`

    md += `## Endpoints\n`
    for (const [endpoint, stats] of Object.entries(report.endpoints)) {
      md += `### ${endpoint}\n`
      md += `- Calls: ${stats.count}\n`
      md += `- Success: ${stats.success}, Errors: ${stats.errors}\n`
      md += `- Avg Duration: ${stats.avgDuration}ms\n\n`
    }

    if (report.errors.length > 0) {
      md += `## Recent Errors\n`
      for (const err of report.errors) {
        md += `- \`${err.method} ${err.endpoint}\` (${err.status} ${err.statusText})\n`
      }
    }

    return md
  }

  /**
   * Export as JSON
   */
  exportJSON() {
    return JSON.stringify(this.generateReport(), null, 2)
  }

  /**
   * Clear all data
   */
  clear() {
    this.requests = []
    this.errors = []
    this.performance = []
  }

  /**
   * Print report to console
   */
  printReport() {
    console.group('📊 Backend Debug Report')
    console.table(this.generateReport().summary)
    console.table(this.generateReport().endpoints)
    console.table(this.generateReport().performance)
    console.groupEnd()
  }
}

// Export singleton
export default new BackendDebugger()
export { BackendDebugger }
