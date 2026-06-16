import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Student,
  Course,
  Batch,
  FacultyMember,
  Notif,
  Exam,
  Payment,
  User,
  Certificate,
  AttendanceRecord,
  ExamMarkRecord,
  InstituteSettings,
  AttnStatus,
} from "@/types";
import {
  INIT_STUDENTS,
  INIT_COURSES,
  INIT_BATCHES,
  INIT_FACULTY,
  INIT_NOTIFS,
  INIT_EXAMS,
  INIT_PAYMENTS,
  INIT_CERTIFICATES,
  INIT_ATTENDANCE_RECORDS,
  INIT_EXAM_MARKS,
  INIT_INSTITUTE_SETTINGS,
} from "@/constants/data";
import { attendanceRecordId } from "./attendanceHelpers";

type ListUpdater<T> = T[] | ((prev: T[]) => T[]);

interface AppState {
  user: User | null;
  active: string;
  students: Student[];
  courses: Course[];
  batches: Batch[];
  faculty: FacultyMember[];
  exams: Exam[];
  payments: Payment[];
  notifs: Notif[];
  certificates: Certificate[];
  attendanceRecords: AttendanceRecord[];
  examMarks: ExamMarkRecord[];
  settings: InstituteSettings;

  setUser: (user: User | null) => void;
  setActive: (active: string) => void;

  setStudents: (students: ListUpdater<Student>) => void;
  addStudent: (student: Student) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;

  setCourses: (courses: ListUpdater<Course>) => void;
  addCourse: (course: Course) => void;
  updateCourse: (course: Course) => void;
  deleteCourse: (id: string) => void;

  setBatches: (batches: ListUpdater<Batch>) => void;
  addBatch: (batch: Batch) => void;
  updateBatch: (batch: Batch) => void;
  deleteBatch: (id: string) => void;

  setFaculty: (faculty: ListUpdater<FacultyMember>) => void;
  addFaculty: (facultyMember: FacultyMember) => void;
  updateFaculty: (facultyMember: FacultyMember) => void;
  deleteFaculty: (id: string) => void;

  setExams: (exams: ListUpdater<Exam>) => void;
  addExam: (exam: Exam) => void;
  updateExam: (exam: Exam) => void;
  deleteExam: (id: string) => void;

  setPayments: (payments: ListUpdater<Payment>) => void;
  addPayment: (payment: Payment) => void;
  updatePayment: (payment: Payment) => void;
  deletePayment: (receipt: string) => void;

  setNotifs: (notifs: ListUpdater<Notif>) => void;
  addNotif: (notif: Notif) => void;
  updateNotif: (notif: Notif) => void;
  deleteNotif: (id: number) => void;

  setCertificates: (certificates: ListUpdater<Certificate>) => void;
  addCertificate: (certificate: Certificate) => void;

  setAttendanceRecords: (records: ListUpdater<AttendanceRecord>) => void;
  saveAttendanceSession: (
    batchId: string,
    batchName: string,
    date: string,
    marks: { studentId: string; status: AttnStatus }[]
  ) => void;

  setExamMarks: (marks: ListUpdater<ExamMarkRecord>) => void;
  updateExamMark: (studentId: string, patch: Partial<ExamMarkRecord>) => void;

  setSettings: (settings: InstituteSettings) => void;
  updateSettings: (patch: Partial<InstituteSettings>) => void;
}

const STORE_VERSION = 2;

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      active: "dashboard",
      students: INIT_STUDENTS,
      courses: INIT_COURSES,
      batches: INIT_BATCHES,
      faculty: INIT_FACULTY,
      exams: INIT_EXAMS,
      payments: INIT_PAYMENTS,
      notifs: INIT_NOTIFS,
      certificates: INIT_CERTIFICATES,
      attendanceRecords: INIT_ATTENDANCE_RECORDS,
      examMarks: INIT_EXAM_MARKS,
      settings: INIT_INSTITUTE_SETTINGS,

      setUser: (user) => set({ user }),
      setActive: (active) => set({ active }),

      setStudents: (students) =>
        set((state) => ({
          students:
            typeof students === "function"
              ? students(state.students)
              : students,
        })),
      addStudent: (student) =>
        set((state) => ({ students: [student, ...state.students] })),
      updateStudent: (student) =>
        set((state) => ({
          students: state.students.map((s) =>
            s.id === student.id ? student : s
          ),
        })),
      deleteStudent: (id) =>
        set((state) => ({
          students: state.students.filter((s) => s.id !== id),
        })),

      setCourses: (courses) =>
        set((state) => ({
          courses:
            typeof courses === "function" ? courses(state.courses) : courses,
        })),
      addCourse: (course) =>
        set((state) => ({ courses: [course, ...state.courses] })),
      updateCourse: (course) =>
        set((state) => ({
          courses: state.courses.map((c) => (c.id === course.id ? course : c)),
        })),
      deleteCourse: (id) =>
        set((state) => ({
          courses: state.courses.filter((c) => c.id !== id),
        })),

      setBatches: (batches) =>
        set((state) => ({
          batches:
            typeof batches === "function" ? batches(state.batches) : batches,
        })),
      addBatch: (batch) =>
        set((state) => ({ batches: [batch, ...state.batches] })),
      updateBatch: (batch) =>
        set((state) => ({
          batches: state.batches.map((b) => (b.id === batch.id ? batch : b)),
        })),
      deleteBatch: (id) =>
        set((state) => ({
          batches: state.batches.filter((b) => b.id !== id),
        })),

      setFaculty: (faculty) =>
        set((state) => ({
          faculty:
            typeof faculty === "function" ? faculty(state.faculty) : faculty,
        })),
      addFaculty: (facultyMember) =>
        set((state) => ({ faculty: [facultyMember, ...state.faculty] })),
      updateFaculty: (facultyMember) =>
        set((state) => ({
          faculty: state.faculty.map((f) =>
            f.id === facultyMember.id ? facultyMember : f
          ),
        })),
      deleteFaculty: (id) =>
        set((state) => ({
          faculty: state.faculty.filter((f) => f.id !== id),
        })),

      setExams: (exams) =>
        set((state) => ({
          exams: typeof exams === "function" ? exams(state.exams) : exams,
        })),
      addExam: (exam) => set((state) => ({ exams: [exam, ...state.exams] })),
      updateExam: (exam) =>
        set((state) => ({
          exams: state.exams.map((e) => (e.id === exam.id ? exam : e)),
        })),
      deleteExam: (id) =>
        set((state) => ({
          exams: state.exams.filter((e) => e.id !== id),
        })),

      setPayments: (payments) =>
        set((state) => ({
          payments:
            typeof payments === "function"
              ? payments(state.payments)
              : payments,
        })),
      addPayment: (payment) =>
        set((state) => ({ payments: [payment, ...state.payments] })),
      updatePayment: (payment) =>
        set((state) => ({
          payments: state.payments.map((p) =>
            p.receipt === payment.receipt ? payment : p
          ),
        })),
      deletePayment: (receipt) =>
        set((state) => ({
          payments: state.payments.filter((p) => p.receipt !== receipt),
        })),

      setNotifs: (notifs) =>
        set((state) => ({
          notifs: typeof notifs === "function" ? notifs(state.notifs) : notifs,
        })),
      addNotif: (notif) =>
        set((state) => ({ notifs: [notif, ...state.notifs] })),
      updateNotif: (notif) =>
        set((state) => ({
          notifs: state.notifs.map((n) => (n.id === notif.id ? notif : n)),
        })),
      deleteNotif: (id) =>
        set((state) => ({
          notifs: state.notifs.filter((n) => n.id !== id),
        })),

      setCertificates: (certificates) =>
        set((state) => ({
          certificates:
            typeof certificates === "function"
              ? certificates(state.certificates)
              : certificates,
        })),
      addCertificate: (certificate) =>
        set((state) => ({
          certificates: [certificate, ...state.certificates],
        })),

      setAttendanceRecords: (records) =>
        set((state) => ({
          attendanceRecords:
            typeof records === "function"
              ? records(state.attendanceRecords)
              : records,
        })),

      saveAttendanceSession: (batchId, batchName, date, marks) =>
        set((state) => {
          const studentIds = new Set(marks.map((m) => m.studentId));
          const kept = state.attendanceRecords.filter(
            (r) =>
              !(
                r.batchId === batchId &&
                r.date === date &&
                studentIds.has(r.studentId)
              )
          );
          const next = marks.map((m) => ({
            id: attendanceRecordId(m.studentId, batchId, date),
            studentId: m.studentId,
            batchId,
            batchName,
            date,
            status: m.status,
          }));
          return { attendanceRecords: [...next, ...kept] };
        }),

      setExamMarks: (marks) =>
        set((state) => ({
          examMarks:
            typeof marks === "function" ? marks(state.examMarks) : marks,
        })),
      updateExamMark: (studentId, patch) =>
        set((state) => ({
          examMarks: state.examMarks.map((m) =>
            m.studentId === studentId ? { ...m, ...patch } : m
          ),
        })),

      setSettings: (settings) => set({ settings }),
      updateSettings: (patch) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...patch,
            receipt: patch.receipt
              ? { ...state.settings.receipt, ...patch.receipt }
              : state.settings.receipt,
            certificate: patch.certificate
              ? { ...state.settings.certificate, ...patch.certificate }
              : state.settings.certificate,
          },
        })),
    }),
    {
      name: "school-management-crm-store",
      version: STORE_VERSION,
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<AppState>;
        if (version < STORE_VERSION) {
          return {
            ...state,
            certificates: state.certificates ?? INIT_CERTIFICATES,
            attendanceRecords:
              state.attendanceRecords ?? INIT_ATTENDANCE_RECORDS,
            examMarks: state.examMarks ?? INIT_EXAM_MARKS,
            settings: state.settings ?? INIT_INSTITUTE_SETTINGS,
          };
        }
        return state as AppState;
      },
    }
  )
);
