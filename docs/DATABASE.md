# Database Schema — SQL

> **Status:** Design reference for your Node + SQL backend. Align tables with `src/types/index.ts`.

Recommended: **PostgreSQL**. Naming: `snake_case` columns, `uuid` or `serial` primary keys.

---

## Core tables

### `users`

Staff login accounts (admin, staff, faculty).

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| name | VARCHAR | |
| email | VARCHAR UNIQUE | |
| password_hash | VARCHAR | bcrypt |
| role | ENUM | admin, staff, faculty |
| phone | VARCHAR | nullable |
| photo_url | VARCHAR | nullable |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

---

### `institute_settings`

Single-row or keyed settings for branding/templates.

| Column | Type | Notes |
|--------|------|-------|
| id | INT PK | usually 1 row |
| name | VARCHAR | |
| phone | VARCHAR | |
| email | VARCHAR | |
| address | TEXT | |
| registration_no | VARCHAR | |
| academic_year | VARCHAR | |
| logo_url | VARCHAR | nullable |
| receipt_config | JSONB | template fields |
| certificate_config | JSONB | template fields |

---

### `courses`

| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR PK | e.g. CRS-001 |
| name | VARCHAR | |
| duration | VARCHAR | |
| fees | DECIMAL | |
| description | TEXT | |
| status | VARCHAR | Active / Inactive |
| created_at | TIMESTAMPTZ | |

---

### `batches`

| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR PK | |
| course_id | VARCHAR FK → courses | |
| name | VARCHAR | |
| timing | VARCHAR | |
| faculty_id | VARCHAR FK → faculty | nullable |
| status | VARCHAR | Upcoming / Ongoing / Completed |
| start_date | DATE | |
| end_date | DATE | |

---

### `students`

| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR PK | STU-001 |
| name | VARCHAR | |
| phone | VARCHAR | |
| email | VARCHAR | |
| course_id | VARCHAR FK | |
| batch_id | VARCHAR FK | nullable |
| guardian | VARCHAR | |
| guardian_phone | VARCHAR | |
| address | TEXT | |
| admission_date | DATE | |
| fees_total | DECIMAL | |
| fees_paid | DECIMAL | default 0 |
| status | VARCHAR | Active / Completed / … |
| dob | DATE | |
| grade | VARCHAR | nullable |
| photo_url | VARCHAR | nullable |

---

### `faculty`

| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR PK | |
| name | VARCHAR | |
| subject | VARCHAR | |
| phone | VARCHAR | |
| email | VARCHAR | |
| salary | DECIMAL | |
| experience | VARCHAR | |
| qualification | VARCHAR | |

---

### `attendance_records`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| student_id | VARCHAR FK | |
| batch_id | VARCHAR FK | |
| date | DATE | |
| status | VARCHAR | present / absent / leave |
| marked_by | UUID FK → users | |
| UNIQUE | (student_id, batch_id, date) | |

---

### `payments`

| Column | Type | Notes |
|--------|------|-------|
| receipt | VARCHAR PK | RCP-2024-001 |
| student_id | VARCHAR FK | |
| amount | DECIMAL | |
| mode | VARCHAR | Cash / UPI / … |
| date | DATE | |
| remarks | TEXT | nullable |
| created_by | UUID FK → users | |

---

### `exams`

| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR PK | |
| title | VARCHAR | |
| course_id | VARCHAR FK | |
| batch_id | VARCHAR FK | |
| date | DATE | |
| max_marks | INT | |
| status | VARCHAR | |

---

### `exam_marks`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| exam_id | VARCHAR FK | |
| student_id | VARCHAR FK | |
| marks | INT | |
| UNIQUE | (exam_id, student_id) | |

---

### `certificates`

| Column | Type | Notes |
|--------|------|-------|
| cert_no | VARCHAR PK | CERT-2024-001 |
| student_id | VARCHAR FK | |
| course_id | VARCHAR FK | |
| grade | VARCHAR | |
| issue_date | DATE | |
| authorised_by | VARCHAR | |

---

### `notifications`

| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | |
| user_id | UUID FK | nullable = broadcast |
| type | VARCHAR | fee / admission / … |
| title | VARCHAR | |
| message | TEXT | |
| read | BOOLEAN | default false |
| created_at | TIMESTAMPTZ | |

---

## Relationships (ER summary)

```
courses 1──* batches
courses 1──* students
batches 1──* students
faculty 1──* batches
students 1──* payments
students 1──* attendance_records
students 1──* exam_marks
students 1──* certificates
exams 1──* exam_marks
users 1──* notifications (optional)
```

---

## Migration order

1. `users`, `institute_settings`
2. `courses`, `faculty`
3. `batches`
4. `students`
5. `attendance_records`, `payments`
6. `exams`, `exam_marks`
7. `certificates`, `notifications`

---

## Seed data

Mirror `src/constants/data.ts` for dev/demo parity when API is connected.

---

*When you pick Prisma/Drizzle, generate schema from this doc and keep in sync with API types.*
