import { Router } from 'express';
import { list, read, readAll, remove } from './notifications.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
const router = Router();
// Notifications routes - Access allowed for any logged-in role
router.get('/', requireAuth, list);
router.patch('/read-all', requireAuth, readAll);
router.patch('/:id/read', requireAuth, read);
router.delete('/:id', requireAuth, remove);
export { router as notificationsRouter };
