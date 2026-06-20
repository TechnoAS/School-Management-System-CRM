import { z } from "zod";
import { v } from "./fields";

export const instituteSettingsSchema = z.object({
  name: v.personName(),
  phone: v.phoneOptional(),
  email: v.optionalEmail(),
  address: v.addressOptional(),
  registrationNo: v.registrationNo(),
  academicYear: v.academicYear().optional().nullable(),
  logoUrl: z.string().optional(),
});

export const receiptSettingsSchema = z.object({
  prefix: v.receiptPrefix(),
  startingNumber: v.receiptNumber(),
  footerText: z.string().max(500).optional().default(""),
  showLogo: z.enum(["yes", "no"]),
  printFormat: z.enum(["A4", "A5", "Thermal"]),
});

export const certificateSettingsSchema = z.object({
  prefix: v.receiptPrefix(),
  authorisedBy: v.personName(),
  bodyText: z.string().max(2000).optional().default(""),
});
