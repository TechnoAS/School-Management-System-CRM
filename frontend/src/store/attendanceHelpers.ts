import type { AttnStatus, AttendanceRecord, Student } from "@/types";

/** Stable id for attendance_records unique key (student + batch + date) */
export function attendanceRecordId(
  studentId: string,
  batchId: string,
  date: string
): string {
  return `${studentId}-${batchId}-${date}`;
}

export function isPresent(status: AttnStatus): boolean {
  return status === "present";
}

export type MonthlyAttendanceRow = {
  studentId: string;
  studentName: string;
  total: number;
  present: number;
  absent: number;
  leave: number;
  pct: number;
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Build month/year options from saved records (last 12 months minimum). */
export function getAttendanceMonthOptions(
  records: AttendanceRecord[]
): { key: string; year: number; month: number; label: string }[] {
  const keys = new Set<string>();
  for (const r of records) {
    const d = new Date(r.date);
    if (Number.isNaN(d.getTime())) continue;
    keys.add(`${d.getFullYear()}-${d.getMonth()}`);
  }

  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.add(`${d.getFullYear()}-${d.getMonth()}`);
  }

  return [...keys]
    .map(key => {
      const [year, month] = key.split("-").map(Number);
      return {
        key,
        year,
        month,
        label: `${MONTH_NAMES[month]} ${year}`,
      };
    })
    .sort((a, b) => b.year - a.year || b.month - a.month);
}

/** Aggregate saved attendance into a monthly per-student summary. */
export function buildMonthlyAttendanceReport(
  records: AttendanceRecord[],
  students: Student[],
  year: number,
  month: number,
  batchFilter: string
): MonthlyAttendanceRow[] {
  const inMonth = records.filter(r => {
    const d = new Date(r.date);
    if (d.getFullYear() !== year || d.getMonth() !== month) return false;
    if (batchFilter !== "all" && r.batchId !== batchFilter) return false;
    return true;
  });

  const byStudent = new Map<string, { present: number; absent: number; leave: number }>();
  for (const r of inMonth) {
    const cur = byStudent.get(r.studentId) ?? { present: 0, absent: 0, leave: 0 };
    if (r.status === "present") cur.present++;
    else if (r.status === "leave") cur.leave++;
    else cur.absent++;
    byStudent.set(r.studentId, cur);
  }

  const studentIds =
    batchFilter === "all"
      ? [...byStudent.keys()]
      : students.filter(s => {
          const batch = records.find(r => r.batchId === batchFilter);
          return batch ? s.batch === batch.batchName : false;
        }).map(s => s.id);

  const uniqueIds = [...new Set([...studentIds, ...byStudent.keys()])];

  return uniqueIds
    .map(studentId => {
      const counts = byStudent.get(studentId) ?? { present: 0, absent: 0, leave: 0 };
      const total = counts.present + counts.absent + counts.leave;
      const pct = total > 0 ? Math.round((counts.present / total) * 100) : 0;
      const student = students.find(s => s.id === studentId);
      return {
        studentId,
        studentName: student?.name ?? studentId,
        total,
        present: counts.present,
        absent: counts.absent,
        leave: counts.leave,
        pct,
      };
    })
    .filter(r => r.total > 0)
    .sort((a, b) => a.studentName.localeCompare(b.studentName));
}

/** Cycle present → absent → leave → present. */
export function nextAttendanceStatus(current: AttnStatus): AttnStatus {
  if (current === "present") return "absent";
  if (current === "absent") return "leave";
  return "present";
}

export const ATTENDANCE_STATUS_STYLES: Record<
  AttnStatus,
  { label: string; className: string }
> = {
  present: {
    label: "Present",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  },
  absent: {
    label: "Absent",
    className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
  },
  leave: {
    label: "Leave",
    className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
  },
};
