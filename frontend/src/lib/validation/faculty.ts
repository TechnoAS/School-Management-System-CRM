import { z } from "zod";
import { v } from "./fields";

export const facultyFormSchema = z.object({
  name: v.personName(),
  subject: v.subject(),
  phone: v.phoneOptional(),
  email: v.optionalEmail(),
  qualification: v.qualification(),
  experience: v.experience(),
  salary: z.coerce.number().pipe(v.positiveMoney()),
});

export type FacultyFormValues = z.infer<typeof facultyFormSchema>;
