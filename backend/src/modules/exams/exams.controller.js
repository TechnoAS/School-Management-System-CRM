import { createExamSchema, updateExamSchema, saveMarksSchema } from './exams.schema.js';
import { getAllExams, getExamById, createExam, updateExam, deleteExam, getExamMarksList, saveExamMarks, getExamResultsDetails, } from './exams.service.js';
import { NotFoundError, UnauthorizedError } from '../../shared/errors/app-error.js';
import { createAuditLog } from '../audit/audit.service.js';
export async function listExams(_req, res, next) {
    try {
        const list = await getAllExams();
        res.status(200).json({
            success: true,
            data: list,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getExam(req, res, next) {
    try {
        const { id } = req.params;
        const exam = await getExamById(id);
        if (!exam) {
            throw new NotFoundError(`Exam with ID "${id}" not found`);
        }
        res.status(200).json({
            success: true,
            data: exam,
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
        const data = createExamSchema.parse(req.body);
        const exam = await createExam(data);
        await createAuditLog({
            userId: req.user.id,
            action: 'EXAM_CREATE',
            entity: 'exams',
            entityId: exam.id,
            afterData: exam,
            ipAddress: req.ip || null,
            userAgent: req.headers['user-agent'] || null,
        });
        res.status(201).json({
            success: true,
            data: exam,
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
        const data = updateExamSchema.parse(req.body);
        const oldExam = await getExamById(id);
        const updated = await updateExam(id, data);
        await createAuditLog({
            userId: req.user.id,
            action: 'EXAM_UPDATE',
            entity: 'exams',
            entityId: id,
            beforeData: oldExam,
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
        const oldExam = await getExamById(id);
        await deleteExam(id);
        await createAuditLog({
            userId: req.user.id,
            action: 'EXAM_DELETE',
            entity: 'exams',
            entityId: id,
            beforeData: oldExam,
            ipAddress: req.ip || null,
            userAgent: req.headers['user-agent'] || null,
        });
        res.status(200).json({
            success: true,
            message: `Exam "${id}" deleted successfully`,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getMarks(req, res, next) {
    try {
        const { id } = req.params;
        const marks = await getExamMarksList(id);
        res.status(200).json({
            success: true,
            data: marks,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function saveMarks(req, res, next) {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }
        const { id } = req.params;
        const data = saveMarksSchema.parse(req.body);
        await saveExamMarks(id, data);
        await createAuditLog({
            userId: req.user.id,
            action: 'EXAM_MARKS_SAVE',
            entity: 'exams',
            entityId: id,
            afterData: { recordsCount: data.marks.length },
            ipAddress: req.ip || null,
            userAgent: req.headers['user-agent'] || null,
        });
        res.status(200).json({
            success: true,
            message: 'Exam marks saved successfully',
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getResults(req, res, next) {
    try {
        const { id } = req.params;
        const results = await getExamResultsDetails(id);
        res.status(200).json({
            success: true,
            data: results,
        });
    }
    catch (error) {
        next(error);
    }
}
