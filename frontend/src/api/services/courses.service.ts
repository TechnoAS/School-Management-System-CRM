import { apiRequest } from "../client";
import { mapCourse, courseToApi } from "../mappers";
import type { Course } from "@/types";

export const coursesService = {
  async list() {
    const rows = await apiRequest<Record<string, unknown>[]>("/courses");
    return rows.map(r => mapCourse(r));
  },

  async get(id: string) {
    const row = await apiRequest<Record<string, unknown>>(`/courses/${id}`);
    const stats = (row.stats as { activeBatches?: number; activeStudents?: number }) ?? {};
    return mapCourse(row, { batches: stats.activeBatches, enrolled: stats.activeStudents });
  },

  async create(data: Omit<Course, "id" | "batches" | "enrolled">, id: string) {
    const payload = { ...courseToApi(data), id };
    const row = await apiRequest<Record<string, unknown>>("/courses", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return mapCourse(row);
  },

  async update(id: string, data: Omit<Course, "id" | "batches" | "enrolled">) {
    const payload = courseToApi(data);
    const row = await apiRequest<Record<string, unknown>>(`/courses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return mapCourse(row);
  },

  async remove(id: string) {
    await apiRequest(`/courses/${id}`, { method: "DELETE" });
  },
};
