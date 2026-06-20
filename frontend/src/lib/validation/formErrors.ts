import type { ZodError, ZodSchema } from "zod";

export function firstZodError(error: ZodError): string {
  return error.issues[0]?.message ?? "Please fix form errors";
}

export function validateForm<T>(
  schema: ZodSchema<T>,
  data: unknown
): { ok: true; data: T } | { ok: false; message: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { ok: false, message: firstZodError(result.error) };
  }
  return { ok: true, data: result.data };
}
