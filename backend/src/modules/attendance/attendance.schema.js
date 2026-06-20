import { z } from 'zod';
import { v } from '../../shared/validation/fields.js';
export const attendanceRecordItemSchema = z.object({
    studentId: v.entityId('Student ID'),
    status: z.enum(['present', 'absent', 'leave']),
});
export const bulkUpsertAttendanceSchema = z.object({
    batchId: v.entityId('Batch ID'),
    date: v
        .isoDate('Attendance date')
        .refine((date) => date <= new Date().toISOString().slice(0, 10), 'Future attendance dates are not allowed'),
    records: z.array(attendanceRecordItemSchema).min(1, 'At least one record is required'),
});
