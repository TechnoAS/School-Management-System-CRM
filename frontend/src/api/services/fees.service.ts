import { apiRequest } from "../client";
import { mapPayment } from "../mappers";

export const feesService = {
  async listPayments() {
    const rows = await apiRequest<Record<string, unknown>[]>("/payments");
    return rows.map(mapPayment);
  },

  async collect(data: {
    studentId: string;
    amount: number;
    mode: string;
    payDate: string;
    remarks?: string;
  }) {
    const row = await apiRequest<Record<string, unknown>>("/payments", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return mapPayment(row);
  },

  async sendReminders() {
    await apiRequest("/fees/reminders", { method: "POST" });
  },
};
