import { apiRequest } from "../client";
import { mapStudent, studentToApi } from "../mappers";
import type { Student, Course, Batch } from "@/types";

export const studentsService = {
  async list(params?: { search?: string; course?: string; status?: string; page?: number; limit?: number }) {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.course) qs.set("course", params.course);
    if (params?.status) qs.set("status", params.status);
    if (params?.page) qs.set("page", String(params.page));
    qs.set("limit", String(params?.limit ?? 500));
    const rows = await apiRequest<Record<string, unknown>[]>(`/students?${qs}`);
    return rows.map(mapStudent);
  },

  async get(id: string) {
    const row = await apiRequest<Record<string, unknown>>(`/students/${id}`);
    return mapStudent(row);
  },

  async create(data: Omit<Student, "id">, courses: Course[], batches: Batch[], id: string) {
    const payload = { ...studentToApi(data, courses, batches), id };
    const row = await apiRequest<Record<string, unknown>>("/students", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return mapStudent(row);
  },

  async update(id: string, data: Omit<Student, "id">, courses: Course[], batches: Batch[]) {
    const payload = studentToApi(data, courses, batches);
    const row = await apiRequest<Record<string, unknown>>(`/students/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return mapStudent(row);
  },

  async remove(id: string) {
    await apiRequest(`/students/${id}`, { method: "DELETE" });
  },

  async uploadPhoto(id: string, file: File): Promise<Student> {
    const form = new FormData();
    form.append("photo", file);
    const row = await apiRequest<Record<string, unknown>>(`/students/${id}/photo`, {
      method: "POST",
      body: form,
    });
    return mapStudent(row);
  },
};
