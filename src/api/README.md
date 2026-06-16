# Front-end API layer

HTTP client for the **Node + SQL** backend. Front-end still uses Zustand until backend is ready.

## Structure (add services as backend ships)

```
src/api/
├── config.ts          # VITE_API_URL, feature flag
├── client.ts          # fetch wrapper + auth header
├── index.ts           # public exports
└── services/          # one file per domain
    ├── auth.service.ts
    ├── students.service.ts
    ├── courses.service.ts
    ├── batches.service.ts
    ├── attendance.service.ts
    ├── fees.service.ts
    ├── faculty.service.ts
    ├── exams.service.ts
    ├── certificates.service.ts
    ├── reports.service.ts
    ├── notifications.service.ts
    ├── settings.service.ts
    └── dashboard.service.ts
```

## Contracts

- REST paths → [`docs/API.md`](../../docs/API.md)
- SQL tables → [`docs/DATABASE.md`](../../docs/DATABASE.md)
- Types → [`src/types/index.ts`](../types/index.ts)

## Enable API mode

```env
# .env.local
VITE_API_URL=http://localhost:5000/api
VITE_API_ENABLED=true
```

Until `VITE_API_ENABLED=true`, pages keep using Zustand persist (offline demo mode).

## Integration pattern (later)

```ts
// Example: students.service.ts
import { apiRequest } from "../client";
import type { Student } from "@/types";

export const studentsService = {
  list: (params?: Record<string, string>) =>
    apiRequest<Student[]>(`/students?${new URLSearchParams(params)}`),
  create: (data: Omit<Student, "id">) =>
    apiRequest<Student>("/students", { method: "POST", body: JSON.stringify(data) }),
};
```

Swap Zustand actions for service calls + React Query hooks module by module.
