import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/shared";
import { formatCurrentDateTime, getTimeGreeting } from "@/lib/utils";
import { useCurrentDateTime } from "@/hooks/useCurrentDateTime";
import {
  buildEnrollmentTrend,
  buildFeeTrend,
  buildCoursePie,
  buildTodayClasses,
} from "@/lib/dashboardStats";
import { API_ENABLED } from "@/api/config";
import { dashboardService, type DashboardStats } from "@/api/services/dashboard.service";
import { pageLayoutService } from "@/api/services/pageLayout.service";
import { DEFAULT_DASHBOARD_LAYOUT } from "@/lib/defaultDashboardLayout";
import type { PageLayout } from "@/types/pageLayout";
import { useAppStore } from "@/store/useAppStore";
import { DynamicDashboard } from "./DynamicDashboard";
import type { Student, Course, Batch, Payment } from "@/types";

function buildStatsFromStore(
  students: Student[],
  courses: Course[],
  batches: Batch[],
  todayClasses: ReturnType<typeof buildTodayClasses>
): DashboardStats {
  const now = new Date();
  const activeStudents = students.filter((s) => s.status === "Active").length;
  const totalPaid = students.reduce((sum, s) => sum + s.feesPaid, 0);
  const totalDue = students.reduce((sum, s) => sum + Math.max(0, s.feesTotal - s.feesPaid), 0);
  const newAdmissions = students.filter((s) => {
    const d = new Date(s.admissionDate);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  return {
    totalStudents: students.length,
    activeStudents,
    newAdmissionsThisMonth: newAdmissions,
    feesDue: totalDue,
    feesCollected: totalPaid,
    studentsWithFeesDue: students.filter((s) => s.feesPaid < s.feesTotal).length,
    totalCourses: courses.length,
    activeCourses: courses.filter((c) => c.status === "Active").length,
    upcomingBatches: batches.filter((b) => b.status === "Upcoming").length,
    ongoingBatches: batches.filter((b) => b.status === "Ongoing").length,
    todayClassesCount: todayClasses.length,
    ongoingClassesNow: todayClasses.filter((c) => c.status === "Ongoing").length,
    totalFaculty: 0,
    totalRevenue: totalPaid,
  };
}

function cloneLayout(layout: PageLayout): PageLayout {
  return JSON.parse(JSON.stringify(layout)) as PageLayout;
}

export function DashboardPage({
  students,
  courses,
  batches,
  payments,
  settings,
}: {
  students: Student[];
  courses: Course[];
  batches: Batch[];
  payments: Payment[];
  settings: { name: string };
}) {
  const editMode = useAppStore((s) => s.editMode);
  const setDashboardLayoutDraft = useAppStore((s) => s.setDashboardLayoutDraft);
  const setDashboardLayoutSaved = useAppStore((s) => s.setDashboardLayoutSaved);
  const setLayoutDirty = useAppStore((s) => s.setLayoutDirty);
  const dashboardLayoutDraft = useAppStore((s) => s.dashboardLayoutDraft);
  const dashboardLayoutSaved = useAppStore((s) => s.dashboardLayoutSaved);

  const [enrollmentData, setEnrollmentData] = useState(() => buildEnrollmentTrend(students));
  const [feeData, setFeeData] = useState(() => buildFeeTrend(students, payments));
  const [coursePie, setCoursePie] = useState(() => buildCoursePie(students, courses));
  const [todayClasses, setTodayClasses] = useState(() => buildTodayClasses(batches));
  const [stats, setStats] = useState<DashboardStats>(() =>
    buildStatsFromStore(students, courses, batches, buildTodayClasses(batches))
  );
  const [layoutLoaded, setLayoutLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadLayout() {
      const state = useAppStore.getState();
      if (state.dashboardLayoutSaved) {
        if (!state.dashboardLayoutDraft) {
          setDashboardLayoutDraft(cloneLayout(state.dashboardLayoutSaved));
        }
        setLayoutLoaded(true);
        return;
      }

      if (API_ENABLED) {
        try {
          const remote = await pageLayoutService.get("dashboard");
          const resolved = remote?.widgets?.length ? remote : DEFAULT_DASHBOARD_LAYOUT;
          if (cancelled) return;
          setDashboardLayoutSaved(cloneLayout(resolved));
          setDashboardLayoutDraft(cloneLayout(resolved));
          setLayoutLoaded(true);
          return;
        } catch {
          /* fall through */
        }
      } else if (state.settings.pageLayouts?.dashboard) {
        const local = state.settings.pageLayouts.dashboard;
        if (cancelled) return;
        setDashboardLayoutSaved(cloneLayout(local));
        setDashboardLayoutDraft(cloneLayout(local));
        setLayoutLoaded(true);
        return;
      }

      if (cancelled) return;
      setDashboardLayoutSaved(cloneLayout(DEFAULT_DASHBOARD_LAYOUT));
      setDashboardLayoutDraft(cloneLayout(DEFAULT_DASHBOARD_LAYOUT));
      setLayoutLoaded(true);
    }

    loadLayout();
    return () => {
      cancelled = true;
    };
  }, [setDashboardLayoutDraft, setDashboardLayoutSaved]);

  useEffect(() => {
    if (!API_ENABLED) {
      const classes = buildTodayClasses(batches);
      setEnrollmentData(buildEnrollmentTrend(students));
      setFeeData(buildFeeTrend(students, payments));
      setCoursePie(buildCoursePie(students, courses));
      setTodayClasses(classes);
      setStats(buildStatsFromStore(students, courses, batches, classes));
      return;
    }

    let cancelled = false;
    Promise.all([
      dashboardService.getStats(),
      dashboardService.getEnrollmentTrend(),
      dashboardService.getFeeTrend(),
      dashboardService.getCourseEnrollment(),
      dashboardService.getTodayClasses(),
    ])
      .then(([apiStats, enrollment, fees, pie, classes]) => {
        if (cancelled) return;
        setStats(apiStats);
        if (enrollment.length) setEnrollmentData(enrollment);
        if (fees.length) setFeeData(fees);
        if (pie.length) setCoursePie(pie);
        setTodayClasses(classes);
      })
      .catch(() => {
        if (cancelled) return;
        const classes = buildTodayClasses(batches);
        setEnrollmentData(buildEnrollmentTrend(students));
        setFeeData(buildFeeTrend(students, payments));
        setCoursePie(buildCoursePie(students, courses));
        setTodayClasses(classes);
        setStats(buildStatsFromStore(students, courses, batches, classes));
      });

    return () => {
      cancelled = true;
    };
  }, [students, courses, batches, payments]);

  const now = useCurrentDateTime();
  const instituteName = settings.name.split(" ")[0] || "your institute";
  const monthLabel = now.toLocaleString("en-IN", { month: "long" }) + " " + now.getFullYear();

  const handleLayoutChange = (next: PageLayout) => {
    setDashboardLayoutDraft(next);
    const savedJson = JSON.stringify(dashboardLayoutSaved);
    const nextJson = JSON.stringify(next);
    setLayoutDirty(savedJson !== nextJson);
  };

  if (!layoutLoaded || !dashboardLayoutDraft) {
    return null;
  }

  return (
    <div>
      <SectionHeader
        title={getTimeGreeting(now)}
        subtitle={`Welcome back! Here's what's happening at ${instituteName} today.`}
        action={
          <p className="text-xs text-muted-foreground text-right hidden sm:block">
            {formatCurrentDateTime(now)}
          </p>
        }
      />

      <DynamicDashboard
        layout={dashboardLayoutDraft}
        data={{
          stats,
          enrollmentData,
          feeData,
          coursePie,
          todayClasses,
          monthLabel,
        }}
        editMode={editMode}
        onLayoutChange={handleLayoutChange}
      />
    </div>
  );
}

export default DashboardPage;
