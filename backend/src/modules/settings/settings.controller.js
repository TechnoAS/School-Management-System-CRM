import path from 'path';
import fs from 'fs';
import { updateInstituteSchema, updateReceiptConfigSchema, updateCertificateConfigSchema, pageIdSchema, pageLayoutSchema } from './settings.schema.js';
import { getSettings, updateInstituteSettings, updateReceiptSettings, updateCertificateSettings, getPageLayout, updatePageLayout, } from './settings.service.js';
import { UnauthorizedError } from '../../shared/errors/app-error.js';
import { createAuditLog } from '../audit/audit.service.js';
import { env } from '../../config/env.js';
/** Delete an old upload file from disk if it exists and belongs to the /uploads/ folder. */
function deleteOldLogo(logoUrl) {
    if (!logoUrl || !logoUrl.startsWith('/uploads/'))
        return;
    const filename = path.basename(logoUrl);
    const filePath = path.join(path.resolve(env.UPLOAD_DIR), filename);
    fs.unlink(filePath, (err) => {
        if (err && err.code !== 'ENOENT') {
            console.warn('[settings] Failed to delete old logo:', filePath, err.message);
        }
    });
}
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
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }
        const data = updateInstituteSchema.parse(req.body);
        // Read the current logo URL BEFORE we overwrite it
        const oldSettings = await getSettings();
        const oldLogoUrl = oldSettings?.logo_url ?? oldSettings?.logoUrl ?? '';
        if (req.file) {
            // A new file was uploaded — delete the old one from disk
            deleteOldLogo(oldLogoUrl);
            data.logoUrl = `/uploads/${req.file.filename}`;
        }
        else if (data.logoUrl === '' || data.logoUrl === null) {
            // Logo was explicitly cleared — delete the old file from disk
            deleteOldLogo(oldLogoUrl);
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
