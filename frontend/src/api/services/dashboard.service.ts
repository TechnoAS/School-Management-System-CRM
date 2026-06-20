import { apiRequest } from "../client";
import type { ChartPoint, PieSlice, TodayClass } from "@/lib/dashboardStats";

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PIE_COLORS = ["#1a3a5c", "#c87d1a", "#2d6a4f", "#7c3d8f", "#c0392b", "#2563eb", "#dc2626"];

export type DashboardStats = {
  totalStudents: number;
  activeStudents: number;
  newAdmissionsThisMonth: number;
  feesDue: number;
  feesCollected: number;
  studentsWithFeesDue: number;
  totalCourses: number;
  activeCourses: number;
  upcomingBatches: number;
  ongoingBatches: number;
  todayClassesCount: number;
  ongoingClassesNow: number;
  totalFaculty: number;
  totalRevenue: number;
};

function monthLabel(ym: string): string {
  const [, m] = ym.split("-");
  const idx = parseInt(m, 10) - 1;
  return MONTH_SHORT[idx] ?? ym;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    return apiRequest<DashboardStats>("/dashboard/stats");
  },

  async getEnrollmentTrend(): Promise<ChartPoint[]> {
    const rows = await apiRequest<{ month: string; count: number }[]>("/dashboard/enrollment-trend");
    return rows.map((r) => ({
      month: monthLabel(r.month),
      students: r.count,
    }));
  },

  async getFeeTrend(): Promise<ChartPoint[]> {
    const rows = await apiRequest<{ month: string; collected: number; due: number }[]>("/dashboard/fee-trend");
    return rows.map((r) => ({
      month: monthLabel(r.month),
      collected: r.collected,
      due: r.due,
    }));
  },

  async getCourseEnrollment(): Promise<PieSlice[]> {
    const rows = await apiRequest<{ name: string; count: number }[]>("/dashboard/course-enrollment");
    return rows.map((r, i) => ({
      name: r.name.length > 18 ? `${r.name.slice(0, 16)}…` : r.name,
      value: r.count,
      color: PIE_COLORS[i % PIE_COLORS.length],
    }));
  },

  async getTodayClasses(): Promise<TodayClass[]> {
    const rows = await apiRequest<
      {
        id: string;
        name: string;
        timing: string;
        courseName: string;
        facultyName: string | null;
        status: string;
      }[]
    >("/dashboard/today-classes");
    return rows.map((r) => ({
      batch: r.name,
      course: r.courseName,
      faculty: r.facultyName ?? "—",
      time: r.timing,
      room: r.name,
      status: r.status,
    }));
  },
};
