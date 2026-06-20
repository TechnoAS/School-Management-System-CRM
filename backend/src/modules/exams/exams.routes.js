import { Router } from 'express';
import { listExams, getExam, create, update, remove, getMarks, saveMarks, getResults, } from './exams.controller.js';
import { requireAuth, requireRoles } from '../../middleware/auth.middleware.js';
const router = Router();
// Exams endpoints - Admin and Faculty access, Staff can read results
router.get('/', requireAuth, requireRoles('admin', 'faculty'), listExams);
router.get('/:id', requireAuth, requireRoles('admin', 'faculty'), getExam);
router.post('/', requireAuth, requireRoles('admin', 'faculty'), create);
router.patch('/:id', requireAuth, requireRoles('admin', 'faculty'), update);
router.delete('/:id', requireAuth, requireRoles('admin'), remove);
// Marks entry and results
router.get('/:id/marks', requireAuth, requireRoles('admin', 'faculty'), getMarks);
router.put('/:id/marks', requireAuth, requireRoles('admin', 'faculty'), saveMarks);
router.get('/:id/results', requireAuth, requireRoles('admin', 'faculty', 'staff'), getResults);
export { router as examsRouter };
