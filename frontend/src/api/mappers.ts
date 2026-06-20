import { calcGrade } from "@/lib/grades";
import type {
  Student,
  Course,
  Batch,
  FacultyMember,
  Notif,
  Exam,
  Payment,
  Certificate,
  AttendanceRecord,
  ExamMarkRecord,
  InstituteSettings,
  User,
} from "@/types";

type Row = Record<string, unknown>;

function str(v: unknown, fallback = ""): string {
  if (v == null) return fallback;
  return String(v);
}

function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function dateStr(v: unknown): string {
  if (!v) return "";
  const s = String(v);
  return s.includes("T") ? s.slice(0, 10) : s;
}

function timeAgo(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function mapUser(row: Row): User {
  return {
    name: str(row.name),
    email: str(row.email),
    role: str(row.role, "staff") as User["role"],
    phone: row.phone ? str(row.phone) : undefined,
    photo: row.photoUrl || row.photo_url ? str(row.photoUrl ?? row.photo_url) : undefined,
  };
}

export function mapStudent(row: Row): Student {
  return {
    id: str(row.id),
    name: str(row.name),
    phone: str(row.phone),
    email: str(row.email),
    course: str(row.course_name ?? row.courseName ?? row.course),
    batch: str(row.batch_name ?? row.batchName ?? row.batch),
    courseId: row.course_id || row.courseId ? str(row.course_id ?? row.courseId) : undefined,
    batchId: row.batch_id || row.batchId ? str(row.batch_id ?? row.batchId) : undefined,
    guardian: str(row.guardian),
    guardianPhone: str(row.guardian_phone ?? row.guardianPhone),
    address: str(row.address),
    admissionDate: dateStr(row.admission_date ?? row.admissionDate),
    feesTotal: num(row.fees_total ?? row.feesTotal),
    feesPaid: num(row.fees_paid ?? row.feesPaid),
    status: str(row.status, "Active"),
    dob: dateStr(row.dob),
    grade: str(row.grade, "-"),
    photo: row.photo_url || row.photoUrl ? str(row.photo_url ?? row.photoUrl) : undefined,
  };
}

export function mapCourse(row: Row, stats?: { batches?: number; enrolled?: number }): Course {
  return {
    id: str(row.id),
    name: str(row.name),
    duration: str(row.duration),
    fees: num(row.fees),
    description: str(row.description),
    status: str(row.status, "Active"),
    batches: stats?.batches ?? num(row.batches),
    enrolled: stats?.enrolled ?? num(row.enrolled),
  };
}

export function mapBatch(row: Row, studentCount = 0): Batch {
  return {
    id: str(row.id),
    course: str(row.course_name ?? row.courseName ?? row.course),
    name: str(row.name),
    timing: str(row.timing),
    faculty: str(row.faculty_name ?? row.facultyName ?? row.faculty),
    students: studentCount || num(row.students ?? row.student_count),
    status: str(row.status, "Ongoing"),
    startDate: dateStr(row.start_date ?? row.startDate),
    endDate: dateStr(row.end_date ?? row.endDate),
  };
}

export function mapFaculty(row: Row): FacultyMember {
  return {
    id: str(row.id),
    name: str(row.name),
    subject: str(row.subject),
    phone: str(row.phone),
    email: str(row.email),
    salary: num(row.salary),
    attendance: num(row.attendance_pct ?? row.attendance, 100),
    experience: str(row.experience),
    qualification: str(row.qualification),
    photo: row.photo_url || row.photoUrl ? str(row.photo_url ?? row.photoUrl) : undefined,
  };
}

export function mapNotif(row: Row): Notif {
  return {
    id: num(row.id),
    type: str(row.type, "info"),
    title: str(row.title),
    message: str(row.message),
    time: timeAgo(str(row.createdAt ?? row.created_at ?? new Date().toISOString())),
    read: Boolean(row.isRead ?? row.is_read),
  };
}

export function mapExam(row: Row): Exam {
  return {
    id: str(row.id),
    title: str(row.title),
    course: str(row.courseName ?? row.course_name ?? row.course),
    batch: str(row.batchName ?? row.batch_name ?? row.batch),
    date: dateStr(row.examDate ?? row.exam_date ?? row.date),
    max: num(row.maxMarks ?? row.max_marks ?? row.max, 100),
    status: str(row.status, "Scheduled"),
  };
}

export function mapPayment(row: Row): Payment {
  return {
    receipt: str(row.receipt),
    student: str(row.studentName ?? row.student),
    studentId: str(row.studentId ?? row.student_id),
    amount: num(row.amount),
    mode: str(row.mode),
    date: dateStr(row.payDate ?? row.pay_date ?? row.date),
    remarks: row.remarks ? str(row.remarks) : undefined,
  };
}

export function mapCertificate(row: Row): Certificate {
  return {
    certNo: str(row.certNo ?? row.cert_no),
    studentId: str(row.studentId ?? row.student_id),
    studentName: str(row.studentName ?? row.student_name),
    course: str(row.courseName ?? row.course_name ?? row.course),
    issueDate: dateStr(row.issueDate ?? row.issue_date),
    grade: str(row.grade),
    authorisedBy: str(row.authorisedBy ?? row.authorised_by),
  };
}

export function mapAttendanceRecord(
  row: Row,
  batchId = "",
  batchName = "",
  date = ""
): AttendanceRecord {
  const resolvedBatchId = batchId || str(row.batchId ?? row.batch_id);
  const resolvedDate = date || dateStr(row.recordDate ?? row.record_date ?? row.date);
  const studentId = str(row.studentId ?? row.student_id);
  return {
    id: `${studentId}_${resolvedBatchId}_${resolvedDate}`,
    studentId,
    batchId: resolvedBatchId,
    batchName: batchName || str(row.batchName ?? row.batch_name),
    date: resolvedDate,
    status: (str(row.status, "present") as AttendanceRecord["status"]) || "present",
  };
}

export function mapExamMark(row: Row, examId = "", maxMarks = 100): ExamMarkRecord {
  const marks = num(row.marks ?? row.m1);
  const pct = maxMarks > 0 ? (marks / maxMarks) * 100 : 0;
  return {
    examId: examId || str(row.examId ?? row.exam_id),
    studentId: str(row.studentId ?? row.student_id),
    studentName: str(row.studentName ?? row.student_name),
    marks,
    grade: str(row.grade) || calcGrade(pct),
  };
}

export function mapInstituteSettings(
  row: Row,
  receipt?: Row,
  certificate?: Row
): InstituteSettings {
  const receiptConfig =
    receipt ??
    (typeof row.receipt_config === "string"
      ? JSON.parse(row.receipt_config)
      : (row.receipt_config as Row)) ??
    {};
  const certConfig =
    certificate ??
    (typeof row.certificate_config === "string"
      ? JSON.parse(row.certificate_config)
      : (row.certificate_config as Row)) ??
    {};

  return {
    name: str(row.name, "Institute"),
    phone: str(row.phone),
    email: str(row.email),
    address: str(row.address),
    registrationNo: str(row.registration_no ?? row.registrationNo),
    academicYear: str(row.academic_year ?? row.academicYear, "2024-25"),
    logoUrl: str(row.logo_url ?? row.logoUrl),
    receipt: {
      prefix: str(receiptConfig.prefix, "RCP"),
      startingNumber: str(receiptConfig.startingNumber ?? receiptConfig.starting_number, "1000"),
      footerText: str(receiptConfig.footerText ?? receiptConfig.footer_text, ""),
      showLogo: str(receiptConfig.showLogo ?? receiptConfig.show_logo, "yes"),
      printFormat: str(receiptConfig.printFormat ?? receiptConfig.print_format, "A4"),
    },
    certificate: {
      prefix: str(certConfig.prefix, "CERT"),
      authorisedBy: str(certConfig.authorisedBy ?? certConfig.authorised_by, ""),
      bodyText: str(certConfig.bodyText ?? certConfig.body_text, ""),
    },
  };
}

/** Convert frontend student form data to API create/update payload */
export function studentToApi(
  data: Omit<Student, "id">,
  courses: Course[],
  batches: Batch[],
  id?: string
) {
  const course = courses.find(c => c.name === data.course || c.id === data.course);
  const batch = batches.find(b => b.name === data.batch || b.id === data.batch);
  return {
    ...(id ? { id } : {}),
    name: data.name,
    phone: data.phone || null,
    email: data.email || null,
    courseId: course?.id ?? data.course,
    batchId: batch?.id ?? data.batch,
    guardian: data.guardian || null,
    guardianPhone: data.guardianPhone || null,
    address: data.address || null,
    admissionDate: data.admissionDate,
    feesTotal: data.feesTotal,
    feesPaid: data.feesPaid,
    status: data.status,
    dob: data.dob || null,
    grade: data.grade || null,
    photoUrl: data.photo?.startsWith("http") || data.photo?.startsWith("/")
      ? data.photo
      : null,
  };
}

export function courseToApi(data: Omit<Course, "id" | "batches" | "enrolled">, id?: string) {
  return {
    ...(id ? { id } : {}),
    name: data.name,
    duration: data.duration,
    fees: data.fees,
    description: data.description,
    status: data.status,
  };
}

export function batchToApi(
  data: Omit<Batch, "id" | "students">,
  courses: Course[],
  faculty: FacultyMember[],
  id?: string
) {
  const course = courses.find(c => c.name === data.course || c.id === data.course);
  const fac = faculty.find(f => f.name === data.faculty || f.id === data.faculty);
  return {
    ...(id ? { id } : {}),
    courseId: course?.id ?? data.course,
    name: data.name,
    timing: data.timing,
    facultyId: fac?.id ?? null,
    status: data.status,
    startDate: data.startDate,
    endDate: data.endDate,
  };
}
