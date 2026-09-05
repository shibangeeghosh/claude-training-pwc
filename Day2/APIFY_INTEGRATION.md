# Apify MCP Integration Guide

This guide explains how to use the Apify MCP (Model Context Protocol) integration with the ALCOA+ QA Compliance Management System.

## Overview

The Apify MCP integration enables users to search for and execute Apify actors directly from the web application UI. This allows for web data extraction and automation tasks without leaving the compliance management system.

### Key Features

- **Actor Search**: Search through thousands of Apify actors by keyword or category
- **Actor Details**: View detailed information about each actor including input parameters
- **Execute Actors**: Run actors with custom configurations
- **Result Tracking**: Monitor execution status and retrieve results
- **Category Filtering**: Filter actors by type (Data Extraction, Social Media, E-Commerce, etc.)

## Architecture

### Components

1. **MCP Server** (`mcp-server-apify.js`)
   - Standalone Model Context Protocol server
   - Implements tool definitions for actor search and execution
   - Can be used with Claude Desktop or other MCP clients

2. **Backend Server** (`backend-server.js`)
   - Express.js REST API server
   - Bridges React frontend and MCP server
   - Provides HTTP endpoints for actor management

3. **React Component** (`src/components/ApifySearch.jsx`)
   - UI for searching and executing actors
   - Integrated as a tab in the main application
   - Real-time search and filtering

4. **API Service** (`src/services/apifyService.js`)
   - Client-side service for API communication
   - Handles authentication and error handling

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm or yarn
- Apify account (optional, for real API integration)

### Installation

1. Clone/download the project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your configuration:
   ```
   VITE_APIFY_API_URL=http://localhost:3001
   PORT=3001
   ```

### Running the Application

**Option 1: Run both servers concurrently**
```bash
npm run dev:full
```

**Option 2: Run servers separately**

Terminal 1 - Start backend API:
```bash
npm run server
```

Terminal 2 - Start frontend dev server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (default Vite port).

### Accessing Apify Search

1. Open the application in your browser
2. Click the "Apify Search" tab
3. Enter a search query (e.g., "web scraper", "instagram")
4. (Optional) Filter by category
5. Click "Search"
6. Browse results and click "Execute" to run an actor

## Using the MCP Server

### Standalone MCP Server

Run the MCP server directly:
```bash
node mcp-server-apify.js
```

### With Claude Desktop

1. Locate your Claude configuration:
   - **macOS**: `~/.claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the Apify MCP server:
   ```json
   {
     "mcpServers": {
       "apify": {
         "command": "node",
         "args": ["/path/to/mcp-server-apify.js"]
       }
     }
   }
   ```

3. Restart Claude Desktop

4. Use Claude to search and execute actors via the MCP interface

## API Endpoints

### Backend REST API

#### Search Actors
```
POST /api/actors/search
Content-Type: application/json

{
  "query": "web scraper",
  "category": "DATA_EXTRACTION",
  "limit": 10
}
```

Response:
```json
{
  "success": true,
  "query": "web scraper",
  "category": "DATA_EXTRACTION",
  "count": 1,
  "actors": [
    {
      "id": "apify/web-scraper",
      "name": "Web Scraper",
      "description": "Universal web scraper...",
      "category": "DATA_EXTRACTION",
      "rating": 4.8,
      "runs": 50000,
      "inputSchema": {...}
    }
  ]
}
```

#### Get Actor Details
```
GET /api/actors/:id
```

#### Execute Actor
```
POST /api/actors/:id/execute
Authorization: Bearer YOUR_API_TOKEN
Content-Type: application/json

{
  "input": {
    "startUrls": ["https://example.com"],
    "pageFunction": "..."
  }
}
```

Response:
```json
{
  "success": true,
  "status": "queued",
  "runId": "run-1234567890",
  "actorId": "apify/web-scraper",
  "createdAt": "2026-09-05T12:00:00Z"
}
```

#### Get Run Results
```
GET /api/runs/:runId
Authorization: Bearer YOUR_API_TOKEN
```

#### Get Categories
```
GET /api/categories
```

#### Health Check
```
GET /health
```

## Available Actors

The system includes mock data for these actors:

### Data Extraction
- **Web Scraper** - Universal scraper for any website
- **Google Search Scraper** - Extract search results
- **Amazon Product Scraper** - E-commerce product data

### Social Media
- **Instagram Scraper** - Posts, profiles, hashtags
- **LinkedIn Scraper** - Profile and job data
- **YouTube Scraper** - Video data and statistics

## Integration with Real Apify API

To connect to the actual Apify service:

1. Get your API token from https://apify.com/account/integrations

2. Update `.env`:
   ```
   APIFY_API_TOKEN=your_actual_token
   ```

3. Modify `backend-server.js` to call real Apify API:
   ```javascript
   async function searchActors(query, category, limit) {
     const response = await fetch('https://api.apify.com/v2/actors', {
       headers: {
         'Authorization': `Bearer ${process.env.APIFY_API_TOKEN}`,
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({ query, category, limit })
     })
     return response.json()
   }
   ```

4. Restart the backend server

## MCP Tools Reference

### search_actors
Search for Apify actors in the store.

**Parameters:**
- `query` (string, required): Search term
- `category` (string, optional): Filter by category
- `limit` (integer, optional): Max results (default: 10)

**Returns:** List of matching actors

### get_actor_details
Get comprehensive information about an actor.

**Parameters:**
- `actor_id` (string, required): Actor ID (e.g., "apify/web-scraper")

**Returns:** Detailed actor information including input schema

### execute_actor
Run an Apify actor with specified configuration.

**Parameters:**
- `actor_id` (string, required): Actor to execute
- `input` (object, required): Actor input configuration
- `token` (string, required): Apify API token

**Returns:** Execution details with run ID

## Troubleshooting

### Backend server won't start
```bash
# Check if port is already in use
lsof -i :3001

# Kill existing process
kill -9 <PID>

# Try different port
PORT=3002 npm run server
```

### Frontend can't connect to backend
- Ensure backend is running on the correct port
- Check VITE_APIFY_API_URL in .env
- Verify CORS is enabled (it is by default)
- Check browser console for errors

### MCP server errors
- Make sure Node.js is installed: `node --version`
- Check file permissions: `chmod +x mcp-server-apify.js`
- Ensure stdin/stdout are not redirected

### No actors found
- Try broader search terms
- Check category filter is appropriate
- Verify backend is responding: `curl http://localhost:3001/health`

## Development

### Adding More Actors

Edit the `mockActors` array in:
- `backend-server.js`
- `src/components/ApifySearch.jsx`
- `mcp-server-apify.js`

### Adding New Categories

Update the `categories` array in:
- `backend-server.js`
- `src/components/ApifySearch.jsx`

### Connecting Real API

Create a new service file:
```javascript
// src/services/apifyRealService.js
export async function searchActors(query, apiToken) {
  const response = await fetch('https://api.apify.com/v2/actors', {
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  })
  return response.json()
}
```

## Performance Tips

- Search results are limited to prevent overwhelming UI
- Use category filters to narrow results
- Monitor actor execution time for long-running tasks
- Cache frequently used actor configurations

## Security Considerations

- Never commit `.env` files with real API tokens
- Use environment variables for all sensitive data
- Validate user input on both frontend and backend
- Implement rate limiting for API calls
- Use HTTPS in production

## Support & Resources

- **Apify Docs**: https://docs.apify.com
- **MCP Specification**: https://mcpservers.org
- **Project Issues**: Check project repository

## Future Enhancements

- Real-time actor execution monitoring
- Result streaming for large datasets
- Actor recommendations based on usage
- Custom actor creation and deployment
- Integration with compliance data
- Scheduled actor execution
- Result caching and history
