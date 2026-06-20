import { z } from 'zod';
import { v } from '../../shared/validation/fields.js';
export const loginSchema = z.object({
    email: v.email(),
    password: v.loginPassword(),
});
export const changePasswordSchema = z
    .object({
    currentPassword: v.loginPassword(),
    newPassword: v.password(),
})
    .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from the current password',
    path: ['newPassword'],
});
