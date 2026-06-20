import { describe, it, expect } from "vitest";
import { PATTERNS } from "@/lib/validation/fields";
import { studentFormSchema } from "@/lib/validation/student";
import { courseFormSchema } from "@/lib/validation/course";
import { loginFormSchema } from "@/lib/validation/auth";

describe("validation patterns", () => {
  it("accepts valid Indian phone numbers", () => {
    expect(PATTERNS.phoneIndia.test("9876543210")).toBe(true);
    expect(PATTERNS.phoneIndia.test("1234567890")).toBe(false);
  });

  it("accepts course duration format", () => {
    expect(PATTERNS.duration.test("6 Months")).toBe(true);
    expect(PATTERNS.duration.test("six months")).toBe(false);
  });

  it("accepts entity ids", () => {
    expect(PATTERNS.entityId.test("STU-001")).toBe(true);
    expect(PATTERNS.entityId.test("ab")).toBe(false);
  });
});

describe("studentFormSchema", () => {
  it("rejects invalid phone", () => {
    const result = studentFormSchema.safeParse({
      name: "Aarav Menon",
      dob: "2005-01-15",
      phone: "12345",
      email: "aarav@example.com",
      address: "123 Main Street, City",
      course: "Web Dev",
      batch: "Batch A",
      guardian: "Parent Name",
      guardianPhone: "9876543210",
      status: "Active",
      grade: "-",
      admissionDate: "2024-06-01",
      feesTotal: 25000,
      feesPaid: 0,
      photo: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("10-digit");
    }
  });
});

describe("courseFormSchema", () => {
  it("rejects bad duration", () => {
    const result = courseFormSchema.safeParse({
      name: "Full Stack Web Development",
      duration: "long",
      fees: 25000,
      description: "",
      status: "Active",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginFormSchema", () => {
  it("rejects invalid email", () => {
    const result = loginFormSchema.safeParse({ email: "not-an-email", password: "secret" });
    expect(result.success).toBe(false);
  });
});
