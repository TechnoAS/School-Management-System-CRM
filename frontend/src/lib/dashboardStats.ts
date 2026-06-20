import type { Student, Course, Batch, Payment } from "@/types";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PIE_COLORS = ["#1a3a5c", "#c87d1a", "#2d6a4f", "#7c3d8f", "#c0392b", "#2563eb", "#dc2626"];

export type ChartPoint = { month: string; students?: number; collected?: number; due?: number };
export type PieSlice = { name: string; value: number; color: string };
export type TodayClass = {
  batch: string;
  course: string;
  faculty: string;
  time: string;
  room: string;
  status: string;
};

function lastNMonths(n: number): { year: number; month: number; label: string }[] {
  const result: { year: number; month: number; label: string }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: MONTH_LABELS[d.getMonth()],
    });
  }
  return result;
}

/** Admissions per month for the last N months. */
export function buildEnrollmentTrend(students: Student[], months = 7): ChartPoint[] {
  return lastNMonths(months).map(({ year, month, label }) => ({
    month: label,
    students: students.filter(s => {
      const d = new Date(s.admissionDate);
      return d.getFullYear() === year && d.getMonth() === month;
    }).length,
  }));
}

/** Fee collected per month; due is outstanding balance snapshot for students admitted that month. */
export function buildFeeTrend(students: Student[], payments: Payment[], months = 7): ChartPoint[] {
  return lastNMonths(months).map(({ year, month, label }) => {
    const collected = payments
      .filter(p => {
        const d = new Date(p.date);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .reduce((sum, p) => sum + p.amount, 0);

    const due = students
      .filter(s => {
        const d = new Date(s.admissionDate);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .reduce((sum, s) => sum + Math.max(0, s.feesTotal - s.feesPaid), 0);

    return { month: label, collected, due };
  });
}

/** Live enrollment counts grouped by course name. */
export function buildCoursePie(students: Student[], courses: Course[]): PieSlice[] {
  const active = students.filter(s => s.status !== "Inactive");
  return courses
    .map((c, i) => ({
      name: c.name.length > 18 ? c.name.slice(0, 16) + "…" : c.name,
      value: active.filter(s => s.course === c.name).length,
      color: PIE_COLORS[i % PIE_COLORS.length],
    }))
    .filter(s => s.value > 0);
}

function inferClassStatus(timing: string): string {
  const match = timing.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return "Upcoming";
  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === "PM" && hour < 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;

  const start = new Date();
  start.setHours(hour, minute, 0, 0);
  const end = new Date(start);
  end.setHours(start.getHours() + 3);

  const now = new Date();
  if (now >= start && now <= end) return "Ongoing";
  if (now > end) return "Completed";
  return "Upcoming";
}

/** Today's schedule derived from ongoing batches. */
export function buildTodayClasses(batches: Batch[]): TodayClass[] {
  return batches
    .filter(b => b.status === "Ongoing")
    .map((b) => ({
      batch: b.name,
      course: b.course,
      faculty: b.faculty,
      time: b.timing,
      room: b.name,
      status: inferClassStatus(b.timing),
    }));
}
