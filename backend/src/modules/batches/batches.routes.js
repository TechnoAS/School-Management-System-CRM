import { Router } from 'express';
import { listBatches, getBatch, getStudents, create, update, remove } from './batches.controller.js';
import { requireAuth, requireRoles } from '../../middleware/auth.middleware.js';
const router = Router();
// Batches endpoints - Admin and staff can read, only admin can write
router.get('/', requireAuth, requireRoles('admin', 'staff'), listBatches);
router.get('/:id', requireAuth, requireRoles('admin', 'staff'), getBatch);
router.get('/:id/students', requireAuth, requireRoles('admin', 'staff'), getStudents);
router.post('/', requireAuth, requireRoles('admin'), create);
router.patch('/:id', requireAuth, requireRoles('admin'), update);
router.delete('/:id', requireAuth, requireRoles('admin'), remove);
export { router as batchesRouter };
