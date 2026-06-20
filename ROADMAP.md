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
| 3000 | Front-end (`npm run dev` in `frontend/`) |
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

- [x] **2.1** Real CSV export in `handleExport()`
- [x] **2.2** Export buttons pass actual row data
- [x] **2.3** Settings save → store (not toast-only)
- [x] **2.4** Password change validates demo password until API exists

## Phase 3 — Attendance

- [x] **3.1** All students in batch (not `slice(0, 6)`)
- [x] **3.2** Present / absent / leave
- [x] **3.3** Filter by selected batch
- [x] **3.4** Persist per date + batch
- [x] **3.5** Monthly report from saved records
- [x] **3.6** Dynamic month/year filter

## Phase 4 — Exams & certificates

- [x] **4.1** Persist marks on save
- [x] **4.2** Results from saved marks
- [x] **4.3** Certificate issue → store
- [x] **4.4** Certificate list from store
- [x] **4.5** Eligibility check before issue

## Phase 5 — Derived data & dashboard

- [x] **5.1** Sync `course.enrolled` on student changes
- [x] **5.2** Sync `batch.students` on assignment changes
- [x] **5.3** Enrollment chart from real admissions
- [x] **5.4** Fee chart from real payments
- [x] **5.5** Course pie from live counts
- [x] **5.6** Today's classes from batch data

## Phase 6 — CRUD gaps

- [x] **6.1** Delete course (with guards)
- [x] **6.2** Delete batch (with guards)
- [x] **6.3** Delete faculty
- [x] **6.4** Delete exam
- [x] **6.5** Delete notification

## Phase 7 — Security & roles

- [x] **7.1** `RoleGuard` component
- [x] **7.2** Guard every route in `router.tsx`
- [x] **7.3** Block URL bypass for staff/faculty
- [x] **7.4** Optional session timeout

## Phase 8 — UX polish

- [x] **8.1** Empty states
- [x] **8.2** Global student search
- [x] **8.3** Zod form validation
- [x] **8.4** Loading skeletons
- [x] **8.5** Confirm bulk actions

## Phase 9 — Fees (complete)

- [x] **9.1** Installments tab wired
- [x] **9.2** Payment history from store
- [x] **9.3** Sequential receipt numbers
- [x] **9.4** Reminder queue in store (delivery = Part C)

## Phase 10 — Reports

- [x] **10.1** Attendance report from store
- [x] **10.2** Date range filters
- [x] **10.3** Real CSV per report

## Phase 11 — Testing

- [x] **11.1** Add Vitest + RTL
- [x] **11.2** Unit tests (utils, roles)
- [x] **11.3** Login flow test
- [x] **11.4** Student CRUD test
- [x] **11.5** `npm test` in CI

---

# Part B — API integration layer (front-end)

Prepare front-end to talk to Node backend. **Scaffold already created** — finish wiring per module.

- [x] **B.1** `src/api/client.ts` + `config.ts` (fetch wrapper)
- [x] **B.2** `.env.example` with `VITE_API_URL`
- [x] **B.3** Vite proxy `/api` → `localhost:5000`
- [x] **B.4** `docs/API.md` — REST contract
- [x] **B.5** `docs/DATABASE.md` — SQL schema reference
- [x] **B.6** `backend/` folder + README structure
- [x] **B.7** Add `src/api/services/auth.service.ts` (stub)
- [x] **B.8** Add service stubs for all modules (see `src/api/README.md`)
- [x] **B.9** `useApiMode()` hook — switch Zustand vs API via `VITE_API_ENABLED`
- [ ] **B.10** Add React Query + provider (when first real endpoint exists)

> **Tip:** API mode is enabled via `.env.local` (`VITE_API_ENABLED=true`). Run the frontend and backend in separate terminals (`npm run dev` in each folder).

---

# Part C — Backend (Node.js + SQL)

You implement this in `backend/`. Follow `backend/README.md`, `docs/API.md`, and `docs/DATABASE.md`.

## Phase C1 — Project setup

- [ ] **C1.1** `backend/package.json` (Express + JavaScript)
- [x] **C1.2** ~~`backend/tsconfig.json`~~ (JavaScript — no build step)
- [ ] **C1.3** `backend/.env` from `.env.example`
- [ ] **C1.4** SQL connection pool (`src/db/pool.ts`)
- [ ] **C1.5** Choose ORM: Prisma / Drizzle / raw `pg`
- [ ] **C1.6** Initial migration (`users`, `institute_settings`)
- [ ] **C1.7** Seed script mirroring `src/constants/data.ts`
- [ ] **C1.8** Document `npm run dev` in `backend/` for local API

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

- [x] **C6.1** Auth — login via API, store JWT + refresh cookie session
- [x] **C6.2** Students → `students.service.ts` + API sync on load
- [x] **C6.3** Courses & batches
- [x] **C6.4** Attendance & fees
- [x] **C6.5** Faculty, exams, certificates
- [x] **C6.6** Reports, notifications, settings, dashboard
- [ ] **C6.7** Remove demo `DEMO_USERS` from client bundle
- [x] **C6.8** Set `VITE_API_ENABLED=true` by default (`.env.example`)

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
| A — Front-end | 52 | 52/52 |
| B — API layer prep | 10 | 9/10 |
| C — Node + SQL backend | 38 | 30/38 |
| **Total** | **100** | **91/100** |

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
