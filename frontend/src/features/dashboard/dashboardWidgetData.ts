import type { DashboardStats } from "@/api/services/dashboard.service";
import { FMT } from "@/lib/utils";
import type { ChartPoint, PieSlice, TodayClass } from "@/lib/dashboardStats";

export type DashboardWidgetData = {
  stats: DashboardStats;
  enrollmentData: ChartPoint[];
  feeData: ChartPoint[];
  coursePie: PieSlice[];
  todayClasses: TodayClass[];
  monthLabel: string;
};

export function resolveKpiValue(dataSource: string, data: DashboardWidgetData): { value: string; sub: string } {
  const { stats, monthLabel } = data;
  switch (dataSource) {
    case "kpi-total-students":
      return { value: String(stats.totalStudents), sub: "Across all courses" };
    case "kpi-active-students":
      return { value: String(stats.activeStudents), sub: "Currently enrolled" };
    case "kpi-new-admissions":
      return { value: String(stats.newAdmissionsThisMonth), sub: monthLabel };
    case "kpi-fees-due":
      return { value: FMT.format(stats.feesDue), sub: `From ${stats.studentsWithFeesDue} students` };
    case "kpi-fees-collected":
      return { value: FMT.format(stats.feesCollected), sub: "This academic year" };
    case "kpi-courses":
      return { value: String(stats.totalCourses), sub: `${stats.activeCourses} active` };
    case "kpi-batches":
      return { value: String(stats.upcomingBatches), sub: `${stats.ongoingBatches} ongoing` };
    case "kpi-today-classes":
      return { value: String(stats.todayClassesCount), sub: `${stats.ongoingClassesNow} ongoing now` };
    default:
      return { value: "—", sub: "" };
  }
}
