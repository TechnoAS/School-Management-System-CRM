import fs from 'fs';
import { createFacultySchema, updateFacultySchema } from './faculty.schema.js';
import { getAllFaculty, getFacultyById, createFaculty, updateFaculty, deleteFaculty, } from './faculty.service.js';
import { NotFoundError, UnauthorizedError, ValidationError } from '../../shared/errors/app-error.js';
import { createAuditLog } from '../audit/audit.service.js';
import { photoUpload, validateMagicBytes } from '../../shared/utils/photo-upload.js';
export const upload = photoUpload;
export async function listFaculty(_req, res, next) {
    try {
        const list = await getAllFaculty();
        res.status(200).json({
            success: true,
            data: list,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getFaculty(req, res, next) {
    try {
        const { id } = req.params;
        const faculty = await getFacultyById(id);
        if (!faculty) {
            throw new NotFoundError(`Faculty with ID "${id}" not found`);
        }
        res.status(200).json({
            success: true,
            data: faculty,
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
        const data = createFacultySchema.parse(req.body);
        const faculty = await createFaculty(data);
        await createAuditLog({
            userId: req.user.id,
            action: 'FACULTY_CREATE',
            entity: 'faculty',
            entityId: faculty.id,
            afterData: faculty,
            ipAddress: req.ip || null,
            userAgent: req.headers['user-agent'] || null,
        });
        res.status(201).json({
            success: true,
            data: faculty,
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
        const data = updateFacultySchema.parse(req.body);
        const oldFaculty = await getFacultyById(id);
        const updated = await updateFaculty(id, data);
        await createAuditLog({
            userId: req.user.id,
            action: 'FACULTY_UPDATE',
            entity: 'faculty',
            entityId: id,
            beforeData: oldFaculty,
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
        const oldFaculty = await getFacultyById(id);
        await deleteFaculty(id);
        await createAuditLog({
            userId: req.user.id,
            action: 'FACULTY_DELETE',
            entity: 'faculty',
            entityId: id,
            beforeData: oldFaculty,
            ipAddress: req.ip || null,
            userAgent: req.headers['user-agent'] || null,
        });
        res.status(200).json({
            success: true,
            message: `Faculty "${id}" deleted successfully`,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function markAttendance(req, res, next) {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }
        const { id } = req.params;
        const { status, date } = req.body;
        // We do not have a separate faculty attendance table in db, so we save to audit logs as a record
        await createAuditLog({
            userId: req.user.id,
            action: 'FACULTY_ATTENDANCE_MARK',
            entity: 'faculty',
            entityId: id,
            afterData: { status, date },
            ipAddress: req.ip || null,
            userAgent: req.headers['user-agent'] || null,
        });
        res.status(200).json({
            success: true,
            message: `Attendance marked as "${status}" for faculty "${id}"`,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getSalarySlip(req, res, next) {
    try {
        const { id } = req.params;
        const faculty = await getFacultyById(id);
        if (!faculty) {
            throw new NotFoundError(`Faculty with ID "${id}" not found`);
        }
        const basicSalary = parseFloat(faculty.salary) || 0;
        const deductions = Math.round(basicSalary * 0.05); // 5% standard tax/provident fund deduction
        const netPaid = basicSalary - deductions;
        res.status(200).json({
            success: true,
            data: {
                facultyId: id,
                name: faculty.name,
                basicSalary,
                deductions,
                netPaid,
                month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
                currency: 'INR',
            },
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
        const faculty = await getFacultyById(id);
        if (!faculty) {
            fs.unlinkSync(req.file.path);
            throw new NotFoundError(`Faculty with ID "${id}" not found`);
        }
        if (!validateMagicBytes(req.file.path)) {
            fs.unlinkSync(req.file.path);
            throw new ValidationError('File upload rejected: magic byte validation failed');
        }
        const photoUrl = `/uploads/${req.file.filename}`;
        const updated = await updateFaculty(id, { photoUrl });
        await createAuditLog({
            userId: req.user.id,
            action: 'FACULTY_PHOTO_UPLOAD',
            entity: 'faculty',
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
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
}
