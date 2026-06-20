import { Router } from 'express';
import { list, getStudent, create, update, remove, uploadPhoto, upload } from './students.controller.js';
import { requireAuth, requireRoles } from '../../middleware/auth.middleware.js';
const router = Router();
// Student endpoints - Admin and staff access
router.get('/', requireAuth, requireRoles('admin', 'staff'), list);
router.get('/:id', requireAuth, requireRoles('admin', 'staff'), getStudent);
router.post('/', requireAuth, requireRoles('admin', 'staff'), create);
router.patch('/:id', requireAuth, requireRoles('admin', 'staff'), update);
router.delete('/:id', requireAuth, requireRoles('admin'), remove);
// Photo upload (using multer middleware)
router.post('/:id/photo', requireAuth, requireRoles('admin', 'staff'), upload.single('photo'), uploadPhoto);
export { router as studentsRouter };
