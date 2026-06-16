# Project Roadmap — One Task at a Time

Work through **Part A** first (front-end fixes). **Part B** prepares API wiring. **Part C** is your **Node.js + SQL** backend — build when ready.

> **Stack decision:** Front-end = React/Vite · Backend = **Node + SQL** (PostgreSQL recommended)  
> **Rule:** Finish one task fully before starting the next.

---

## Project layout

```
school-management-crm/
├── src/                    # React front-end (active now)
│   └── api/                # HTTP client — ready for backend
├── backend/                # Node + SQL API (you build here)
│   └── README.md
├── docs/
│   ├── API.md              # REST contract
│   └── DATABASE.md         # SQL schema reference
├── ROADMAP.md              # this file
└── .env.example            # VITE_API_URL
```

| Port | Service |
|------|---------|
| 3000 | Front-end (`pnpm dev`) |
| 5000 | Backend API (`backend/` — when built) |

---

# Part A — Front-end (before backend)

Fix demo gaps while Zustand + localStorage remain the data source.

## Phase 1 — Data layer (foundation)

Everything else depends on a single, consistent data source. **Types align with `docs/DATABASE.md` for Node + SQL backend.**

- [x] **1.1** Wire `FeesPage` to Zustand `payments` store
- [x] **1.2** Wire `ExamsPage` to Zustand `exams` store
- [x] **1.3** Add `certificates` + `attendance` to Zustand store
- [x] **1.4** Wire `CertificatesPage` to store
- [x] **1.5** Wire `AttendancePage` save to store
- [x] **1.6** Add `settings` to Zustand store
- [x] **1.7** Wire `SettingsPanel` to store (editable inputs)

## Phase 2 — Real actions

- [ ] **2.1** Real CSV export in `handleExport()`
- [ ] **2.2** Export buttons pass actual row data
- [ ] **2.3** Settings save → store (not toast-only)
- [ ] **2.4** Password change validates demo password until API exists

## Phase 3 — Attendance

- [ ] **3.1** All students in batch (not `slice(0, 6)`)
- [ ] **3.2** Present / absent / leave
- [ ] **3.3** Filter by selected batch
- [ ] **3.4** Persist per date + batch
- [ ] **3.5** Monthly report from saved records
- [ ] **3.6** Dynamic month/year filter

## Phase 4 — Exams & certificates

- [ ] **4.1** Persist marks on save
- [ ] **4.2** Results from saved marks
- [ ] **4.3** Certificate issue → store
- [ ] **4.4** Certificate list from store
- [ ] **4.5** Eligibility check before issue

## Phase 5 — Derived data & dashboard

- [ ] **5.1** Sync `course.enrolled` on student changes
- [ ] **5.2** Sync `batch.students` on assignment changes
- [ ] **5.3** Enrollment chart from real admissions
- [ ] **5.4** Fee chart from real payments
- [ ] **5.5** Course pie from live counts
- [ ] **5.6** Today's classes from batch data

## Phase 6 — CRUD gaps

- [ ] **6.1** Delete course (with guards)
- [ ] **6.2** Delete batch (with guards)
- [ ] **6.3** Delete faculty
- [ ] **6.4** Delete exam
- [ ] **6.5** Delete notification

## Phase 7 — Security & roles

- [ ] **7.1** `RoleGuard` component
- [ ] **7.2** Guard every route in `router.tsx`
- [ ] **7.3** Block URL bypass for staff/faculty
- [ ] **7.4** Optional session timeout

## Phase 8 — UX polish

- [ ] **8.1** Empty states
- [ ] **8.2** Global student search
- [ ] **8.3** Zod form validation
- [ ] **8.4** Loading skeletons
- [ ] **8.5** Confirm bulk actions

## Phase 9 — Fees (complete)

- [ ] **9.1** Installments tab wired
- [ ] **9.2** Payment history from store
- [ ] **9.3** Sequential receipt numbers
- [ ] **9.4** Reminder queue in store (delivery = Part C)

## Phase 10 — Reports

- [ ] **10.1** Attendance report from store
- [ ] **10.2** Date range filters
- [ ] **10.3** Real CSV per report

## Phase 11 — Testing

- [ ] **11.1** Add Vitest + RTL
- [ ] **11.2** Unit tests (utils, roles)
- [ ] **11.3** Login flow test
- [ ] **11.4** Student CRUD test
- [ ] **11.5** `pnpm test` in CI

---

# Part B — API integration layer (front-end)

Prepare front-end to talk to Node backend. **Scaffold already created** — finish wiring per module.

- [x] **B.1** `src/api/client.ts` + `config.ts` (fetch wrapper)
- [x] **B.2** `.env.example` with `VITE_API_URL`
- [x] **B.3** Vite proxy `/api` → `localhost:5000`
- [x] **B.4** `docs/API.md` — REST contract
- [x] **B.5** `docs/DATABASE.md` — SQL schema reference
- [x] **B.6** `backend/` folder + README structure
- [ ] **B.7** Add `src/api/services/auth.service.ts` (stub)
- [ ] **B.8** Add service stubs for all modules (see `src/api/README.md`)
- [ ] **B.9** `useApiMode()` hook — switch Zustand vs API via `VITE_API_ENABLED`
- [ ] **B.10** Add React Query + provider (when first real endpoint exists)

> **Tip:** Build Part A Phases 1–7 first, then B.7–B.10 in parallel with Part C.

---

# Part C — Backend (Node.js + SQL)

You implement this in `backend/`. Follow `backend/README.md`, `docs/API.md`, and `docs/DATABASE.md`.

## Phase C1 — Project setup

- [ ] **C1.1** `backend/package.json` (Express/Fastify + TypeScript)
- [ ] **C1.2** `backend/tsconfig.json`
- [ ] **C1.3** `backend/.env` from `.env.example`
- [ ] **C1.4** SQL connection pool (`src/db/pool.ts`)
- [ ] **C1.5** Choose ORM: Prisma / Drizzle / raw `pg`
- [ ] **C1.6** Initial migration (`users`, `institute_settings`)
- [ ] **C1.7** Seed script mirroring `src/constants/data.ts`
- [ ] **C1.8** `pnpm dev:api` script at repo root

## Phase C2 — Auth & middleware

- [ ] **C2.1** `POST /api/auth/login` — JWT + bcrypt
- [ ] **C2.2** `GET /api/auth/me`
- [ ] **C2.3** `PATCH /api/auth/password`
- [ ] **C2.4** `auth` middleware — verify JWT
- [ ] **C2.5** `rbac` middleware — admin / staff / faculty
- [ ] **C2.6** CORS for `http://localhost:3000`

## Phase C3 — Core entities (SQL + REST)

- [ ] **C3.1** Courses — CRUD + migrations
- [ ] **C3.2** Faculty — CRUD
- [ ] **C3.3** Batches — CRUD + faculty FK
- [ ] **C3.4** Students — CRUD + search/pagination + photo upload
- [ ] **C3.5** Wire front-end Students module → API (first live integration)

## Phase C4 — Operations

- [ ] **C4.1** Attendance — bulk upsert + monthly report SQL
- [ ] **C4.2** Payments — collect fee + receipt numbering
- [ ] **C4.3** Exams + exam_marks tables + marks API
- [ ] **C4.4** Certificates — issue + list
- [ ] **C4.5** Notifications — inbox CRUD

## Phase C5 — Institute features

- [ ] **C5.1** Settings API — institute, receipt, certificate templates
- [ ] **C5.2** Dashboard aggregates (stats + charts SQL)
- [ ] **C5.3** Reports endpoints + CSV export
- [ ] **C5.4** Fee reminders queue (email/SMS provider optional)

## Phase C6 — Front-end cutover

Replace Zustand persist **module by module** (don't big-bang):

- [ ] **C6.1** Auth — login via API, store JWT
- [ ] **C6.2** Students → `students.service.ts` + React Query
- [ ] **C6.3** Courses & batches
- [ ] **C6.4** Attendance & fees
- [ ] **C6.5** Faculty, exams, certificates
- [ ] **C6.6** Reports, notifications, settings, dashboard
- [ ] **C6.7** Remove demo `DEMO_USERS` from client bundle
- [ ] **C6.8** Set `VITE_API_ENABLED=true` by default

## Phase C7 — Production

- [ ] **C7.1** Dockerfile (API) + env secrets
- [ ] **C7.2** SQL migrations in CI
- [ ] **C7.3** API integration tests (supertest)
- [ ] **C7.4** Deploy API + static front-end
- [ ] **C7.5** HTTPS, rate limiting, helmet

---

## Recommended order

```
Part A (Phases 1–7)  →  Part C (C1–C2 auth)  →  C3.5 first API wire
        ↓                        ↓
Part A (8–11)          →  Part C (C3–C5 all APIs)
        ↓                        ↓
Part B (B.7–B.10)      →  Part C6 cutover module by module
```

---

## Progress tracker

| Section | Tasks | Done |
|---------|-------|------|
| A — Front-end | 52 | 7/52 |
| B — API layer prep | 10 | 6/10 |
| C — Node + SQL backend | 38 | 0/38 |
| **Total** | **100** | **13/100** |

---

## Quick links

| Doc | Purpose |
|-----|---------|
| [`backend/README.md`](backend/README.md) | Backend folder guide |
| [`docs/API.md`](docs/API.md) | REST endpoints |
| [`docs/DATABASE.md`](docs/DATABASE.md) | SQL tables |
| [`src/api/README.md`](src/api/README.md) | Front-end HTTP layer |
| [`src/types/index.ts`](src/types/index.ts) | Shared type shapes |

---

*Last updated: June 2026*
