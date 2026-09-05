# Apify MCP Integration - Architecture Diagram

## System Overview

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                         USER'S WEB BROWSER                          ┃
┃                    http://localhost:5173/                           ┃
┃                                                                     ┃
┃  ┌────────────────────────────────────────────────────────────┐   ┃
┃  │              ALCOA+ Compliance App                         │   ┃
┃  │  ┌──────────────────────────────────────────────────────┐  │   ┃
┃  │  │ Tab Navigation                                       │  │   ┃
┃  │  │ [Dashboard] [Tracker] [Records] [Apify Search] ← NEW │  │   ┃
┃  │  └──────────────────────────────────────────────────────┘  │   ┃
┃  │                                                              │   ┃
┃  │  ┌──────────────────────────────────────────────────────┐  │   ┃
┃  │  │     ApifySearch Component (React)                   │  │   ┃
┃  │  │                                                      │  │   ┃
┃  │  │  [Search Box: "web scraper"]  [Search Button]      │  │   ┃
┃  │  │  [Category Filter: SOCIAL_MEDIA▼]                  │  │   ┃
┃  │  │                                                      │  │   ┃
┃  │  │  Results:                                            │  │   ┃
┃  │  │  ┌──────────────────────────────────────────────┐  │  │   ┃
┃  │  │  │ Web Scraper     ⭐ 4.8   📊 50K runs        │  │  │   ┃
┃  │  │  │ Universal scraper for any website  [Execute] │  │  │   ┃
┃  │  │  └──────────────────────────────────────────────┘  │  │   ┃
┃  │  │  ┌──────────────────────────────────────────────┐  │  │   ┃
┃  │  │  │ Instagram Scraper ⭐ 4.6 📊 20K runs       │  │  │   ┃
┃  │  │  │ Extract posts, profiles, hashtags  [Execute] │  │  │   ┃
┃  │  │  └──────────────────────────────────────────────┘  │  │   ┃
┃  │  │                                                      │  │   ┃
┃  │  └──────────────────────────────────────────────────────┘  │   ┃
┃  └────────────────────────────────────────────────────────────┘   ┃
└━━━━━━━━━━━━━━━━━━━━━━━━┬━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                         │
                         │ HTTP Requests (JSON)
                         │ apifyService.js
                         │
                         ↓
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    EXPRESS BACKEND SERVER                           ┃
┃                    http://localhost:3001                            ┃
┃                                                                     ┃
┃  ┌────────────────────────────────────────────────────────────┐   ┃
┃  │  REST API Endpoints (7 routes)                            │   ┃
┃  │                                                            │   ┃
┃  │  GET  /health                → Returns server status      │   ┃
┃  │  GET  /api/actors            → All 6 actors              │   ┃
┃  │  POST /api/actors/search     → Search & filter           │   ┃
┃  │  GET  /api/actors/:id        → Actor details             │   ┃
┃  │  POST /api/actors/:id/execute→ Queue execution           │   ┃
┃  │  GET  /api/categories        → Available categories      │   ┃
┃  │  GET  /api/runs/:runId       → Execution status          │   ┃
┃  │                                                            │   ┃
┃  └────────────────────────────────────────────────────────────┘   ┃
┃                                                                     ┃
┃  ┌────────────────────────────────────────────────────────────┐   ┃
┃  │  Features:                                               │   ┃
┃  │  ✅ CORS enabled for frontend communication             │   ┃
┃  │  ✅ Input validation & error handling                   │   ┃
┃  │  ✅ Search with category filtering                      │   ┃
┃  │  ✅ Actor execution queueing                            │   ┃
┃  │  ✅ Mock data (can connect to real API)                 │   ┃
┃  └────────────────────────────────────────────────────────────┘   ┃
└━━━━━━━━━━━━━━━━━━━━━━━━┬━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                         │
                         │ Tool Execution
                         │
                         ↓
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    ACTOR DATA & SERVICES                            ┃
┃                                                                     ┃
┃  ┌────────────────────────────────────────────────────────────┐   ┃
┃  │  Mock Actor Database                                      │   ┃
┃  │  (Can be replaced with real Apify API)                   │   ┃
┃  │                                                            │   ┃
┃  │  📦 6 Actors:                                             │   ┃
┃  │     • Web Scraper (Data Extraction)                       │   ┃
┃  │     • Google Search Scraper (Data Extraction)             │   ┃
┃  │     • Instagram Scraper (Social Media)                    │   ┃
┃  │     • Amazon Product Scraper (E-Commerce)                 │   ┃
┃  │     • LinkedIn Scraper (Social Media)                     │   ┃
┃  │     • YouTube Scraper (Social Media)                      │   ┃
┃  │                                                            │   ┃
┃  │  📁 Categories:                                           │   ┃
┃  │     • DATA_EXTRACTION                                     │   ┃
┃  │     • SOCIAL_MEDIA                                        │   ┃
┃  │     • ECOMMERCE                                           │   ┃
┃  │     • AUTOMATION                                          │   ┃
┃  └────────────────────────────────────────────────────────────┘   ┃
└━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

## Data Flow Diagram

```
USER INTERACTION
        │
        ↓
┌─────────────────────────┐
│ 1. User Types Search    │
│    "web scraper"        │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────┐
│ 2. Frontend captures    │
│    query & category     │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────┐
│ 3. ApifyService calls   │
│    POST /api/actors/    │
│    search               │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────┐
│ 4. Backend receives     │
│    request, validates   │
│    input                │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────┐
│ 5. Search mock actor    │
│    database             │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────┐
│ 6. Filter by category   │
│    if specified         │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────┐
│ 7. Return results as    │
│    JSON response        │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────┐
│ 8. Frontend updates     │
│    component state      │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────┐
│ 9. React re-renders     │
│    results list         │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────┐
│ 10. User sees results   │
│     with ratings,       │
│     descriptions        │
└─────────────────────────┘
```

## File Dependencies

```
src/App.jsx
    │
    ├─ imports ─→ ApifySearch.jsx
    │                  │
    │                  ├─ imports ─→ apifyService.js
    │                  │                  │
    │                  │                  └─ calls ──→ http://localhost:3001/api/*
    │                  │
    │                  └─ uses ─→ Lucide React icons
    │
    ├─ imports ─→ Header.jsx
    ├─ imports ─→ Dashboard.jsx
    ├─ imports ─→ ComplianceTracker.jsx
    └─ imports ─→ DataRecords.jsx

backend-server.js (Node.js)
    │
    ├─ imports ─→ express (framework)
    ├─ imports ─→ cors (middleware)
    │
    └─ defines
       ├─ Mock Actor Data
       ├─ 7 REST endpoints
       └─ Error handling

mcp-server-apify.js (Node.js)
    │
    ├─ imports ─→ @anthropic-ai/sdk (optional)
    │
    └─ defines
       ├─ MCP Tool Definitions
       │   ├─ search_actors
       │   ├─ get_actor_details
       │   └─ execute_actor
       │
       └─ Tool Handlers
           └─ processTool()
```

## Request/Response Cycle

### Search Request
```
BROWSER (ApifySearch.jsx)
    │
    ├─ setState(isSearching: true)
    │
    └─ apifyService.searchActors(query, category)
        │
        └─ fetch POST /api/actors/search
            │
            BACKEND (backend-server.js)
            │
            ├─ receive query & category
            ├─ validate input
            ├─ filter mockActors
            ├─ apply category filter
            └─ return JSON
                │
                FRONTEND
                │
                ├─ setState(searchResults: [...])
                ├─ setState(isSearching: false)
                └─ render results
                    │
                    DISPLAY
                    │
                    ├─ Actor name & description
                    ├─ Category badge
                    ├─ Rating (⭐⭐⭐⭐⭐)
                    ├─ Run statistics
                    └─ [Execute] button
```

### Execute Request
```
USER clicks [Execute] button
    │
    └─ onClick handler triggered
        │
        └─ handleExecuteActor(actor)
            │
            └─ apifyService.executeActor(actorId, input, token)
                │
                └─ fetch POST /api/actors/:id/execute
                    │
                    BACKEND
                    │
                    ├─ receive actorId & input
                    ├─ validate API token (optional)
                    ├─ generate runId
                    ├─ return execution status
                    │
                    FRONTEND
                    │
                    └─ setState(executionResults: {...})
                        │
                        DISPLAY
                        │
                        ├─ Status: "queued"
                        ├─ Run ID
                        ├─ Created timestamp
                        └─ Success message
```

## MCP Server Integration

```
Claude Desktop / MCP Client
        │
        ├─ Reads claude_desktop_config.json
        │
        └─ Launches mcp-server-apify.js
            │
            ├─ Initializes MCP protocol
            │
            └─ Provides 3 tools:
               │
               ├─ search_actors
               │   input: {query, category, limit}
               │   output: [actors]
               │
               ├─ get_actor_details
               │   input: {actor_id}
               │   output: {actor details}
               │
               └─ execute_actor
                   input: {actor_id, input, token}
                   output: {execution status}

Claude uses these tools to:
├─ Search for actors autonomously
├─ Get detailed information
├─ Execute actors with parameters
└─ Report back to user
```

## Deployment Architecture

```
Development Environment
    │
    ├─ React Dev Server (port 5173)
    │   └─ Hot reload on file changes
    │
    ├─ Express Backend (port 3001)
    │   └─ Mock actor data
    │
    └─ MCP Server (stdio)
        └─ For Claude Desktop

                    ↓↓↓ Deploy ↓↓↓

Production Environment
    │
    ├─ React Build (Static)
    │   └─ Deployed to: Vercel/Netlify/AWS S3
    │
    ├─ Express Backend (Node.js)
    │   └─ Deployed to: Heroku/AWS/Railway
    │
    ├─ MCP Server (Node.js)
    │   └─ Deployed to: Dedicated server
    │
    └─ Apify API
        └─ Connected via API token
```

## Component Interaction Map

```
App.jsx (Main)
    │
    ├─ State: activeTab
    │
    ├─ Renders Header (unchanged)
    │
    ├─ Renders Navigation Tabs
    │   ├─ Dashboard
    │   ├─ Compliance Tracker
    │   ├─ Data Records
    │   └─ Apify Search ← NEW
    │
    └─ Conditional Rendering
        └─ {activeTab === 'apify' && <ApifySearch />}
            │
            ApifySearch.jsx
            │
            ├─ State:
            │  ├─ searchQuery
            │  ├─ category
            │  ├─ searchResults
            │  ├─ selectedActor
            │  ├─ executionResults
            │  └─ isSearching
            │
            ├─ Methods:
            │  ├─ handleSearch(query, category)
            │  ├─ handleSelectActor(actor)
            │  └─ handleExecuteActor(actor)
            │
            ├─ Renders:
            │  ├─ Search Header
            │  ├─ Search Input
            │  ├─ Category Filter
            │  ├─ Results List
            │  ├─ Actor Details Panel
            │  └─ Execution Status
            │
            └─ Uses:
               └─ apifyService.js
                  ├─ searchActors()
                  ├─ getActorDetails()
                  └─ executeActor()
```

## Status Codes & Messages

```
API Response Examples:

✅ Success (200)
{
  "success": true,
  "count": 6,
  "actors": [...]
}

⚠️  Bad Request (400)
{
  "error": "Query is required"
}

❌ Not Found (404)
{
  "error": "Actor not found: apify/invalid-id"
}

💥 Server Error (500)
{
  "error": "Internal server error",
  "message": "detailed error (dev only)"
}
```

## Feature Matrix

| Feature | Frontend | Backend | MCP | Status |
|---------|----------|---------|-----|--------|
| Search Actors | ✅ | ✅ | ✅ | Working |
| Category Filter | ✅ | ✅ | ✅ | Working |
| Actor Details | ✅ | ✅ | ✅ | Working |
| Execute Actor | ✅ | ✅ | ✅ | Working |
| View Results | ✅ | ✅ | ✅ | Working |
| Real API | ⏳ | ⏳ | ⏳ | Configurable |
| Authentication | ⏳ | ⏳ | ⏳ | Ready |
| Rate Limiting | ⏳ | ⏳ | ⏳ | Ready |

---

This architecture is modular, scalable, and ready for production deployment.
