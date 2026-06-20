import { bulkUpsertAttendanceSchema } from './attendance.schema.js';
import { getAttendance, upsertAttendance, getAttendanceReport, listAttendanceRecords, } from './attendance.service.js';
import { UnauthorizedError, ValidationError } from '../../shared/errors/app-error.js';
import { createAuditLog } from '../audit/audit.service.js';
export async function listAttendance(req, res, next) {
    try {
        const batchId = req.query.batchId;
        const date = req.query.date;
        if (!batchId || !date) {
            throw new ValidationError('Both batchId and date query parameters are required');
        }
        const records = await getAttendance(batchId, date);
        res.status(200).json({
            success: true,
            data: records,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function upsert(req, res, next) {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }
        const data = bulkUpsertAttendanceSchema.parse(req.body);
        await upsertAttendance(data, req.user.id);
        await createAuditLog({
            userId: req.user.id,
            action: 'ATTENDANCE_UPSERT',
            entity: 'batches',
            entityId: data.batchId,
            afterData: { date: data.date, recordsCount: data.records.length },
            ipAddress: req.ip || null,
            userAgent: req.headers['user-agent'] || null,
        });
        res.status(200).json({
            success: true,
            message: 'Attendance record updated successfully',
        });
    }
    catch (error) {
        next(error);
    }
}
export async function listRecords(req, res, next) {
    try {
        const months = req.query.months ? Number(req.query.months) : 12;
        const records = await listAttendanceRecords(months);
        res.status(200).json({
            success: true,
            data: records,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function report(req, res, next) {
    try {
        const batchId = req.query.batchId;
        const month = req.query.month; // YYYY-MM
        if (!batchId || !month) {
            throw new ValidationError('Both batchId and month query parameters are required');
        }
        const reportData = await getAttendanceReport(batchId, month);
        res.status(200).json({
            success: true,
            data: reportData,
        });
    }
    catch (error) {
        next(error);
    }
}
