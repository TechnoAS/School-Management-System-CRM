import { z } from "zod";
import { v } from "./fields";

export const batchFormSchema = z
  .object({
    name: v.batchName(),
    course: z.string().min(1, "Select a course"),
    faculty: z.string().min(1, "Select faculty"),
    startDate: v.isoDate("Start date"),
    endDate: v.isoDate("End date"),
    timing: v.timing(),
    students: z.coerce.number().int().nonnegative("Max students cannot be negative"),
    status: z.enum(["Upcoming", "Ongoing", "Completed"]),
  })
  .refine(data => data.endDate >= data.startDate, {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });

export type BatchFormValues = z.infer<typeof batchFormSchema>;
