import { z } from "zod";
import { v } from "./fields";

export const studentFormSchema = z.object({
  name: v.personName(),
  dob: v.isoDate("Date of birth"),
  phone: v.phoneRequired(),
  email: v.email(),
  address: v.address(),
  course: z.string().min(1, "Select a course"),
  batch: z.string().min(1, "Select a batch"),
  guardian: v.personName(),
  guardianPhone: v.phoneRequired(),
  status: z.string(),
  grade: v.grade(),
  admissionDate: v.isoDate("Admission date"),
  feesTotal: v.positiveMoney(),
  feesPaid: v.positiveMoney(),
  photo: z.string(),
});

export type StudentFormValues = z.infer<typeof studentFormSchema>;
