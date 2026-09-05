/**
 * Rate Limiting Tests for API Client
 * Tests per-second rate limiting, batch concurrency, and endpoint-specific limits
 */

import { ApiClient, ApiResponse } from './client'

/**
 * Test 1: Per-second rate limiting
 */
async function testPerSecondRateLimiting() {
  console.log('Test 1: Per-second rate limiting (10 req/sec)')

  const client = new ApiClient('http://localhost:3000', {
    requestsPerSecond: 10,
    isDev: true
  })

  const startTime = Date.now()
  const mockRequests = Array(25).fill(null).map((_, i) =>
    client.get(`/api/test/${i}`)
  )

  // Mock fetch to avoid actual network calls
  global.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ success: true })
  })

  const results = await Promise.all(mockRequests)
  const duration = Date.now() - startTime

  console.log(`Completed 25 requests in ${duration}ms`)
  console.log(`Expected duration: ~2500ms (2.5 seconds for 25 at 10 req/sec)`)
  console.log(`All successful: ${results.every(r => r.success)}`)
  console.log(`---\n`)
}

/**
 * Test 2: Batch concurrency limiting
 */
async function testBatchConcurrency() {
  console.log('Test 2: Batch concurrency limiting (5 max concurrent)')

  const client = new ApiClient('http://localhost:3000', {
    maxConcurrentRequests: 5,
    isDev: true
  })

  const concurrentTracker = { max: 0, current: 0 }

  // Mock fetch to track concurrency
  let callCount = 0
  global.fetch = async () => {
    callCount++
    concurrentTracker.current++
    concurrentTracker.max = Math.max(concurrentTracker.max, concurrentTracker.current)

    await new Promise(resolve => setTimeout(resolve, 100))
    concurrentTracker.current--

    return {
      ok: true,
      status: 200,
      json: async () => ({ id: callCount, success: true })
    }
  }

  const mockRequests = Array(15).fill(null).map((_, i) =>
    client.post(`/api/test`, { id: i })
  )

  const startTime = Date.now()
  const results = await client.batch(mockRequests)
  const duration = Date.now() - startTime

  console.log(`Completed batch of 15 requests in ${duration}ms`)
  console.log(`Max concurrent requests: ${concurrentTracker.max}`)
  console.log(`Expected: 5, Actual: ${concurrentTracker.max}`)
  console.log(`All successful: ${results.every(r => r.success)}`)
  console.log(`---\n`)
}

/**
 * Test 3: Endpoint-specific rate limiting
 */
async function testEndpointSpecificLimit() {
  console.log('Test 3: Endpoint-specific rate limiting')

  const client = new ApiClient('http://localhost:3000', {
    requestsPerSecond: 10,
    endpointLimits: {
      '/api/upload': { requestsPerSecond: 2 }
    },
    isDev: true
  })

  global.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ success: true })
  })

  console.log('Sending 5 requests to /api/upload (limited to 2 req/sec)')
  const startTime = Date.now()

  const uploadRequests = Array(5).fill(null).map(() =>
    client.post('/api/upload', { data: 'test' })
  )

  const results = await Promise.all(uploadRequests)
  const duration = Date.now() - startTime

  console.log(`Completed 5 requests in ${duration}ms`)
  console.log(`Expected duration: ~2000ms (5 at 2 req/sec)`)
  console.log(`All successful: ${results.every(r => r.success)}`)
  console.log(`---\n`)
}

/**
 * Test 4: Configuration changes
 */
async function testConfigurationChanges() {
  console.log('Test 4: Configuration changes after initialization')

  const client = new ApiClient('http://localhost:3000', {
    requestsPerSecond: 10,
    isDev: true
  })

  console.log(`Initial limit: ${client.requestsPerSecond} req/sec`)

  client.configureRateLimiting({ requestsPerSecond: 20 })
  console.log(`After reconfigure: ${client.requestsPerSecond} req/sec`)

  client.setEndpointLimit('/api/slow', 1)
  console.log(`Added endpoint limit: /api/slow = 1 req/sec`)
  console.log(`Endpoint limits: ${Object.keys(client.endpointLimits).join(', ')}`)
  console.log(`---\n`)
}

/**
 * Test 5: Error handling in batch
 */
async function testBatchErrorHandling() {
  console.log('Test 5: Batch error handling')

  const client = new ApiClient('http://localhost:3000', {
    maxConcurrentRequests: 5,
    isDev: false // Disable logging for cleaner output
  })

  let callCount = 0
  global.fetch = async () => {
    callCount++
    if (callCount % 3 === 0) {
      // Simulate error for every 3rd request
      throw new Error('Simulated network error')
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({ id: callCount, success: true })
    }
  }

  const mockRequests = Array(9).fill(null).map((_, i) =>
    client.post(`/api/test`, { id: i })
  )

  const results = await client.batch(mockRequests)
  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length

  console.log(`Total requests: ${results.length}`)
  console.log(`Successful: ${successful}`)
  console.log(`Failed: ${failed}`)
  console.log(`Batch handled errors gracefully: ${failed > 0 && successful > 0}`)
  console.log(`---\n`)
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('=== API Client Rate Limiting Tests ===\n')

  try {
    await testPerSecondRateLimiting()
    await testBatchConcurrency()
    await testEndpointSpecificLimit()
    await testConfigurationChanges()
    await testBatchErrorHandling()

    console.log('=== All tests completed ===')
  } catch (error) {
    console.error('Test failed:', error)
  }
}

// Run tests if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
}

export {
  testPerSecondRateLimiting,
  testBatchConcurrency,
  testEndpointSpecificLimit,
  testConfigurationChanges,
  testBatchErrorHandling
}
