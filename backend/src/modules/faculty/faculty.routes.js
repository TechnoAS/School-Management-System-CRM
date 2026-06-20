import { Router } from 'express';
import { listFaculty, getFaculty, create, update, remove, markAttendance, getSalarySlip, uploadPhoto, upload, } from './faculty.controller.js';
import { requireAuth, requireRoles } from '../../middleware/auth.middleware.js';
const router = Router();
// Faculty endpoints - Admin only as per API.md permissions
router.get('/', requireAuth, requireRoles('admin'), listFaculty);
router.get('/:id', requireAuth, requireRoles('admin'), getFaculty);
router.post('/', requireAuth, requireRoles('admin'), create);
router.patch('/:id', requireAuth, requireRoles('admin'), update);
router.delete('/:id', requireAuth, requireRoles('admin'), remove);
router.post('/:id/attendance', requireAuth, requireRoles('admin'), markAttendance);
router.get('/:id/salary', requireAuth, requireRoles('admin'), getSalarySlip);
router.post('/:id/photo', requireAuth, requireRoles('admin'), upload.single('photo'), uploadPhoto);
export { router as facultyRouter };
