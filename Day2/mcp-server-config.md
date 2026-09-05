# Apify MCP Server Configuration

This document explains how to set up and configure the Apify MCP Server.

## Quick Start

### Installation

1. Install dependencies (if using the Node.js version):
```bash
npm install @anthropic-ai/sdk
```

2. Make the server executable:
```bash
chmod +x mcp-server-apify.js
```

### Running the Server

```bash
node mcp-server-apify.js
```

## Using with Claude Desktop

To use this MCP server with Claude Desktop, add it to your Claude configuration:

### macOS
Edit `~/.claude/claude_desktop_config.json`:

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

### Windows
Edit `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "apify": {
      "command": "node",
      "args": ["C:\\path\\to\\mcp-server-apify.js"]
    }
  }
}
```

## Available Tools

### 1. search_actors
Search for Apify actors in the store.

**Parameters:**
- `query` (required): Search term for actors
- `category` (optional): Filter by category (DATA_EXTRACTION, SOCIAL_MEDIA, ECOMMERCE, AUTOMATION)
- `limit` (optional): Maximum results to return (default: 10)

**Example:**
```
Search for web scrapers that can extract data from e-commerce sites
```

### 2. get_actor_details
Get detailed information about a specific actor.

**Parameters:**
- `actor_id` (required): The ID of the actor (e.g., 'apify/web-scraper')

**Example:**
```
Get details about the apify/web-scraper actor
```

### 3. execute_actor
Execute an Apify actor with provided configuration.

**Parameters:**
- `actor_id` (required): The actor to execute
- `input` (required): Input configuration object
- `token` (required): Apify API token for authentication

**Example:**
```
Execute the apify/google-search-scraper with queries for "Claude AI"
```

## Actors Available

The server includes mock data for these actors:

1. **Web Scraper** (apify/web-scraper)
   - Universal web scraper for any website
   - Category: DATA_EXTRACTION
   - Rating: 4.8/5
   - Runs: 50,000+

2. **Google Search Scraper** (apify/google-search-scraper)
   - Search results extraction
   - Category: DATA_EXTRACTION
   - Rating: 4.7/5
   - Runs: 30,000+

3. **Instagram Scraper** (apify/instagram-scraper)
   - Instagram posts, profiles, hashtags
   - Category: SOCIAL_MEDIA
   - Rating: 4.6/5
   - Runs: 20,000+

4. **Amazon Product Scraper** (apify/amazon-product-scraper)
   - Product information extraction
   - Category: ECOMMERCE
   - Rating: 4.9/5
   - Runs: 40,000+

5. **LinkedIn Scraper** (apify/linkedin-scraper)
   - LinkedIn profile and job data
   - Category: SOCIAL_MEDIA
   - Rating: 4.5/5
   - Runs: 15,000+

## Integration with Real Apify API

To connect to the real Apify API:

1. Get your API token from https://apify.com/account/integrations
2. Modify the tool handler functions in `mcp-server-apify.js` to call the actual Apify API:

```javascript
async function searchActors(query, category, limit, apiToken) {
  const response = await fetch('https://api.apify.com/v2/actors', {
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, category, limit })
  })
  return response.json()
}
```

3. Update the tool definitions to require the API token parameter

## Environment Variables

You can set these optional environment variables:

- `APIFY_API_TOKEN`: Your Apify API token (for real API integration)
- `MCP_LOG_LEVEL`: Logging level (debug, info, warn, error)

## Troubleshooting

### Server won't start
- Make sure Node.js 16+ is installed: `node --version`
- Check that the file has execute permissions: `chmod +x mcp-server-apify.js`

### No tools available
- Ensure the server is running and responding to requests
- Check that the tools/list method is properly implemented

### API token errors
- Verify your Apify token is valid and has appropriate permissions
- Check that the token is passed correctly to the execute_actor tool

## Architecture

The MCP server implements the Model Context Protocol with:

1. **Tool Definitions** - JSON schemas for each tool
2. **Tool Handlers** - Process tool calls and return results
3. **Request Loop** - Listens for incoming requests via stdin/stdout
4. **Error Handling** - Gracefully handles invalid requests

The server operates in a request-response pattern compatible with any MCP client.

## Performance Notes

- Search results are limited to prevent overwhelming responses
- Actor execution is asynchronous (returns run ID immediately)
- Results can be paginated for large datasets
- Mock data responds instantly; real API may have network latency

## Future Enhancements

- Add support for real-time run monitoring
- Implement result streaming for large datasets
- Add actor recommendations based on usage patterns
- Support for custom actor creation and deployment
