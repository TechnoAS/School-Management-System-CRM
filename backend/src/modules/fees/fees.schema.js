import { z } from 'zod';
import { v } from '../../shared/validation/fields.js';
export const collectPaymentSchema = z.object({
    studentId: v.entityId('Student ID'),
    amount: v.positiveAmount(),
    mode: v.paymentMode(),
    payDate: v.isoDate('Payment date'),
    remarks: z.string().max(500).optional().nullable(),
});
