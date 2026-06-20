import { z } from "zod";
import { v } from "./fields";

export const profileAccountSchema = z.object({
  name: v.personName(),
  email: v.email(),
  phone: v.phoneOptional(),
  photo: z.string().optional().default(""),
});

export type ProfileAccountValues = z.infer<typeof profileAccountSchema>;
