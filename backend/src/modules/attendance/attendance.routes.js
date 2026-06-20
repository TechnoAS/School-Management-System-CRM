import { Router } from 'express';
import { listAttendance, listRecords, upsert, report } from './attendance.controller.js';
import { requireAuth, requireRoles } from '../../middleware/auth.middleware.js';
const router = Router();
// Attendance endpoints - Admin, staff, and faculty can view/write daily logs
router.get('/', requireAuth, requireRoles('admin', 'staff', 'faculty'), listAttendance);
router.put('/', requireAuth, requireRoles('admin', 'staff', 'faculty'), upsert);
// Historical records for client sync
router.get('/records', requireAuth, requireRoles('admin', 'staff', 'faculty'), listRecords);
// Reports - Admin and staff only
router.get('/report', requireAuth, requireRoles('admin', 'staff'), report);
export { router as attendanceRouter };
