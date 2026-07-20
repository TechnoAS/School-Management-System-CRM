import { z } from 'zod';
import { v } from '../../shared/validation/fields.js';
export const createCourseSchema = z.object({
    id: v.entityId('Course ID'),
    name: v.courseTitle(),
    duration: v.duration(),
    fees: v.positiveMoney(),
    description: z.string().max(2000).optional().nullable(),
    status: z.enum(['Active', 'Inactive']).default('Active'),
    startDate: v.isoDate('Start date').optional().nullable(),
    endDate: v.isoDate('End date').optional().nullable(),
    logoUrl: z.string().optional().nullable(),
    bannerUrl: z.string().optional().nullable(),
    extraData: z.record(z.string(), z.unknown()).optional().nullable(),
});
export const updateCourseSchema = createCourseSchema.partial().omit({ id: true });
