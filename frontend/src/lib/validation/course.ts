import { z } from "zod";
import { v } from "./fields";
import { computeDurationFromDates } from "@/lib/duration";

export const courseFormSchema = z
  .object({
    name: v.courseTitle(),
    startDate: v.isoDate("Start date"),
    endDate: v.isoDate("End date"),
    fees: z.coerce.number().pipe(v.positiveMoney()),
    description: z.string().max(2000).optional().default(""),
    status: z.enum(["Active", "Inactive"]),
  })
  .superRefine((data, ctx) => {
    if (data.endDate <= data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be after start date",
        path: ["endDate"],
      });
    }
    const duration = computeDurationFromDates(data.startDate, data.endDate);
    if (!duration) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Could not calculate duration from dates",
        path: ["endDate"],
      });
    }
  })
  .transform(data => ({
    ...data,
    duration: computeDurationFromDates(data.startDate, data.endDate),
  }));

export type CourseFormValues = z.infer<typeof courseFormSchema>;
