// Apify MCP Service
// This service provides methods to interact with the Apify MCP server

const API_BASE_URL = process.env.VITE_APIFY_API_URL || 'http://localhost:3001'

class ApifyService {
  constructor() {
    this.baseUrl = API_BASE_URL
  }

  // Search for actors
  async searchActors(query, category = 'all', limit = 10) {
    try {
      const response = await fetch(`${this.baseUrl}/api/actors/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          category: category === 'all' ? null : category,
          limit,
        }),
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Search error:', error)
      throw error
    }
  }

  // Get actor details
  async getActorDetails(actorId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/actors/${actorId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get actor details: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Get details error:', error)
      throw error
    }
  }

  // Execute an actor
  async executeActor(actorId, input, apiToken) {
    try {
      const response = await fetch(`${this.baseUrl}/api/actors/${actorId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiToken}`,
        },
        body: JSON.stringify({ input }),
      })

      if (!response.ok) {
        throw new Error(`Execution failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Execution error:', error)
      throw error
    }
  }

  // Get execution results
  async getExecutionResults(runId, apiToken) {
    try {
      const response = await fetch(`${this.baseUrl}/api/runs/${runId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiToken}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get results: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Get results error:', error)
      throw error
    }
  }

  // Get actor categories
  async getCategories() {
    try {
      const response = await fetch(`${this.baseUrl}/api/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get categories: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Get categories error:', error)
      throw error
    }
  }

  // Test MCP server connection
  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
      })

      return response.ok
    } catch (error) {
      console.error('Connection test failed:', error)
      return false
    }
  }
}

export default new ApifyService()
