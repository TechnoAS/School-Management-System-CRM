import type { AttnStatus } from "@/types";

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
