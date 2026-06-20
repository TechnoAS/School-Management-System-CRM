import type { Student, Course, Batch } from "@/types";

/** Recompute `course.enrolled` and `batch.students` from the student roster. */
export function reconcileEnrollmentCounts(
  students: Student[],
  courses: Course[],
  batches: Batch[]
): { courses: Course[]; batches: Batch[] } {
  const active = students.filter(s => s.status !== "Inactive");
  return {
    courses: courses.map(c => ({
      ...c,
      enrolled: active.filter(s => s.course === c.name || s.course === c.id).length,
    })),
    batches: batches.map(b => ({
      ...b,
      students: students.filter(s => s.batch === b.name || s.batch === b.id).length,
    })),
  };
}
