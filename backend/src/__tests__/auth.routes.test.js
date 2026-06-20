import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
vi.mock('../config/database.js', () => ({
    pool: {
        getConnection: vi.fn().mockResolvedValue({ release: vi.fn() }),
        query: vi.fn(),
        end: vi.fn(),
    },
}));
describe('POST /api/auth/refresh', () => {
    it('returns 401 when refresh cookie is missing', async () => {
        const response = await request(app).post('/api/auth/refresh');
        expect(response.status).toBe(401);
        expect(response.body).toMatchObject({
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'Session cookie is missing' },
        });
    });
});
describe('GET /api/health', () => {
    it('returns 200 when database pool is available', async () => {
        const response = await request(app).get('/api/health');
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.database).toBe('connected');
    });
});
