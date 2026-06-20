import { Router } from 'express';
import { stats, enrollmentTrend, feeTrend, todayClasses, courseEnrollment, reportStudents, reportAdmissions, reportFees, reportFeesDue, reportAttendance, reportFaculty, exportCSV, } from './dashboard.controller.js';
import { requireAuth, requireRoles } from '../../middleware/auth.middleware.js';
const router = Router();
// Dashboard widgets (Available to all authorized roles)
router.get('/dashboard/stats', requireAuth, stats);
router.get('/dashboard/enrollment-trend', requireAuth, enrollmentTrend);
router.get('/dashboard/fee-trend', requireAuth, feeTrend);
router.get('/dashboard/today-classes', requireAuth, todayClasses);
router.get('/dashboard/course-enrollment', requireAuth, courseEnrollment);
// Reporting routes (Restricted to Admin and Staff)
router.get('/reports/students', requireAuth, requireRoles('admin', 'staff'), reportStudents);
router.get('/reports/admissions', requireAuth, requireRoles('admin', 'staff'), reportAdmissions);
router.get('/reports/fees', requireAuth, requireRoles('admin', 'staff'), reportFees);
router.get('/reports/fees/due', requireAuth, requireRoles('admin', 'staff'), reportFeesDue);
router.get('/reports/attendance', requireAuth, requireRoles('admin', 'staff'), reportAttendance);
router.get('/reports/faculty', requireAuth, requireRoles('admin', 'staff'), reportFaculty);
// CSV Data export endpoint
router.get('/reports/:type/export', requireAuth, requireRoles('admin', 'staff'), exportCSV);
export { router as dashboardRouter };
