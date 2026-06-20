import { z } from 'zod';
import { v } from '../../shared/validation/fields.js';
export const createExamSchema = z.object({
    id: v.entityId('Exam ID'),
    title: v.examTitle(),
    courseId: v.entityId('Course ID'),
    batchId: v.entityId('Batch ID'),
    examDate: v.isoDate('Exam date'),
    maxMarks: z.number().int().positive('Max marks must be greater than zero').max(1000).default(100),
    status: z.enum(['Upcoming', 'Completed', 'Cancelled']).default('Upcoming'),
});
export const updateExamSchema = createExamSchema.partial().omit({ id: true });
export const saveMarksSchema = z.object({
    marks: z
        .array(z.object({
        studentId: v.entityId('Student ID'),
        marks: z.number().int().nonnegative('Marks cannot be negative').max(1000),
    }))
        .min(1, 'At least one mark record is required'),
});
