import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedError } from '../shared/errors/app-error.js';
import { generateRefreshToken } from '../shared/utils/crypto.js';
import { refreshSession } from '../modules/auth/auth.service.js';
import * as queryModule from '../shared/db/query.js';
import { pool } from '../config/database.js';
vi.mock('../modules/audit/audit.service.js', () => ({
    createAuditLog: vi.fn().mockResolvedValue(undefined),
}));
describe('refreshSession', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('throws UnauthorizedError for an invalid refresh token', async () => {
        await expect(refreshSession('not-a-valid-jwt', null, null)).rejects.toThrow(UnauthorizedError);
        await expect(refreshSession('not-a-valid-jwt', null, null)).rejects.toThrow('Session authentication failed');
    });
    it('throws UnauthorizedError when token is not found in database', async () => {
        const token = generateRefreshToken({ id: 'user-1' });
        vi.spyOn(queryModule, 'queryOne').mockResolvedValueOnce(undefined);
        await expect(refreshSession(token, null, null)).rejects.toThrow('Session not found or expired');
    });
    it('throws UnauthorizedError when token is revoked', async () => {
        const token = generateRefreshToken({ id: 'user-1' });
        vi.spyOn(queryModule, 'queryOne').mockResolvedValueOnce({
            id: 'token-1',
            user_id: 'user-1',
            token_hash: 'hash',
            expires_at: new Date(Date.now() + 86400000),
            revoked_at: new Date(),
        });
        await expect(refreshSession(token, null, null)).rejects.toThrow('Session is invalid or expired');
    });
    it('propagates database errors instead of masking them as 401', async () => {
        const token = generateRefreshToken({ id: 'user-1' });
        const dbError = new Error('ECONNREFUSED');
        vi.spyOn(queryModule, 'queryOne').mockRejectedValueOnce(dbError);
        await expect(refreshSession(token, null, null)).rejects.toBe(dbError);
    });
    it('rotates tokens on a valid refresh', async () => {
        const token = generateRefreshToken({ id: 'user-1' });
        const querySpy = vi.spyOn(queryModule, 'queryOne');
        querySpy
            .mockResolvedValueOnce({
            id: 'token-1',
            user_id: 'user-1',
            token_hash: 'hash',
            expires_at: new Date(Date.now() + 86400000),
            revoked_at: null,
        })
            .mockResolvedValueOnce({
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
            role: 'admin',
        });
        const poolQuery = vi.spyOn(pool, 'query').mockResolvedValue([[], []]);
        const result = await refreshSession(token, '127.0.0.1', 'vitest');
        expect(result.accessToken).toBeTruthy();
        expect(result.refreshToken).toBeTruthy();
        expect(poolQuery).toHaveBeenCalledTimes(2);
        expect(poolQuery.mock.calls[0]?.[0]).toContain('DELETE FROM refresh_tokens');
        expect(poolQuery.mock.calls[1]?.[0]).toContain('INSERT INTO refresh_tokens');
    });
});
