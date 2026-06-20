import {
  coursesService,
  batchesService,
  studentsService,
  facultyService,
  feesService,
  examsService,
  certificatesService,
  notificationsService,
  settingsService,
  attendanceService,
} from "./services";
import { ApiError } from "./client";
import type { Batch, Course, ExamMarkRecord } from "@/types";
import type { MonthlyAttendanceRow } from "@/store/attendanceHelpers";

export interface SyncedAppData {
  courses: Awaited<ReturnType<typeof coursesService.list>>;
  batches: Awaited<ReturnType<typeof batchesService.list>>;
  students: Awaited<ReturnType<typeof studentsService.list>>;
  faculty: Awaited<ReturnType<typeof facultyService.list>>;
  payments: Awaited<ReturnType<typeof feesService.listPayments>>;
  exams: Awaited<ReturnType<typeof examsService.list>>;
  certificates: Awaited<ReturnType<typeof certificatesService.list>>;
  notifs: Awaited<ReturnType<typeof notificationsService.list>>;
  settings: Awaited<ReturnType<typeof settingsService.getInstitute>>;
  attendanceRecords: Awaited<ReturnType<typeof loadAttendanceRecords>>;
  examMarks: Awaited<ReturnType<typeof loadExamMarks>>;
}

type SyncRole = "admin" | "staff" | "faculty" | "super_admin";

const EMPTY_SETTINGS: SyncedAppData["settings"] = {
  name: "",
  phone: "",
  email: "",
  address: "",
  registrationNo: "",
  academicYear: "",
  logoUrl: "",
  receipt: {
    prefix: "",
    startingNumber: "",
    footerText: "",
    showLogo: "Yes",
    printFormat: "A4",
  },
  certificate: {
    prefix: "",
    authorisedBy: "",
    bodyText: "",
  },
};

async function optionalByRole<T>(
  allow: readonly SyncRole[],
  role: SyncRole,
  request: () => Promise<T>,
  fallback: T
): Promise<T> {
  if (!allow.includes(role)) return fallback;
  try {
    return await request();
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      return fallback;
    }
    throw error;
  }
}

async function loadAttendanceRecords() {
  return attendanceService.listRecords(12).catch(() => []);
}

async function loadExamMarks(exams: Awaited<ReturnType<typeof examsService.list>>) {
  if (!exams.length) return [];
  const marksByExam = await Promise.all(
    exams.map(e =>
      examsService.getMarks(e.id, e.max, { savedOnly: true }).catch(() => [] as ExamMarkRecord[])
    )
  );
  return marksByExam.flat();
}

export type AttendanceReportData = {
  summary: { present: number; absent: number; leave: number };
  students: MonthlyAttendanceRow[];
};

export async function fetchAttendanceReport(
  batchId: string,
  month: string
): Promise<AttendanceReportData> {
  const data = await attendanceService.getReport(batchId, month);
  const students = data.students.map(row => {
    const total = row.present + row.absent + row.leave;
    const pct = total > 0 ? Math.round((row.present / total) * 100) : 0;
    return {
      studentId: row.studentId,
      studentName: row.studentName,
      total,
      present: row.present,
      absent: row.absent,
      leave: row.leave,
      pct,
    };
  });
  return { summary: data.summary, students };
}

function enrichCoursesWithStats(
  courses: Course[],
  batches: Batch[],
  students: SyncedAppData["students"]
) {
  return courses.map(c => ({
    ...c,
    batches: batches.filter(b => b.course === c.name || b.course === c.id).length,
    enrolled: students.filter(s => s.course === c.name || s.course === c.id).length,
  }));
}

function enrichBatchesWithCounts(batches: Batch[], students: SyncedAppData["students"]) {
  return batches.map(b => ({
    ...b,
    students: students.filter(s => s.batch === b.name || s.batch === b.id).length,
  }));
}

export async function syncAppData(role: SyncRole): Promise<SyncedAppData> {
  const [courses, batches, students, faculty, payments, exams, certificates, notifs, settings] =
    await Promise.all([
      optionalByRole(["admin", "staff", "super_admin"], role, () => coursesService.list(), []),
      optionalByRole(["admin", "staff", "super_admin"], role, () => batchesService.list(), []),
      optionalByRole(["admin", "staff", "super_admin"], role, () => studentsService.list(), []),
      optionalByRole(["admin", "super_admin"], role, () => facultyService.list(), []),
      optionalByRole(["admin", "staff", "super_admin"], role, () => feesService.listPayments(), []),
      optionalByRole(["admin", "faculty", "super_admin"], role, () => examsService.list(), []),
      optionalByRole(["admin", "super_admin"], role, () => certificatesService.list(), []),
      notificationsService.list(),
      optionalByRole(["admin", "staff", "faculty", "super_admin"], role, () => settingsService.getInstitute(), EMPTY_SETTINGS),
    ]);

  const enrichedBatches = enrichBatchesWithCounts(batches, students);
  const enrichedCourses = enrichCoursesWithStats(courses, enrichedBatches, students);
  const [attendanceRecords, examMarks] = await Promise.all([
    loadAttendanceRecords(),
    loadExamMarks(exams),
  ]);

  return {
    courses: enrichedCourses,
    batches: enrichedBatches,
    students,
    faculty,
    payments,
    exams,
    certificates,
    notifs,
    settings,
    attendanceRecords,
    examMarks,
  };
}
