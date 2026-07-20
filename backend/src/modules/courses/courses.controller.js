import fs from 'fs';
import { createCourseSchema, updateCourseSchema } from './courses.schema.js';
import {
    getAllCourses,
    getCourseById,
    getCourseStats,
    createCourse,
    updateCourse,
    deleteCourse,
} from './courses.service.js';
import { NotFoundError, UnauthorizedError, ValidationError } from '../../shared/errors/app-error.js';
import { createAuditLog } from '../audit/audit.service.js';
import { photoUpload, validateMagicBytes } from '../../shared/utils/photo-upload.js';
import {
    deletePhotoFromStorageByKey,
    deleteStoredAssetByUrl,
    isR2StorageEnabled,
    uploadCourseLogoToStorage,
    uploadCourseBannerToStorage,
    uploadCourseMaterialToStorage,
} from '../../shared/utils/object-storage.js';
import { logger } from '../../config/logger.js';

export const upload = photoUpload;

export async function listCourses(_req, res, next) {
    try {
        const courses = await getAllCourses();
        res.status(200).json({
            success: true,
            data: courses,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getCourse(req, res, next) {
    try {
        const { id } = req.params;
        const course = await getCourseById(id);
        if (!course) {
            throw new NotFoundError(`Course with ID "${id}" not found`);
        }
        const stats = await getCourseStats(id);
        res.status(200).json({
            success: true,
            data: {
                ...course,
                stats,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
export async function create(req, res, next) {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }
        const data = createCourseSchema.parse(req.body);
        const course = await createCourse(data);
        await createAuditLog({
            userId: req.user.id,
            action: 'COURSE_CREATE',
            entity: 'courses',
            entityId: course.id,
            afterData: course,
            ipAddress: req.ip || null,
            userAgent: req.headers['user-agent'] || null,
        });
        res.status(201).json({
            success: true,
            data: course,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function update(req, res, next) {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }
        const { id } = req.params;
        const data = updateCourseSchema.parse(req.body);
        const oldCourse = await getCourseById(id);
        const updated = await updateCourse(id, data);
        await createAuditLog({
            userId: req.user.id,
            action: 'COURSE_UPDATE',
            entity: 'courses',
            entityId: id,
            beforeData: oldCourse,
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
export async function remove(req, res, next) {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }
        const { id } = req.params;
        const oldCourse = await getCourseById(id);
        await deleteCourse(id);
        await createAuditLog({
            userId: req.user.id,
            action: 'COURSE_DELETE',
            entity: 'courses',
            entityId: id,
            beforeData: oldCourse,
            ipAddress: req.ip || null,
            userAgent: req.headers['user-agent'] || null,
        });
        res.status(200).json({
            success: true,
            message: `Course "${id}" deleted successfully`,
        });
    }
    catch (error) {
        next(error);
    }
}

async function handleImageUpload(req, res, next, { field, storageFn, auditAction }) {
    let uploadedStorageKey = null;
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }
        if (!req.file) {
            throw new ValidationError(`No ${field} file uploaded`);
        }
        const { id } = req.params;
        const course = await getCourseById(id);
        if (!course) {
            fs.unlinkSync(req.file.path);
            throw new NotFoundError(`Course with ID "${id}" not found`);
        }
        const isValid = validateMagicBytes(req.file.path);
        if (!isValid) {
            fs.unlinkSync(req.file.path);
            throw new ValidationError('File upload rejected: magic byte validation failed');
        }
        const previousUrl = course[`${field}_url`] || course[`${field}Url`] || null;
        let fileUrl;
        if (isR2StorageEnabled()) {
            const uploaded = await storageFn(req.file.path, req.file.mimetype, req.file.originalname);
            if (!uploaded) {
                throw new ValidationError('Cloud storage upload failed — image must be stored in bucket');
            }
            uploadedStorageKey = uploaded.key;
            fileUrl = uploaded.url;
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        }
        else {
            fileUrl = `/uploads/${req.file.filename}`;
        }
        const updateKey = field === 'logo' ? 'logoUrl' : 'bannerUrl';
        const updated = await updateCourse(id, { [updateKey]: fileUrl });
        if (previousUrl && previousUrl !== fileUrl) {
            try {
                await deleteStoredAssetByUrl(previousUrl);
            }
            catch (cleanupError) {
                logger.warn(`Failed to delete previous course ${field}`, { cleanupError });
            }
        }
        await createAuditLog({
            userId: req.user.id,
            action: auditAction,
            entity: 'courses',
            entityId: id,
            afterData: { [updateKey]: fileUrl },
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
                logger.warn(`Failed to rollback uploaded course ${field}`, { cleanupError });
            }
        }
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
}

export async function uploadLogo(req, res, next) {
    return handleImageUpload(req, res, next, {
        field: 'logo',
        storageFn: uploadCourseLogoToStorage,
        auditAction: 'COURSE_LOGO_UPLOAD',
    });
}

export async function uploadBanner(req, res, next) {
    return handleImageUpload(req, res, next, {
        field: 'banner',
        storageFn: uploadCourseBannerToStorage,
        auditAction: 'COURSE_BANNER_UPLOAD',
    });
}

export async function uploadMaterial(req, res, next) {
    let uploadedStorageKey = null;
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }
        if (!req.file) {
            throw new ValidationError('No material file uploaded');
        }
        const { id } = req.params;
        const title = req.body.title || req.file.originalname;
        const materialId = req.body.materialId || `mat_${Date.now()}`;
        const course = await getCourseById(id);
        if (!course) {
            fs.unlinkSync(req.file.path);
            throw new NotFoundError(`Course with ID "${id}" not found`);
        }
        const isValid = validateMagicBytes(req.file.path);
        if (!isValid) {
            fs.unlinkSync(req.file.path);
            throw new ValidationError('File upload rejected: magic byte validation failed');
        }
        let fileUrl;
        if (isR2StorageEnabled()) {
            const uploaded = await uploadCourseMaterialToStorage(req.file.path, req.file.mimetype, req.file.originalname);
            if (!uploaded) {
                throw new ValidationError('Cloud storage upload failed — file must be stored in bucket');
            }
            uploadedStorageKey = uploaded.key;
            fileUrl = uploaded.url;
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        }
        else {
            fileUrl = `/uploads/${req.file.filename}`;
        }
        const existingExtra = typeof course.extra_data === 'string'
            ? JSON.parse(course.extra_data)
            : (course.extra_data || {});
        const materials = Array.isArray(existingExtra.materials) ? [...existingExtra.materials] : [];
        const entry = {
            id: materialId,
            title,
            fileName: req.file.originalname,
            url: fileUrl,
            uploadedAt: new Date().toISOString(),
        };
        const idx = materials.findIndex(m => m.id === materialId);
        if (idx >= 0) {
            const old = materials[idx];
            if (old?.url) {
                try {
                    await deleteStoredAssetByUrl(old.url);
                }
                catch (cleanupError) {
                    logger.warn('Failed to delete previous course material', { cleanupError });
                }
            }
            materials[idx] = entry;
        }
        else {
            materials.push(entry);
        }
        const updated = await updateCourse(id, { extraData: { ...existingExtra, materials } });
        await createAuditLog({
            userId: req.user.id,
            action: 'COURSE_MATERIAL_UPLOAD',
            entity: 'courses',
            entityId: id,
            afterData: entry,
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
                logger.warn('Failed to rollback uploaded course material', { cleanupError });
            }
        }
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
}

export async function removeMaterial(req, res, next) {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }
        const { id, materialId } = req.params;
        const course = await getCourseById(id);
        if (!course) {
            throw new NotFoundError(`Course with ID "${id}" not found`);
        }
        const existingExtra = typeof course.extra_data === 'string'
            ? JSON.parse(course.extra_data)
            : (course.extra_data || {});
        const materials = Array.isArray(existingExtra.materials) ? [...existingExtra.materials] : [];
        const idx = materials.findIndex(m => m.id === materialId);
        if (idx < 0) {
            throw new NotFoundError(`Material "${materialId}" not found`);
        }
        const [removed] = materials.splice(idx, 1);
        if (removed?.url) {
            try {
                await deleteStoredAssetByUrl(removed.url);
            }
            catch (cleanupError) {
                logger.warn('Failed to delete course material file', { cleanupError });
            }
        }
        const updated = await updateCourse(id, { extraData: { ...existingExtra, materials } });
        await createAuditLog({
            userId: req.user.id,
            action: 'COURSE_MATERIAL_DELETE',
            entity: 'courses',
            entityId: id,
            beforeData: removed,
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
