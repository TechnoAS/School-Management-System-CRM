import fs from 'fs';
import { createStudentSchema, updateStudentSchema } from './students.schema.js';
import { getStudentsList, getStudentById, createStudent, updateStudent, deleteStudentSoft, } from './students.service.js';
import { NotFoundError, UnauthorizedError, ValidationError } from '../../shared/errors/app-error.js';
import { createAuditLog } from '../audit/audit.service.js';
import { photoUpload, validateMagicBytes } from '../../shared/utils/photo-upload.js';
import {
    deletePhotoFromStorageByKey,
    deleteStoredAssetByUrl,
    isR2StorageEnabled,
    uploadPhotoToStorage,
    uploadDocumentToStorage,
} from '../../shared/utils/object-storage.js';
import { logger } from '../../config/logger.js';
export const upload = photoUpload;
export async function list(req, res, next) {
    try {
        const search = req.query.search;
        const course = req.query.course;
        const status = req.query.status;
        const page = req.query.page ? parseInt(req.query.page, 10) : 1;
        // Clamp limit to a maximum of 100 to prevent DB stress
        const limit = Math.min(req.query.limit ? parseInt(req.query.limit, 10) : 10, 100);
        const result = await getStudentsList({ search, course, status, page, limit });
        res.status(200).json({
            success: true,
            data: result.students,
            meta: result.meta,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getStudent(req, res, next) {
    try {
        const { id } = req.params;
        const student = await getStudentById(id);
        if (!student) {
            throw new NotFoundError(`Student with ID "${id}" not found`);
        }
        res.status(200).json({
            success: true,
            data: student,
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
        const data = createStudentSchema.parse(req.body);
        const student = await createStudent(data);
        await createAuditLog({
            userId: req.user.id,
            action: 'STUDENT_ADMISSION',
            entity: 'students',
            entityId: student.id,
            afterData: student,
            ipAddress: req.ip || null,
            userAgent: req.headers['user-agent'] || null,
        });
        res.status(201).json({
            success: true,
            data: student,
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
        const data = updateStudentSchema.parse(req.body);
        const oldStudent = await getStudentById(id);
        const updated = await updateStudent(id, data);
        await createAuditLog({
            userId: req.user.id,
            action: 'STUDENT_UPDATE',
            entity: 'students',
            entityId: id,
            beforeData: oldStudent,
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
        const oldStudent = await getStudentById(id);
        await deleteStudentSoft(id);
        await createAuditLog({
            userId: req.user.id,
            action: 'STUDENT_DELETE_SOFT',
            entity: 'students',
            entityId: id,
            beforeData: oldStudent,
            ipAddress: req.ip || null,
            userAgent: req.headers['user-agent'] || null,
        });
        res.status(200).json({
            success: true,
            message: `Student "${id}" soft-deleted successfully`,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function uploadPhoto(req, res, next) {
    let uploadedStorageKey = null;
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }
        if (!req.file) {
            throw new ValidationError('No photo file uploaded');
        }
        const { id } = req.params;
        const student = await getStudentById(id);
        if (!student) {
            fs.unlinkSync(req.file.path);
            throw new NotFoundError(`Student with ID "${id}" not found`);
        }
        // Validate magic bytes
        const isValid = validateMagicBytes(req.file.path);
        if (!isValid) {
            fs.unlinkSync(req.file.path);
            throw new ValidationError('File upload rejected: magic byte validation failed');
        }
        const previousPhotoUrl = student.photo_url || null;
        let photoUrl = `/uploads/${req.file.filename}`;
        if (isR2StorageEnabled()) {
            const uploaded = await uploadPhotoToStorage(req.file.path, req.file.mimetype, req.file.originalname);
            if (!uploaded) {
                throw new ValidationError('Cloud storage upload failed');
            }
            uploadedStorageKey = uploaded.key;
            photoUrl = uploaded.url;
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        }
        const updated = await updateStudent(id, { photoUrl });
        if (previousPhotoUrl && previousPhotoUrl !== photoUrl) {
            try {
                await deleteStoredAssetByUrl(previousPhotoUrl);
            }
            catch (cleanupError) {
                logger.warn('Failed to delete previous student photo', { cleanupError });
            }
        }
        await createAuditLog({
            userId: req.user.id,
            action: 'STUDENT_PHOTO_UPLOAD',
            entity: 'students',
            entityId: id,
            afterData: { photoUrl },
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
                logger.warn('Failed to rollback uploaded student photo', { cleanupError });
            }
        }
        // Clean up file if error occurred after upload but before finish
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
}
export async function uploadDocument(req, res, next) {
    let uploadedStorageKey = null;
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }
        if (!req.file) {
            throw new ValidationError('No document file uploaded');
        }
        const { id } = req.params;
        const slotId = req.body.slotId;
        const label = req.body.label || 'Document';
        if (!slotId) {
            fs.unlinkSync(req.file.path);
            throw new ValidationError('Document slot ID is required');
        }
        const student = await getStudentById(id);
        if (!student) {
            fs.unlinkSync(req.file.path);
            throw new NotFoundError(`Student with ID "${id}" not found`);
        }
        const isValid = validateMagicBytes(req.file.path);
        if (!isValid) {
            fs.unlinkSync(req.file.path);
            throw new ValidationError('File upload rejected: magic byte validation failed');
        }
        let fileUrl = `/uploads/${req.file.filename}`;
        if (isR2StorageEnabled()) {
            const uploaded = await uploadDocumentToStorage(req.file.path, req.file.mimetype, req.file.originalname);
            if (!uploaded) {
                throw new ValidationError('Cloud storage upload failed');
            }
            uploadedStorageKey = uploaded.key;
            fileUrl = uploaded.url;
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        }
        const existingExtra = typeof student.extra_data === 'string'
            ? JSON.parse(student.extra_data)
            : (student.extra_data || {});
        const documents = Array.isArray(existingExtra.documents) ? [...existingExtra.documents] : [];
        const docEntry = {
            slotId,
            label,
            fileName: req.file.originalname,
            url: fileUrl,
            uploadedAt: new Date().toISOString(),
        };
        const idx = documents.findIndex(d => d.slotId === slotId);
        if (idx >= 0) {
            const oldUrl = documents[idx].url;
            if (oldUrl && oldUrl !== fileUrl) {
                try {
                    await deleteStoredAssetByUrl(oldUrl);
                }
                catch (cleanupError) {
                    logger.warn('Failed to delete previous student document', { cleanupError });
                }
            }
            documents[idx] = docEntry;
        }
        else {
            documents.push(docEntry);
        }
        const extraData = { ...existingExtra, documents };
        const updated = await updateStudent(id, { extraData });
        await createAuditLog({
            userId: req.user.id,
            action: 'STUDENT_DOCUMENT_UPLOAD',
            entity: 'students',
            entityId: id,
            afterData: { slotId, label, fileUrl },
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
                logger.warn('Failed to rollback uploaded student document', { cleanupError });
            }
        }
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
}
