import { describe, it, expect, vi } from 'vitest';
import { z, ZodError } from 'zod';
import { AppError, UnauthorizedError, ValidationError, } from '../shared/errors/app-error.js';
import { errorMiddleware } from '../middleware/error.middleware.js';
vi.mock('../config/logger.js', () => ({
    logger: {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
    },
}));
function createMockRes() {
    const res = {
        headersSent: false,
        statusCode: 200,
        body: undefined,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        },
    };
    return res;
}
describe('errorMiddleware', () => {
    const next = vi.fn();
    it('formats AppError with correct status and code', () => {
        const res = createMockRes();
        const err = new ValidationError('Email is required', [{ field: 'email', message: 'Required' }]);
        errorMiddleware(err, {}, res, next);
        expect(res.statusCode).toBe(400);
        expect(res.body).toMatchObject({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Email is required',
                details: [{ field: 'email', message: 'Required' }],
            },
        });
    });
    it('returns 400 for Zod validation errors', () => {
        const res = createMockRes();
        let zodErr;
        try {
            z.object({ email: z.string().email() }).parse({});
        }
        catch (error) {
            if (error instanceof ZodError) {
                zodErr = error;
            }
        }
        errorMiddleware(zodErr, {}, res, next);
        expect(res.statusCode).toBe(400);
        expect(res.body).toMatchObject({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: 'Validation failed' },
        });
        expect(res.body.error.details.length).toBeGreaterThan(0);
    });
    it('returns 401 for UnauthorizedError', () => {
        const res = createMockRes();
        errorMiddleware(new UnauthorizedError('Session cookie is missing'), {}, res, next);
        expect(res.statusCode).toBe(401);
        expect(res.body).toMatchObject({
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'Session cookie is missing' },
        });
    });
    it('returns 500 for unexpected errors without exposing internals', () => {
        const res = createMockRes();
        const err = new Error('database connection lost');
        errorMiddleware(err, {}, res, next);
        expect(res.statusCode).toBe(500);
        expect(res.body).toMatchObject({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An unexpected error occurred',
            },
        });
        expect(res.body.error.stack).toBeUndefined();
    });
    it('does not convert non-JWT operational errors to auth failures', () => {
        const res = createMockRes();
        const err = new AppError('Service unavailable', 503, 'SERVICE_UNAVAILABLE');
        errorMiddleware(err, {}, res, next);
        expect(res.statusCode).toBe(503);
        expect(res.body).toMatchObject({
            error: { code: 'SERVICE_UNAVAILABLE', message: 'Service unavailable' },
        });
    });
});
