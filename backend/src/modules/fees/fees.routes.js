import { Router } from 'express';
import { listDue, history, getReceipt, collect, sendReminders } from './fees.controller.js';
import { requireAuth, requireRoles } from '../../middleware/auth.middleware.js';
const router = Router();
// Fees & Payments endpoints - Admin and staff access
router.get('/fees/due', requireAuth, requireRoles('admin', 'staff'), listDue);
router.get('/payments', requireAuth, requireRoles('admin', 'staff'), history);
router.get('/payments/:receipt', requireAuth, requireRoles('admin', 'staff'), getReceipt);
router.post('/payments', requireAuth, requireRoles('admin', 'staff'), collect);
router.post('/fees/reminders', requireAuth, requireRoles('admin', 'staff'), sendReminders);
export { router as feesRouter };
