import type { Role, User } from "@/types";

// Modules each role is allowed to open. "all" grants every module (Admin).
export const ROLES: Record<
  Role,
  { label: string; access: string; modules: string[] | "all"; tint: string }
> = {
  super_admin: {
    label: "Super Admin",
    access: "Full Access + Layout Editor",
    modules: "all",
    tint: "#1a3a5c",
  },
  admin: {
    label: "Admin",
    access: "Full Access",
    modules: "all",
    tint: "#c87d1a",
  },
  staff: {
    label: "Staff",
    access: "Student & Fee Management",
    modules: [
      "dashboard",
      "students",
      "courses",
      "batches",
      "attendance",
      "fees",
      "notifications",
    ],
    tint: "#2d6a4f",
  },
  faculty: {
    label: "Faculty",
    access: "Attendance & Marks Entry",
    modules: ["dashboard", "attendance", "exams", "notifications"],
    tint: "#7c3d8f",
  },
};

// Demo accounts for sign-in (front-end only, no real backend).
export const DEMO_USERS: Array<User & { password: string }> = [
  {
    name: "Aarav Menon",
    email: "admin@techacademy.com",
    password: "admin123",
    role: "super_admin",
    phone: "+91 98450 10001",
  },
  {
    name: "Divya Rao",
    email: "staff@techacademy.com",
    password: "staff123",
    role: "staff",
    phone: "+91 98450 10002",
  },
  {
    name: "Rahul Mehta",
    email: "faculty@techacademy.com",
    password: "faculty123",
    role: "faculty",
    phone: "+91 98450 10003",
  },
];

export function canAccess(role: Role, moduleId: string) {
  const allowed = ROLES[role].modules;
  return allowed === "all" || allowed.includes(moduleId);
}
