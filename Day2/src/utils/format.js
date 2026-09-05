// Format & Query String Utilities
// Provides helpers for URL parameters, query strings, and data formatting

/**
 * Parse query string from URL or string
 * @param {string} queryString - Query string (with or without ?)
 * @returns {Object} Parsed query parameters as object
 */
export const parseQueryString = (queryString) => {
  if (!queryString) return {}

  const cleaned = queryString.startsWith('?') ? queryString.slice(1) : queryString
  if (!cleaned) return {}

  const params = new URLSearchParams(cleaned)
  const result = {}

  for (const [key, value] of params.entries()) {
    result[key] = decodeURIComponent(value)
  }

  return result
}

/**
 * Build query string from object
 * @param {Object} params - Parameters object
 * @returns {string} Formatted query string with ?
 */
export const buildQueryString = (params) => {
  if (!params || Object.keys(params).length === 0) return ''

  const encoded = Object.entries(params)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')

  return encoded ? `?${encoded}` : ''
}

/**
 * Update query parameter in current URL
 * @param {string} key - Parameter key
 * @param {string} value - Parameter value
 * @returns {string} Updated URL
 */
export const updateQueryParam = (key, value) => {
  const url = new URL(window.location.href)
  if (value === null || value === undefined || value === '') {
    url.searchParams.delete(key)
  } else {
    url.searchParams.set(key, value)
  }
  return url.toString()
}

/**
 * Get query parameter from current URL
 * @param {string} key - Parameter key
 * @param {string} defaultValue - Default if not found
 * @returns {string} Parameter value
 */
export const getQueryParam = (key, defaultValue = null) => {
  const params = new URLSearchParams(window.location.search)
  return params.get(key) ?? defaultValue
}

/**
 * Format compliance percentage for display
 * @param {number} percentage - Percentage value (0-100)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (percentage) => {
  if (typeof percentage !== 'number') return 'N/A'
  const rounded = Math.round(percentage)
  return `${rounded}%`
}

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} format - Format style ('short', 'long', 'time')
 * @returns {string} Formatted date
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return 'N/A'

  const dateObj = date instanceof Date ? date : new Date(date)
  if (isNaN(dateObj.getTime())) return 'Invalid date'

  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    time: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  }

  return dateObj.toLocaleDateString('en-US', options[format] || options.short)
}

/**
 * Format database connection string (safe for display)
 * @param {string} host - Database host
 * @param {number} port - Database port
 * @param {string} name - Database name
 * @returns {string} Formatted connection info
 */
export const formatDatabaseInfo = (host, port, name) => {
  return `${host}:${port}/${name}`
}

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (typeof str !== 'string') return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Format status to readable label
 * @param {string} status - Status value
 * @returns {string} Formatted status label
 */
export const formatStatus = (status) => {
  const statusMap = {
    pass: 'Compliant',
    warning: 'Warning',
    fail: 'Non-Compliant',
    compliant: 'Compliant',
    'non-compliant': 'Non-Compliant'
  }
  return statusMap[status?.toLowerCase()] || capitalize(status)
}

/**
 * Format number with thousands separator
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (typeof num !== 'number') return 'N/A'
  return num.toLocaleString('en-US')
}

/**
 * Create URL safe slug from string
 * @param {string} str - String to slugify
 * @returns {string} URL-safe slug
 */
export const slugify = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Truncate string with ellipsis
 * @param {string} str - String to truncate
 * @param {number} length - Max length
 * @returns {string} Truncated string
 */
export const truncate = (str, length = 50) => {
  if (typeof str !== 'string') return ''
  return str.length > length ? str.substring(0, length) + '...' : str
}

/**
 * Format ALCOA+ principle name
 * @param {string} principle - Principle ID
 * @returns {string} Formatted principle name
 */
export const formatPrinciple = (principle) => {
  const principleMap = {
    attributable: 'Attributable',
    legible: 'Legible',
    contemporaneous: 'Contemporaneous',
    original: 'Original',
    accurate: 'Accurate',
    complete: 'Complete',
    consistent: 'Consistent',
    enduring: 'Enduring'
  }
  return principleMap[principle?.toLowerCase()] || capitalize(principle)
}

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} Is valid URL
 */
export const isValidUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Get time ago string (e.g., "2 hours ago")
 * @param {Date|string} date - Date to compare
 * @returns {string} Relative time string
 */
export const getTimeAgo = (date) => {
  const dateObj = date instanceof Date ? date : new Date(date)
  const now = new Date()
  const seconds = Math.floor((now - dateObj) / 1000)

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  }

  for (const [name, value] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / value)
    if (interval >= 1) {
      return interval === 1 ? `1 ${name} ago` : `${interval} ${name}s ago`
    }
  }

  return 'Just now'
}

export default {
  parseQueryString,
  buildQueryString,
  updateQueryParam,
  getQueryParam,
  formatPercentage,
  formatDate,
  formatDatabaseInfo,
  capitalize,
  formatStatus,
  formatNumber,
  slugify,
  truncate,
  formatPrinciple,
  isValidEmail,
  isValidUrl,
  getTimeAgo
}
