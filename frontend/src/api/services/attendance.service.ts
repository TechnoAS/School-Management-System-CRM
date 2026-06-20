import { apiRequest } from "../client";
import { mapAttendanceRecord } from "../mappers";
import type { AttnStatus } from "@/types";

export const attendanceService = {
  async listRecords(months = 12) {
    const rows = await apiRequest<Record<string, unknown>[]>(
      `/attendance/records?months=${encodeURIComponent(String(months))}`
    );
    return rows.map(r => mapAttendanceRecord(r));
  },

  async get(batchId: string, date: string, batchName: string) {
    const rows = await apiRequest<Record<string, unknown>[]>(
      `/attendance?batchId=${encodeURIComponent(batchId)}&date=${encodeURIComponent(date)}`
    );
    return rows
      .filter(r => r.status)
      .map(r => mapAttendanceRecord(r, batchId, batchName, date));
  },

  async save(
    batchId: string,
    date: string,
    records: { studentId: string; status: AttnStatus }[]
  ) {
    await apiRequest("/attendance", {
      method: "PUT",
      body: JSON.stringify({ batchId, date, records }),
    });
  },

  async getReport(batchId: string, month: string) {
    return apiRequest<{
      summary: { present: number; absent: number; leave: number };
      students: {
        studentId: string;
        studentName: string;
        present: number;
        absent: number;
        leave: number;
        totalClasses: number;
      }[];
    }>(
      `/attendance/report?batchId=${encodeURIComponent(batchId)}&month=${encodeURIComponent(month)}`
    );
  },
};
