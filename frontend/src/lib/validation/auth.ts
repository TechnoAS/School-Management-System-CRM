import { z } from "zod";
import { v } from "./fields";

export const loginFormSchema = z.object({
  email: v.email(),
  password: v.loginPassword(),
});

export const changePasswordFormSchema = z
  .object({
    currentPassword: v.loginPassword(),
    newPassword: v.password(),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(data => data.currentPassword !== data.newPassword, {
    message: "New password must be different from the current password",
    path: ["newPassword"],
  });

export type LoginFormValues = z.infer<typeof loginFormSchema>;
