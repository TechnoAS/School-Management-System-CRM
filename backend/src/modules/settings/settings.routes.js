import { Router } from 'express';
import { getBranding, getInstitute, updateInstitute, getReceipt, updateReceipt, getCertificate, updateCertificate, getPageLayoutHandler, updatePageLayoutHandler, } from './settings.controller.js';
import { requireAuth, requireRoles } from '../../middleware/auth.middleware.js';
import { upload } from '../students/students.controller.js';
const router = Router();
router.get('/branding', getBranding);
// Settings read endpoints: all authenticated roles need branding/config to render UI.
router.get('/institute', requireAuth, requireRoles('admin', 'staff', 'faculty'), getInstitute);
router.patch('/institute', requireAuth, requireRoles('admin'), upload.single('logo'), updateInstitute);
router.get('/receipt', requireAuth, requireRoles('admin', 'staff', 'faculty'), getReceipt);
router.patch('/receipt', requireAuth, requireRoles('admin'), updateReceipt);
router.get('/certificate', requireAuth, requireRoles('admin', 'staff', 'faculty'), getCertificate);
router.patch('/certificate', requireAuth, requireRoles('admin'), updateCertificate);
router.get('/page-layout/:pageId', requireAuth, requireRoles('admin', 'staff', 'faculty'), getPageLayoutHandler);
router.patch('/page-layout/:pageId', requireAuth, requireRoles('super_admin'), updatePageLayoutHandler);
export { router as settingsRouter };
