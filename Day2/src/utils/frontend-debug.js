// Frontend Debug Utilities
// Utilities for debugging React components, performance, and accessibility

/**
 * Frontend component and performance debugger
 */
class FrontendDebugger {
  constructor() {
    this.componentRenders = []
    this.performanceMetrics = []
    this.accessibilityIssues = []
    this.stateChanges = []
    this.maxRecords = 500
  }

  /**
   * Track component render
   */
  trackRender(componentName, props, duration, memo = false) {
    const render = {
      timestamp: new Date().toISOString(),
      componentName,
      propsKeys: Object.keys(props || {}),
      propCount: Object.keys(props || {}).length,
      duration,
      memoized: memo,
      propsSerialized: this.serializeProps(props)
    }

    this.componentRenders.push(render)
    if (this.componentRenders.length > this.maxRecords) {
      this.componentRenders.shift()
    }

    this.performanceMetrics.push({
      type: 'render',
      componentName,
      duration,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Detect re-render loops
   */
  detectRerenderLoops(threshold = 5) {
    const loops = []
    const componentGroups = {}

    for (const render of this.componentRenders) {
      const key = render.componentName
      if (!componentGroups[key]) {
        componentGroups[key] = []
      }
      componentGroups[key].push(render)
    }

    for (const [component, renders] of Object.entries(componentGroups)) {
      if (renders.length >= threshold) {
        const recentRenders = renders.slice(-10)
        const avgDuration = recentRenders.reduce((sum, r) => sum + r.duration, 0) / recentRenders.length

        loops.push({
          component,
          renderCount: renders.length,
          averageDuration: Math.round(avgDuration),
          severity: renders.length > threshold * 2 ? 'critical' : 'high',
          suggestion: 'Consider memoization with useMemo/useCallback'
        })
      }
    }

    return loops
  }

  /**
   * Detect props drilling
   */
  detectPropsDrilling() {
    const drilling = []
    const maxPropsThreshold = 8

    for (const render of this.componentRenders) {
      if (render.propCount > maxPropsThreshold) {
        drilling.push({
          component: render.componentName,
          propCount: render.propCount,
          props: render.propsKeys,
          severity: render.propCount > maxPropsThreshold * 1.5 ? 'high' : 'medium',
          suggestion: 'Consider using Context API or custom hooks'
        })
      }
    }

    return drilling
  }

  /**
   * Serialize props for comparison
   */
  serializeProps(props) {
    if (!props) return ''
    const keys = Object.keys(props).sort()
    return keys.map(k => `${k}:${typeof props[k]}`).join('|')
  }

  /**
   * Track state changes
   */
  trackStateChange(component, stateName, oldValue, newValue, reason) {
    const change = {
      timestamp: new Date().toISOString(),
      component,
      stateName,
      changed: oldValue !== newValue,
      reason,
      type: typeof newValue
    }

    this.stateChanges.push(change)
    if (this.stateChanges.length > this.maxRecords) {
      this.stateChanges.shift()
    }
  }

  /**
   * Record accessibility issue
   */
  recordA11yIssue(type, severity, element, description, wcagLevel = 'A') {
    const issue = {
      timestamp: new Date().toISOString(),
      type,
      severity,
      element,
      description,
      wcagLevel,
      id: `A11Y-${this.accessibilityIssues.length + 1}`
    }

    this.accessibilityIssues.push(issue)
    if (this.accessibilityIssues.length > this.maxRecords) {
      this.accessibilityIssues.shift()
    }
  }

  /**
   * Check for common accessibility issues
   */
  scanAccessibility() {
    const issues = []

    // Check for images without alt text
    const images = document.querySelectorAll('img:not([alt])')
    images.forEach(img => {
      this.recordA11yIssue('missing-alt', 'high', img, 'Image missing alt text')
      issues.push({ type: 'missing-alt', count: images.length })
    })

    // Check for buttons without accessible names
    const buttons = document.querySelectorAll('button:not(:has(*))')
    buttons.forEach(btn => {
      if (!btn.textContent?.trim() && !btn.getAttribute('aria-label')) {
        this.recordA11yIssue('no-button-text', 'high', btn, 'Button missing accessible name')
      }
    })

    // Check for color contrast (simplified check)
    const textElements = document.querySelectorAll('p, span, a, button, h1, h2, h3, h4, h5, h6')
    textElements.forEach(el => {
      const style = window.getComputedStyle(el)
      const bgColor = style.backgroundColor
      const color = style.color
      if (bgColor && color) {
        if (!this.hasGoodContrast(bgColor, color)) {
          this.recordA11yIssue('low-contrast', 'medium', el, 'Insufficient color contrast')
        }
      }
    })

    // Check for missing form labels
    const inputs = document.querySelectorAll('input:not([type="hidden"])')
    inputs.forEach(input => {
      const label = document.querySelector(`label[for="${input.id}"]`)
      if (!label && !input.getAttribute('aria-label')) {
        this.recordA11yIssue('no-label', 'high', input, 'Form input missing label')
      }
    })

    // Check heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    let lastLevel = 0
    headings.forEach(h => {
      const level = parseInt(h.tagName[1])
      if (level > lastLevel + 1) {
        this.recordA11yIssue('heading-hierarchy', 'medium', h, `Heading hierarchy skip (${lastLevel} → ${level})`)
      }
      lastLevel = level
    })

    return issues
  }

  /**
   * Simple contrast check (simplified algorithm)
   */
  hasGoodContrast(bgColor, fgColor) {
    // Very simplified contrast check - would need more sophisticated algorithm
    // This is a placeholder for demonstration
    return true
  }

  /**
   * Get performance metrics summary
   */
  getPerformanceMetrics() {
    if (this.performanceMetrics.length === 0) {
      return {
        averageRenderTime: 0,
        slowestRender: 0,
        fastestRender: 0,
        medianRenderTime: 0,
        totalRenders: 0
      }
    }

    const renders = this.performanceMetrics
      .filter(m => m.type === 'render')
      .map(m => m.duration)
      .sort((a, b) => a - b)

    const sum = renders.reduce((a, b) => a + b, 0)
    const median = renders[Math.floor(renders.length / 2)]

    return {
      averageRenderTime: Math.round(sum / renders.length),
      slowestRender: renders[renders.length - 1],
      fastestRender: renders[0],
      medianRenderTime: median,
      totalRenders: renders.length,
      slowRenderCount: renders.filter(r => r > 16).length
    }
  }

  /**
   * Find slow rendering components
   */
  getSlowComponents(threshold = 16) {
    const componentPerf = {}

    for (const render of this.componentRenders) {
      const key = render.componentName
      if (!componentPerf[key]) {
        componentPerf[key] = {
          renders: [],
          count: 0
        }
      }
      componentPerf[key].renders.push(render.duration)
      componentPerf[key].count++
    }

    const slow = []
    for (const [component, data] of Object.entries(componentPerf)) {
      const avg = data.renders.reduce((a, b) => a + b, 0) / data.renders.length
      if (avg > threshold) {
        slow.push({
          component,
          averageDuration: Math.round(avg),
          renderCount: data.count,
          maxDuration: Math.max(...data.renders),
          severity: avg > threshold * 2 ? 'critical' : 'high'
        })
      }
    }

    return slow.sort((a, b) => b.averageDuration - a.averageDuration)
  }

  /**
   * Get accessibility summary
   */
  getA11ySummary() {
    return {
      total: this.accessibilityIssues.length,
      critical: this.accessibilityIssues.filter(a => a.severity === 'critical').length,
      high: this.accessibilityIssues.filter(a => a.severity === 'high').length,
      medium: this.accessibilityIssues.filter(a => a.severity === 'medium').length,
      low: this.accessibilityIssues.filter(a => a.severity === 'low').length,
      wcagAIssues: this.accessibilityIssues.filter(a => a.wcagLevel === 'A').length,
      wcagAAIssues: this.accessibilityIssues.filter(a => a.wcagLevel === 'AA').length,
      wcagAAAIssues: this.accessibilityIssues.filter(a => a.wcagLevel === 'AAA').length
    }
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    return {
      timestamp: new Date().toISOString(),
      renderingMetrics: this.getPerformanceMetrics(),
      slowComponents: this.getSlowComponents(),
      rerenderLoops: this.detectRerenderLoops(),
      propsDrilling: this.detectPropsDrilling(),
      accessibilityIssues: this.getA11ySummary(),
      stateChanges: this.stateChanges.length,
      totalRenders: this.componentRenders.length
    }
  }

  /**
   * Export as markdown report
   */
  exportMarkdown() {
    const report = this.generateReport()

    let md = `# Frontend Debug Report\n\n`
    md += `Generated: ${report.timestamp}\n\n`

    md += `## Rendering Performance\n`
    md += `- Average Render Time: ${report.renderingMetrics.averageRenderTime}ms\n`
    md += `- Fastest Render: ${report.renderingMetrics.fastestRender}ms\n`
    md += `- Slowest Render: ${report.renderingMetrics.slowestRender}ms\n`
    md += `- Total Renders: ${report.renderingMetrics.totalRenders}\n`
    md += `- Slow Renders (>16ms): ${report.renderingMetrics.slowRenderCount}\n\n`

    if (report.slowComponents.length > 0) {
      md += `## Slow Components\n`
      for (const comp of report.slowComponents) {
        md += `### ${comp.component}\n`
        md += `- Average Duration: ${comp.averageDuration}ms\n`
        md += `- Render Count: ${comp.renderCount}\n`
        md += `- Max Duration: ${comp.maxDuration}ms\n`
        md += `- Severity: ${comp.severity}\n\n`
      }
    }

    if (report.rerenderLoops.length > 0) {
      md += `## Re-render Issues\n`
      for (const loop of report.rerenderLoops) {
        md += `### ${loop.component}\n`
        md += `- Render Count: ${loop.renderCount}\n`
        md += `- Average Duration: ${loop.averageDuration}ms\n`
        md += `- Suggestion: ${loop.suggestion}\n\n`
      }
    }

    if (report.propsDrilling.length > 0) {
      md += `## Props Drilling\n`
      for (const drill of report.propsDrilling) {
        md += `### ${drill.component}\n`
        md += `- Props Count: ${drill.propCount}\n`
        md += `- Props: ${drill.props.join(', ')}\n`
        md += `- Suggestion: ${drill.suggestion}\n\n`
      }
    }

    const a11y = report.accessibilityIssues
    if (a11y.total > 0) {
      md += `## Accessibility Issues\n`
      md += `- Total Issues: ${a11y.total}\n`
      md += `- Critical: ${a11y.critical}\n`
      md += `- High: ${a11y.high}\n`
      md += `- Medium: ${a11y.medium}\n`
      md += `- Low: ${a11y.low}\n`
      md += `- WCAG A Issues: ${a11y.wcagAIssues}\n`
      md += `- WCAG AA Issues: ${a11y.wcagAAIssues}\n\n`
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
   * Get all accessibility issues
   */
  getA11yIssues() {
    return [...this.accessibilityIssues]
  }

  /**
   * Get component render history
   */
  getComponentHistory(componentName) {
    return this.componentRenders.filter(r => r.componentName === componentName)
  }

  /**
   * Get state change history
   */
  getStateHistory(component, stateName) {
    return this.stateChanges.filter(
      s => s.component === component && (!stateName || s.stateName === stateName)
    )
  }

  /**
   * Clear all data
   */
  clear() {
    this.componentRenders = []
    this.performanceMetrics = []
    this.accessibilityIssues = []
    this.stateChanges = []
  }

  /**
   * Print report to console
   */
  printReport() {
    console.group('🎨 Frontend Debug Report')
    console.table(this.generateReport())

    if (this.getSlowComponents().length > 0) {
      console.group('⚠️ Slow Components')
      console.table(this.getSlowComponents())
      console.groupEnd()
    }

    if (this.detectRerenderLoops().length > 0) {
      console.group('🔄 Re-render Issues')
      console.table(this.detectRerenderLoops())
      console.groupEnd()
    }

    if (this.accessibilityIssues.length > 0) {
      console.group('♿ Accessibility Issues')
      console.table(this.getA11ySummary())
      console.groupEnd()
    }

    console.groupEnd()
  }

  /**
   * Download report
   */
  downloadReport(filename = 'frontend-debug.md') {
    const content = this.exportMarkdown()
    const blob = new Blob([content], { type: 'text/markdown' })
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

export default new FrontendDebugger()
export { FrontendDebugger }
