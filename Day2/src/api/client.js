// API Client with async/await and Rate Limiting
// Centralized HTTP request handler with built-in DoS protection

import ENV from '../config/env'

/**
 * API response wrapper
 */
class ApiResponse {
  constructor(data, status = 200, error = null, retryAfter = null) {
    this.success = !error
    this.data = data
    this.status = status
    this.error = error
    this.timestamp = new Date().toISOString()
    this.retryAfter = retryAfter
  }
}

/**
 * Rate limiter for per-second request throttling
 * Prevents overwhelming the API with too many requests
 */
class RateLimiter {
  /**
   * Initialize rate limiter
   * @param {number} maxRequestsPerSecond - Maximum requests allowed per second
   */
  constructor(maxRequestsPerSecond = 10) {
    this.maxRequests = maxRequestsPerSecond
    this.requestTimestamps = []
  }

  /**
   * Try to acquire a request slot
   * @returns {Promise<Object>} {allowed: boolean, retryAfter: number}
   */
  async acquire() {
    const now = Date.now()
    const oneSecondAgo = now - 1000

    // Remove timestamps older than 1 second window
    this.requestTimestamps = this.requestTimestamps.filter(t => t > oneSecondAgo)

    // If we have available slots, grant the request
    if (this.requestTimestamps.length < this.maxRequests) {
      this.requestTimestamps.push(now)
      return { allowed: true, retryAfter: 0 }
    }

    // Calculate how long to wait until oldest request expires
    const oldestTimestamp = this.requestTimestamps[0]
    const waitTime = Math.ceil(1000 - (now - oldestTimestamp)) + 1
    return { allowed: false, retryAfter: waitTime }
  }
}

/**
 * Concurrency limiter for batch operations
 * Prevents resource exhaustion from too many simultaneous requests
 */
class ConcurrencyLimiter {
  /**
   * Initialize concurrency limiter
   * @param {number} maxConcurrent - Maximum concurrent requests allowed
   */
  constructor(maxConcurrent = 5) {
    this.maxConcurrent = maxConcurrent
    this.activeCount = 0
    this.waitQueue = []
  }

  /**
   * Acquire a concurrency slot, waiting if necessary
   */
  async acquire() {
    if (this.activeCount < this.maxConcurrent) {
      this.activeCount++
      return
    }

    // Wait until a slot becomes available
    await new Promise(resolve => this.waitQueue.push(resolve))
    this.activeCount++
  }

  /**
   * Release a concurrency slot and wake up waiting requests
   */
  release() {
    this.activeCount--
    const resolve = this.waitQueue.shift()
    if (resolve) {
      resolve()
    }
  }
}

/**
 * Main API client with rate limiting and DoS protection
 */
class ApiClient {
  /**
   * Initialize API client with optional rate limiting configuration
   * @param {string} baseURL - Base URL for API requests
   * @param {Object} options - Configuration options
   * @param {number} options.requestsPerSecond - Max requests per second (default: 10)
   * @param {number} options.maxConcurrentRequests - Max concurrent batch requests (default: 5)
   * @param {Object} options.endpointLimits - Per-endpoint rate limit configurations
   * @param {boolean} options.isDev - Enable development logging (default: auto-detect)
   */
  constructor(baseURL = ENV.API_BASE_URL, options = {}) {
    this.baseURL = baseURL
    this.timeout = 30000
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }

    // Initialize rate limiting
    this.requestsPerSecond = options.requestsPerSecond || 10
    this.maxConcurrentRequests = options.maxConcurrentRequests || 5
    this.rateLimiter = new RateLimiter(this.requestsPerSecond)
    this.concurrencyLimiter = new ConcurrencyLimiter(this.maxConcurrentRequests)

    // Per-endpoint rate limits (e.g., { '/api/v1/upload': { limit: 2 } })
    this.endpointLimits = {}
    if (options.endpointLimits) {
      Object.entries(options.endpointLimits).forEach(([endpoint, config]) => {
        this.endpointLimits[endpoint] = {
          limiter: new RateLimiter(config.requestsPerSecond || this.requestsPerSecond),
          config
        }
      })
    }

    // Development logging (auto-detect if not specified)
    this.isDev = options.isDev !== false &&
      (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development')
  }

  /**
   * Configure rate limiting after initialization
   * @param {Object} options - Rate limit options
   * @param {number} options.requestsPerSecond - Max requests per second
   * @param {number} options.maxConcurrentRequests - Max concurrent requests
   */
  configureRateLimiting(options = {}) {
    if (options.requestsPerSecond) {
      this.requestsPerSecond = options.requestsPerSecond
      this.rateLimiter = new RateLimiter(this.requestsPerSecond)
    }
    if (options.maxConcurrentRequests) {
      this.maxConcurrentRequests = options.maxConcurrentRequests
      this.concurrencyLimiter = new ConcurrencyLimiter(this.maxConcurrentRequests)
    }
  }

  /**
   * Add or update endpoint-specific rate limit
   * @param {string} endpoint - Endpoint pattern (e.g., '/api/v1/upload')
   * @param {number} requestsPerSecond - Max requests per second for this endpoint
   */
  setEndpointLimit(endpoint, requestsPerSecond) {
    this.endpointLimits[endpoint] = {
      limiter: new RateLimiter(requestsPerSecond),
      config: { requestsPerSecond }
    }
  }

  /**
   * Find matching endpoint-specific rate limiter
   * @param {string} endpoint - The requested endpoint
   * @returns {RateLimiter|null} Matching rate limiter or null
   */
  findEndpointLimiter(endpoint) {
    // Try exact match first
    if (this.endpointLimits[endpoint]) {
      return this.endpointLimits[endpoint].limiter
    }

    // Try pattern matching (simple prefix matching)
    for (const [pattern, config] of Object.entries(this.endpointLimits)) {
      if (endpoint.startsWith(pattern)) {
        return config.limiter
      }
    }

    return null
  }

  /**
   * Enforce rate limiting for a request
   * Waits if necessary and returns rate limit info
   * @param {string} endpoint - The endpoint being requested
   * @param {string} method - HTTP method
   * @returns {Promise<Object>} Rate limit result with retryAfter info
   */
  async enforceRateLimit(endpoint, method) {
    // Check endpoint-specific limiter first
    const endpointLimiter = this.findEndpointLimiter(endpoint)
    const limiter = endpointLimiter || this.rateLimiter

    const result = await limiter.acquire()

    if (!result.allowed) {
      if (this.isDev) {
        console.warn(
          `[RateLimit] ${method} ${endpoint} throttled. ` +
          `Wait ${result.retryAfter}ms before retry.`
        )
      }

      // Wait the required time before retrying
      await new Promise(resolve => setTimeout(resolve, result.retryAfter))

      // Recursively retry after waiting
      return this.enforceRateLimit(endpoint, method)
    }

    return result
  }

  /**
   * Get authorization token from storage
   */
  async getToken() {
    try {
      const token = localStorage.getItem('auth_token')
      return token || null
    } catch (err) {
      console.warn('Error retrieving token:', err.message)
      return null
    }
  }

  /**
   * Build headers with authentication
   */
  async buildHeaders(customHeaders = {}) {
    const token = await this.getToken()
    const headers = { ...this.defaultHeaders, ...customHeaders }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  /**
   * Build full URL
   */
  buildURL(endpoint) {
    if (endpoint.startsWith('http')) {
      return endpoint
    }
    return `${this.baseURL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`
  }

  /**
   * Handle API errors
   */
  handleError(error, context = {}) {
    const apiError = {
      message: error.message || 'Unknown error',
      code: error.code || 'UNKNOWN_ERROR',
      status: error.status || 500,
      context
    }

    console.error('API Error:', apiError)
    return apiError
  }

  /**
   * Make GET request with rate limiting
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<ApiResponse>} API response with rate limit info
   */
  async get(endpoint, options = {}) {
    try {
      // Enforce rate limiting
      await this.enforceRateLimit(endpoint, 'GET')

      const url = this.buildURL(endpoint)
      const headers = await this.buildHeaders(options.headers)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
        ...options
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`)
        error.status = response.status
        throw error
      }

      const data = await response.json()
      return new ApiResponse(data, response.status)
    } catch (err) {
      return new ApiResponse(
        null,
        err.status || 500,
        this.handleError(err, { endpoint, method: 'GET' })
      )
    }
  }

  /**
   * Make POST request with rate limiting
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @param {Object} options - Request options
   * @returns {Promise<ApiResponse>} API response with rate limit info
   */
  async post(endpoint, body = {}, options = {}) {
    try {
      // Enforce rate limiting
      await this.enforceRateLimit(endpoint, 'POST')

      const url = this.buildURL(endpoint)
      const headers = await this.buildHeaders(options.headers)

      // Add idempotency key for create operations
      if (!headers['Idempotency-Key']) {
        headers['Idempotency-Key'] = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
        ...options
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`)
        error.status = response.status
        throw error
      }

      const data = await response.json()
      return new ApiResponse(data, response.status)
    } catch (err) {
      return new ApiResponse(
        null,
        err.status || 500,
        this.handleError(err, { endpoint, method: 'POST', bodyKeys: Object.keys(body) })
      )
    }
  }

  /**
   * Make PUT request with rate limiting
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @param {Object} options - Request options
   * @returns {Promise<ApiResponse>} API response with rate limit info
   */
  async put(endpoint, body = {}, options = {}) {
    try {
      // Enforce rate limiting
      await this.enforceRateLimit(endpoint, 'PUT')

      const url = this.buildURL(endpoint)
      const headers = await this.buildHeaders(options.headers)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
        ...options
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`)
        error.status = response.status
        throw error
      }

      const data = await response.json()
      return new ApiResponse(data, response.status)
    } catch (err) {
      return new ApiResponse(
        null,
        err.status || 500,
        this.handleError(err, { endpoint, method: 'PUT' })
      )
    }
  }

  /**
   * Make PATCH request with rate limiting
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @param {Object} options - Request options
   * @returns {Promise<ApiResponse>} API response with rate limit info
   */
  async patch(endpoint, body = {}, options = {}) {
    try {
      // Enforce rate limiting
      await this.enforceRateLimit(endpoint, 'PATCH')

      const url = this.buildURL(endpoint)
      const headers = await this.buildHeaders(options.headers)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
        ...options
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`)
        error.status = response.status
        throw error
      }

      const data = await response.json()
      return new ApiResponse(data, response.status)
    } catch (err) {
      return new ApiResponse(
        null,
        err.status || 500,
        this.handleError(err, { endpoint, method: 'PATCH' })
      )
    }
  }

  /**
   * Make DELETE request with rate limiting
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<ApiResponse>} API response with rate limit info
   */
  async delete(endpoint, options = {}) {
    try {
      // Enforce rate limiting
      await this.enforceRateLimit(endpoint, 'DELETE')

      const url = this.buildURL(endpoint)
      const headers = await this.buildHeaders(options.headers)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(url, {
        method: 'DELETE',
        headers,
        signal: controller.signal,
        ...options
      })

      clearTimeout(timeoutId)

      if (!response.ok && response.status !== 204) {
        const error = new Error(`HTTP ${response.status}`)
        error.status = response.status
        throw error
      }

      const data = response.status === 204 ? null : await response.json()
      return new ApiResponse(data, response.status)
    } catch (err) {
      return new ApiResponse(
        null,
        err.status || 500,
        this.handleError(err, { endpoint, method: 'DELETE' })
      )
    }
  }

  /**
   * Retry failed request with exponential backoff
   */
  async retry(fn, maxRetries = 3, delay = 1000) {
    let lastError

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await fn()
        if (result.success || result.status < 500) {
          return result
        }
        lastError = result.error
      } catch (err) {
        lastError = err
      }

      if (attempt < maxRetries - 1) {
        const backoffDelay = delay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, backoffDelay))
      }
    }

    return new ApiResponse(null, 500, lastError)
  }

  /**
   * Execute batch requests with concurrency limiting
   * Prevents resource exhaustion from too many simultaneous requests
   * @param {Array<Promise>} requests - Array of request promises
   * @param {Object} options - Batch options
   * @param {number} options.maxConcurrent - Override max concurrent requests for this batch
   * @returns {Promise<Array<ApiResponse>>} Array of responses with rate limit info
   */
  async batch(requests, options = {}) {
    try {
      if (!Array.isArray(requests) || requests.length === 0) {
        throw new Error('Requests must be a non-empty array')
      }

      // Use provided concurrency limit or default
      const maxConcurrent = options.maxConcurrent || this.maxConcurrentRequests

      if (maxConcurrent >= requests.length) {
        // If limit allows, execute all in parallel
        const results = await Promise.allSettled(requests)
        return results.map(result => {
          if (result.status === 'fulfilled') {
            return result.value
          } else {
            return new ApiResponse(
              null,
              500,
              this.handleError(result.reason, { context: 'batch' })
            )
          }
        })
      }

      // Otherwise, enforce concurrency limits
      if (this.isDev) {
        console.info(
          `[Batch] Processing ${requests.length} requests ` +
          `with max ${maxConcurrent} concurrent`
        )
      }

      const results = new Array(requests.length)
      const executing = []

      for (let i = 0; i < requests.length; i++) {
        const request = requests[i]

        // Create a promise that respects concurrency limits
        const slotPromise = (async () => {
          await this.concurrencyLimiter.acquire()
          try {
            const result = await request
            results[i] = result
          } catch (err) {
            results[i] = new ApiResponse(
              null,
              500,
              this.handleError(err, { context: 'batch' })
            )
          } finally {
            this.concurrencyLimiter.release()
          }
        })()

        executing.push(slotPromise)

        // If we have enough executing, wait for one to complete
        if (executing.length >= maxConcurrent) {
          await Promise.race(executing)
          executing.splice(0, 1)
        }
      }

      // Wait for all remaining to complete
      await Promise.all(executing)

      return results
    } catch (err) {
      if (this.isDev) {
        console.error('[Batch] Error:', err.message)
      }
      return [new ApiResponse(
        null,
        500,
        this.handleError(err, { context: 'batch' })
      )]
    }
  }
}

// Export singleton instance
export default new ApiClient()
export { ApiClient, ApiResponse }
