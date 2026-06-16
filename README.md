# School Management System CRM

A modern, full-featured **Institute Management System** for educational institutes. Manage student admissions, courses, batches, attendance, fees, exams, certificates, faculty, reports, and notifications — all from a single, role-aware dashboard.

Built for **TechAcademy** as a production-grade front-end application with demo data, persistent local state, and a polished UI.

![Dashboard](docs/screenshots/dashboard.png)

---

## Table of Contents

- [Overview](#overview)
- [Screenshots](#screenshots)
- [Features](#features)
- [User Roles & Access](#user-roles--access)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Demo Accounts](#demo-accounts)
- [Available Scripts](#available-scripts)
- [Data & Persistence](#data--persistence)
- [CI / Quality Checks](#ci--quality-checks)
- [Architecture Notes](#architecture-notes)
- [Regenerating Screenshots](#regenerating-screenshots)
- [Specification Reference](#specification-reference)
- [Roadmap & Limitations](#roadmap--limitations)

---

## Overview

This CRM covers end-to-end institute administration:

| Area | Capabilities |
|------|-------------|
| **Students** | Admissions, profiles, ID generation, guardian info, course/batch enrollment, search & export |
| **Courses** | Create courses, duration, fees, descriptions, active/inactive status |
| **Batches** | Batch creation, timings, faculty assignment, student lists, status tracking |
| **Attendance** | Daily student attendance, monthly reports, absent student lists |
| **Fees** | Collection, due tracking, installments, payment history, printable receipts |
| **Faculty** | Profiles, subject assignment, salary records, faculty attendance |
| **Exams** | Exam creation, marks entry, results, performance reports |
| **Certificates** | Issue certificates, certificate numbers, print-ready layouts |
| **Reports** | Student, admission, fee, attendance, and faculty reports |
| **Notifications** | Fee reminders, admission confirmations, course completion alerts |
| **Settings** | Institute branding, receipt format, certificate format, role overview |

> **Note:** This is currently a **front-end application** with seeded demo data stored in the browser via Zustand persist. There is no backend API yet — ideal for demos, prototyping, and UI/UX validation.

---

## Screenshots

### Login

Role-based sign-in with demo account shortcuts for Admin, Staff, and Faculty.

![Login](docs/screenshots/login.png)

### Dashboard

Real-time KPIs, enrollment trends, fee collection charts, course distribution, and today's class schedule.

![Dashboard](docs/screenshots/dashboard.png)

### Students

Search, filter, paginate, add/edit students, view detailed profiles, and export data.

![Students](docs/screenshots/students.png)

### Courses

Manage course catalog with duration, fees, enrollment counts, and status.

![Courses](docs/screenshots/courses.png)

### Batches

Organize students into timed batches with faculty assignment and status tracking.

![Batches](docs/screenshots/batches.png)

### Attendance

Mark daily attendance and review monthly attendance summaries.

![Attendance](docs/screenshots/attendance.png)

### Fee Management

Collect fees, track dues, view payment history, send reminders, and print receipts.

![Fees](docs/screenshots/fees.png)

### Faculty

Manage trainer profiles, subjects, salary slips, and attendance.

![Faculty](docs/screenshots/faculty.png)

### Exams

Create exams, enter marks, and review student performance.

![Exams](docs/screenshots/exams.png)

### Certificates

Issue and print completion certificates with unique certificate numbers.

![Certificates](docs/screenshots/certificates.png)

### Reports

Generate institute-wide reports across students, fees, attendance, and faculty.

![Reports](docs/screenshots/reports.png)

### Notifications

Centralized notification inbox with read/unread status.

![Notifications](docs/screenshots/notifications.png)

### Settings

Configure institute details, logo, receipt format, certificate layout, and role permissions.

![Settings](docs/screenshots/settings.png)

---

## Features

### Dashboard
- Total & active student counts
- New admissions this month
- Fees due & fees collected
- Total courses & upcoming batches
- Today's class schedule
- Enrollment trend chart (area)
- Fee collection chart (bar)
- Course distribution (pie)

### Student Management
- New student admission with auto-generated IDs
- Student photo upload
- Guardian information & address
- Course enrollment & batch assignment
- Full student profile view
- Search by name, ID, or course
- Filter by course and status
- CSV export
- Pagination

### Course Management
- Create / edit / delete courses
- Duration, fees, and description
- Active / inactive status
- Batch and enrollment counts
- Course detail modal

### Batch Management
- Create batches with timing and dates
- Faculty assignment
- View enrolled students per batch
- Status: Upcoming, Ongoing, Completed

### Attendance Management
- Daily attendance marking (Present / Absent / Leave)
- Batch-wise attendance
- Monthly attendance summary
- Absent student list

### Fee Management
- Fee collection with multiple payment modes
- Due fees tracking & installment support
- Payment history with receipts
- Printable fee receipts
- Due student list & reminder actions
- Collection rate statistics

### Faculty / Trainer Management
- Add and manage faculty profiles
- Subject assignment & qualifications
- Salary records with printable salary slips
- Faculty attendance tracking

### Exam Management
- Create exams by course and batch
- Marks entry and result generation
- Student performance overview

### Certificate Management
- Issue certificates to eligible students
- Auto certificate number generation
- Print-ready certificate preview

### Reports
- Student report
- Admission report
- Fee collection report
- Due fee report
- Attendance report
- Faculty report

### Notifications
- Fee due reminders
- Admission confirmations
- Course completion notifications
- Mark as read / delete

### Settings
- Institute name, address, contact details
- Logo upload (max 2 MB)
- Receipt format configuration
- Certificate format configuration
- User role reference panel

---

## User Roles & Access

| Role | Access Level | Modules |
|------|-------------|---------|
| **Admin** | Full access — all modules and settings | All modules |
| **Staff** | Student & fee management | Dashboard, Students, Courses, Batches, Attendance, Fees, Notifications |
| **Faculty** | Attendance & marks entry | Dashboard, Attendance, Exams, Notifications |

Navigation is filtered automatically based on the signed-in user's role. Unauthorized routes redirect to the dashboard.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 18 |
| **Language** | TypeScript (strict mode) |
| **Build Tool** | Vite 6 |
| **Routing** | React Router 7 |
| **State** | Zustand 5 (with `persist` middleware → localStorage) |
| **Styling** | Tailwind CSS 4 |
| **UI Components** | Radix UI primitives + custom shared components |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Forms** | React Hook Form |
| **Animations** | Motion |
| **Toasts** | Sonner |
| **Dates** | date-fns |
| **Package Manager** | pnpm |

---

## Project Structure

```
school-management-crm/
├── .github/workflows/     # CI pipeline (lint, typecheck, build)
├── docs/
│   └── screenshots/       # README screenshots (auto-generated)
├── guidelines/            # Product spec & design guidelines
│   ├── Guidelines.md
│   └── Institute_Management.pdf
├── public/                # Static assets
├── scripts/
│   └── capture-screenshots.mjs
├── src/
│   ├── app/               # App shell, router, shadcn/ui primitives
│   ├── components/
│   │   ├── layout/        # AppShell, Sidebar, Header, ErrorBoundary
│   │   └── shared/        # Reusable UI (Btn, Card, Modal, StatCard, …)
│   ├── constants/         # Demo data, navigation, roles
│   ├── features/          # Feature modules (one folder per page)
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── students/
│   │   ├── courses/
│   │   ├── batches/
│   │   ├── attendance/
│   │   ├── fees/
│   │   ├── faculty/
│   │   ├── exams/
│   │   ├── certificates/
│   │   ├── reports/
│   │   ├── notifications/
│   │   └── settings/
│   ├── lib/               # Utilities (formatting, export helpers)
│   ├── store/             # Zustand global store
│   ├── styles/            # Global CSS, theme tokens, fonts
│   └── types/             # Shared TypeScript types
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

Path alias: `@/` → `src/` (configured in both `vite.config.ts` and `tsconfig.json`).

---

## Getting Started

### Prerequisites

- **Node.js** 20 or later
- **pnpm** 11 (ships with Corepack, or install via `npm install -g pnpm`)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd school-management-crm

# Install dependencies
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Vite will pick the next available port if 3000 is in use.

### Production Build

```bash
pnpm build
```

Output is written to the `dist/` folder.

### Preview Production Build

```bash
pnpm preview
```

---

## Demo Accounts

Use these credentials on the login page, or click the demo role buttons to auto-fill:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@techacademy.com` | `admin123` |
| Staff | `staff@techacademy.com` | `staff123` |
| Faculty | `faculty@techacademy.com` | `faculty123` |

Authentication is **client-side only** for demonstration purposes. Do not use these patterns in production.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite dev server with HMR |
| `pnpm build` | Type-check and build for production |
| `pnpm preview` | Serve the production build locally |
| `pnpm lint` | Run ESLint across the project |
| `pnpm lint:fix` | Auto-fix ESLint issues |
| `pnpm format` | Format all files with Prettier |
| `pnpm format:check` | Check formatting without writing |
| `pnpm screenshots` | Regenerate README screenshots (requires dev server) |

---

## Data & Persistence

- **Initial data** is seeded from `src/constants/data.ts` (students, courses, batches, faculty, exams, payments, notifications).
- **Runtime changes** (add/edit/delete) are stored in **Zustand** and persisted to **localStorage** via the `persist` middleware.
- Clearing browser storage resets the app to default demo data.
- **No backend** — all CRUD operations happen in-memory on the client.

---

## CI / Quality Checks

GitHub Actions runs on every push and pull request to `main` / `master`:

1. `pnpm install`
2. `pnpm tsc --noEmit` — TypeScript strict compilation
3. `pnpm run lint` — ESLint
4. `pnpm run build` — Production build verification

Workflow file: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

---

## Architecture Notes

- **Feature-based folders** — each module owns its page and modals under `src/features/`.
- **Lazy-loaded routes** — pages are code-split via `React.lazy()` for faster initial load.
- **Protected routes** — unauthenticated users are redirected to `/login`.
- **Error boundaries** — each route is wrapped in an `ErrorBoundary` to prevent full-app crashes.
- **Role-based navigation** — sidebar items filtered via `canAccess()` in `src/constants/roles.ts`.
- **Shared design system** — custom components in `src/components/shared/` plus Radix/shadcn primitives in `src/app/components/ui/`.

---

## Regenerating Screenshots

Screenshots in `docs/screenshots/` can be refreshed after UI changes:

```bash
# Terminal 1 — start the dev server
pnpm dev

# Terminal 2 — capture screenshots (uses Chrome on Windows by default)
pnpm screenshots
```

Optional environment variables:

| Variable | Default | Purpose |
|----------|---------|---------|
| `APP_URL` | `http://localhost:3000` | Dev server URL |
| `CHROME_PATH` | `C:\Program Files\Google\Chrome\Application\chrome.exe` | Chrome executable |

---

## Specification Reference

The full product specification is available in:

- [`guidelines/Institute_Management.pdf`](guidelines/Institute_Management.pdf) — Feature specification document v1.0
- [`guidelines/Guidelines.md`](guidelines/Guidelines.md) — Design and development guidelines

---

## Roadmap & Limitations

### Current limitations
- No real backend API or database
- Demo authentication (no JWT, OAuth, or session server)
- Data is per-browser (localStorage), not shared across devices
- Print/export features are client-side simulations

### Planned enhancements
- REST or GraphQL API integration
- Real authentication & authorization server
- Database persistence (PostgreSQL / MongoDB)
- Email/SMS notification delivery
- Multi-institute (tenant) support
- Mobile-responsive enhancements & PWA

---

## License

This project is **private** (`"private": true` in `package.json`). All rights reserved unless otherwise specified by the repository owner.
