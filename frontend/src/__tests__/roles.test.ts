import { describe, it, expect } from "vitest";
import { canAccess, ROLES } from "@/constants/roles";

describe("canAccess", () => {
  it("grants admin all modules", () => {
    expect(canAccess("admin", "settings")).toBe(true);
    expect(canAccess("admin", "faculty")).toBe(true);
  });

  it("grants super_admin all modules", () => {
    expect(canAccess("super_admin", "settings")).toBe(true);
    expect(canAccess("super_admin", "dashboard")).toBe(true);
  });

  it("restricts staff from admin-only modules", () => {
    expect(canAccess("staff", "students")).toBe(true);
    expect(canAccess("staff", "settings")).toBe(false);
    expect(canAccess("staff", "faculty")).toBe(false);
  });

  it("restricts faculty to assigned modules", () => {
    expect(canAccess("faculty", "attendance")).toBe(true);
    expect(canAccess("faculty", "students")).toBe(false);
  });

  it("defines four roles", () => {
    expect(Object.keys(ROLES)).toEqual(["super_admin", "admin", "staff", "faculty"]);
  });
});
