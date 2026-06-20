import type { PageLayouts } from "./pageLayout";

export type Student = {
  id: string;
  name: string;
  phone: string;
  email: string;
  course: string;
  batch: string;
  courseId?: string;
  batchId?: string;
  guardian: string;
  guardianPhone: string;
  address: string;
  admissionDate: string;
  feesTotal: number;
  feesPaid: number;
  status: string;
  dob: string;
  grade: string;
  photo?: string;
};

export type Role = "admin" | "staff" | "faculty" | "super_admin";

export type User = {
  name: string;
  email: string;
  role: Role;
  phone?: string;
  photo?: string;
};

export type Course = {
  id: string;
  name: string;
  duration: string;
  fees: number;
  description: string;
  status: string;
  batches: number;
  enrolled: number;
};

export type Batch = {
  id: string;
  course: string;
  name: string;
  timing: string;
  faculty: string;
  students: number;
  status: string;
  startDate: string;
  endDate: string;
};

export type AttnStatus = "present" | "absent" | "leave";

/** Daily attendance row — maps to `attendance_records` in SQL */
export type AttendanceRecord = {
  id: string;
  studentId: string;
  batchId: string;
  batchName: string;
  date: string;
  status: AttnStatus;
};

export type FacultyMember = {
  id: string;
  name: string;
  subject: string;
  phone: string;
  email: string;
  salary: number;
  attendance: number;
  experience: string;
  qualification: string;
  photo?: string;
  todayStatus?: AttnStatus;
  todayDate?: string;
};

export type Notif = {
  id: number;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
};

export type Exam = {
  id: string;
  title: string;
  course: string;
  batch: string;
  date: string;
  max: number;
  status: string;
};

/** Per-exam score for one student — maps to `exam_marks` in SQL */
export type ExamMarkRecord = {
  examId: string;
  studentId: string;
  studentName: string;
  marks: number;
  grade: string;
};

/** Payment row — maps to `payments` in SQL */
export type Payment = {
  receipt: string;
  student: string;
  studentId: string;
  amount: number;
  mode: string;
  date: string;
  remarks?: string;
};

/** Queued fee reminder — delivery handled by backend in Part C */
export type FeeReminder = {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  queuedAt: string;
  status: "pending" | "sent";
};

/** Issued certificate — maps to `certificates` in SQL */
export type Certificate = {
  certNo: string;
  studentId: string;
  studentName: string;
  course: string;
  issueDate: string;
  grade: string;
  authorisedBy: string;
};

export type ReceiptSettings = {
  prefix: string;
  startingNumber: string;
  footerText: string;
  showLogo: string;
  printFormat: string;
};

export type CertificateSettings = {
  prefix: string;
  authorisedBy: string;
  bodyText: string;
};

/** Institute profile — maps to `institute_settings` in SQL */
export type InstituteSettings = {
  name: string;
  phone: string;
  email: string;
  address: string;
  registrationNo: string;
  academicYear: string;
  logoUrl: string;
  receipt: ReceiptSettings;
  certificate: CertificateSettings;
  pageLayouts?: PageLayouts;
};
