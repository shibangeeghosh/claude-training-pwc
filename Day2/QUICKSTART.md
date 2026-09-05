# Apify MCP Integration - Quick Start Guide

## What You've Built

A full-stack web application that integrates Apify's powerful web scraping and automation tools directly into the ALCOA+ Compliance Management System. Users can now:

✅ Search for web scrapers and automation actors
✅ Execute actors with custom configurations
✅ View actor details and ratings
✅ Filter by category
✅ Track execution status

## Files Created/Modified

### New Files
- `mcp-server-apify.js` - Standalone MCP server for Apify integration
- `backend-server.js` - Express API server that bridges frontend and MCP
- `src/components/ApifySearch.jsx` - React UI component for search
- `src/services/apifyService.js` - API client service
- `APIFY_INTEGRATION.md` - Full integration documentation
- `mcp-server-config.md` - MCP configuration guide

### Modified Files
- `src/App.jsx` - Added "Apify Search" tab
- `package.json` - Added express, cors, concurrently dependencies

## Quick Start (3 Steps)

### 1. Install Dependencies
```bash
cd /home/labuser/Downloads/claude-training-pwc/Day2
npm install
```

### 2. Start Backend Server (Terminal 1)
```bash
npm run server
```

You should see:
```
Apify Backend Server running on http://localhost:3001
Health check: http://localhost:3001/health
```

### 3. Start Frontend (Terminal 2)
```bash
npm run dev
```

You should see:
```
VITE v4.3.0  ready in 123 ms

➜  Local:   http://localhost:5173/
```

## Using the Feature

1. Open http://localhost:5173 in your browser
2. Click the **"Apify Search"** tab
3. Search for actors:
   - Try: "web scraper", "instagram", "amazon", "youtube", "google"
4. Filter by category (optional)
5. Click "Execute" to run an actor
6. View execution details

## Example Searches

- **"web scraper"** - Find universal web scrapers
- **"social"** - Find social media scrapers (Instagram, YouTube, LinkedIn)
- **"amazon"** - Find e-commerce product scrapers
- **"google"** - Find search result extraction tools

## Architecture

```
User Browser
    ↓
React Frontend (http://localhost:5173)
    ↓ HTTP Requests
Express Backend (http://localhost:3001)
    ↓ Tool Execution
MCP Server (Tools)
    ↓
Mock Actor Data
```

## Available Actors in Demo

1. **Web Scraper** - Universal scraper
2. **Google Search Scraper** - Search results
3. **Instagram Scraper** - Social media
4. **Amazon Product Scraper** - E-commerce
5. **LinkedIn Scraper** - Professional network
6. **YouTube Scraper** - Video platform

## Running Both Servers at Once

Instead of two terminals, you can run:
```bash
npm run dev:full
```

This uses `concurrently` to start both backend and frontend in one command.

## API Endpoints

The backend provides these REST endpoints:

```
POST   /api/actors/search      - Search for actors
GET    /api/actors             - Get all actors
GET    /api/actors/:id         - Get actor details
POST   /api/actors/:id/execute - Execute an actor
GET    /api/runs/:runId        - Get execution results
GET    /api/categories         - Get available categories
GET    /health                 - Health check
```

Test the health check:
```bash
curl http://localhost:3001/health
```

## Connecting to Real Apify

To use the real Apify service:

1. Get API token from https://apify.com/account/integrations
2. Update `.env`:
   ```
   APIFY_API_TOKEN=your_real_token
   ```
3. Modify `backend-server.js` to call real API endpoints
4. Restart backend

## Using MCP Server Standalone

Run the MCP server directly:
```bash
node mcp-server-apify.js
```

Use with Claude Desktop by adding to config (see `mcp-server-config.md`).

## Troubleshooting

**Port 3001 already in use?**
```bash
PORT=3002 npm run server
# Then update VITE_APIFY_API_URL=http://localhost:3002 in .env
```

**Module not found errors?**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Can't find "Apify Search" tab?**
- Check browser console for errors
- Ensure `src/components/ApifySearch.jsx` exists
- Refresh the page

## File Structure

```
Day2/
├── src/
│   ├── components/
│   │   ├── ApifySearch.jsx      ← New UI component
│   │   ├── Dashboard.jsx
│   │   ├── ComplianceTracker.jsx
│   │   └── DataRecords.jsx
│   ├── services/
│   │   └── apifyService.js      ← New API client
│   └── App.jsx                  ← Updated
├── mcp-server-apify.js          ← New MCP server
├── backend-server.js            ← New Express server
├── package.json                 ← Updated
├── APIFY_INTEGRATION.md         ← Full documentation
└── QUICKSTART.md                ← This file
```

## Next Steps

### Immediate
- Test the search functionality
- Try different queries and categories
- Verify backend and frontend communication

### Development
- Connect to real Apify API
- Add actor execution result display
- Implement run history
- Add authentication/API key management

### Production
- Deploy backend and frontend separately
- Use environment-specific configurations
- Implement proper error handling and logging
- Add rate limiting and monitoring

## Support

- **Full Documentation**: See `APIFY_INTEGRATION.md`
- **MCP Configuration**: See `mcp-server-config.md`
- **Apify Docs**: https://docs.apify.com
- **MCP Spec**: https://mcpservers.org

## Summary

You now have:

✅ Standalone MCP server for Apify integration
✅ Express backend with REST API
✅ React UI component with search functionality
✅ Integration with existing ALCOA+ app
✅ Mock data for testing
✅ Full documentation
✅ Ready to connect to real Apify API

Start using it with `npm run dev:full` and open http://localhost:5173!
