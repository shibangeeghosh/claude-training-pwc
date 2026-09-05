@echo off
REM ALCOA+ QA Application - Setup Script (Windows)
REM Initializes development environment with all necessary configurations

setlocal enabledelayedexpansion

echo.
echo ===================================================
echo   ALCOA+ QA Application Setup
echo ===================================================
echo.

REM Step 1: Check Node.js
echo [1/6] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo X Node.js not found. Please install Node.js 16+
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION% found
echo.

REM Step 2: Install dependencies
echo [2/6] Installing dependencies...
if not exist "node_modules" (
    call npm install
    echo [OK] Dependencies installed
) else (
    echo [OK] Dependencies already installed
)
echo.

REM Step 3: Setup environment files
echo [3/6] Setting up environment files...
if not exist ".env" (
    copy .env.example .env
    echo [OK] Created .env
) else (
    echo [OK] .env already exists
)

if not exist ".env.production" (
    copy .env.example .env.production
    echo [OK] Created .env.production
) else (
    echo [OK] .env.production already exists
)
echo.

REM Step 4: Configure git hooks
echo [4/6] Configuring Git hooks...
call git config core.hooksPath .githooks
echo [OK] Git hooks configured
echo.

REM Step 5: Display database information
echo [5/6] Database Configuration
echo -------------------------------------------
echo Database Host: localhost
echo Database Port: 5432
echo Dev Database: alcoa_qa_dev
echo Prod Database: alcoa_qa_prod
echo.

REM Summary
echo ===================================================
echo   [OK] Setup Complete!
echo ===================================================
echo.

REM Show next steps
echo Next steps:
echo.
echo 1. Ensure PostgreSQL is running:
echo    docker run --name alcoa-postgres -e POSTGRES_USER=dev_user -e POSTGRES_DB=alcoa_qa_dev -p 5432:5432 -d postgres:14
echo.
echo 2. Start development server:
echo    npm run dev
echo.
echo 3. Open in browser:
echo    http://localhost:3000
echo.

echo Useful Commands:
echo   npm run dev        - Start development server with hot reload
echo   npm run build      - Build for production
echo   npm run preview    - Preview production build
echo.

echo Configuration files:
echo   .env               - Development environment
echo   .env.production    - Production environment (local testing)
echo   .env.example       - Environment template
echo.

echo Documentation:
echo   ENVIRONMENT.md     - Detailed environment setup guide
echo   HOOKS.md           - Custom React hooks documentation
echo   CLAUDE.md          - Development guidance for Claude Code
echo   README.md          - Application overview
echo.

pause
