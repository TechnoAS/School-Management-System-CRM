import { z } from "zod";

/**
 * Shared field patterns — keep in sync with `backend/src/shared/validation/fields.ts`.
 */
export const PATTERNS = {
  entityId: /^[A-Za-z0-9][A-Za-z0-9_-]{2,19}$/,
  personName: /^[A-Za-z][A-Za-z\s.'-]{1,119}$/,
  phoneIndia: /^[6-9]\d{9}$/,
  phoneIndiaFlex: /^(\+91[\s-]?)?[6-9]\d{9}$/,
  isoDate: /^\d{4}-\d{2}-\d{2}$/,
  academicYear: /^\d{4}-\d{2}$/,
  duration: /^\d+(\.\d+)?\s*(Month|Months|Week|Weeks|Day|Days|Year|Years)$/i,
  experience: /^(\d+(\.\d+)?\s*(Year|Years|Month|Months)|Fresher?)$/i,
  grade: /^([A-F][+-]?|-)$/,
  title: /^[A-Za-z0-9][A-Za-z0-9\s.'():,&–-]{1,254}$/,
  batchName: /^[A-Za-z0-9][A-Za-z0-9\s.'–-]{1,119}$/,
  timing: /^[A-Za-z0-9].{2,119}$/,
  receiptPrefix: /^[A-Z0-9-]{1,20}$/i,
  receiptNumber: /^\d{1,10}$/,
  paymentMode: /^(Cash|UPI|Card|Bank Transfer|Cheque|Online)$/i,
  password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&._-]{8,128}$/,
  address: /^[\s\S]{5,500}$/,
  qualification: /^[A-Za-z0-9][A-Za-z0-9\s.,()+-]{0,119}$/,
  registrationNo: /^[A-Za-z0-9][A-Za-z0-9/-]{0,79}$/,
} as const;

const emptyToNull = (val: unknown) => (val === "" || val === undefined ? null : val);

export const v = {
  entityId: (label = "ID") =>
    z
      .string()
      .trim()
      .regex(PATTERNS.entityId, `${label} must be 3–20 characters (letters, numbers, hyphens, underscores)`),

  personName: () =>
    z
      .string()
      .trim()
      .regex(PATTERNS.personName, "Name must be 2–120 letters (spaces, dots, hyphens allowed)"),

  optionalPersonName: () =>
    z.preprocess(
      emptyToNull,
      z
        .string()
        .trim()
        .regex(PATTERNS.personName, "Name must be 2–120 letters (spaces, dots, hyphens allowed)")
        .nullable()
        .optional()
    ),

  gradeRequired: () =>
    z
      .string()
      .regex(PATTERNS.grade, "Grade must be A+, A, B+, B, C, or F")
      .refine(g => g !== "-", "Grade is required"),

  email: () => z.string().trim().email("Enter a valid email address").max(255),

  optionalEmail: () =>
    z.preprocess(
      emptyToNull,
      z.string().trim().email("Enter a valid email address").max(255).nullable().optional()
    ),

  phoneRequired: () =>
    z
      .string()
      .trim()
      .regex(PATTERNS.phoneIndia, "Phone must be a 10-digit mobile number starting with 6–9"),

  phoneOptional: () =>
    z.preprocess(
      emptyToNull,
      z
        .string()
        .trim()
        .regex(PATTERNS.phoneIndiaFlex, "Phone must be 10 digits or +91 followed by 10 digits")
        .nullable()
        .optional()
    ),

  isoDate: (label = "Date") => z.string().regex(PATTERNS.isoDate, `${label} must be YYYY-MM-DD`),

  password: () =>
    z
      .string()
      .regex(
        PATTERNS.password,
        "Password must be 8+ characters and include at least one letter and one number"
      ),

  loginPassword: () => z.string().min(1, "Password is required"),

  duration: () =>
    z.string().trim().regex(PATTERNS.duration, "Duration format: e.g. 6 Months, 12 Weeks"),

  experience: () =>
    z.preprocess(
      emptyToNull,
      z
        .string()
        .trim()
        .regex(PATTERNS.experience, "Experience format: e.g. 5 Years or Fresher")
        .nullable()
        .optional()
    ),

  courseTitle: () =>
    z.string().trim().regex(PATTERNS.title, "Course name must be 2–255 characters"),

  examTitle: () => z.string().trim().regex(PATTERNS.title, "Exam title must be 2–255 characters"),

  batchName: () =>
    z.string().trim().regex(PATTERNS.batchName, "Batch name must be 2–120 characters"),

  timing: () => z.string().trim().regex(PATTERNS.timing, "Timing must be at least 3 characters"),

  address: () =>
    z.string().trim().regex(PATTERNS.address, "Address must be at least 5 characters"),

  addressOptional: () =>
    z.preprocess(
      emptyToNull,
      z
        .string()
        .trim()
        .regex(PATTERNS.address, "Address must be at least 5 characters")
        .nullable()
        .optional()
    ),

  grade: () => z.string().regex(PATTERNS.grade, "Grade must be A+, A, B+, B, C, F, or -"),

  paymentMode: () =>
    z
      .string()
      .regex(
        PATTERNS.paymentMode,
        "Payment mode must be Cash, UPI, Card, Bank Transfer, Cheque, or Online"
      ),

  receiptPrefix: () =>
    z
      .string()
      .trim()
      .regex(PATTERNS.receiptPrefix, "Prefix must be 1–20 letters, numbers, or hyphens"),

  receiptNumber: () =>
    z.string().trim().regex(PATTERNS.receiptNumber, "Starting number must be 1–10 digits"),

  academicYear: () =>
    z.string().regex(PATTERNS.academicYear, "Academic year format: 2024-25"),

  registrationNo: () =>
    z.preprocess(
      emptyToNull,
      z
        .string()
        .trim()
        .regex(PATTERNS.registrationNo, "Registration number format is invalid")
        .nullable()
        .optional()
    ),

  qualification: () =>
    z.preprocess(
      emptyToNull,
      z
        .string()
        .trim()
        .regex(PATTERNS.qualification, "Qualification format is invalid")
        .nullable()
        .optional()
    ),

  subject: () =>
    z.string().trim().regex(PATTERNS.title, "Subject must be 2–120 characters"),

  positiveMoney: () => z.number().nonnegative("Amount cannot be negative"),

  positiveAmount: () => z.number().positive("Amount must be greater than zero"),
};
