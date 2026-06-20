import { Router } from 'express';
import { listCourses, getCourse, create, update, remove } from './courses.controller.js';
import { requireAuth, requireRoles } from '../../middleware/auth.middleware.js';
const router = Router();
// Courses endpoints - Admin and staff can read, only admin can write
router.get('/', requireAuth, requireRoles('admin', 'staff'), listCourses);
router.get('/:id', requireAuth, requireRoles('admin', 'staff'), getCourse);
router.post('/', requireAuth, requireRoles('admin'), create);
router.patch('/:id', requireAuth, requireRoles('admin'), update);
router.delete('/:id', requireAuth, requireRoles('admin'), remove);
export { router as coursesRouter };
