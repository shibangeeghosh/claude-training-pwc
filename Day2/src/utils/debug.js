// Debug Utility Module
// Provides debug logging, inspection, and development tools

import ENV from '../config/env'

/**
 * Debug configuration and utilities
 */
class DebugManager {
  constructor() {
    this.enabled = this.isDebugEnabled()
    this.startTime = Date.now()
    this.timers = new Map()
    this.logs = []
    this.maxLogs = 1000
  }

  /**
   * Check if debug mode is enabled
   */
  isDebugEnabled() {
    if (typeof window !== 'undefined') {
      // Browser environment
      return (
        localStorage.getItem('DEBUG_MODE') === 'true' ||
        window.__DEBUG_MODE__ === true ||
        ENV.IS_DEV
      )
    }
    // Node environment
    return process.env.DEBUG === 'true' || process.env.DEBUG_MODE === 'true'
  }

  /**
   * Enable debug mode
   */
  enable() {
    this.enabled = true
    if (typeof window !== 'undefined') {
      localStorage.setItem('DEBUG_MODE', 'true')
      window.__DEBUG_MODE__ = true
    } else {
      process.env.DEBUG = 'true'
    }
    console.info('🐛 Debug mode ENABLED')
  }

  /**
   * Disable debug mode
   */
  disable() {
    this.enabled = false
    if (typeof window !== 'undefined') {
      localStorage.removeItem('DEBUG_MODE')
      window.__DEBUG_MODE__ = false
    } else {
      process.env.DEBUG = 'false'
    }
    console.info('🐛 Debug mode DISABLED')
  }

  /**
   * Toggle debug mode
   */
  toggle() {
    if (this.enabled) {
      this.disable()
    } else {
      this.enable()
    }
  }

  /**
   * Debug log with timestamp and context
   */
  log(message, data = null, context = 'APP') {
    if (!this.enabled) return

    const timestamp = this.getTimestamp()
    const logEntry = {
      timestamp,
      context,
      message,
      data,
      level: 'DEBUG'
    }

    console.log(
      `%c[${timestamp}] %c${context}%c ${message}`,
      'color: gray; font-size: 11px;',
      'color: #0066CC; font-weight: bold;',
      'color: inherit;',
      data
    )

    this.addToLogs(logEntry)
  }

  /**
   * Info level logging
   */
  info(message, data = null, context = 'INFO') {
    if (!this.enabled) return

    const timestamp = this.getTimestamp()
    const logEntry = {
      timestamp,
      context,
      message,
      data,
      level: 'INFO'
    }

    console.info(
      `%c[${timestamp}] %c${context}%c ${message}`,
      'color: gray; font-size: 11px;',
      'color: #10b981; font-weight: bold;',
      'color: inherit;',
      data
    )

    this.addToLogs(logEntry)
  }

  /**
   * Warning level logging
   */
  warn(message, data = null, context = 'WARN') {
    if (!this.enabled) return

    const timestamp = this.getTimestamp()
    const logEntry = {
      timestamp,
      context,
      message,
      data,
      level: 'WARN'
    }

    console.warn(
      `%c[${timestamp}] %c${context}%c ${message}`,
      'color: gray; font-size: 11px;',
      'color: #f59e0b; font-weight: bold;',
      'color: inherit;',
      data
    )

    this.addToLogs(logEntry)
  }

  /**
   * Error level logging
   */
  error(message, error = null, context = 'ERROR') {
    if (!this.enabled) return

    const timestamp = this.getTimestamp()
    const logEntry = {
      timestamp,
      context,
      message,
      error: error?.message || error,
      stack: error?.stack,
      level: 'ERROR'
    }

    console.error(
      `%c[${timestamp}] %c${context}%c ${message}`,
      'color: gray; font-size: 11px;',
      'color: #ef4444; font-weight: bold;',
      'color: inherit;',
      error
    )

    this.addToLogs(logEntry)
  }

  /**
   * Inspect object or value
   */
  inspect(label, value) {
    if (!this.enabled) return

    console.group(`🔍 Inspect: ${label}`)
    console.table(value)
    console.groupEnd()

    this.log(`Inspected: ${label}`, value, 'INSPECT')
  }

  /**
   * Start a timer
   */
  time(label) {
    if (!this.enabled) return

    this.timers.set(label, performance.now())
    this.log(`Timer started: ${label}`, null, 'TIMER')
  }

  /**
   * End a timer and log duration
   */
  timeEnd(label) {
    if (!this.enabled) return

    const startTime = this.timers.get(label)
    if (!startTime) {
      console.warn(`Timer "${label}" not found`)
      return
    }

    const duration = (performance.now() - startTime).toFixed(2)
    this.timers.delete(label)

    const color = duration > 1000 ? '#ef4444' : duration > 100 ? '#f59e0b' : '#10b981'
    console.log(
      `%c⏱️ ${label}: ${duration}ms`,
      `color: ${color}; font-weight: bold;`
    )

    this.log(`Timer ended: ${label}`, { duration: `${duration}ms` }, 'TIMER')
  }

  /**
   * Profile function execution
   */
  profile(functionName) {
    if (!this.enabled) return

    console.profile(functionName)
    this.log(`Profiling started: ${functionName}`, null, 'PROFILE')
  }

  /**
   * End profiling
   */
  profileEnd(functionName) {
    if (!this.enabled) return

    console.profileEnd(functionName)
    this.log(`Profiling ended: ${functionName}`, null, 'PROFILE')
  }

  /**
   * Group related logs
   */
  group(label) {
    if (!this.enabled) return
    console.group(`📦 ${label}`)
  }

  /**
   * End log group
   */
  groupEnd() {
    if (!this.enabled) return
    console.groupEnd()
  }

  /**
   * Assert condition (like console.assert)
   */
  assert(condition, message, data = null) {
    if (!this.enabled) return

    if (!condition) {
      this.error(`Assertion failed: ${message}`, data, 'ASSERT')
    } else {
      this.log(`Assertion passed: ${message}`, data, 'ASSERT')
    }
  }

  /**
   * Trace stack
   */
  trace(message = 'Stack trace') {
    if (!this.enabled) return

    console.group(`📍 ${message}`)
    console.trace()
    console.groupEnd()

    this.log(message, null, 'TRACE')
  }

  /**
   * Get current timestamp
   */
  getTimestamp() {
    const elapsed = Date.now() - this.startTime
    return `${elapsed}ms`
  }

  /**
   * Add log entry to internal log buffer
   */
  addToLogs(logEntry) {
    this.logs.push(logEntry)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }
  }

  /**
   * Get all logs
   */
  getLogs() {
    return [...this.logs]
  }

  /**
   * Clear logs
   */
  clearLogs() {
    this.logs = []
    this.log('Logs cleared', null, 'SYSTEM')
  }

  /**
   * Export logs
   */
  exportLogs(format = 'json') {
    const logs = this.getLogs()

    if (format === 'json') {
      return JSON.stringify(logs, null, 2)
    }

    if (format === 'csv') {
      const headers = ['Timestamp', 'Context', 'Level', 'Message', 'Data']
      const rows = logs.map(log => [
        log.timestamp,
        log.context,
        log.level,
        log.message,
        JSON.stringify(log.data)
      ])
      return [headers, ...rows].map(row => row.join(',')).join('\n')
    }

    return logs
  }

  /**
   * Download logs as file
   */
  downloadLogs(filename = 'debug-logs.json') {
    if (typeof window === 'undefined') {
      console.warn('Download only available in browser')
      return
    }

    const logs = this.exportLogs('json')
    const blob = new Blob([logs], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    this.log(`Logs downloaded: ${filename}`, null, 'DOWNLOAD')
  }

  /**
   * Analyze performance metrics
   */
  analyzePerformance() {
    if (typeof window === 'undefined' || !this.enabled) return

    const metrics = {
      navigation: performance.getEntriesByType('navigation')[0],
      resources: performance.getEntriesByType('resource'),
      marks: performance.getEntriesByType('mark'),
      measures: performance.getEntriesByType('measure')
    }

    console.group('📊 Performance Analysis')
    console.table(metrics)
    console.groupEnd()

    return metrics
  }

  /**
   * Get debug status
   */
  getStatus() {
    return {
      enabled: this.enabled,
      uptime: Date.now() - this.startTime,
      logs: this.logs.length,
      timers: this.timers.size,
      environment: ENV.ENVIRONMENT
    }
  }

  /**
   * Print status
   */
  printStatus() {
    const status = this.getStatus()
    console.table(status)
    return status
  }
}

// Export singleton instance
export default new DebugManager()
export { DebugManager }
