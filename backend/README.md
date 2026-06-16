# Backend — Node.js + TypeScript + MySQL (Express)

> **Status:** Reserved for the production API. The front-end runs standalone (Zustand persist) until this backend is wired in. See [Front-end Integration](#front-end-integration) for the swap plan.

---

## Table of Contents

1. [Stack](#stack)
2. [Folder Structure](#folder-structure)
3. [Environment Variables](#environment-variables)
4. [Security Architecture](#security-architecture)
5. [Authentication Flow](#authentication-flow)
6. [RBAC — Role & Permission Matrix](#rbac--role--permission-matrix)
7. [Database Schema Reference](#database-schema-reference)
8. [API Contract](#api-contract)
9. [Front-end Integration](#front-end-integration)
10. [Quick Start](#quick-start)
11. [Scripts](#scripts)
12. [Monorepo](#monorepo)

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Runtime | Node.js 20 LTS | Pin version using `.nvmrc` and `engines` |
| Framework | Express | Simple, lightweight, standard industry choice |
| Language | TypeScript 5+ | Strict type checking (`strict: true`), clean typing |
| Database | MySQL 8.0+ | ACID-compliant relational DB (Free tier available on Clever Cloud, Aiven, or local) |
| ORM / Queries | Prisma **or** Drizzle **or** `mysql2` | Parameterized queries enforced to block SQL injection |
| Auth | Short-lived JWT (15 min) + Refresh Token (7 d, HttpOnly cookie) | Secure session rotation strategy |
| Password Hashing | bcrypt | Cost factor **12** minimum |
| Validation | Zod | Matches front-end schemas; strips unknown fields on request payload |
| Security Headers | `helmet` | Sets standard headers (CSP, HSTS, X-Frame-Options, etc.) |
| Rate Limiting | `express-rate-limit` | Tiered per-IP and per-user limits (Free, local implementation) |
| File Uploads | `multer` + MIME validation | Strict file size and extension checks; stores outside webroot |
| Logging | `winston` or `pino` | Console/file logs (Free self-hosted, no paid log aggregator required) |
| Secrets | Environment variables | Loaded via `dotenv` in development; server host env variables in production (Free) |

---

## Folder Structure (Domain-Driven Module Architecture)

Instead of traditional flat layers (which scatter related student or fee files across the entire codebase), this project uses a **Feature-Based Module (Vertical Slice)** architecture. All code related to a single business domain resides in the same directory, making it highly modular, simple to scale, and easy to maintain.

```
backend/
├── .env                          # ← NEVER COMMIT (gitignored)
├── .env.example                  # Safe template — no real secrets
├── .nvmrc                        # Pins Node.js version
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript compiler configuration
├── README.md                     # Backend developer guide
├── SECURITY.md                   # Threat model & security instructions
│
├── prisma/                       # Database ORM settings (if using Prisma)
│   ├── schema.prisma
│   └── migrations/
│
├── sql/                          # Database Raw SQL migrations (if not using ORM)
│   ├── 001_init.sql
│   ├── 002_audit_log.sql
│   └── seed.sql
│
└── src/
    ├── server.ts                 # App entry point (PORT binding & graceful shutdown)
    ├── app.ts                    # Express instance configuration & global middleware registration
    │
    ├── config/                   # Global configuration & loaders
    │   ├── env.ts                # Environment validation (Zod)
    │   └── database.ts           # MySQL connection pool initialization
    │
    ├── middleware/               # App-wide global middleware
    │   ├── auth.middleware.ts    # JWT parsing & route authentication
    │   ├── error.middleware.ts   # Safe centralized error formats (hides stack traces)
    │   └── rate-limit.ts         # Global API request caps
    │
    ├── modules/                  # Feature Modules (Vertical Slices)
    │   ├── auth/                 # Authentication & Session Module
    │   │   ├── auth.controller.ts
    │   │   ├── auth.service.ts
    │   │   ├── auth.routes.ts
    │   │   └── auth.schema.ts
    │   │
    │   ├── students/             # Student Profiles & Enrolment Module
    │   │   ├── students.controller.ts
    │   │   ├── students.service.ts
    │   │   ├── students.repository.ts
    │   │   ├── students.routes.ts
    │   │   └── students.schema.ts
    │   │
    │   ├── courses/              # Curriculum & Course Catalogue Module
    │   │   ├── courses.controller.ts
    │   │   ├── courses.service.ts
    │   │   ├── courses.repository.ts
    │   │   └── courses.routes.ts
    │   │
    │   ├── fees/                 # Finance, Payments, and Invoicing Module
    │   │   ├── fees.controller.ts
    │   │   ├── fees.service.ts
    │   │   ├── fees.repository.ts
    │   │   └── fees.routes.ts
    │   │
    │   └── [other-modules]/      # batches, exams, notifications, attendance, etc.
    │
    └── shared/                   # Generic helpers, interfaces & types shared across modules
        ├── errors/               # Custom AppError classes
        │   └── app-error.ts
        ├── utils/                # Standard utility functions
        │   ├── crypto.ts         # JWT & hashing utilities
        │   └── mailer.ts         # Transactional email helpers (NodeMailer)
        └── types/                # Common TypeScript type definitions
            └── express.d.ts      # Custom extensions to Express Request namespaces
```

---

## Environment Variables

Copy `.env.example` → `.env` and fill in all variables.

```bash
cp .env.example .env
```

> **Free Production Hosting Rule:** Configure these variables directly in your hosting dashboard (e.g., Render, Railway, Vercel, or Fly.io) instead of uploading a `.env` file.

| Variable | Required | Description |
|---|---|---|
| `PORT` | ✅ | HTTP port (default `5000`) |
| `NODE_ENV` | ✅ | `development` / `production` / `test` |
| `DATABASE_URL` | ✅ | MySQL connection string: `mysql://user:pass@host:3306/dbname` |
| `DATABASE_POOL_MAX` | | Max DB pool connections (default `10`) |
| `JWT_ACCESS_SECRET` | ✅ | Access token secret (minimum 64 hex chars) |
| `JWT_REFRESH_SECRET` | ✅ | Refresh token secret (minimum 64 hex chars) |
| `JWT_ACCESS_EXPIRES_IN` | ✅ | `15m` (strict limit) |
| `JWT_REFRESH_EXPIRES_IN` | ✅ | `7d` |
| `CORS_ORIGIN` | ✅ | React frontend URL (e.g., `http://localhost:3000`) |
| `BCRYPT_ROUNDS` | | bcrypt work factor (default `12`) |
| `UPLOAD_DIR` | | Absolute upload directory |
| `MAX_UPLOAD_MB` | | Size limit (default `5`) |
| `ALLOWED_MIME_TYPES` | | Allowed mime types (e.g., `image/jpeg,image/png,application/pdf`) |
| `SMTP_HOST` | | Transactional SMTP Server (e.g. Brevo free SMTP / Gmail SMTP) |
| `SMTP_PORT` | | SMTP Port (usually `587` or `465`) |
| `SMTP_USER` | | SMTP Username |
| `SMTP_PASS` | | SMTP Password |
| `SMTP_FROM` | | `"School CRM" <no-reply@yourdomain.com>` |
| `RATE_LIMIT_AUTH_MAX` | | Auth endpoints rate limit per 15 min window (default `5`) |
| `RATE_LIMIT_API_MAX` | | API endpoints rate limit per 1 min window (default `120`) |
| `LOG_LEVEL` | | Log level: `info` (production) / `debug` (development) |

---

## Security Architecture

See [`SECURITY.md`](./SECURITY.md) for threat models and verification procedures.

```
Internet
   │
   ▼
[Reverse Proxy — Nginx / Caddy / Cloudflare Free Tunnel]
   • SSL/TLS (Let's Encrypt / Cloudflare Certificate)
   • HSTS: max-age=31536000
   • DDoS Mitigation (Cloudflare Free Tier)
   │
   ▼
[Node.js / Express API]
   • helmet (Secure headers)
   • CORS — strict allowlist, credentials: true
   • express-rate-limit (Auth endpoints capped at 5 req / 15 min)
   • Zod validation → reject unknown body arguments
   • JWT Access Verification (15m expiration)
   • RBAC Guard Middleware
   • XSS Input Sanitization
   │
   ▼
[MySQL Database]
   • Parameterized queries (using `?` placeholders or ORM)
   • Restricted user permissions (No DROP/ALTER permissions for application user)
   • Audit logging updates
```

### Mandatory security checklist before first production deploy

- [ ] All JWT secrets generated with `openssl rand -hex 64`
- [ ] `JWT_ACCESS_EXPIRES_IN=15m` confirmed
- [ ] Refresh tokens saved hashed in DB, rotated on refresh
- [ ] `bcrypt` rounds set to `12` or higher
- [ ] `helmet` middleware registered at top of app
- [ ] CORS `origin` configured to the exact frontend domain
- [ ] Rate limits verified on `/api/auth/login` (limit to 5 attempts / 15 minutes)
- [ ] Parameterized database queries verified everywhere (no template strings inside raw queries)
- [ ] File uploads validate file contents via magic byte analysis (using `file-type`), not just file extension
- [ ] Upload directory is located outside server's public static asset paths
- [ ] `NODE_ENV` is set to `production` in host settings (suppresses Express default HTML stack trace output)
- [ ] Audit log saves correct client details on modification actions
- [ ] CI pipeline runs `npm audit` to capture vulnerabilities
- [ ] MySQL user restricted to `SELECT, INSERT, UPDATE, DELETE` (cannot issue `ALTER` or `DROP`)
- [ ] Error handler formats output to `{ success: false, error: { code, message } }` — never sends system SQL errors to users

---

## Authentication Flow

### Login

```
Client                          Server
  │                               │
  │  POST /api/auth/login         │
  │  { email, password }          │
  │──────────────────────────────▶│
  │                               │  1. Rate limit verification (express-rate-limit)
  │                               │  2. Lookup user record in MySQL
  │                               │  3. Verify via bcrypt.compare()
  │                               │  4. Generate short access token (15 min)
  │                               │  5. Generate refresh token, save hash to `refresh_tokens` table
  │                               │  6. Set refresh token in HttpOnly, Secure, SameSite=Strict cookie
  │                               │
  │  200 { accessToken, user }    │
  │  Set-Cookie: refreshToken=... │
  │◀──────────────────────────────│
```

### Token Refresh

```
Client                          Server
  │                               │
  │  POST /api/auth/refresh       │
  │  Cookie: refreshToken=...     │
  │──────────────────────────────▶│
  │                               │  1. Read HttpOnly cookie value
  │                               │  2. Compute hash, lookup in database table
  │                               │  3. Validate expiry, ensure not revoked
  │                               │  4. Issue new access token
  │                               │  5. Rotate refresh token (replace entry in MySQL)
  │                               │
  │  200 { accessToken }          │
  │◀──────────────────────────────│
```

### Logout

```
POST /api/auth/logout
  → Delete refresh token entry from MySQL
  → Reset refresh token cookie (Max-Age=0)
```

### Password Reset

```
POST /api/auth/forgot-password   → Send 15-minute token link via nodemailer (free Brevo/Gmail SMTP)
POST /api/auth/reset-password    → Verify token, hash new password, delete user's active refresh tokens
```

---

## RBAC — Role & Permission Matrix

| Permission | Super Admin | Admin | Faculty | Student |
|---|:---:|:---:|:---:|:---:|
| Manage admins & roles | ✅ | ❌ | ❌ | ❌ |
| Manage faculty | ✅ | ✅ | ❌ | ❌ |
| Manage students | ✅ | ✅ | ❌ | ❌ |
| View all students | ✅ | ✅ | ✅ (own batch) | ❌ |
| Manage courses & batches | ✅ | ✅ | ❌ | ❌ |
| Mark attendance | ✅ | ✅ | ✅ (own batch) | ❌ |
| View own attendance | ✅ | ✅ | ✅ | ✅ |
| Manage fees | ✅ | ✅ | ❌ | ❌ |
| View own fees | ✅ | ✅ | ❌ | ✅ |
| Manage exams | ✅ | ✅ | ✅ (own batch) | ❌ |
| View own grades | ✅ | ✅ | ✅ | ✅ |
| Issue certificates | ✅ | ✅ | ❌ | ❌ |
| View reports | ✅ | ✅ | ❌ | ❌ |
| Manage settings | ✅ | ❌ | ❌ | ❌ |
| View audit log | ✅ | ❌ | ❌ | ❌ |

---

## Database Schema Reference

Full schema layout available at [`../docs/DATABASE.md`](../docs/DATABASE.md).

### Critical MySQL Security Tables

```sql
-- Refresh token store
CREATE TABLE refresh_tokens (
  id          VARCHAR(36) PRIMARY KEY,       -- UUID generated in application logic
  user_id     VARCHAR(36) NOT NULL,
  token_hash  VARCHAR(255) NOT NULL UNIQUE,  -- bcrypt or sha256 hash of refresh token
  expires_at  TIMESTAMP NOT NULL,
  revoked_at  TIMESTAMP NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address  VARCHAR(45),                   -- supports IPv4 and IPv6
  user_agent  TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Immutable audit log (Application database user should only have INSERT permission here)
CREATE TABLE audit_log (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     VARCHAR(36) NULL,
  action      VARCHAR(100) NOT NULL,         -- e.g. 'STUDENT_UPDATE', 'LOGIN'
  entity      VARCHAR(100),                  -- target table
  entity_id   VARCHAR(36),
  before_data JSON NULL,                     -- MySQL JSON field
  after_data  JSON NULL,                     -- MySQL JSON field
  ip_address  VARCHAR(45),
  user_agent  TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Failed login tracking (prevents lockouts but allows auditing)
CREATE TABLE login_attempts (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email       VARCHAR(255) NOT NULL,
  ip_address  VARCHAR(45) NOT NULL,
  succeeded   BOOLEAN NOT NULL DEFAULT FALSE,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
```

---

## API Contract

REST endpoints per module → [`../docs/API.md`](../docs/API.md)

### Standard response envelope

```typescript
// Success
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "total": 200 }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required"
  }
}
```

### Authorization Header

Include on all authenticated API requests:
```
Authorization: Bearer <accessToken>
```

---

## Front-end Integration

Once the Express API is ready, switch the frontend state client to fetch calls:

1. **`src/api/client.ts`** — Axios or Fetch implementation:
   - Configures authorization header injection from local memory
   - Automatically handles 401 response → calls refresh endpoint `/api/auth/refresh` → retries API query
   - Avoids storing access tokens in persistent storage (e.g. `localStorage` or `sessionStorage`) due to XSS theft vulnerability. Keep tokens strictly in-memory.
2. **`src/api/services/*.ts`** — API service files per category (courses, fees, students, etc.)
3. **React Query** — Handles query invalidation, caching, and state synchronization.

---

## Quick Start

```bash
cd backend
cp .env.example .env
# Edit credentials in .env (Generate secrets using `openssl rand -hex 64`)

pnpm install
pnpm run db:migrate        # runs Prisma/SQL migrations
pnpm run db:seed           # applies seeding data
pnpm run dev               # starts Express server on http://localhost:5000
```

From root project directory:

```bash
pnpm dev          # frontend :3000
pnpm dev:api      # backend :5000
```

---

## Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Starts app locally with `nodemon` or `tsx watch` |
| `pnpm build` | Compiles TypeScript modules into `dist/` |
| `pnpm start` | Executes production files: `node dist/index.js` |
| `pnpm db:migrate` | Runs database migrations |
| `pnpm db:migrate:reset` | **⚠ Destructive** — recreates the database schemas |
| `pnpm db:seed` | Populates demo data |
| `pnpm test` | Launches local tests |
| `pnpm lint` | Performs ESLint analysis |
| `pnpm typecheck` | Validates types without code emission (`tsc --noEmit`) |
| `pnpm audit` | Runs `npm audit --audit-level=high` (checks vulnerabilities) |

---

## Monorepo

Configured in `pnpm-workspace.yaml`:

```yaml
packages:
  - "."
  - "backend"
```
