# Backend Routes Security & Architecture Rules

**MANDATORY** security and architecture guidelines for modifying backend API routes in the ALCOA+ QA application.

> **Status**: Required for all backend route modifications  
> **Enforcement**: Pre-commit hook validation  
> **Violations**: Block commit, require remediation

## 🔐 Mandatory Security Rules

### 1. Authentication & Authorization

#### **REQUIRED:**
- ✅ All endpoints MUST require valid authentication token
- ✅ Implement role-based access control (RBAC)
- ✅ Validate JWT tokens on every request
- ✅ Use Bearer token scheme: `Authorization: Bearer <token>`
- ✅ Include token expiration (max 1 hour)
- ✅ Implement refresh token rotation

#### **Implementation:**
```javascript
// Backend example (Node.js/Express)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return res.sendStatus(401)

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

// Apply to routes
app.get('/api/records', authenticateToken, (req, res) => {
  // Protected endpoint
})
```

#### **Violation Examples:**
- ❌ Endpoints accessible without token
- ❌ No token validation
- ❌ Hardcoded secrets
- ❌ No expiration on tokens

---

### 2. Input Validation

#### **REQUIRED:**
- ✅ Validate ALL input parameters
- ✅ Whitelist expected fields (reject unknown)
- ✅ Type checking (string, number, boolean, enum)
- ✅ Length validation (min/max)
- ✅ Format validation (email, URL, date)
- ✅ Sanitize inputs (prevent injection)

#### **Implementation:**
```javascript
const validateRecord = (data) => {
  const schema = {
    title: { type: 'string', min: 1, max: 255, required: true },
    status: { 
      type: 'enum', 
      values: ['compliant', 'warning', 'fail'],
      required: true 
    },
    percentage: { type: 'number', min: 0, max: 100, required: true },
    date: { type: 'date', required: true }
  }

  for (const [key, rules] of Object.entries(schema)) {
    if (rules.required && !data[key]) {
      throw new Error(`${key} is required`)
    }
    if (data[key] && rules.type === 'string') {
      if (data[key].length < rules.min || data[key].length > rules.max) {
        throw new Error(`${key} length invalid`)
      }
    }
  }
}

app.post('/api/records', authenticateToken, (req, res) => {
  try {
    validateRecord(req.body)
    // Process record
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})
```

#### **Violation Examples:**
- ❌ No input validation
- ❌ Accepting unknown fields
- ❌ No type checking
- ❌ SQL/NoSQL injection vulnerabilities
- ❌ Accepting untrusted data directly

---

### 3. SQL/NoSQL Injection Prevention

#### **REQUIRED:**
- ✅ Use parameterized queries/prepared statements
- ✅ Never concatenate user input into queries
- ✅ Use ORM (Sequelize, TypeORM, Mongoose) when possible
- ✅ Validate query parameters

#### **INCORRECT (Vulnerable):**
```javascript
// ❌ NEVER DO THIS - SQL Injection vulnerability
const query = `SELECT * FROM records WHERE id = ${req.params.id}`
db.query(query)

// ❌ NEVER - NoSQL Injection
db.collection('records').find({ $where: req.body.filter })
```

#### **CORRECT (Safe):**
```javascript
// ✅ Parameterized query (SQL)
const query = 'SELECT * FROM records WHERE id = ?'
db.query(query, [req.params.id])

// ✅ ORM (Safe)
const record = await Record.findById(req.params.id)

// ✅ Mongoose (Safe)
db.collection('records').find({ id: ObjectId(req.params.id) })
```

---

### 4. Output Encoding & Data Sanitization

#### **REQUIRED:**
- ✅ Never return raw user input in response
- ✅ Encode special characters in responses
- ✅ Remove sensitive fields before returning
- ✅ Use JSON serialization (automatically escapes)

#### **Implementation:**
```javascript
// ❌ WRONG - Returns sensitive data
app.get('/api/user/:id', (req, res) => {
  const user = db.find(req.params.id)
  res.json(user) // Might include password hash
})

// ✅ CORRECT - Removes sensitive fields
app.get('/api/user/:id', (req, res) => {
  const user = db.find(req.params.id)
  delete user.passwordHash
  delete user.apiKey
  res.json(user)
})

// ✅ BETTER - Use serializer
function serializeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  }
}

app.get('/api/user/:id', (req, res) => {
  const user = db.find(req.params.id)
  res.json(serializeUser(user))
})
```

---

### 5. Rate Limiting & DoS Protection

#### **REQUIRED:**
- ✅ Implement rate limiting on all public endpoints
- ✅ Limit: max 100 requests per IP per minute (default)
- ✅ Return 429 (Too Many Requests) when limit exceeded
- ✅ Include rate limit headers in response

#### **Implementation:**
```javascript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false // Disable `X-RateLimit-*` headers
})

// Apply to all routes
app.use('/api/', limiter)

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // 5 requests per 15 minutes
})

app.post('/api/auth/login', authLimiter, (req, res) => {
  // Login logic
})
```

---

### 6. CORS & HTTPS Requirements

#### **REQUIRED:**
- ✅ All endpoints MUST use HTTPS (TLS 1.2+)
- ✅ Implement proper CORS headers
- ✅ Whitelist allowed origins (not wildcard `*`)
- ✅ Validate Content-Type headers
- ✅ Use secure cookies (HttpOnly, Secure, SameSite)

#### **Implementation:**
```javascript
import cors from 'cors'

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 3600 // Preflight cache 1 hour
}

app.use(cors(corsOptions))

// Enforce HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`)
    } else {
      next()
    }
  })
}

// Secure cookie settings
app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 3600000 // 1 hour
  }
}))
```

---

### 7. Sensitive Data Protection

#### **REQUIRED:**
- ✅ Never log sensitive data (passwords, tokens, PII)
- ✅ Never return sensitive data in responses
- ✅ Encrypt data at rest (database passwords, API keys)
- ✅ Use environment variables for secrets (NEVER hardcode)
- ✅ Implement data retention policies

#### **Sensitive Fields to NEVER return:**
- ❌ Passwords / password hashes
- ❌ API keys / tokens
- ❌ Credit card numbers
- ❌ Social security numbers
- ❌ Medical information
- ❌ Internal system paths

#### **Implementation:**
```javascript
// ❌ WRONG - Returns password
app.get('/api/user/:id', (req, res) => {
  const user = db.find(req.params.id)
  res.json(user) // Includes password!
})

// ✅ CORRECT - Excludes sensitive fields
app.get('/api/user/:id', (req, res) => {
  const user = db.find(req.params.id)
  const { passwordHash, apiKey, ...safeUser } = user
  res.json(safeUser)
})

// ✅ ENVIRONMENT VARIABLES - Never hardcode
const API_KEY = process.env.DB_API_KEY // From .env
// NOT: const API_KEY = 'sk_live_51234567890'
```

---

## 🏗️ Mandatory Architecture Rules

### 1. RESTful Endpoint Design

#### **REQUIRED:**
- ✅ Use standard HTTP methods: GET, POST, PUT, PATCH, DELETE
- ✅ Use plural resource names: `/api/records`, not `/api/record`
- ✅ Use hierarchical structure: `/api/records/{id}/compliance`
- ✅ Return appropriate HTTP status codes
- ✅ Version API: `/api/v1/records`

#### **Endpoint Patterns:**
```
GET    /api/v1/records              # List all records
GET    /api/v1/records/:id          # Get single record
POST   /api/v1/records              # Create new record
PUT    /api/v1/records/:id          # Replace entire record
PATCH  /api/v1/records/:id          # Partial update
DELETE /api/v1/records/:id          # Delete record

GET    /api/v1/records/:id/compliance # Sub-resource
POST   /api/v1/records/:id/audit     # Sub-resource action
```

#### **HTTP Status Codes:**
```
200 OK                    # Successful GET/PUT/PATCH
201 Created              # Successful POST
204 No Content           # Successful DELETE
400 Bad Request          # Invalid input
401 Unauthorized         # Missing/invalid auth
403 Forbidden            # Authenticated but not permitted
404 Not Found            # Resource doesn't exist
409 Conflict             # Data conflict/integrity issue
429 Too Many Requests    # Rate limit exceeded
500 Internal Server Error # Server error
503 Service Unavailable  # Temporary downtime
```

---

### 2. Request/Response Format

#### **REQUIRED:**
- ✅ All requests/responses use JSON format
- ✅ Include `Content-Type: application/json` header
- ✅ Consistent response envelope structure
- ✅ Include error messages (but not sensitive info)
- ✅ Pagination for list endpoints

#### **Success Response Format:**
```javascript
{
  "success": true,
  "data": {
    "id": "rec-001",
    "title": "Clinical Trial Data",
    "status": "compliant",
    "percentage": 95,
    "createdAt": "2024-12-15T10:30:00Z"
  }
}
```

#### **Error Response Format:**
```javascript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid percentage value",
    "details": [
      { "field": "percentage", "issue": "Must be 0-100" }
    ]
  }
}
```

#### **List Response with Pagination:**
```javascript
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

---

### 3. Error Handling

#### **REQUIRED:**
- ✅ All errors MUST return JSON response
- ✅ Include error code (for frontend error handling)
- ✅ Include user-friendly message (no stack traces)
- ✅ Log detailed errors server-side only
- ✅ Never expose internal system errors to client

#### **Implementation:**
```javascript
// ❌ WRONG - Exposes internal error details
app.get('/api/records/:id', (req, res) => {
  try {
    const record = db.find(req.params.id)
    res.json(record)
  } catch (err) {
    res.status(500).json({
      error: err.message,
      stack: err.stack // ❌ NEVER send stack trace
    })
  }
})

// ✅ CORRECT - Generic error message to client, detailed logging server-side
app.get('/api/records/:id', (req, res) => {
  try {
    const record = db.find(req.params.id)
    res.json({ success: true, data: record })
  } catch (err) {
    logger.error(`Database error: ${err.message}`, { err, userId: req.user.id })
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'An error occurred while retrieving the record'
      }
    })
  }
})
```

---

### 4. Logging & Monitoring

#### **REQUIRED:**
- ✅ Log all authentication attempts
- ✅ Log all data modifications (POST, PUT, PATCH, DELETE)
- ✅ Include timestamp, user ID, action, resource
- ✅ NEVER log sensitive data
- ✅ Monitor error rates and alert on anomalies

#### **Implementation:**
```javascript
const logger = require('winston')

// ✅ Log authentication
app.post('/api/auth/login', (req, res) => {
  logger.info('Login attempt', { 
    email: req.body.email, 
    ip: req.ip,
    timestamp: new Date().toISOString()
  })
  // Don't log password!
})

// ✅ Log data modifications
app.post('/api/records', authenticateToken, (req, res) => {
  logger.info('Record created', {
    userId: req.user.id,
    recordId: newRecord.id,
    action: 'CREATE',
    resource: 'records',
    timestamp: new Date().toISOString()
  })
})

// ✅ Log deletions (audit trail)
app.delete('/api/records/:id', authenticateToken, (req, res) => {
  logger.warn('Record deleted', {
    userId: req.user.id,
    recordId: req.params.id,
    action: 'DELETE',
    resource: 'records',
    timestamp: new Date().toISOString()
  })
})

// ❌ NEVER log passwords or sensitive data
logger.info('User login', { password: req.body.password }) // ❌ WRONG!
```

---

### 5. Dependency & Version Management

#### **REQUIRED:**
- ✅ Use established libraries (express, fastify, hapi)
- ✅ Keep dependencies up-to-date
- ✅ Monitor security vulnerabilities: `npm audit`
- ✅ Document breaking changes in migrations
- ✅ Test before upgrading major versions

#### **Vulnerable Library Detection:**
```bash
# Check for vulnerabilities
npm audit

# Fix automatically (when possible)
npm audit fix

# Install specific security update
npm update express
```

---

### 6. Database Transactions & Data Integrity

#### **REQUIRED:**
- ✅ Use transactions for multi-step operations
- ✅ Implement ACID properties
- ✅ Rollback on errors
- ✅ Prevent race conditions
- ✅ Validate data constraints

#### **Implementation:**
```javascript
// ✅ Database transaction
app.post('/api/records/batch', authenticateToken, async (req, res) => {
  const client = await db.connect()
  try {
    await client.query('BEGIN')
    
    const results = []
    for (const record of req.body.records) {
      const result = await client.query(
        'INSERT INTO records (title, status) VALUES ($1, $2) RETURNING *',
        [record.title, record.status]
      )
      results.push(result.rows[0])
    }
    
    await client.query('COMMIT')
    res.json({ success: true, data: results })
  } catch (err) {
    await client.query('ROLLBACK')
    logger.error('Batch insert failed', { err })
    res.status(500).json({ 
      success: false, 
      error: { code: 'BATCH_ERROR', message: 'Batch operation failed' }
    })
  } finally {
    client.release()
  }
})
```

---

### 7. Idempotency & Deduplication

#### **REQUIRED:**
- ✅ POST requests should be idempotent (use idempotency keys)
- ✅ Prevent duplicate records on retry
- ✅ Use unique constraints in database
- ✅ Return 409 Conflict for duplicates

#### **Implementation:**
```javascript
app.post('/api/records', authenticateToken, async (req, res) => {
  const idempotencyKey = req.headers['idempotency-key']
  
  if (!idempotencyKey) {
    return res.status(400).json({
      error: { code: 'MISSING_KEY', message: 'Idempotency-Key header required' }
    })
  }

  // Check if already processed
  const existing = await db.query(
    'SELECT * FROM processed_requests WHERE idempotency_key = $1',
    [idempotencyKey]
  )
  
  if (existing.rows.length > 0) {
    return res.status(200).json({
      success: true,
      data: existing.rows[0].response_data
    })
  }

  // Process new request
  const record = await db.query(
    'INSERT INTO records (...) VALUES (...) RETURNING *'
  )

  // Store for idempotency
  await db.query(
    'INSERT INTO processed_requests (idempotency_key, response_data) VALUES ($1, $2)',
    [idempotencyKey, JSON.stringify(record.rows[0])]
  )

  res.status(201).json({ success: true, data: record.rows[0] })
})
```

---

### 8. API Versioning

#### **REQUIRED:**
- ✅ Include version in URL: `/api/v1/`, `/api/v2/`
- ✅ Support at least 2 major versions
- ✅ Deprecation period: minimum 6 months warning
- ✅ Document breaking changes
- ✅ Provide migration guide

#### **Structure:**
```
/api/v1/records         # Current version (maintained)
/api/v2/records         # New version (in development)

# Deprecation headers
Deprecation: true
Sunset: Sun, 31 Dec 2024 23:59:59 GMT
Link: </api/v2/records>; rel="successor-version"
```

---

## 🔍 Pre-Commit Hook Validation

The pre-commit hook validates backend route changes:

```bash
.githooks/pre-commit-backend
```

**Checks:**
- ✓ No hardcoded secrets/API keys
- ✓ Authentication on protected endpoints
- ✓ Input validation present
- ✓ No SQL injection vulnerabilities
- ✓ Proper error handling
- ✓ Appropriate status codes
- ✓ Rate limiting implemented
- ✓ Sensitive data not logged

---

## 📋 Backend Route Modification Checklist

Before committing backend route changes:

- [ ] Authentication required (token/API key)
- [ ] Authorization implemented (RBAC)
- [ ] All inputs validated (type, length, format)
- [ ] SQL/NoSQL injection prevented
- [ ] No hardcoded secrets
- [ ] Rate limiting configured
- [ ] Proper HTTP status codes
- [ ] Errors handled without exposing internals
- [ ] Sensitive data excluded from responses
- [ ] Data modifications logged
- [ ] HTTPS enforced (production)
- [ ] CORS properly configured
- [ ] Tests written
- [ ] Documentation updated
- [ ] Security review completed

---

## 🚨 Violation Examples & Fixes

### Example 1: Missing Authentication

**❌ VIOLATION:**
```javascript
app.get('/api/records', (req, res) => {
  const records = db.query('SELECT * FROM records')
  res.json(records)
})
```

**✅ FIX:**
```javascript
app.get('/api/records', authenticateToken, (req, res) => {
  const records = db.query('SELECT * FROM records WHERE user_id = ?', [req.user.id])
  res.json({ success: true, data: records })
})
```

---

### Example 2: SQL Injection Vulnerability

**❌ VIOLATION:**
```javascript
app.get('/api/records/:id', (req, res) => {
  const query = `SELECT * FROM records WHERE id = ${req.params.id}` // ❌ Concatenation!
  const record = db.query(query)
  res.json(record)
})
```

**✅ FIX:**
```javascript
app.get('/api/records/:id', authenticateToken, (req, res) => {
  const record = db.query(
    'SELECT * FROM records WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  )
  res.json({ success: true, data: record })
})
```

---

### Example 3: Exposing Sensitive Data

**❌ VIOLATION:**
```javascript
app.get('/api/users/:id', (req, res) => {
  const user = db.find(req.params.id)
  res.json(user) // Returns password hash, API key, etc.!
})
```

**✅ FIX:**
```javascript
app.get('/api/users/:id', authenticateToken, (req, res) => {
  if (req.user.id !== req.params.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' })
  }
  const user = db.find(req.params.id)
  delete user.passwordHash
  delete user.apiKey
  res.json({ success: true, data: user })
})
```

---

### Example 4: Missing Input Validation

**❌ VIOLATION:**
```javascript
app.post('/api/records', (req, res) => {
  db.insert(req.body) // No validation!
  res.json({ success: true })
})
```

**✅ FIX:**
```javascript
app.post('/api/records', authenticateToken, (req, res) => {
  // Validate input
  if (!req.body.title || typeof req.body.title !== 'string') {
    return res.status(400).json({ error: 'Invalid title' })
  }
  if (req.body.title.length < 1 || req.body.title.length > 255) {
    return res.status(400).json({ error: 'Title length invalid' })
  }
  if (!['compliant', 'warning', 'fail'].includes(req.body.status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }
  
  const record = db.insert({
    title: req.body.title,
    status: req.body.status,
    userId: req.user.id
  })
  res.status(201).json({ success: true, data: record })
})
```

---

## 📚 Additional Resources

### Security Standards
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [CWE Top 25](https://cwe.mitre.org/top25/)

### Implementation Guides
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://nodejs.org/en/docs/guides/security/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

### Testing Tools
- `npm audit` - Dependency vulnerability scanning
- `OWASP ZAP` - Automated security scanning
- `Snyk` - Continuous vulnerability monitoring
- `SonarQube` - Code quality & security analysis

---

## 🔒 Sign-off

All backend route modifications MUST comply with these rules. Non-compliant changes will be blocked by pre-commit validation.

**Questions?** Refer to this document or contact the security team.

**Last Updated:** September 5, 2024  
**Version:** 1.0  
**Status:** MANDATORY
