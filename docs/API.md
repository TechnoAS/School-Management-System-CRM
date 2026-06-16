# API Contract — Node + SQL Backend

> **Status:** Specification for backend implementation. Front-end will call these endpoints via `src/api/`.

**Base URL:** `http://localhost:5000/api`  
**Auth:** `Authorization: Bearer <jwt>` on protected routes  
**Format:** JSON request/response bodies unless noted

---

## Auth

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | public | `{ email, password }` → `{ user, token }` |
| POST | `/auth/logout` | any | Invalidate session (if using refresh tokens) |
| GET | `/auth/me` | any | Current user + role |
| PATCH | `/auth/password` | any | Change password |

---

## Students

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/students` | admin, staff | List + `?search=&course=&status=&page=` |
| GET | `/students/:id` | admin, staff | Single profile |
| POST | `/students` | admin, staff | Create admission |
| PATCH | `/students/:id` | admin, staff | Update |
| DELETE | `/students/:id` | admin | Soft delete |
| POST | `/students/:id/photo` | admin, staff | Multipart upload |

---

## Courses

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/courses` | admin, staff | List all |
| GET | `/courses/:id` | admin, staff | Detail + stats |
| POST | `/courses` | admin | Create |
| PATCH | `/courses/:id` | admin | Update |
| DELETE | `/courses/:id` | admin | Delete if no enrollments |

---

## Batches

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/batches` | admin, staff | List |
| GET | `/batches/:id` | admin, staff | Detail + roster |
| GET | `/batches/:id/students` | admin, staff | Enrolled students |
| POST | `/batches` | admin | Create |
| PATCH | `/batches/:id` | admin | Update |
| DELETE | `/batches/:id` | admin | Delete if empty |

---

## Attendance

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/attendance` | admin, staff, faculty | `?batchId=&date=` |
| PUT | `/attendance` | admin, staff, faculty | Bulk upsert marks |
| GET | `/attendance/report` | admin, staff | Monthly summary |

---

## Fees & payments

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/fees/due` | admin, staff | Due students |
| GET | `/payments` | admin, staff | Payment history |
| POST | `/payments` | admin, staff | Collect fee → receipt |
| GET | `/payments/:receipt` | admin, staff | Receipt detail |
| POST | `/fees/reminders` | admin, staff | Queue reminders |

---

## Faculty

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/faculty` | admin | List |
| GET | `/faculty/:id` | admin | Profile |
| POST | `/faculty` | admin | Create |
| PATCH | `/faculty/:id` | admin | Update |
| DELETE | `/faculty/:id` | admin | Delete |
| POST | `/faculty/:id/attendance` | admin | Mark attendance |
| GET | `/faculty/:id/salary` | admin | Salary slip data |

---

## Exams

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/exams` | admin, faculty | List |
| POST | `/exams` | admin, faculty | Create |
| PATCH | `/exams/:id` | admin, faculty | Update |
| DELETE | `/exams/:id` | admin | Delete |
| GET | `/exams/:id/marks` | admin, faculty | Marks for batch |
| PUT | `/exams/:id/marks` | admin, faculty | Save marks |
| GET | `/exams/:id/results` | admin, faculty, staff | Published results |

---

## Certificates

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/certificates` | admin | Issued list |
| POST | `/certificates` | admin | Issue certificate |
| GET | `/certificates/:certNo` | admin | Detail + print data |

---

## Reports

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/reports/students` | admin | Student report |
| GET | `/reports/admissions` | admin, staff | Admission report |
| GET | `/reports/fees` | admin, staff | Fee collection |
| GET | `/reports/fees/due` | admin, staff | Due fees |
| GET | `/reports/attendance` | admin, staff | Attendance |
| GET | `/reports/faculty` | admin | Faculty report |
| GET | `/reports/:type/export` | admin, staff | CSV download |

---

## Notifications

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/notifications` | any | Inbox for current user |
| PATCH | `/notifications/:id/read` | any | Mark read |
| PATCH | `/notifications/read-all` | any | Mark all read |
| DELETE | `/notifications/:id` | any | Delete |

---

## Settings

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/settings/institute` | admin | Institute profile |
| PATCH | `/settings/institute` | admin | Update + logo upload |
| GET | `/settings/receipt` | admin | Receipt template |
| PATCH | `/settings/receipt` | admin | Update template |
| GET | `/settings/certificate` | admin | Certificate template |
| PATCH | `/settings/certificate` | admin | Update template |

---

## Dashboard

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/dashboard/stats` | any | KPI cards |
| GET | `/dashboard/enrollment-trend` | any | Chart data |
| GET | `/dashboard/fee-trend` | any | Chart data |
| GET | `/dashboard/today-classes` | any | Schedule |

---

## Standard error shape

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Human readable message",
  "details": []
}
```

## HTTP status codes

| Code | Use |
|------|-----|
| 200 | OK |
| 201 | Created |
| 400 | Validation error |
| 401 | Not authenticated |
| 403 | Wrong role |
| 404 | Not found |
| 409 | Conflict (e.g. duplicate receipt) |
| 500 | Server error |

---

*Types mirror `src/types/index.ts`. Update both when schema changes.*
