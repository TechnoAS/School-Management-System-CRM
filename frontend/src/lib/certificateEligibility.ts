import type { Student, Certificate, AttendanceRecord, ExamMarkRecord } from "@/types";



export type EligibilityResult = { eligible: boolean; reasons: string[] };



const MIN_ATTENDANCE_PCT = 75;

const MIN_PASSING_GRADE = ["A+", "A", "B+", "B", "C"];



function studentAttendancePct(studentId: string, records: AttendanceRecord[]): number | null {

  const mine = records.filter(r => r.studentId === studentId);

  if (mine.length === 0) return null;

  const present = mine.filter(r => r.status === "present").length;

  return Math.round((present / mine.length) * 100);

}



/** Check whether a student can receive a course completion certificate. */

export function checkCertificateEligibility(

  student: Student,

  certificates: Certificate[],

  attendanceRecords: AttendanceRecord[],

  examMarks: ExamMarkRecord[]

): EligibilityResult {

  const reasons: string[] = [];



  const alreadyIssued = certificates.some(

    c => c.studentId === student.id && c.course === student.course

  );

  if (alreadyIssued) reasons.push("Certificate already issued for this course");



  if (student.feesPaid < student.feesTotal) {

    reasons.push(`Outstanding fees: ₹${student.feesTotal - student.feesPaid}`);

  }



  if (student.status === "Inactive") {

    reasons.push("Student account is inactive");

  }



  const attnPct = studentAttendancePct(student.id, attendanceRecords);

  if (attnPct !== null && attnPct < MIN_ATTENDANCE_PCT) {

    reasons.push(`Attendance ${attnPct}% is below required ${MIN_ATTENDANCE_PCT}%`);

  }



  const marks = examMarks.filter(m => m.studentId === student.id);

  if (marks.length > 0) {

    const failing = marks.filter(m => !MIN_PASSING_GRADE.includes(m.grade));

    if (failing.length > 0) {

      reasons.push(

        `${failing.length} exam(s) below passing grade (lowest: ${failing[0]?.grade ?? "F"})`

      );

    }

  } else if (student.status !== "Completed") {

    reasons.push("No exam marks on record and course not marked completed");

  }



  return { eligible: reasons.length === 0, reasons };

}

