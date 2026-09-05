# Backend Route Implementation Template

Secure, production-ready templates for implementing backend routes in the ALCOA+ QA application.

## Project Structure

When adding backend to this project, use this structure:

```
backend/
├── config/
│   ├── database.js
│   ├── environment.js
│   └── constants.js
├── middleware/
│   ├── authenticate.js
│   ├── authorize.js
│   ├── errorHandler.js
│   └── validation.js
├── routes/
│   ├── records.js
│   ├── compliance.js
│   ├── users.js
│   └── auth.js
├── controllers/
│   ├── recordController.js
│   ├── complianceController.js
│   └── userController.js
├── services/
│   ├── recordService.js
│   ├── complianceService.js
│   └── userService.js
├── models/
│   ├── Record.js
│   ├── User.js
│   └── ComplianceCheck.js
├── utils/
│   ├── logger.js
│   ├── validators.js
│   └── errors.js
├── tests/
│   ├── records.test.js
│   ├── compliance.test.js
│   └── auth.test.js
├── .env.example
├── server.js
└── package.json
```

---

## 1. Authentication Middleware

**File: `backend/middleware/authenticate.js`**

```javascript
const jwt = require('jsonwebtoken')
const logger = require('../utils/logger')

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    logger.warn('Authentication attempt without token', { ip: req.ip })
    return res.status(401).json({
      success: false,
      error: {
        code: 'MISSING_TOKEN',
        message: 'Authentication token is required'
      }
    })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn('Invalid token attempt', { ip: req.ip, error: err.message })
      return res.status(403).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token'
        }
      })
    }

    req.user = user
    logger.info('User authenticated', { userId: user.id })
    next()
  })
}

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user.id,
        role: req.user.role,
        requiredRoles: roles
      })
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this resource'
        }
      })
    }
    next()
  }
}

module.exports = { authenticateToken, authorize }
```

---

## 2. Input Validation

**File: `backend/utils/validators.js`**

```javascript
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

const isValidPercentage = (value) => {
  return typeof value === 'number' && value >= 0 && value <= 100
}

const isValidStatus = (status) => {
  return ['compliant', 'warning', 'fail'].includes(status)
}

const validateRecord = (data) => {
  const errors = []

  if (!data.title || typeof data.title !== 'string') {
    errors.push({ field: 'title', message: 'Title is required and must be a string' })
  } else if (data.title.length < 1 || data.title.length > 255) {
    errors.push({ field: 'title', message: 'Title must be 1-255 characters' })
  }

  if (!data.status || !isValidStatus(data.status)) {
    errors.push({ field: 'status', message: 'Invalid status' })
  }

  if (data.percentage !== undefined && !isValidPercentage(data.percentage)) {
    errors.push({ field: 'percentage', message: 'Percentage must be 0-100' })
  }

  if (data.date && isNaN(new Date(data.date).getTime())) {
    errors.push({ field: 'date', message: 'Invalid date format' })
  }

  return errors
}

module.exports = {
  isValidEmail,
  isValidPercentage,
  isValidStatus,
  validateRecord
}
```

---

## 3. Secure Route Handler

**File: `backend/routes/records.js`**

```javascript
const express = require('express')
const rateLimit = require('express-rate-limit')
const { authenticateToken, authorize } = require('../middleware/authenticate')
const { validateRecord } = require('../utils/validators')
const RecordService = require('../services/recordService')
const logger = require('../utils/logger')

const router = express.Router()

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please try again later'
})

router.use(limiter)

/**
 * GET /api/v1/records
 * List all records with pagination
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Validate pagination params
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const pageSize = Math.min(100, parseInt(req.query.pageSize) || 20)

    // Get records (only user's records)
    const records = await RecordService.getRecords(
      req.user.id,
      page,
      pageSize
    )

    logger.info('Records retrieved', {
      userId: req.user.id,
      count: records.data.length
    })

    res.json({
      success: true,
      data: records.data,
      pagination: {
        page,
        pageSize,
        total: records.total,
        totalPages: Math.ceil(records.total / pageSize)
      }
    })
  } catch (err) {
    logger.error('Error retrieving records', { userId: req.user.id, err })
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Error retrieving records'
      }
    })
  }
})

/**
 * GET /api/v1/records/:id
 * Get single record by ID
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    // Validate ID format (basic validation)
    if (!/^\d+$/.test(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid record ID format'
        }
      })
    }

    const record = await RecordService.getRecord(req.params.id, req.user.id)

    if (!record) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Record not found'
        }
      })
    }

    res.json({ success: true, data: record })
  } catch (err) {
    logger.error('Error retrieving record', {
      userId: req.user.id,
      recordId: req.params.id,
      err
    })
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Error retrieving record'
      }
    })
  }
})

/**
 * POST /api/v1/records
 * Create new record
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Validate input
    const errors = validateRecord(req.body)
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors
        }
      })
    }

    // Require idempotency key to prevent duplicates
    const idempotencyKey = req.headers['idempotency-key']
    if (!idempotencyKey) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_IDEMPOTENCY_KEY',
          message: 'Idempotency-Key header is required'
        }
      })
    }

    const record = await RecordService.createRecord({
      title: req.body.title,
      status: req.body.status,
      percentage: req.body.percentage,
      date: req.body.date,
      userId: req.user.id,
      idempotencyKey
    })

    logger.info('Record created', {
      userId: req.user.id,
      recordId: record.id
    })

    res.status(201).json({ success: true, data: record })
  } catch (err) {
    if (err.code === 'DUPLICATE') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_RECORD',
          message: 'Record already exists'
        }
      })
    }

    logger.error('Error creating record', {
      userId: req.user.id,
      err
    })

    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Error creating record'
      }
    })
  }
})

/**
 * PUT /api/v1/records/:id
 * Update record
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Validate ID
    if (!/^\d+$/.test(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid record ID'
        }
      })
    }

    // Validate input
    const errors = validateRecord(req.body)
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors
        }
      })
    }

    const record = await RecordService.updateRecord(
      req.params.id,
      req.user.id,
      req.body
    )

    if (!record) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Record not found'
        }
      })
    }

    logger.info('Record updated', {
      userId: req.user.id,
      recordId: req.params.id
    })

    res.json({ success: true, data: record })
  } catch (err) {
    logger.error('Error updating record', {
      userId: req.user.id,
      recordId: req.params.id,
      err
    })

    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Error updating record'
      }
    })
  }
})

/**
 * DELETE /api/v1/records/:id
 * Delete record
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Validate ID
    if (!/^\d+$/.test(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid record ID'
        }
      })
    }

    const success = await RecordService.deleteRecord(
      req.params.id,
      req.user.id
    )

    if (!success) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Record not found'
        }
      })
    }

    logger.warn('Record deleted', {
      userId: req.user.id,
      recordId: req.params.id
    })

    res.status(204).send()
  } catch (err) {
    logger.error('Error deleting record', {
      userId: req.user.id,
      recordId: req.params.id,
      err
    })

    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Error deleting record'
      }
    })
  }
})

module.exports = router
```

---

## 4. Service Layer (Business Logic)

**File: `backend/services/recordService.js`**

```javascript
const db = require('../config/database')
const logger = require('../utils/logger')

class RecordService {
  static async getRecords(userId, page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize

    try {
      // Parameterized query - prevents SQL injection
      const query = `
        SELECT id, title, status, percentage, created_at
        FROM records
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `

      const records = await db.query(query, [userId, pageSize, offset])

      // Get total count
      const countQuery = 'SELECT COUNT(*) as total FROM records WHERE user_id = $1'
      const countResult = await db.query(countQuery, [userId])

      return {
        data: records.rows,
        total: parseInt(countResult.rows[0].total, 10)
      }
    } catch (err) {
      logger.error('Database error in getRecords', { userId, err })
      throw err
    }
  }

  static async getRecord(recordId, userId) {
    try {
      const query = `
        SELECT id, title, status, percentage, created_at
        FROM records
        WHERE id = $1 AND user_id = $2
      `

      const result = await db.query(query, [recordId, userId])
      return result.rows[0] || null
    } catch (err) {
      logger.error('Database error in getRecord', { recordId, userId, err })
      throw err
    }
  }

  static async createRecord(data) {
    const client = await db.connect()

    try {
      await client.query('BEGIN')

      // Check for idempotency
      const idempotencyCheck = await client.query(
        'SELECT response_data FROM processed_requests WHERE idempotency_key = $1',
        [data.idempotencyKey]
      )

      if (idempotencyCheck.rows.length > 0) {
        const err = new Error('Duplicate request')
        err.code = 'DUPLICATE'
        throw err
      }

      // Insert record
      const query = `
        INSERT INTO records (title, status, percentage, created_at, user_id)
        VALUES ($1, $2, $3, NOW(), $4)
        RETURNING id, title, status, percentage, created_at
      `

      const result = await client.query(query, [
        data.title,
        data.status,
        data.percentage,
        data.userId
      ])

      const record = result.rows[0]

      // Log for idempotency
      await client.query(
        'INSERT INTO processed_requests (idempotency_key, response_data) VALUES ($1, $2)',
        [data.idempotencyKey, JSON.stringify(record)]
      )

      await client.query('COMMIT')

      return record
    } catch (err) {
      await client.query('ROLLBACK')
      logger.error('Database error in createRecord', { userId: data.userId, err })
      throw err
    } finally {
      client.release()
    }
  }

  static async updateRecord(recordId, userId, updates) {
    try {
      const query = `
        UPDATE records
        SET title = $1, status = $2, percentage = $3, updated_at = NOW()
        WHERE id = $4 AND user_id = $5
        RETURNING id, title, status, percentage, created_at
      `

      const result = await db.query(query, [
        updates.title,
        updates.status,
        updates.percentage,
        recordId,
        userId
      ])

      return result.rows[0] || null
    } catch (err) {
      logger.error('Database error in updateRecord', { recordId, userId, err })
      throw err
    }
  }

  static async deleteRecord(recordId, userId) {
    try {
      const query = `
        DELETE FROM records
        WHERE id = $1 AND user_id = $2
      `

      const result = await db.query(query, [recordId, userId])
      return result.rowCount > 0
    } catch (err) {
      logger.error('Database error in deleteRecord', { recordId, userId, err })
      throw err
    }
  }
}

module.exports = RecordService
```

---

## 5. Main Server File

**File: `backend/server.js`**

```javascript
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
require('dotenv').config()

const recordRoutes = require('./routes/records')
const logger = require('./utils/logger')

const app = express()
const PORT = process.env.PORT || 3001

// Security headers
app.use(helmet())

// Logging
app.use(morgan('combined', { stream: { write: msg => logger.info(msg) } }))

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key']
}))

// Body parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// HTTPS redirect in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`)
    } else {
      next()
    }
  })
}

// Health check endpoint (public)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/v1/records', recordRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  })
})

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { err, url: req.url })
  res.status(500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: 'An unexpected error occurred'
    }
  })
})

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
  logger.info(`Environment: ${process.env.NODE_ENV}`)
})
```

---

## 6. Environment Configuration

**File: `backend/.env.example`**

```bash
# Server
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=alcoa_qa_dev
DB_USER=dev_user
DB_PASSWORD=dev_password

# Security
JWT_SECRET=your_jwt_secret_here_change_in_production
SESSION_SECRET=your_session_secret_here
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Logging
LOG_LEVEL=info

# CORS
ENABLE_CORS=true
```

---

## 7. Testing

**File: `backend/tests/records.test.js`**

```javascript
const request = require('supertest')
const app = require('../server')
const { generateToken } = require('../utils/jwt')

describe('Records Routes', () => {
  let authToken
  let userId = 1

  beforeAll(() => {
    authToken = generateToken({ id: userId, role: 'user' })
  })

  describe('GET /api/v1/records', () => {
    it('should require authentication', async () => {
      const res = await request(app).get('/api/v1/records')
      expect(res.status).toBe(401)
      expect(res.body.error.code).toBe('MISSING_TOKEN')
    })

    it('should return records for authenticated user', async () => {
      const res = await request(app)
        .get('/api/v1/records')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
    })
  })

  describe('POST /api/v1/records', () => {
    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/v1/records')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: '' })

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('should require idempotency key', async () => {
      const res = await request(app)
        .post('/api/v1/records')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Record',
          status: 'compliant',
          percentage: 95
        })

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('MISSING_IDEMPOTENCY_KEY')
    })

    it('should create record with valid data', async () => {
      const res = await request(app)
        .post('/api/v1/records')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Idempotency-Key', 'test-key-1')
        .send({
          title: 'Test Record',
          status: 'compliant',
          percentage: 95
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBeDefined()
    })
  })
})
```

---

## Summary

This template provides:

✅ **Authentication** - JWT token validation on all endpoints  
✅ **Authorization** - Role-based access control  
✅ **Input Validation** - Type and format checking  
✅ **SQL Injection Prevention** - Parameterized queries  
✅ **Error Handling** - Proper error responses  
✅ **Logging** - Audit trail without sensitive data  
✅ **Rate Limiting** - DoS protection  
✅ **CORS** - Proper origin whitelisting  
✅ **HTTPS** - Enforced in production  
✅ **Idempotency** - Duplicate request prevention  
✅ **Testing** - Unit test patterns  

Use this as the foundation for all backend route implementations.
