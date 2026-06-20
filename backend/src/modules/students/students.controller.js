import fs from 'fs';
import { createStudentSchema, updateStudentSchema } from './students.schema.js';
import { getStudentsList, getStudentById, createStudent, updateStudent, deleteStudentSoft, } from './students.service.js';
import { NotFoundError, UnauthorizedError, ValidationError } from '../../shared/errors/app-error.js';
import { createAuditLog } from '../audit/audit.service.js';
import { photoUpload, validateMagicBytes } from '../../shared/utils/photo-upload.js';
export const upload = photoUpload;
export async function list(req, res, next) {
    try {
        const search = req.query.search;
        const course = req.query.course;
        const status = req.query.status;
        const page = req.query.page ? parseInt(req.query.page, 10) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
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
        const photoUrl = `/uploads/${req.file.filename}`;
        const updated = await updateStudent(id, { photoUrl });
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
        // Clean up file if error occurred after upload but before finish
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
}
