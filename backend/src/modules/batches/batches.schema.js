import { z } from 'zod';
import { v } from '../../shared/validation/fields.js';
const batchFields = {
    id: v.entityId('Batch ID'),
    courseId: v.entityId('Course ID'),
    name: v.batchName(),
    timing: v.timing(),
    facultyId: v.entityId('Faculty ID').optional().nullable(),
    status: z.enum(['Upcoming', 'Ongoing', 'Completed']).default('Upcoming'),
    startDate: v.isoDate('Start date'),
    endDate: v.isoDate('End date'),
};
function endAfterStart(data, ctx) {
    if (data.startDate && data.endDate && data.endDate < data.startDate) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'End date must be on or after start date',
            path: ['endDate'],
        });
    }
}
export const createBatchSchema = z.object(batchFields).superRefine(endAfterStart);
export const updateBatchSchema = z
    .object({
    courseId: v.entityId('Course ID').optional(),
    name: v.batchName().optional(),
    timing: v.timing().optional(),
    facultyId: v.entityId('Faculty ID').optional().nullable(),
    status: z.enum(['Upcoming', 'Ongoing', 'Completed']).optional(),
    startDate: v.isoDate('Start date').optional(),
    endDate: v.isoDate('End date').optional(),
})
    .superRefine(endAfterStart);
