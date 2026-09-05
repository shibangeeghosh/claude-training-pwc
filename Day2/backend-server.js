#!/usr/bin/env node

import express from 'express'
import cors from 'cors'
import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Mock actors data (same as in MCP server)
const mockActors = [
  {
    id: 'apify/web-scraper',
    name: 'Web Scraper',
    description: 'Universal web scraper for extracting data from any website',
    category: 'DATA_EXTRACTION',
    rating: 4.8,
    runs: 50000,
    inputSchema: {
      startUrls: 'Array of URLs to scrape',
      pageFunction: 'JavaScript function for data extraction',
      proxyConfiguration: 'Proxy settings for anonymous scraping',
    },
  },
  {
    id: 'apify/google-search-scraper',
    name: 'Google Search Scraper',
    description: 'Scrapes Google Search results for keywords',
    category: 'DATA_EXTRACTION',
    rating: 4.7,
    runs: 30000,
    inputSchema: {
      queries: 'Array of search queries',
      resultsPerPage: 'Number of results per query',
      maxPages: 'Maximum pages to scrape',
    },
  },
  {
    id: 'apify/instagram-scraper',
    name: 'Instagram Scraper',
    description: 'Scrapes Instagram posts, profiles, and hashtags',
    category: 'SOCIAL_MEDIA',
    rating: 4.6,
    runs: 20000,
    inputSchema: {
      startUrls: 'Instagram URLs to scrape',
      maxPostsPerHandle: 'Maximum posts per account',
      downloadMedia: 'Download images and videos',
    },
  },
  {
    id: 'apify/amazon-product-scraper',
    name: 'Amazon Product Scraper',
    description: 'Extracts product information from Amazon',
    category: 'ECOMMERCE',
    rating: 4.9,
    runs: 40000,
    inputSchema: {
      searchTerm: 'Product search term',
      maxResults: 'Maximum products to extract',
      includeReviews: 'Include customer reviews',
    },
  },
  {
    id: 'apify/linkedin-scraper',
    name: 'LinkedIn Profile Scraper',
    description: 'Scrapes LinkedIn profile and job information',
    category: 'SOCIAL_MEDIA',
    rating: 4.5,
    runs: 15000,
    inputSchema: {
      profileUrls: 'LinkedIn profile URLs',
      includeConnections: 'Include connection data',
      maxPages: 'Maximum pages to scrape',
    },
  },
  {
    id: 'apify/youtube-scraper',
    name: 'YouTube Scraper',
    description: 'Extract video data, comments, and statistics from YouTube',
    category: 'SOCIAL_MEDIA',
    rating: 4.7,
    runs: 25000,
    inputSchema: {
      searchQueries: 'Video search queries',
      maxVideos: 'Maximum videos to extract',
      includeComments: 'Include comment data',
    },
  },
]

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'DATA_EXTRACTION', label: 'Data Extraction' },
  { value: 'SOCIAL_MEDIA', label: 'Social Media' },
  { value: 'ECOMMERCE', label: 'E-Commerce' },
  { value: 'AUTOMATION', label: 'Automation' },
]

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Search actors
app.post('/api/actors/search', (req, res) => {
  try {
    const { query, category, limit = 10 } = req.body

    if (!query) {
      return res.status(400).json({ error: 'Query is required' })
    }

    const filtered = mockActors.filter(
      (actor) =>
        (actor.name.toLowerCase().includes(query.toLowerCase()) ||
          actor.description.toLowerCase().includes(query.toLowerCase())) &&
        (!category || actor.category === category)
    )

    const results = filtered.slice(0, Math.min(limit, 50))

    res.json({
      success: true,
      query,
      category,
      count: results.length,
      actors: results,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get actor details
app.get('/api/actors/:id', (req, res) => {
  try {
    const { id } = req.params
    const actor = mockActors.find((a) => a.id === id)

    if (!actor) {
      return res.status(404).json({ error: `Actor not found: ${id}` })
    }

    res.json({ success: true, actor })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Execute actor
app.post('/api/actors/:id/execute', (req, res) => {
  try {
    const { id } = req.params
    const { input } = req.body
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'API token required' })
    }

    const actor = mockActors.find((a) => a.id === id)
    if (!actor) {
      return res.status(404).json({ error: `Actor not found: ${id}` })
    }

    const runId = `run-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    res.json({
      success: true,
      status: 'queued',
      actorId: id,
      runId,
      input,
      createdAt: new Date().toISOString(),
      message: `Actor "${actor.name}" has been queued for execution.`,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get run results
app.get('/api/runs/:runId', (req, res) => {
  try {
    const { runId } = req.params
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'API token required' })
    }

    res.json({
      success: true,
      runId,
      status: 'succeeded',
      message: 'Results available',
      datasetId: `dataset-${Date.now()}`,
      recordCount: Math.floor(Math.random() * 100) + 10,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get categories
app.get('/api/categories', (req, res) => {
  try {
    res.json({
      success: true,
      categories,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get all actors
app.get('/api/actors', (req, res) => {
  try {
    res.json({
      success: true,
      count: mockActors.length,
      actors: mockActors,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  })
})

app.listen(PORT, () => {
  console.log(`Apify Backend Server running on http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
  console.log(`API endpoints:`)
  console.log(`  POST   /api/actors/search - Search for actors`)
  console.log(`  GET    /api/actors - Get all actors`)
  console.log(`  GET    /api/actors/:id - Get actor details`)
  console.log(`  POST   /api/actors/:id/execute - Execute an actor`)
  console.log(`  GET    /api/runs/:runId - Get run results`)
  console.log(`  GET    /api/categories - Get available categories`)
})
