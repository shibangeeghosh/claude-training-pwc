#!/bin/bash

# ALCOA+ QA Application - Setup Script
# Initializes development environment with all necessary configurations

set -e

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   ALCOA+ QA Application Setup${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Check Node.js
echo -e "${YELLOW}[1/6]${NC} Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found. Please install Node.js 16+${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION} found${NC}"
echo ""

# Step 2: Install dependencies
echo -e "${YELLOW}[2/6]${NC} Installing dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi
echo ""

# Step 3: Setup environment files
echo -e "${YELLOW}[3/6]${NC} Setting up environment files..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env${NC}"
else
    echo -e "${GREEN}✓ .env already exists${NC}"
fi

if [ ! -f ".env.production" ]; then
    cp .env.example .env.production
    echo -e "${GREEN}✓ Created .env.production${NC}"
else
    echo -e "${GREEN}✓ .env.production already exists${NC}"
fi
echo ""

# Step 4: Configure git hooks
echo -e "${YELLOW}[4/6]${NC} Configuring Git hooks..."
git config core.hooksPath .githooks
chmod +x .githooks/*
echo -e "${GREEN}✓ Git hooks configured${NC}"
echo ""

# Step 5: Validate environment
echo -e "${YELLOW}[5/6]${NC} Validating environment configuration..."
if ./.githooks/pre-commit; then
    echo -e "${GREEN}✓ Environment validation passed${NC}"
else
    echo -e "${RED}✗ Environment validation failed${NC}"
    exit 1
fi
echo ""

# Step 6: Display database information
echo -e "${YELLOW}[6/6]${NC} Database Configuration"
echo -e "${BLUE}──────────────────────────────────────────${NC}"
echo -e "Database Host: ${GREEN}localhost${NC}"
echo -e "Database Port: ${GREEN}5432${NC}"
echo -e "Dev Database: ${GREEN}alcoa_qa_dev${NC}"
echo -e "Prod Database: ${GREEN}alcoa_qa_prod${NC}"
echo ""

# Summary
echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✓ Setup Complete!${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""

# Show next steps
echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. Ensure PostgreSQL is running:"
echo -e "     ${YELLOW}docker run --name alcoa-postgres -e POSTGRES_USER=dev_user -e POSTGRES_DB=alcoa_qa_dev -p 5432:5432 -d postgres:14${NC}"
echo ""
echo -e "  2. Start development server:"
echo -e "     ${YELLOW}npm run dev${NC}"
echo ""
echo -e "  3. Open in browser:"
echo -e "     ${YELLOW}http://localhost:3000${NC}"
echo ""

# Additional information
echo -e "${BLUE}Useful Commands:${NC}"
echo -e "  npm run dev        - Start development server with hot reload"
echo -e "  npm run build      - Build for production"
echo -e "  npm run preview    - Preview production build"
echo ""

echo -e "${GREEN}Configuration files:${NC}"
echo -e "  .env               - Development environment"
echo -e "  .env.production    - Production environment (local testing)"
echo -e "  .env.example       - Environment template"
echo ""

echo -e "${BLUE}Documentation:${NC}"
echo -e "  ENVIRONMENT.md     - Detailed environment setup guide"
echo -e "  HOOKS.md           - Custom React hooks documentation"
echo -e "  CLAUDE.md          - Development guidance for Claude Code"
echo -e "  README.md          - Application overview"
echo ""

exit 0
