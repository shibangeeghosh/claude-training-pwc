#!/usr/bin/env node

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// MCP Tool definitions for Apify
const tools = [
  {
    name: "search_actors",
    description:
      "Search for Apify actors in the Apify Store by keyword or category",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query for actors (e.g., 'web scraper', 'social media')",
        },
        category: {
          type: "string",
          description: "Actor category (e.g., 'DATA_EXTRACTION', 'AUTOMATION')",
        },
        limit: {
          type: "integer",
          description: "Maximum number of results to return (default: 10)",
          default: 10,
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_actor_details",
    description:
      "Get detailed information about a specific Apify actor including input schema and documentation",
    input_schema: {
      type: "object",
      properties: {
        actor_id: {
          type: "string",
          description: "The ID of the actor (e.g., 'apify/web-scraper')",
        },
      },
      required: ["actor_id"],
    },
  },
  {
    name: "execute_actor",
    description:
      "Execute an Apify actor with provided input configuration",
    input_schema: {
      type: "object",
      properties: {
        actor_id: {
          type: "string",
          description: "The ID of the actor to execute",
        },
        input: {
          type: "object",
          description: "Input configuration for the actor",
        },
        token: {
          type: "string",
          description: "Apify API token for authentication",
        },
      },
      required: ["actor_id", "input", "token"],
    },
  },
];

// Mock data for demonstration - In production, these would call actual Apify API
const mockActors = [
  {
    id: "apify/web-scraper",
    name: "Web Scraper",
    description: "Universal web scraper for extracting data from any website",
    category: "DATA_EXTRACTION",
    rating: 4.8,
    runs: 50000,
    inputSchema: {
      startUrls: "Array of URLs to scrape",
      pageFunction: "JavaScript function for data extraction",
      proxyConfiguration: "Proxy settings for anonymous scraping",
    },
  },
  {
    id: "apify/google-search-scraper",
    name: "Google Search Scraper",
    description: "Scrapes Google Search results for keywords",
    category: "DATA_EXTRACTION",
    rating: 4.7,
    runs: 30000,
    inputSchema: {
      queries: "Array of search queries",
      resultsPerPage: "Number of results per query",
      maxPages: "Maximum pages to scrape",
    },
  },
  {
    id: "apify/instagram-scraper",
    name: "Instagram Scraper",
    description: "Scrapes Instagram posts, profiles, and hashtags",
    category: "SOCIAL_MEDIA",
    rating: 4.6,
    runs: 20000,
    inputSchema: {
      startUrls: "Instagram URLs to scrape",
      maxPostsPerHandle: "Maximum posts per account",
      downloadMedia: "Download images and videos",
    },
  },
  {
    id: "apify/amazon-product-scraper",
    name: "Amazon Product Scraper",
    description: "Extracts product information from Amazon",
    category: "ECOMMERCE",
    rating: 4.9,
    runs: 40000,
    inputSchema: {
      searchTerm: "Product search term",
      maxResults: "Maximum products to extract",
      includeReviews: "Include customer reviews",
    },
  },
  {
    id: "apify/linkedin-scraper",
    name: "LinkedIn Profile Scraper",
    description: "Scrapes LinkedIn profile and job information",
    category: "SOCIAL_MEDIA",
    rating: 4.5,
    runs: 15000,
    inputSchema: {
      profileUrls: "LinkedIn profile URLs",
      includeConnections: "Include connection data",
      maxPages: "Maximum pages to scrape",
    },
  },
];

// Tool handler functions
function searchActors(query, category, limit) {
  const filtered = mockActors.filter(
    (actor) =>
      (actor.name.toLowerCase().includes(query.toLowerCase()) ||
        actor.description.toLowerCase().includes(query.toLowerCase())) &&
      (!category || actor.category === category)
  );
  return filtered.slice(0, limit);
}

function getActorDetails(actorId) {
  const actor = mockActors.find((a) => a.id === actorId);
  if (!actor) {
    return { error: `Actor not found: ${actorId}` };
  }
  return actor;
}

function executeActor(actorId, input, token) {
  const actor = mockActors.find((a) => a.id === actorId);
  if (!actor) {
    return { error: `Actor not found: ${actorId}` };
  }

  // Mock execution - in production, this would call Apify API
  return {
    status: "queued",
    actorId: actorId,
    runId: `run-${Date.now()}`,
    input: input,
    createdAt: new Date().toISOString(),
    message: `Actor ${actor.name} has been queued for execution. Check back for results.`,
  };
}

// Process tool calls
function processTool(toolName, toolInput) {
  switch (toolName) {
    case "search_actors":
      return searchActors(
        toolInput.query,
        toolInput.category,
        toolInput.limit || 10
      );
    case "get_actor_details":
      return getActorDetails(toolInput.actor_id);
    case "execute_actor":
      return executeActor(
        toolInput.actor_id,
        toolInput.input,
        toolInput.token
      );
    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

// Main MCP server loop
async function runMCPServer() {
  console.log("Apify MCP Server started. Waiting for requests...");

  const readline = await import("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Handle incoming requests
  rl.on("line", async (line) => {
    try {
      const request = JSON.parse(line);

      if (request.method === "tools/list") {
        console.log(JSON.stringify({ tools }));
      } else if (request.method === "tools/call") {
        const result = processTool(request.params.name, request.params.arguments);
        console.log(
          JSON.stringify({
            result,
            requestId: request.id,
          })
        );
      } else {
        console.log(
          JSON.stringify({
            error: "Unknown method",
            requestId: request.id,
          })
        );
      }
    } catch (error) {
      console.error("Error processing request:", error.message);
    }
  });

  rl.on("close", () => {
    process.exit(0);
  });
}

// Run the server
runMCPServer();
