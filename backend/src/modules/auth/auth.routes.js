import { Router } from 'express';
import { login, refresh, logout, changePassword, me } from './auth.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { authRateLimiter } from '../../middleware/rate-limit.js';
const router = Router();
// Public routes (Rate-limited for login attempts)
router.post('/login', authRateLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
// Protected routes
router.get('/me', requireAuth, me);
router.patch('/password', requireAuth, changePassword);
export { router as authRouter };
