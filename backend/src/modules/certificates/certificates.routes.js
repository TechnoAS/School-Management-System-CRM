import { Router } from 'express';
import { listCertificates, getCertificate, issue } from './certificates.controller.js';
import { requireAuth, requireRoles } from '../../middleware/auth.middleware.js';
const router = Router();
// Certificates endpoints - Admin only
router.get('/', requireAuth, requireRoles('admin'), listCertificates);
router.post('/', requireAuth, requireRoles('admin'), issue);
router.get('/:certNo', requireAuth, requireRoles('admin'), getCertificate);
export { router as certificatesRouter };
