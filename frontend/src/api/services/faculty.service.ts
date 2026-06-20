import { apiRequest } from "../client";
import { mapFaculty } from "../mappers";
import type { FacultyMember } from "@/types";

export const facultyService = {
  async list() {
    const rows = await apiRequest<Record<string, unknown>[]>("/faculty");
    return rows.map(mapFaculty);
  },

  async create(data: Omit<FacultyMember, "id" | "attendance">, id: string) {
    const row = await apiRequest<Record<string, unknown>>("/faculty", {
      method: "POST",
      body: JSON.stringify({ ...data, id }),
    });
    return mapFaculty(row);
  },

  async update(id: string, data: Partial<FacultyMember>) {
    const row = await apiRequest<Record<string, unknown>>(`/faculty/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return mapFaculty(row);
  },

  async remove(id: string) {
    await apiRequest(`/faculty/${id}`, { method: "DELETE" });
  },

  async uploadPhoto(id: string, file: File): Promise<FacultyMember> {
    const form = new FormData();
    form.append("photo", file);
    const row = await apiRequest<Record<string, unknown>>(`/faculty/${id}/photo`, {
      method: "POST",
      body: form,
    });
    return mapFaculty(row);
  },
};
