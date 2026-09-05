# Backend Security Checklist

Quick reference checklist for backend route modifications in the ALCOA+ QA application.

## 🔐 Authentication & Authorization

- [ ] All endpoints have `authenticateToken` middleware (except health/status/public)
- [ ] JWT tokens are validated on every request
- [ ] Authorization middleware checks user roles
- [ ] Token expiration is set (max 1 hour)
- [ ] Refresh token rotation implemented
- [ ] No hardcoded user IDs or roles

## 🔒 Input Validation

- [ ] All input parameters are validated
- [ ] Invalid input returns 400 Bad Request
- [ ] Validation includes type checking
- [ ] Validation includes length limits
- [ ] Validation includes format validation (email, URL, date)
- [ ] Unknown fields are rejected
- [ ] Whitelist approach used (only accept known fields)

## 🛡️ SQL/NoSQL Injection Prevention

- [ ] No string concatenation in queries
- [ ] Parameterized queries used (? or $1 placeholders)
- [ ] ORM or query builder used
- [ ] User input never directly in query
- [ ] Query parameters properly escaped
- [ ] No dynamic query construction

## 📤 Output & Data Sanitization

- [ ] Sensitive fields removed from responses (passwords, tokens, API keys)
- [ ] User input not echoed back directly
- [ ] Responses properly JSON encoded
- [ ] No internal system paths in responses
- [ ] Error messages don't expose implementation details
- [ ] Pagination properly validated

## 🚫 Rate Limiting & DoS Protection

- [ ] Rate limiting configured on endpoints
- [ ] Default: 100 requests/minute per IP
- [ ] Auth endpoints: 5 requests/15 minutes
- [ ] Returns 429 on rate limit exceeded
- [ ] Rate limit info in response headers
- [ ] Monitoring for abuse patterns

## 🔑 Secrets & Configuration

- [ ] No hardcoded secrets in code
- [ ] Secrets stored in .env files
- [ ] .env files in .gitignore
- [ ] JWT secret from environment variable
- [ ] Database passwords from environment
- [ ] API keys from environment
- [ ] No secrets in logs

## 📋 Logging & Monitoring

- [ ] Authentication attempts logged
- [ ] Data modifications logged (CREATE, UPDATE, DELETE)
- [ ] Failed access attempts logged
- [ ] No sensitive data in logs
- [ ] Includes timestamp and user ID
- [ ] Error messages logged server-side
- [ ] Monitoring for suspicious patterns

## 🌐 CORS & HTTPS

- [ ] CORS configured with specific origins (not *)
- [ ] Allowed origins whitelisted
- [ ] Credentials allowed only for trusted origins
- [ ] HTTPS enforced in production
- [ ] Secure cookies: HttpOnly, Secure, SameSite
- [ ] HSTS headers configured
- [ ] No sensitive headers exposed

## ⚠️ Error Handling

- [ ] All endpoints have try-catch blocks
- [ ] Database operations wrapped in error handlers
- [ ] Errors return JSON (not HTML)
- [ ] Appropriate HTTP status codes
- [ ] No stack traces in responses
- [ ] Generic error messages to clients
- [ ] Detailed logs server-side

## 🔄 Data Integrity

- [ ] Transactions used for multi-step operations
- [ ] ACID properties maintained
- [ ] Rollback on errors
- [ ] Race conditions prevented
- [ ] Unique constraints in database
- [ ] Foreign key constraints
- [ ] Data validation before insertion

## 🎯 Idempotency & Deduplication

- [ ] POST requests require Idempotency-Key header
- [ ] Duplicate requests return same result
- [ ] Processed requests tracked
- [ ] 409 Conflict returned for duplicates
- [ ] Idempotency timeout configured

## 📊 API Versioning

- [ ] URL includes version: /api/v1/
- [ ] Backward compatibility maintained
- [ ] Breaking changes documented
- [ ] Deprecation warnings included
- [ ] Migration guides provided
- [ ] At least 2 versions supported

## 🧪 Testing

- [ ] Unit tests written
- [ ] Integration tests written
- [ ] Authentication tests
- [ ] Authorization tests
- [ ] Input validation tests
- [ ] Error scenario tests
- [ ] Security tests (injection, auth, etc.)
- [ ] Performance tests

## 📖 Documentation

- [ ] API endpoints documented
- [ ] Authentication method documented
- [ ] Request/response examples provided
- [ ] Error codes documented
- [ ] Rate limits documented
- [ ] Authentication header format documented
- [ ] Pagination documented

## 🚀 Before Deployment

- [ ] All tests passing
- [ ] Code review completed
- [ ] Security review completed
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Backups configured
- [ ] Monitoring configured
- [ ] Logging configured
- [ ] HTTPS certificates valid
- [ ] CORS origins updated for production
- [ ] Rate limits set for production
- [ ] Database credentials secured

## 🔍 Regular Security Tasks

- [ ] Run `npm audit` weekly
- [ ] Review access logs monthly
- [ ] Test backup restoration quarterly
- [ ] Security training updates annually
- [ ] Penetration testing annually
- [ ] Dependency updates regular

---

## ❌ Common Security Mistakes

### Do NOT:

```
❌ app.get('/api/users', (req, res) => {})  // Missing auth
❌ `SELECT * FROM users WHERE id = ${id}`    // SQL injection
❌ res.json(user)                            // User has password
❌ console.log(token)                        // Logging secrets
❌ cors: '*'                                 // Wildcard CORS
❌ password: 'hardcoded_123'                 // Hardcoded secret
❌ return err.message + err.stack            // Exposing internals
❌ var apiKey = 'sk_live_1234567'           // Hardcoded key
```

### DO:

```
✅ app.get('/api/users', authenticateToken, (req, res) => {})  // With auth
✅ db.query('SELECT * FROM users WHERE id = ?', [id])         // Parameterized
✅ delete user.password; res.json(user)                        // Remove sensitive
✅ logger.info('Login attempt', { email })                     // Don't log secrets
✅ cors: { origin: whitelist }                                 // Specific origins
✅ password: process.env.DB_PASSWORD                           // Environment var
✅ res.status(500).json({ error: 'Server error' })            // Generic message
✅ const apiKey = process.env.STRIPE_API_KEY                   // Environment var
```

---

## 🆘 Troubleshooting

### "Pre-commit validation failed"

**Check for:**
1. Hardcoded secrets (passwords, API keys)
2. SQL concatenation instead of parameterized queries
3. Missing authentication middleware
4. Logging sensitive data

**Fix:**
```bash
# Move secrets to .env
# Replace concatenation with parameterized queries
# Add authenticateToken middleware
# Remove sensitive logging
git add .
git commit -m "Fix security issues"
```

### "Unauthorized" on endpoint

**Check:**
1. Authorization header sent with Bearer token
2. Token format: `Authorization: Bearer <token>`
3. Token not expired
4. User role matches required role

### Rate limit exceeded

**Solutions:**
1. Wait 1 minute before retrying (default limit)
2. Implement exponential backoff
3. Request higher rate limit for your use case
4. Use batch endpoints when available

---

## 📞 Getting Help

**Security Questions:**
1. Check BACKEND_SECURITY.md for detailed guidelines
2. Review BACKEND_TEMPLATE.md for code examples
3. See CODE_QUALITY.md for implementation standards
4. Contact security team for clarification

**Pre-commit Validation:**
```bash
# Run validation manually
./.githooks/pre-commit-backend

# View detailed error
git commit -m "test" 2>&1 | head -50
```

---

**Version:** 1.0  
**Last Updated:** September 5, 2024  
**Status:** MANDATORY FOR ALL BACKEND WORK
