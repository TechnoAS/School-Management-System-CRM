import { apiRequest } from "../client";
import { mapExam, mapExamMark } from "../mappers";
import type { Exam, Course, Batch } from "@/types";

export const examsService = {
  async list() {
    const rows = await apiRequest<Record<string, unknown>[]>("/exams");
    return rows.map(mapExam);
  },

  async create(
    data: Omit<Exam, "id">,
    courses: Course[],
    batches: Batch[],
    id: string
  ) {
    const course = courses.find(c => c.name === data.course);
    const batch = batches.find(b => b.name === data.batch);
    const row = await apiRequest<Record<string, unknown>>("/exams", {
      method: "POST",
      body: JSON.stringify({
        id,
        title: data.title,
        courseId: course?.id,
        batchId: batch?.id,
        examDate: data.date,
        maxMarks: data.max,
        status: "Upcoming",
      }),
    });
    return mapExam({
      ...row,
      courseName: data.course,
      batchName: data.batch,
      examDate: data.date,
      maxMarks: data.max,
      status: "Upcoming",
    });
  },

  async getMarks(examId: string, maxMarks = 100, options?: { savedOnly?: boolean }) {
    const rows = await apiRequest<Record<string, unknown>[]>(`/exams/${examId}/marks`);
    const mapped = rows.map(row => mapExamMark(row, examId, maxMarks));
    if (!options?.savedOnly) return mapped;
    return rows
      .map((row, index) => ({ row, mark: mapped[index]! }))
      .filter(({ row }) => row.markRecordId != null || row.marks != null)
      .map(({ mark }) => mark);
  },

  async saveMarks(examId: string, marks: { studentId: string; marks: number }[]) {
    await apiRequest(`/exams/${examId}/marks`, {
      method: "PUT",
      body: JSON.stringify({ marks }),
    });
  },

  async remove(id: string) {
    await apiRequest(`/exams/${id}`, { method: "DELETE" });
  },
};
