# Security Policy & Runbook

> This document is the security reference for the School Management CRM backend.
> Every developer and DevOps engineer **must** read this before deploying or modifying code.

---

## Table of Contents

1. [Threat Model](#threat-model)
2. [Authentication Security](#authentication-security)
3. [Authorization & RBAC](#authorization--rbac)
4. [Input Validation & Injection Prevention](#input-validation--injection-prevention)
5. [Transport Security](#transport-security)
6. [HTTP Security Headers](#http-security-headers)
7. [Rate Limiting & Brute-Force Protection](#rate-limiting--brute-force-protection)
8. [Data Protection & PII Handling](#data-protection--pii-handling)
9. [File Upload Security](#file-upload-security)
10. [Audit Logging](#audit-logging)
11. [Secrets Management](#secrets-management)
12. [Dependency Security](#dependency-security)
13. [Error Handling](#error-handling)
14. [Infrastructure Security](#infrastructure-security)
15. [Incident Response](#incident-response)
16. [Reporting a Vulnerability](#reporting-a-vulnerability)

---

## Threat Model

This system stores **student PII** (personally identifiable information), financial records (fees), academic records, and staff data. The primary threats are:

| Threat | Risk | Mitigations |
|---|---|---|
| Credential stuffing / brute force | High | Rate limiting (`express-rate-limit`), account lockout, bcrypt |
| Stolen JWT / session hijacking | High | Short-lived access tokens (15 min), HttpOnly cookies, token rotation |
| SQL injection | Critical | ORM / parameterized queries only (using `?` style binds) |
| XSS via stored content | Medium | Output encoding, CSP (helmet), server-side sanitization |
| CSRF | Medium | SameSite=Strict cookies, custom request headers |
| Privilege escalation | High | RBAC on every Express route, permission checks in service layer |
| Sensitive data exposure | High | HTTPS only, no secrets in logs, PII scrubbing |
| Insecure file uploads | Medium | MIME validation (`file-type`), size limits, isolated storage |
| Supply chain attack | Medium | `npm audit`, Dependabot, package-lock.json integrity check |
| Insider threat / data exfiltration | Medium | Audit log, least-privilege MySQL user, database query parameters |

---

## Authentication Security

### Password Storage

- Algorithm: **bcrypt** with cost factor `≥ 12`
- Benchmark: hashing one password should take **≥ 250 ms** on your production server
- Never store plaintext passwords, reversible hashes, or unsalted hashes
- Enforce minimum password strength: 10+ chars, mixed case, digit, special character

```typescript
// ✅ Correct
const hash = await bcrypt.hash(password, 12);

// ❌ Never do this
const hash = crypto.createHash('md5').update(password).digest('hex');
```

### JWT Tokens

| Token | Storage | Lifetime | Transmission |
|---|---|---|---|
| Access token | **Memory only** (React state / variable) | **15 minutes** | `Authorization: Bearer` header |
| Refresh token | **HttpOnly, Secure, SameSite=Strict cookie** | 7 days | Sent automatically by browser |

**Why memory for access tokens?**
`localStorage` is readable by any JavaScript on the page — one XSS vulnerability = all users' sessions compromised.

```typescript
// ✅ Access token signing
const accessToken = jwt.sign(
  { sub: user.id, role: user.role, permissions: user.permissions },
  process.env.JWT_ACCESS_SECRET,
  { expiresIn: '15m', algorithm: 'HS256' }
);

// ✅ Refresh token — store only the HASH in the database
const rawToken = crypto.randomBytes(64).toString('hex');
const tokenHash = await bcrypt.hash(rawToken, 10); // lower rounds ok — it's random
await db.refreshTokens.create({ tokenHash, userId, expiresAt, ipAddress });
// Send rawToken to client via HttpOnly cookie — never store raw in DB
```

### Refresh Token Rotation

- On every use: **delete old token, insert new token** (prevents token replay)
- On logout: delete the specific token from the DB
- On password change: **revoke ALL refresh tokens** for the user
- On suspicious activity (new IP, new device): flag for re-authentication

### Account Lockout

After `RATE_LIMIT_AUTH_MAX` (default 5) failed login attempts from the same IP within 15 minutes:
- Return `429 Too Many Requests`
- Log attempt to `login_attempts` table
- Optionally notify admin via email for sustained attacks

---

## Authorization & RBAC

### Rule: Check permissions on every route — no exceptions

```typescript
// ✅ Every protected route must have both guards in Express router
router.delete('/students/:id',
  authenticate,                          // verifies JWT
  requirePermission('students:delete'),  // checks RBAC
  studentController.delete
);

// ❌ Never skip authorization
router.delete('/students/:id', studentController.delete);
```

### Permission naming convention

```
resource:action
students:read      students:write    students:delete
fees:read          fees:write        fees:delete
reports:read
audit_log:read
settings:write
```

---

## Input Validation & Injection Prevention

### SQL Injection

**Never concatenate user input into SQL strings.**

```typescript
// ✅ Parameterized (safe using mysql2 placeholder)
const [rows] = await db.query(
  'SELECT * FROM students WHERE id = ? AND school_id = ?',
  [req.params.id, req.user.schoolId]
);

// ❌ SQL injection vulnerability
const [rows] = await db.query(
  `SELECT * FROM students WHERE id = '${req.params.id}'`
);
```

- Use Prisma, Drizzle, or `mysql2` parameterized placeholders (`?`)
- The MySQL database application user must NOT have permissions like `DROP`, `ALTER`, `CREATE`, or `TRUNCATE` tables

### XSS Prevention

- All API responses are JSON — set `Content-Type: application/json`
- For any field that accepts rich text: sanitize with `sanitize-html` on the **server** before storing

```typescript
import sanitizeHtml from 'sanitize-html';

const cleanNotes = sanitizeHtml(req.body.notes, {
  allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br'],
  allowedAttributes: {}
});
```

---

## Transport Security

- **HTTPS only** — configure your hosting proxy or reverse proxy (e.g. Nginx, Caddy, Cloudflare Tunnel Free Tier) to redirect all HTTP → HTTPS
- **TLS 1.2 minimum** — disable TLS 1.0 and 1.1

---

## HTTP Security Headers

Configured via `helmet` middleware in Express.

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
```

---

## Rate Limiting & Brute-Force Protection

Using standard free libraries:

```typescript
import rateLimit from 'express-rate-limit';

// Auth routes — strict limits
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 5,                       // 5 attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Try again in 15 minutes.' }
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// General API — generous but capped
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,         // 1 minute
  max: 120,
});
app.use('/api/', apiLimiter);
```

---

## Data Protection & PII Handling

Ensure compliance with data processing regulations (e.g., GDPR, FERPA, local PII laws).

- Scrub PII (passwords, emails, phone numbers) before writing to application log files
- Store database backups securely (using GPG encryption or local encryption tools)
- Never expose API tokens, cookies, or parameters in query strings

---

## File Upload Security

Always validate uploads inside Express controller:

```typescript
import { fromBuffer } from 'file-type';

const buffer = req.file.buffer;
const type = await fromBuffer(buffer);

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
if (!type || !ALLOWED_TYPES.includes(type.mime)) {
  return res.status(400).json({ error: 'File type not allowed' });
}

// Generate random filename to prevent Path Traversal
const safeFilename = crypto.randomUUID() + '.' + type.ext;
```

---

## Audit Logging

Save user modifications to the database `audit_log` table.

```typescript
async function auditLog(ctx: AuditContext) {
  await db.query(
    `INSERT INTO audit_log (user_id, action, entity, entity_id, before_data, after_data, ip_address, user_agent) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [ctx.userId, ctx.action, ctx.entity, ctx.entityId, JSON.stringify(ctx.before), JSON.stringify(ctx.after), ctx.ip, ctx.userAgent]
  );
}
```

---

## Secrets Management

### Local Development
Use `.env` files (make sure `.env` is inside `.gitignore`).

### Production (Free-Tier Friendly Solutions)
Instead of paid enterprise vaults (like AWS Secrets Manager, GCP Secret Manager, or HashiCorp Vault), use the following **completely free** methods:

1. **Platform Environment Variables (Recommended)**:
   If hosting on free-tier platforms like **Render**, **Railway**, **Fly.io**, or **Vercel**, configure secrets directly in the dashboard UI under **Environment Variables**. They are safely injected into the process memory at startup.
2. **Systemd / System Env**:
   If hosting on a free/cheap self-hosted VPS (like Oracle Cloud Free Tier, DigitalOcean droplet, or Linode), export secrets directly inside system environment configuration or systemd service unit files:
   ```ini
   # /etc/systemd/system/node-app.service
   Environment="DATABASE_URL=mysql://crm_app:my-secret-password@localhost:3306/techacademy_crm"
   Environment="JWT_ACCESS_SECRET=..."
   ```
3. **Encrypted local dotenv (Alternative)**:
   Encrypt environment files using tools like `dotenv-vault` (free tier) and deploy only the key to production.

---

## Dependency Security

Run safety checks locally or in free Github actions workflow:

```bash
npm audit --audit-level=high
```

---

## Error Handling

Enforce safe formats:

```typescript
app.use((err, req, res, next) => {
  const statusCode = err.statusCode ?? 500;
  
  // Log locally using winston/pino (stdout or file)
  logger.error(err);

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code ?? 'INTERNAL_ERROR',
      message: statusCode < 500 ? err.message : 'An unexpected error occurred'
    }
  });
});
```

---

## Infrastructure Security

### MySQL Least-Privilege User Setup

Run this script to limit application database access:

```sql
-- Create user restricted to localhost (or app host private IP)
CREATE USER 'crm_app'@'localhost' IDENTIFIED BY '<strong_random_password>';

-- Grant only read/write capabilities (No schema changes allowed)
GRANT SELECT, INSERT, UPDATE, DELETE ON techacademy_crm.* TO 'crm_app'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;
```

### Docker Container Hardening (Free/Open Source Tools)
- Pin images to specific Alpine releases (e.g. `node:20-alpine`)
- Use **Trivy** (free open source scanner) to scan images locally:
  ```bash
  trivy image my-express-app:latest
  ```

---

## Incident Response

### Secret Leak
1. Reset credentials instantly in your hosting dashboard variables.
2. Restart Node.js processes immediately to drop all old JWT sessions.
3. Review audit logs to detect potential unauthorized access.
