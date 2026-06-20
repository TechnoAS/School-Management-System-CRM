import { z } from "zod";
import { v } from "./fields";

export const feeCollectFormSchema = z.object({
  studentId: z.string().min(1, "Select a student"),
  amount: z.coerce.number().pipe(v.positiveAmount()),
  mode: v.paymentMode(),
  date: v.isoDate("Payment date"),
  remarks: z.string().max(500).optional().default(""),
});

export type FeeCollectFormValues = z.infer<typeof feeCollectFormSchema>;
