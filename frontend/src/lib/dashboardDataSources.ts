import type { DashboardWidgetType } from "@/types/pageLayout";

export type DataSourceMeta = {
  key: string;
  label: string;
  widgetTypes: DashboardWidgetType[];
  defaultType: DashboardWidgetType;
  defaultColors?: string[];
  defaultIcon?: string;
  defaultTitle: string;
  defaultSubtitle?: string;
  defaultSpan: 1 | 2 | 3 | 4;
};

export const DASHBOARD_DATA_SOURCES: DataSourceMeta[] = [
  {
    key: "kpi-total-students",
    label: "Total Students KPI",
    widgetTypes: ["stat"],
    defaultType: "stat",
    defaultIcon: "Users",
    defaultColors: ["#1a3a5c"],
    defaultTitle: "Total Students",
    defaultSubtitle: "Across all courses",
    defaultSpan: 1,
  },
  {
    key: "kpi-active-students",
    label: "Active Students KPI",
    widgetTypes: ["stat"],
    defaultType: "stat",
    defaultIcon: "CheckCircle2",
    defaultColors: ["#059669"],
    defaultTitle: "Active Students",
    defaultSubtitle: "Currently enrolled",
    defaultSpan: 1,
  },
  {
    key: "kpi-new-admissions",
    label: "New Admissions KPI",
    widgetTypes: ["stat"],
    defaultType: "stat",
    defaultIcon: "UserPlus",
    defaultColors: ["#7c3aed"],
    defaultTitle: "New Admissions",
    defaultSubtitle: "This month",
    defaultSpan: 1,
  },
  {
    key: "kpi-fees-due",
    label: "Fees Due KPI",
    widgetTypes: ["stat"],
    defaultType: "stat",
    defaultIcon: "AlertCircle",
    defaultColors: ["#ef4444"],
    defaultTitle: "Fees Due",
    defaultSubtitle: "Outstanding balance",
    defaultSpan: 1,
  },
  {
    key: "kpi-fees-collected",
    label: "Fees Collected KPI",
    widgetTypes: ["stat"],
    defaultType: "stat",
    defaultIcon: "Wallet",
    defaultColors: ["#d97706"],
    defaultTitle: "Fees Collected",
    defaultSubtitle: "This academic year",
    defaultSpan: 1,
  },
  {
    key: "kpi-courses",
    label: "Courses KPI",
    widgetTypes: ["stat"],
    defaultType: "stat",
    defaultIcon: "BookOpen",
    defaultColors: ["#0d9488"],
    defaultTitle: "Total Courses",
    defaultSubtitle: "Active courses",
    defaultSpan: 1,
  },
  {
    key: "kpi-batches",
    label: "Batches KPI",
    widgetTypes: ["stat"],
    defaultType: "stat",
    defaultIcon: "Layers",
    defaultColors: ["#4f46e5"],
    defaultTitle: "Upcoming Batches",
    defaultSubtitle: "Ongoing batches",
    defaultSpan: 1,
  },
  {
    key: "kpi-today-classes",
    label: "Today's Classes KPI",
    widgetTypes: ["stat"],
    defaultType: "stat",
    defaultIcon: "Calendar",
    defaultColors: ["#f43f5e"],
    defaultTitle: "Today's Classes",
    defaultSubtitle: "Ongoing now",
    defaultSpan: 1,
  },
  {
    key: "enrollment-trend",
    label: "Enrollment Trend",
    widgetTypes: ["area", "bar", "line"],
    defaultType: "area",
    defaultColors: ["#1a3a5c"],
    defaultTitle: "Student Enrollment Trend",
    defaultSubtitle: "Last 7 months",
    defaultSpan: 2,
  },
  {
    key: "fee-trend",
    label: "Fee Collection vs Due",
    widgetTypes: ["bar", "area", "line"],
    defaultType: "bar",
    defaultColors: ["#1a3a5c", "#c0392b"],
    defaultTitle: "Fee Collection vs Due",
    defaultSubtitle: "Monthly overview",
    defaultSpan: 2,
  },
  {
    key: "course-enrollment",
    label: "Enrollment by Course",
    widgetTypes: ["pie", "donut", "bar", "horizontal-bar"],
    defaultType: "pie",
    defaultColors: ["#1a3a5c", "#c87d1a", "#2d6a4f", "#7c3d8f", "#c0392b", "#2563eb", "#dc2626"],
    defaultTitle: "Enrollment by Course",
    defaultSpan: 1,
  },
  {
    key: "today-classes",
    label: "Today's Classes List",
    widgetTypes: ["list"],
    defaultType: "list",
    defaultTitle: "Today's Classes",
    defaultSpan: 1,
  },
];

export function getDataSourceMeta(key: string): DataSourceMeta | undefined {
  return DASHBOARD_DATA_SOURCES.find((d) => d.key === key);
}
