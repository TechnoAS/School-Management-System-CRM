import { apiRequest } from "../client";
import { mapCertificate } from "../mappers";
import type { Student, Course } from "@/types";

export const certificatesService = {
  async list() {
    const rows = await apiRequest<Record<string, unknown>[]>("/certificates");
    return rows.map(mapCertificate);
  },

  async issue(data: {
    studentId: string;
    courseId: string;
    grade: string;
    authorisedBy: string;
    issueDate: string;
  }) {
    const row = await apiRequest<Record<string, unknown>>("/certificates", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return mapCertificate(row);
  },
};

export function studentToCertPayload(
  student: Student,
  courses: Course[],
  grade: string,
  authorisedBy: string,
  issueDate: string
) {
  const course = courses.find(c => c.name === student.course);
  return {
    studentId: student.id,
    courseId: course?.id ?? student.course,
    grade,
    authorisedBy,
    issueDate,
  };
}
