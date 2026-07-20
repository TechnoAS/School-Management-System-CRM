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

  async uploadLogo(id: string, file: File): Promise<Course> {
    const form = new FormData();
    form.append("logo", file);
    const row = await apiRequest<Record<string, unknown>>(`/courses/${id}/logo`, {
      method: "POST",
      body: form,
    });
    return mapCourse(row);
  },

  async uploadBanner(id: string, file: File): Promise<Course> {
    const form = new FormData();
    form.append("banner", file);
    const row = await apiRequest<Record<string, unknown>>(`/courses/${id}/banner`, {
      method: "POST",
      body: form,
    });
    return mapCourse(row);
  },

  async uploadMaterial(id: string, file: File, title: string, materialId?: string): Promise<Course> {
    const form = new FormData();
    form.append("material", file);
    form.append("title", title);
    if (materialId) form.append("materialId", materialId);
    const row = await apiRequest<Record<string, unknown>>(`/courses/${id}/materials`, {
      method: "POST",
      body: form,
    });
    return mapCourse(row);
  },

  async removeMaterial(id: string, materialId: string): Promise<Course> {
    const row = await apiRequest<Record<string, unknown>>(`/courses/${id}/materials/${materialId}`, {
      method: "DELETE",
    });
    return mapCourse(row);
  },
};
