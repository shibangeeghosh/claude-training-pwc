import React, { useState } from 'react'
import { Search, Play, Info, Star, TrendingUp } from 'lucide-react'

export default function ApifySearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedActor, setSelectedActor] = useState(null)
  const [executionResults, setExecutionResults] = useState(null)
  const [apiToken, setApiToken] = useState('')
  const [showTokenInput, setShowTokenInput] = useState(false)

  // Mock actors data
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

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const filtered = mockActors.filter(
      (actor) =>
        (actor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          actor.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (category === 'all' || actor.category === category)
    )

    setSearchResults(filtered)
    setIsSearching(false)
  }

  const handleSelectActor = (actor) => {
    setSelectedActor(actor)
    setExecutionResults(null)
  }

  const handleExecuteActor = (actor) => {
    setExecutionResults({
      status: 'queued',
      actorId: actor.id,
      runId: `run-${Date.now()}`,
      createdAt: new Date().toISOString(),
      message: `Actor "${actor.name}" has been queued for execution.`,
    })
  }

  const getCategoryBadgeColor = (category) => {
    const colors = {
      DATA_EXTRACTION: 'bg-blue-100 text-blue-800',
      SOCIAL_MEDIA: 'bg-purple-100 text-purple-800',
      ECOMMERCE: 'bg-green-100 text-green-800',
      AUTOMATION: 'bg-orange-100 text-orange-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-eli-navy mb-4">Apify Actor Search</h2>
        <p className="text-gray-600 mb-6">
          Search and execute powerful web scraping and automation actors from the Apify Store
        </p>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search actors (e.g., 'web scraper', 'instagram')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eli-blue focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-2 bg-eli-blue text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eli-blue"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Found {searchResults.length} Actor{searchResults.length !== 1 ? 's' : ''}
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {searchResults.map((actor) => (
              <div
                key={actor.id}
                className="p-6 hover:bg-gray-50 cursor-pointer transition"
                onClick={() => handleSelectActor(actor)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-eli-navy mb-1">
                      {actor.name}
                    </h4>
                    <p className="text-gray-600 mb-3">{actor.description}</p>

                    <div className="flex gap-3 flex-wrap items-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(
                          actor.category
                        )}`}
                      >
                        {actor.category.replace('_', ' ')}
                      </span>

                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star size={16} fill="currentColor" />
                        <span className="text-sm font-medium">{actor.rating}</span>
                      </div>

                      <div className="flex items-center gap-1 text-gray-500">
                        <TrendingUp size={16} />
                        <span className="text-sm">{actor.runs.toLocaleString()} runs</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleExecuteActor(actor)
                    }}
                    className="ml-4 px-4 py-2 bg-eli-accent text-white rounded-lg font-medium hover:bg-cyan-600 flex items-center gap-2 whitespace-nowrap"
                  >
                    <Play size={16} />
                    Execute
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results Message */}
      {searchQuery && searchResults.length === 0 && !isSearching && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <Info className="mx-auto mb-3 text-blue-600" size={32} />
          <p className="text-gray-700">
            No actors found for "{searchQuery}
            {category !== 'all' ? `" in ${category.replace('_', ' ')}` : '"'}. Try a different search term.
          </p>
        </div>
      )}

      {/* Actor Details Panel */}
      {selectedActor && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-eli-navy">{selectedActor.name}</h3>
              <p className="text-gray-600 text-sm mt-1">{selectedActor.id}</p>
            </div>
            <button
              onClick={() => setSelectedActor(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Input Parameters</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {Object.entries(selectedActor.inputSchema).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="font-mono text-eli-blue font-medium">{key}</span>
                    <span className="text-gray-600 ml-2">- {value}</span>
                  </div>
                ))}
              </div>
            </div>

            {executionResults && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">Execution Status</h4>
                <p className="text-green-800 text-sm mb-2">{executionResults.message}</p>
                <div className="bg-white rounded p-2 text-xs font-mono text-gray-600 overflow-auto">
                  <div>Run ID: {executionResults.runId}</div>
                  <div>Status: {executionResults.status}</div>
                  <div>Created: {new Date(executionResults.createdAt).toLocaleString()}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!searchQuery && searchResults.length === 0 && (
        <div className="bg-gradient-to-br from-eli-light to-blue-50 rounded-lg p-12 text-center border border-blue-100">
          <Search className="mx-auto mb-4 text-eli-blue" size={48} />
          <h3 className="text-xl font-semibold text-eli-navy mb-2">
            Search for Apify Actors
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Use the search box above to find web scraping and automation tools. Browse by category or search by name.
          </p>
        </div>
      )}
    </div>
  )
}
