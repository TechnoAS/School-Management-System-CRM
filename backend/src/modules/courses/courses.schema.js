import { z } from 'zod';
import { v } from '../../shared/validation/fields.js';
export const createCourseSchema = z.object({
    id: v.entityId('Course ID'),
    name: v.courseTitle(),
    duration: v.duration(),
    fees: v.positiveMoney(),
    description: z.string().max(2000).optional().nullable(),
    status: z.enum(['Active', 'Inactive']).default('Active'),
});
export const updateCourseSchema = createCourseSchema.partial().omit({ id: true });
