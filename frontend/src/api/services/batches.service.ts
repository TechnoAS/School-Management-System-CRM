import { apiRequest } from "../client";
import { mapBatch, batchToApi } from "../mappers";
import type { Batch, Course, FacultyMember } from "@/types";

export const batchesService = {
  async list() {
    const rows = await apiRequest<Record<string, unknown>[]>("/batches");
    return rows.map(r => mapBatch(r));
  },

  async get(id: string) {
    const row = await apiRequest<Record<string, unknown>>(`/batches/${id}`);
    return mapBatch(row);
  },

  async create(
    data: Omit<Batch, "id" | "students">,
    courses: Course[],
    faculty: FacultyMember[],
    id: string
  ) {
    const payload = { ...batchToApi(data, courses, faculty), id };
    const row = await apiRequest<Record<string, unknown>>("/batches", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return mapBatch(
      { ...row, course_name: data.course, faculty_name: data.faculty },
      0
    );
  },

  async update(
    id: string,
    data: Omit<Batch, "id" | "students">,
    courses: Course[],
    faculty: FacultyMember[]
  ) {
    const payload = batchToApi(data, courses, faculty);
    const row = await apiRequest<Record<string, unknown>>(`/batches/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return mapBatch(row);
  },

  async remove(id: string) {
    await apiRequest(`/batches/${id}`, { method: "DELETE" });
  },
};
