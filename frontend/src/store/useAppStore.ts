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
  FeeReminder,
} from "@/types";
import type { PageLayout } from "@/types/pageLayout";
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
import { reconcileEnrollmentCounts } from "./enrollmentSync";
import { API_ENABLED } from "@/api/config";

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
  feeReminders: FeeReminder[];

  editMode: boolean;
  dashboardLayoutDraft: PageLayout | null;
  dashboardLayoutSaved: PageLayout | null;
  layoutDirty: boolean;

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

  setEditMode: (on: boolean) => void;
  toggleEditMode: () => void;
  setDashboardLayoutDraft: (layout: PageLayout | null) => void;
  setDashboardLayoutSaved: (layout: PageLayout | null) => void;
  setLayoutDirty: (dirty: boolean) => void;
  resetLayoutEditor: () => void;

  queueFeeReminders: (reminders: FeeReminder[]) => void;
  markRemindersSent: (ids: string[]) => void;
}

const STORE_VERSION = 4;

function withReconciledCounts(
  students: Student[],
  courses: Course[],
  batches: Batch[]
): Pick<AppState, "students" | "courses" | "batches"> {
  const { courses: nextCourses, batches: nextBatches } = reconcileEnrollmentCounts(
    students,
    courses,
    batches
  );
  return { students, courses: nextCourses, batches: nextBatches };
}

const API_EMPTY_SETTINGS: InstituteSettings = {
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

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      active: "dashboard",
      students: API_ENABLED ? [] : INIT_STUDENTS,
      courses: API_ENABLED ? [] : INIT_COURSES,
      batches: API_ENABLED ? [] : INIT_BATCHES,
      faculty: API_ENABLED ? [] : INIT_FACULTY,
      exams: API_ENABLED ? [] : INIT_EXAMS,
      payments: API_ENABLED ? [] : INIT_PAYMENTS,
      notifs: API_ENABLED ? [] : INIT_NOTIFS,
      certificates: API_ENABLED ? [] : INIT_CERTIFICATES,
      attendanceRecords: API_ENABLED ? [] : INIT_ATTENDANCE_RECORDS,
      examMarks: API_ENABLED ? [] : INIT_EXAM_MARKS,
      settings: API_ENABLED ? API_EMPTY_SETTINGS : INIT_INSTITUTE_SETTINGS,
      feeReminders: [],
      editMode: false,
      dashboardLayoutDraft: null,
      dashboardLayoutSaved: null,
      layoutDirty: false,

      setUser: (user) =>
        set(
          user
            ? { user }
            : {
                user: null,
                editMode: false,
                dashboardLayoutDraft: null,
                dashboardLayoutSaved: null,
                layoutDirty: false,
              }
        ),
      setActive: (active) => set({ active }),

      setStudents: (students) =>
        set((state) => {
          const nextStudents =
            typeof students === "function" ? students(state.students) : students;
          return withReconciledCounts(nextStudents, state.courses, state.batches);
        }),
      addStudent: (student) =>
        set((state) =>
          withReconciledCounts([student, ...state.students], state.courses, state.batches)
        ),
      updateStudent: (student) =>
        set((state) =>
          withReconciledCounts(
            state.students.map((s) => (s.id === student.id ? student : s)),
            state.courses,
            state.batches
          )
        ),
      deleteStudent: (id) =>
        set((state) =>
          withReconciledCounts(
            state.students.filter((s) => s.id !== id),
            state.courses,
            state.batches
          )
        ),

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
            m.studentId === studentId && (!patch.examId || m.examId === patch.examId)
              ? { ...m, ...patch }
              : m
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
            pageLayouts: patch.pageLayouts
              ? { ...state.settings.pageLayouts, ...patch.pageLayouts }
              : state.settings.pageLayouts,
          },
        })),

      setEditMode: (on) => set({ editMode: on }),
      toggleEditMode: () => set((state) => ({ editMode: !state.editMode })),
      setDashboardLayoutDraft: (dashboardLayoutDraft) => set({ dashboardLayoutDraft }),
      setDashboardLayoutSaved: (dashboardLayoutSaved) => set({ dashboardLayoutSaved }),
      setLayoutDirty: (layoutDirty) => set({ layoutDirty }),
      resetLayoutEditor: () =>
        set({
          editMode: false,
          dashboardLayoutDraft: null,
          dashboardLayoutSaved: null,
          layoutDirty: false,
        }),

      queueFeeReminders: (reminders) =>
        set((state) => ({
          feeReminders: [...reminders, ...state.feeReminders],
        })),
      markRemindersSent: (ids) =>
        set((state) => ({
          feeReminders: state.feeReminders.map(r =>
            ids.includes(r.id) ? { ...r, status: "sent" as const } : r
          ),
        })),
    }),
    {
      name: "school-management-crm-store",
      version: STORE_VERSION,
      partialize: (state) =>
        API_ENABLED
          ? { user: state.user, active: state.active }
          : {
              user: state.user,
              active: state.active,
              students: state.students,
              courses: state.courses,
              batches: state.batches,
              faculty: state.faculty,
              exams: state.exams,
              payments: state.payments,
              notifs: state.notifs,
              certificates: state.certificates,
              attendanceRecords: state.attendanceRecords,
              examMarks: state.examMarks,
              settings: state.settings,
              feeReminders: state.feeReminders,
            },
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<AppState>;
        if (API_ENABLED && version < STORE_VERSION) {
          return {
            user: state.user ?? null,
            active: state.active ?? "dashboard",
          } as AppState;
        }
        if (version < STORE_VERSION) {
          return {
            ...state,
            user: state.user ?? null,
            active: state.active ?? "dashboard",
            certificates: state.certificates ?? INIT_CERTIFICATES,
            attendanceRecords:
              state.attendanceRecords ?? INIT_ATTENDANCE_RECORDS,
            examMarks: state.examMarks ?? INIT_EXAM_MARKS,
            settings: state.settings ?? INIT_INSTITUTE_SETTINGS,
            feeReminders: state.feeReminders ?? [],
          } as AppState;
        }
        return { ...state, user: state.user ?? null, active: state.active ?? "dashboard" } as AppState;
      },
    }
  )
);
