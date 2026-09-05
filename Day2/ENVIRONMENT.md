# Environment Configuration & Git Hooks

This document explains how to configure the ALCOA+ QA application for local testing with database connectivity.

## Environment Files

### .env (Development)
Local development environment configuration. Used by `npm run dev`.

```bash
VITE_API_BASE_URL=http://localhost:3001
VITE_DB_HOST=localhost
VITE_DB_PORT=5432
VITE_DB_NAME=alcoa_qa_dev
VITE_ENVIRONMENT=development
VITE_LOG_LEVEL=debug
```

### .env.production (Production - Local Testing)
Production build environment, configured for local testing with localhost database.

```bash
VITE_API_BASE_URL=http://localhost:3001
VITE_DB_HOST=localhost
VITE_DB_PORT=5432
VITE_DB_NAME=alcoa_qa_prod
VITE_ENVIRONMENT=production
VITE_LOG_LEVEL=info
```

**Important**: For actual production deployment, update these values to point to your production server.

### .env.example
Template file documenting all available environment variables.

## Environment Variables Reference

| Variable | Purpose | Default | Example |
|----------|---------|---------|---------|
| VITE_APP_NAME | Application display name | ALCOA+ QA Compliance | - |
| VITE_APP_VERSION | Application version | 1.0.0 | - |
| VITE_API_BASE_URL | Backend API endpoint | http://localhost:3001 | http://api.example.com |
| VITE_DB_HOST | Database hostname | localhost | db.example.com |
| VITE_DB_PORT | Database port | 5432 | 5432 |
| VITE_DB_NAME | Database name | alcoa_qa_dev | mydb |
| VITE_DB_USER | Database username | dev_user | postgres |
| VITE_ENVIRONMENT | Environment name | development | production |
| VITE_LOG_LEVEL | Logging level | debug | info, warn, error |

## Git Hooks

Git hooks automatically run at specific points in the git workflow to validate configuration and prevent commits with invalid environments.

### Hook Location
All hooks are stored in `.githooks/` directory and configured via:
```bash
git config core.hooksPath .githooks
```

### pre-commit Hook

**File**: `.githooks/pre-commit`

Runs before each commit to validate:
- ✓ `.env` file exists
- ✓ `.env.production` file exists
- ✓ All required environment variables are set
- ✓ Database host is configured for local testing (localhost)
- ✓ node_modules is present
- ✓ package-lock.json is in sync

**What it checks**:
```bash
# Required variables validation
VITE_APP_NAME
VITE_API_BASE_URL
VITE_DB_HOST
VITE_DB_PORT
VITE_DB_NAME
VITE_ENVIRONMENT
```

**If validation fails**:
```
✗ Error: .env file not found
  Run: cp .env.example .env
```

To commit despite validation failure (not recommended):
```bash
git commit --no-verify
```

### post-checkout Hook

**File**: `.githooks/post-checkout`

Runs after checking out branches to:
- Create `.env` from `.env.example` if missing
- Create `.env.production` from `.env.example` if missing
- Configure git hooks path
- Display database configuration reminder

**Output**:
```
✓ Environment setup complete
✓ Database Host: localhost
Ready for local testing
```

## Setup Instructions

### First-Time Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Day2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment files are auto-created** (via post-checkout hook)
   - If not automatic, manually create:
   ```bash
   cp .env.example .env
   cp .env.example .env.production
   ```

4. **Verify git hooks are configured**
   ```bash
   git config core.hooksPath
   # Should output: .githooks
   ```

### Updating Environment Variables

Edit `.env` or `.env.production`:

```bash
# Development
nano .env

# Production (local testing)
nano .env.production
```

Changes take effect on next `npm run dev` or `npm run build`.

## Database Setup for Local Testing

### Configure PostgreSQL Connection

All environment files are set to use `localhost` for database host:

```bash
# Default local connection
Host: localhost
Port: 5432
User: dev_user (dev) or prod_user (prod)
Database: alcoa_qa_dev (dev) or alcoa_qa_prod (prod)
```

### Start Local Database

**Using Docker**:
```bash
docker run --name alcoa-postgres \
  -e POSTGRES_USER=dev_user \
  -e POSTGRES_DB=alcoa_qa_dev \
  -p 5432:5432 \
  -d postgres:14
```

**Using Local PostgreSQL**:
```bash
# Ensure PostgreSQL is running
# macOS
brew services start postgresql

# Linux
sudo service postgresql start

# Windows
# Start PostgreSQL service via Services app
```

## Accessing Environment in Code

### Using the env.js utility

```jsx
import ENV from '../config/env'

function MyComponent() {
  return (
    <div>
      <p>Database: {ENV.DB_HOST}:{ENV.DB_PORT}</p>
      <p>Environment: {ENV.ENVIRONMENT}</p>
    </div>
  )
}
```

### Safe env access with defaults

```jsx
import { getEnv, isDevelopment, isProduction } from '../config/env'

// Get with default fallback
const apiUrl = getEnv('API_BASE_URL', 'http://localhost:3001')

// Check environment
if (isDevelopment()) {
  console.log('Running in development mode')
}
```

## Troubleshooting

### "Pre-commit validation failed"

**Problem**: Commit blocked due to missing environment files

**Solution**:
```bash
# Create missing environment files
cp .env.example .env
cp .env.example .env.production

# Commit again
git commit -m "your message"
```

### "Missing required variable: VITE_DB_HOST"

**Problem**: Environment variable not set in .env files

**Solution**:
1. Check `.env` and `.env.production` contain all required variables
2. Ensure variables are formatted correctly: `KEY=value` (no spaces around `=`)
3. Rebuild: `npm run build`

### Database connection timeout

**Problem**: Cannot connect to localhost:5432

**Solution**:
1. Verify database service is running
2. Check `.env` has correct `VITE_DB_HOST` and `VITE_DB_PORT`
3. Test connection: `psql -h localhost -U dev_user -d alcoa_qa_dev`

### Git hooks not running

**Problem**: Pre-commit hook doesn't execute

**Solution**:
```bash
# Verify hooks path is configured
git config core.hooksPath

# If empty, configure it
git config core.hooksPath .githooks

# Make sure hooks are executable
chmod +x .githooks/pre-commit
chmod +x .githooks/post-checkout

# Test hook
./.githooks/pre-commit
```

## Environment File Checklist

Before committing changes:

- [ ] `.env` is configured for local development
- [ ] `.env.production` is configured for local testing (localhost)
- [ ] `VITE_DB_HOST=localhost` in both files
- [ ] Required environment variables present
- [ ] No sensitive data (passwords) in environment files
- [ ] `.env` and `.env.production` in `.gitignore` (if using secrets)

## Security Notes

- **Never commit sensitive data** like database passwords to git
- Use `.env` files locally only; store secrets in secure vaults for production
- `.env` files should be in `.gitignore` in production repositories
- Use environment variable substitution for all sensitive configuration
- Review `.env.example` before sharing with team (only non-sensitive vars)

## Production Deployment

For actual production:

1. Do NOT use localhost for `VITE_DB_HOST`
2. Update to production server address
3. Use environment-specific secrets management
4. Enable only required log levels (INFO or WARN)
5. Set `VITE_ENVIRONMENT=production`
6. Verify all database credentials are secure

## See Also

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Git Hooks Documentation](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)
- [Node.js dotenv](https://github.com/motdotla/dotenv)
