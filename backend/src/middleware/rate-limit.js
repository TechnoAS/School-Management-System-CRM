import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: env.RATE_LIMIT_AUTH_MAX,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many login attempts. Please try again after 15 minutes.',
        },
    },
});
export const apiRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    limit: env.RATE_LIMIT_API_MAX,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many API requests. Please slow down.',
        },
    },
});
