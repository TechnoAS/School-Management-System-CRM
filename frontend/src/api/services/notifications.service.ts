import { apiRequest } from "../client";
import { mapNotif } from "../mappers";

export const notificationsService = {
  async list() {
    const rows = await apiRequest<Record<string, unknown>[]>("/notifications");
    return rows.map(mapNotif);
  },

  async markRead(id: number) {
    await apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
  },

  async markAllRead() {
    await apiRequest("/notifications/read-all", { method: "PATCH" });
  },

  async remove(id: number) {
    await apiRequest(`/notifications/${id}`, { method: "DELETE" });
  },
};
