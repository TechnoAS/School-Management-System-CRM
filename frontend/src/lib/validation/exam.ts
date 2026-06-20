import { z } from "zod";
import { v } from "./fields";

export const examFormSchema = z.object({
  title: v.examTitle(),
  course: z.string().min(1, "Select a course"),
  batch: z.string().min(1, "Select a batch"),
  date: v.isoDate("Exam date"),
  max: z.coerce.number().int().positive("Maximum marks must be greater than zero").max(1000),
});

export type ExamFormValues = z.infer<typeof examFormSchema>;
