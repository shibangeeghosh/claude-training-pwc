// CLI Debug Tool
// Command-line interface for debug operations

/**
 * Parse command line arguments
 */
export const parseArgs = (args) => {
  const result = {
    flags: {},
    commands: [],
    debug: false
  }

  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=')
      result.flags[key] = value || true
      if (key === 'debug') {
        result.debug = true
      }
    } else if (arg.startsWith('-')) {
      result.flags[arg.substring(1)] = true
      if (arg === '-d') {
        result.debug = true
      }
    } else {
      result.commands.push(arg)
    }
  }

  return result
}

/**
 * Print debug header
 */
export const printDebugHeader = () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║         🐛 ALCOA+ QA Debug Mode - Claude Debugging        ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `)
}

/**
 * Print debug help
 */
export const printDebugHelp = () => {
  console.log(`
Debug Mode Commands:

  --debug                Enable debug mode
  --debug=verbose        Enable verbose debug logging
  --debug=profile        Enable performance profiling
  --debug=trace          Enable stack traces
  --debug=inspect        Enable object inspection

Browser Console Debug Commands:

  debug.enable()         Enable debug mode
  debug.disable()        Disable debug mode
  debug.toggle()         Toggle debug mode

Logging Functions:

  debug.log(msg, data)   Log debug message
  debug.info(msg, data)  Log info message
  debug.warn(msg, data)  Log warning message
  debug.error(msg, err)  Log error message

Performance Analysis:

  debug.time(label)      Start timer
  debug.timeEnd(label)   End timer and log duration
  debug.profile(name)    Start profiling
  debug.profileEnd(name) End profiling

Utilities:

  debug.inspect(label, value)  Inspect object/value
  debug.trace(msg)             Print stack trace
  debug.assert(condition, msg) Assert condition
  debug.group(label)           Start log group
  debug.groupEnd()             End log group

Log Management:

  debug.getLogs()             Get all logs
  debug.clearLogs()           Clear all logs
  debug.exportLogs(format)    Export logs (json/csv)
  debug.downloadLogs(name)    Download logs as file
  debug.getStatus()           Get debug status
  debug.printStatus()         Print status to console

Examples:

  // Enable debugging
  > npm run dev -- --debug

  // Use in browser console
  > debug.enable()
  > debug.log('My message', { data: 'value' })
  > debug.time('myOperation')
  > // ... do something ...
  > debug.timeEnd('myOperation')
  > debug.downloadLogs()

  `)
}

/**
 * Apply debug flags to environment
 */
export const applyDebugFlags = (flags) => {
  const config = {
    verbose: flags.verbose === true || flags.verbose === 'true',
    profile: flags.profile === true || flags.profile === 'true',
    trace: flags.trace === true || flags.trace === 'true',
    inspect: flags.inspect === true || flags.inspect === 'true',
    timestamps: true
  }

  if (typeof window !== 'undefined') {
    window.__DEBUG_CONFIG__ = config
  } else {
    global.__DEBUG_CONFIG__ = config
  }

  return config
}

/**
 * Initialize debug mode
 */
export const initDebugMode = (args = []) => {
  const parsed = parseArgs(args)

  if (parsed.debug) {
    printDebugHeader()
    const config = applyDebugFlags(parsed.flags)

    console.log('Debug Configuration:')
    console.table(config)

    if (parsed.flags.help || parsed.flags.h) {
      printDebugHelp()
    }

    return config
  }

  return null
}

/**
 * Hook for pre-commit validation (no debug left in code)
 */
export const validateNoDebugCode = (fileContent) => {
  const debugPatterns = [
    /debug\.enable\(\)/g,
    /debug\.disable\(\)/g,
    /debug\.log\(/g,
    /debug\.info\(/g,
    /debug\.warn\(/g,
    /debug\.error\(/g,
    /debugger\s*;?/g,
    /console\.log\(/g,
    /console\.debug\(/g,
    /console\.trace\(/g
  ]

  const violations = []

  for (const pattern of debugPatterns) {
    const matches = fileContent.match(pattern)
    if (matches) {
      violations.push(...matches.map(m => ({
        pattern: m,
        message: 'Debug statement detected - remove before committing'
      })))
    }
  }

  return violations
}

export default {
  parseArgs,
  printDebugHeader,
  printDebugHelp,
  applyDebugFlags,
  initDebugMode,
  validateNoDebugCode
}
