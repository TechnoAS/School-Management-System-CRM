import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { adminUser, superAdminUser, staffUser, facultyUser, bearer } from './helpers.js';
const { poolQuery } = vi.hoisted(() => {
    const poolQuery = vi.fn().mockImplementation((sql) => {
        const normalized = sql.replace(/\s+/g, ' ').trim().toUpperCase();
        if (normalized.startsWith('SELECT COUNT')) {
            return Promise.resolve([[{ count: 0, total: 0 }], []]);
        }
        if (normalized.includes('SUM(')) {
            return Promise.resolve([[{ total: 0 }], []]);
        }
        if (normalized.startsWith('SELECT')) {
            return Promise.resolve([[], []]);
        }
        return Promise.resolve([{ affectedRows: 1 }, []]);
    });
    return { poolQuery };
});
vi.mock('../config/database.js', () => ({
    pool: {
        getConnection: vi.fn().mockResolvedValue({ release: vi.fn() }),
        query: poolQuery,
        end: vi.fn(),
    },
}));
vi.mock('../modules/audit/audit.service.js', () => ({
    createAuditLog: vi.fn().mockResolvedValue(undefined),
}));
import { app } from '../app.js';
describe('API readiness — route smoke tests', () => {
    beforeEach(() => {
        poolQuery.mockClear();
    });
    describe('Public endpoints', () => {
        it('GET /api/health — server and DB pool up', async () => {
            const res = await request(app).get('/api/health');
            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({ success: true, database: 'connected' });
        });
        it('POST /api/auth/login — rejects empty body', async () => {
            const res = await request(app).post('/api/auth/login').send({});
            expect(res.status).toBe(400);
            expect(res.body).toMatchObject({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'Validation failed' },
            });
            expect(res.body.error.details?.length).toBeGreaterThan(0);
        });
        it('POST /api/auth/refresh — 401 without cookie', async () => {
            const res = await request(app).post('/api/auth/refresh');
            expect(res.status).toBe(401);
        });
        it('GET /api/settings/branding — public institute name for login screen', async () => {
            const res = await request(app).get('/api/settings/branding');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('name');
        });
    });
    describe('Auth required — returns 401 without token', () => {
        const protectedGets = [
            '/api/auth/me',
            '/api/courses',
            '/api/students',
            '/api/batches',
            '/api/faculty',
            '/api/attendance?batchId=BAT-001&date=2024-01-15',
            '/api/fees/due',
            '/api/payments',
            '/api/exams',
            '/api/certificates',
            '/api/notifications',
            '/api/dashboard/stats',
            '/api/settings/institute',
        ];
        it.each(protectedGets)('GET %s', async (path) => {
            const res = await request(app).get(path);
            expect(res.status).toBe(401);
            expect(res.body.error?.code).toBe('UNAUTHORIZED');
        });
    });
    describe('Admin token — modules respond 200', () => {
        const adminGets = [
            { path: '/api/courses' },
            { path: '/api/students' },
            { path: '/api/batches' },
            { path: '/api/faculty' },
            { path: '/api/attendance?batchId=BAT-001&date=2024-01-15' },
            { path: '/api/fees/due' },
            { path: '/api/payments' },
            { path: '/api/exams' },
            { path: '/api/certificates' },
            { path: '/api/notifications' },
            { path: '/api/dashboard/stats' },
            { path: '/api/dashboard/enrollment-trend' },
            { path: '/api/dashboard/fee-trend' },
            { path: '/api/dashboard/today-classes' },
            { path: '/api/reports/students' },
            { path: '/api/settings/institute' },
        ];
        it.each(adminGets)('GET $path', async ({ path }) => {
            const res = await request(app).get(path).set('Authorization', bearer(adminUser));
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });
    describe('Super admin token — same access as admin', () => {
        it('GET /api/faculty', async () => {
            const res = await request(app)
                .get('/api/faculty')
                .set('Authorization', bearer(superAdminUser));
            expect(res.status).toBe(200);
        });
        it('GET /api/settings/page-layout/dashboard', async () => {
            const res = await request(app)
                .get('/api/settings/page-layout/dashboard')
                .set('Authorization', bearer(superAdminUser));
            expect(res.status).toBe(200);
        });
    });
    describe('Staff token — allowed reads', () => {
        it('GET /api/students', async () => {
            const res = await request(app)
                .get('/api/students')
                .set('Authorization', bearer(staffUser));
            expect(res.status).toBe(200);
        });
        it('GET /api/reports/fees', async () => {
            const res = await request(app)
                .get('/api/reports/fees')
                .set('Authorization', bearer(staffUser));
            expect(res.status).toBe(200);
        });
    });
    describe('Role enforcement', () => {
        it('staff can read institute settings', async () => {
            const res = await request(app)
                .get('/api/settings/institute')
                .set('Authorization', bearer(staffUser));
            expect(res.status).toBe(200);
        });
        it('faculty cannot list students', async () => {
            const res = await request(app)
                .get('/api/students')
                .set('Authorization', bearer(facultyUser));
            expect(res.status).toBe(403);
        });
        it('faculty can list exams', async () => {
            const res = await request(app)
                .get('/api/exams')
                .set('Authorization', bearer(facultyUser));
            expect(res.status).toBe(200);
        });
        it('staff cannot issue certificates', async () => {
            const res = await request(app)
                .post('/api/certificates')
                .set('Authorization', bearer(staffUser))
                .send({ studentId: 'STU-001', courseId: 'CRS-001' });
            expect(res.status).toBe(403);
        });
        it('admin cannot PATCH page layout (super_admin only)', async () => {
            const res = await request(app)
                .patch('/api/settings/page-layout/dashboard')
                .set('Authorization', bearer(adminUser))
                .send({ widgets: [] });
            expect(res.status).toBe(403);
        });
        it('super_admin can PATCH page layout', async () => {
            const res = await request(app)
                .patch('/api/settings/page-layout/dashboard')
                .set('Authorization', bearer(superAdminUser))
                .send({ widgets: [] });
            expect(res.status).toBe(200);
        });
    });
});
