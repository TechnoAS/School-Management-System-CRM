import { z } from 'zod';
import { v } from '../../shared/validation/fields.js';
export const createStudentSchema = z.object({
    id: v.entityId('Student ID'),
    name: v.personName(),
    phone: v.phoneOptional(),
    email: v.optionalEmail(),
    courseId: v.entityId('Course ID'),
    batchId: v.entityId('Batch ID').optional().nullable(),
    guardian: v.optionalPersonName(),
    guardianPhone: v.phoneOptional(),
    address: v.addressOptional(),
    admissionDate: v.isoDate('Admission date'),
    feesTotal: v.positiveMoney().default(0),
    feesPaid: v.positiveMoney().default(0),
    status: z.enum(['Active', 'Inactive', 'Completed', 'Deleted']).default('Active'),
    dob: v.isoDate('Date of birth').optional().nullable(),
    grade: v.gradeOptional(),
    photoUrl: z.string().optional().nullable(),
});
export const updateStudentSchema = createStudentSchema.partial().omit({ id: true });
