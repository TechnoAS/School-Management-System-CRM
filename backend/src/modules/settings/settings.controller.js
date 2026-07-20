import fs from 'fs';
import { updateInstituteSchema, updateReceiptConfigSchema, updateCertificateConfigSchema, pageIdSchema, pageLayoutSchema, admissionFormConfigSchema, } from './settings.schema.js';
import { getSettings, updateInstituteSettings, updateReceiptSettings, updateCertificateSettings, getPageLayout, updatePageLayout, getAdmissionFormConfig, updateAdmissionFormConfig, } from './settings.service.js';
import { UnauthorizedError, ValidationError } from '../../shared/errors/app-error.js';
import { createAuditLog } from '../audit/audit.service.js';
import { validateMagicBytes } from '../../shared/utils/photo-upload.js';
import {
    deletePhotoFromStorageByKey,
    deleteStoredAssetByUrl,
    isR2StorageEnabled,
    uploadLogoToStorage,
} from '../../shared/utils/object-storage.js';
import { logger } from '../../config/logger.js';

export async function getBranding(_req, res, next) {
    try {
        const settings = await getSettings();
        res.status(200).json({
            success: true,
            data: {
                name: settings?.name ?? 'Institute',
                logoUrl: settings?.logo_url ?? settings?.logoUrl ?? '',
            },
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getInstitute(_req, res, next) {
    try {
        const settings = await getSettings();
        res.status(200).json({
            success: true,
            data: settings,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function updateInstitute(req, res, next) {
    let uploadedStorageKey = null;
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }
        const data = updateInstituteSchema.parse(req.body);
        const oldSettings = await getSettings();
        const oldLogoUrl = oldSettings?.logo_url ?? oldSettings?.logoUrl ?? '';
        if (req.file) {
            const isValid = validateMagicBytes(req.file.path);
            if (!isValid) {
                fs.unlinkSync(req.file.path);
                throw new ValidationError('File upload rejected: magic byte validation failed');
            }
            let logoUrl = `/uploads/${req.file.filename}`;
            if (isR2StorageEnabled()) {
                const uploaded = await uploadLogoToStorage(req.file.path, req.file.mimetype, req.file.originalname);
                if (!uploaded) {
                    throw new ValidationError('Cloud storage upload failed');
                }
                uploadedStorageKey = uploaded.key;
                logoUrl = uploaded.url;
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
            }
            data.logoUrl = logoUrl;
            if (oldLogoUrl && oldLogoUrl !== logoUrl) {
                try {
                    await deleteStoredAssetByUrl(oldLogoUrl);
                }
                catch (cleanupError) {
                    logger.warn('Failed to delete previous logo asset', { cleanupError });
                }
            }
        }
        else if (data.logoUrl === '' || data.logoUrl === null) {
            if (oldLogoUrl) {
                try {
                    await deleteStoredAssetByUrl(oldLogoUrl);
                }
                catch (cleanupError) {
                    logger.warn('Failed to delete removed logo asset', { cleanupError });
                }
            }
            data.logoUrl = '';
        }
        const updated = await updateInstituteSettings(data);
        await createAuditLog({
            userId: req.user.id,
            action: 'SETTINGS_INSTITUTE_UPDATE',
            entity: 'institute_settings',
            entityId: '1',
            beforeData: oldSettings,
            afterData: updated,
            ipAddress: req.ip || null,
            userAgent: req.headers['user-agent'] || null,
        });
        res.status(200).json({
            success: true,
            data: updated,
        });
    }
    catch (error) {
        if (uploadedStorageKey) {
            try {
                await deletePhotoFromStorageByKey(uploadedStorageKey);
            }
            catch (cleanupError) {
                logger.warn('Failed to rollback uploaded logo', { cleanupError });
            }
        }
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
}
export async function getReceipt(_req, res, next) {
    try {
        const settings = await getSettings();
        const config = typeof settings.receipt_config === 'string'
            ? JSON.parse(settings.receipt_config)
            : settings.receipt_config || {};
        res.status(200).json({
            success: true,
            data: config,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function updateReceipt(req, res, next) {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }
        const data = updateReceiptConfigSchema.parse(req.body);
        const updated = await updateReceiptSettings(data);
        await createAuditLog({
            userId: req.user.id,
            action: 'SETTINGS_RECEIPT_UPDATE',
            entity: 'institute_settings',
            entityId: '1',
            afterData: updated,
            ipAddress: req.ip || null,
            userAgent: req.headers['user-agent'] || null,
        });
        res.status(200).json({
            success: true,
            data: updated,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getCertificate(_req, res, next) {
    try {
        const settings = await getSettings();
        const config = typeof settings.certificate_config === 'string'
            ? JSON.parse(settings.certificate_config)
            : settings.certificate_config || {};
        res.status(200).json({
            success: true,
            data: config,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function updateCertificate(req, res, next) {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }
        const data = updateCertificateConfigSchema.parse(req.body);
        const updated = await updateCertificateSettings(data);
        await createAuditLog({
            userId: req.user.id,
            action: 'SETTINGS_CERTIFICATE_UPDATE',
            entity: 'institute_settings',
            entityId: '1',
            afterData: updated,
            ipAddress: req.ip || null,
            userAgent: req.headers['user-agent'] || null,
        });
        res.status(200).json({
            success: true,
            data: updated,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getPageLayoutHandler(req, res, next) {
    try {
        const pageId = pageIdSchema.parse(req.params.pageId);
        const layout = await getPageLayout(pageId);
        res.status(200).json({
            success: true,
            data: layout,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getAdmissionFormHandler(_req, res, next) {
    try {
        const config = await getAdmissionFormConfig();
        res.status(200).json({
            success: true,
            data: config,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function updateAdmissionFormHandler(req, res, next) {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }
        const config = admissionFormConfigSchema.parse(req.body);
        const before = await getAdmissionFormConfig();
        const updated = await updateAdmissionFormConfig(config);
        await createAuditLog({
            userId: req.user.id,
            action: 'SETTINGS_ADMISSION_FORM_UPDATE',
            entity: 'institute_settings',
            entityId: 'admission-form',
            beforeData: before,
            afterData: updated,
            ipAddress: req.ip || null,
            userAgent: req.headers['user-agent'] || null,
        });
        res.status(200).json({
            success: true,
            data: updated,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function updatePageLayoutHandler(req, res, next) {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }
        const pageId = pageIdSchema.parse(req.params.pageId);
        const layout = pageLayoutSchema.parse(req.body);
        const before = (await getPageLayout(pageId));
        const updated = await updatePageLayout(pageId, layout);
        await createAuditLog({
            userId: req.user.id,
            action: 'SETTINGS_PAGE_LAYOUT_UPDATE',
            entity: 'institute_settings',
            entityId: pageId,
            beforeData: before,
            afterData: updated,
            ipAddress: req.ip || null,
            userAgent: req.headers['user-agent'] || null,
        });
        res.status(200).json({
            success: true,
            data: updated,
        });
    }
    catch (error) {
        next(error);
    }
}
