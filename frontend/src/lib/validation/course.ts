import { z } from "zod";
import { v } from "./fields";

export const courseFormSchema = z.object({
  name: v.courseTitle(),
  duration: v.duration(),
  fees: z.coerce.number().pipe(v.positiveMoney()),
  description: z.string().max(2000).optional().default(""),
  status: z.enum(["Active", "Inactive"]),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;
