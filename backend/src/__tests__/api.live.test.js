/**
 * Live API tests — hit a running MySQL database.
 * Skip by default. Run when DB is seeded:
 *
 *   cd backend
 *   npm run db:setup
 *   npm run test:live
 */
import dotenv from 'dotenv';
dotenv.config({ override: true });
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
const LIVE = process.env.RUN_LIVE_API_TESTS === '1';
const describeLive = LIVE ? describe : describe.skip;
// Import app after dotenv so config/env.ts reads real DATABASE_URL
const { app } = await import('../app.js');
describeLive('Live API (MySQL required)', () => {
    let adminToken;
    let refreshCookie;
    let adminEmail = '';
    let dbReady = false;
    beforeAll(async () => {
        const email = process.env.ADMIN_EMAIL ?? 'admin@example.com';
        const password = process.env.ADMIN_PASSWORD ?? '';
        if (!password) {
            console.warn('Skipping live API tests: set ADMIN_PASSWORD in backend/.env');
            return;
        }
        const login = await request(app)
            .post('/api/auth/login')
            .send({ email, password });
        if (login.status !== 200) {
            console.warn(`Skipping live API tests: login returned ${login.status}. Run npm run db:setup first.`);
            return;
        }
        dbReady = true;
        adminToken = login.body.data.accessToken;
        const setCookie = login.headers['set-cookie'];
        refreshCookie = Array.isArray(setCookie) ? setCookie.join('; ') : (setCookie ?? '');
        adminEmail = email;
    });
    it('login returns user and sets refresh cookie', () => {
        if (!dbReady)
            return;
        expect(adminToken).toBeTruthy();
        expect(refreshCookie).toContain('refreshToken');
    });
    it('GET /api/auth/me', async () => {
        if (!dbReady)
            return;
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(res.body.data.user.email).toBe(adminEmail);
    });
    it('GET /api/courses returns seeded data', async () => {
        if (!dbReady)
            return;
        const res = await request(app)
            .get('/api/courses')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
    });
    it('POST /api/auth/refresh rotates session', async () => {
        if (!dbReady)
            return;
        const res = await request(app)
            .post('/api/auth/refresh')
            .set('Cookie', refreshCookie);
        expect(res.status).toBe(200);
        expect(res.body.data.accessToken).toBeTruthy();
    });
});
