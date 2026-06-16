import { Suspense, lazy, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router";
import { useAppStore } from "@/store/useAppStore";
import { AppShell } from "@/components/layout/AppShell";
import { LogoutDialog } from "@/components/shared";
import { ProfileModal } from "@/components/layout/ProfileModal";
import { User } from "@/types";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";

// Lazy-load page components
const LoginPage = lazy(() => import("@/features/auth/LoginPage"));
const DashboardPage = lazy(() => import("@/features/dashboard/DashboardPage"));
const StudentsPage = lazy(() => import("@/features/students/StudentsPage"));
const CoursesPage = lazy(() => import("@/features/courses/CoursesPage"));
const BatchesPage = lazy(() => import("@/features/batches/BatchesPage"));
const AttendancePage = lazy(() =>
  import("@/features/attendance/AttendancePage")
);
const FeesPage = lazy(() => import("@/features/fees/FeesPage"));
const FacultyPage = lazy(() => import("@/features/faculty/FacultyPage"));
const ExamsPage = lazy(() => import("@/features/exams/ExamsPage"));
const CertificatesPage = lazy(() =>
  import("@/features/certificates/CertificatesPage")
);
const ReportsPage = lazy(() => import("@/features/reports/ReportsPage"));
const NotificationsPage = lazy(() =>
  import("@/features/notifications/NotificationsPage")
);
const SettingsPanel = lazy(() => import("@/features/settings/SettingsPanel"));

function ProtectedLayout() {
  const {
    user,
    setUser,
    students,
    setStudents,
    courses,
    setCourses,
    batches,
    setBatches,
    faculty,
    setFaculty,
    notifs,
    setNotifs,
    payments,
    addPayment,
    exams,
    addExam,
    examMarks,
    setExamMarks,
    certificates,
    addCertificate,
    attendanceRecords,
    saveAttendanceSession,
    settings,
    updateSettings,
  } = useAppStore();

  const navigate = useNavigate();
  const location = useLocation();

  const [showLogout, setShowLogout] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const current =
    location.pathname === "/"
      ? "dashboard"
      : location.pathname.substring(1).split("/")[0];

  const unreadCount = notifs.filter((n) => !n.read).length;

  const handleNavigate = (id: string) => {
    navigate(id === "dashboard" ? "/" : `/${id}`);
  };

  const handleLogout = () => {
    setShowLogout(false);
    setUser(null);
    navigate("/login");
  };

  return (
    <AppShell
      user={user}
      current={current || "dashboard"}
      unreadCount={unreadCount}
      onNavigate={handleNavigate}
      onShowProfile={() => setShowProfile(true)}
      onShowLogout={() => setShowLogout(true)}
    >
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }
      >
        <Routes>
          <Route
            path="/"
            element={
              <ErrorBoundary>
                <DashboardPage
                  students={students}
                  courses={courses}
                  batches={batches}
                />
              </ErrorBoundary>
            }
          />
          <Route
            path="/students"
            element={
              <ErrorBoundary>
                <StudentsPage
                  students={students}
                  setStudents={setStudents}
                  courses={courses}
                  batches={batches}
                />
              </ErrorBoundary>
            }
          />
          <Route
            path="/courses"
            element={
              <ErrorBoundary>
                <CoursesPage courses={courses} setCourses={setCourses} />
              </ErrorBoundary>
            }
          />
          <Route
            path="/batches"
            element={
              <ErrorBoundary>
                <BatchesPage
                  batches={batches}
                  setBatches={setBatches}
                  courses={courses}
                  faculty={faculty}
                  students={students}
                  onNavigate={handleNavigate}
                />
              </ErrorBoundary>
            }
          />
          <Route
            path="/attendance"
            element={
              <ErrorBoundary>
                <AttendancePage
                  students={students}
                  batches={batches}
                  attendanceRecords={attendanceRecords}
                  saveAttendanceSession={saveAttendanceSession}
                />
              </ErrorBoundary>
            }
          />
          <Route
            path="/fees"
            element={
              <ErrorBoundary>
                <FeesPage
                  students={students}
                  setStudents={setStudents}
                  payments={payments}
                  addPayment={addPayment}
                />
              </ErrorBoundary>
            }
          />
          <Route
            path="/faculty"
            element={
              <ErrorBoundary>
                <FacultyPage
                  faculty={faculty}
                  setFaculty={setFaculty}
                  courses={courses}
                />
              </ErrorBoundary>
            }
          />
          <Route
            path="/exams"
            element={
              <ErrorBoundary>
                <ExamsPage
                  courses={courses}
                  batches={batches}
                  exams={exams}
                  addExam={addExam}
                  examMarks={examMarks}
                  setExamMarks={setExamMarks}
                />
              </ErrorBoundary>
            }
          />
          <Route
            path="/certificates"
            element={
              <ErrorBoundary>
                <CertificatesPage
                  students={students}
                  certificates={certificates}
                  addCertificate={addCertificate}
                  settings={settings}
                />
              </ErrorBoundary>
            }
          />
          <Route
            path="/reports"
            element={
              <ErrorBoundary>
                <ReportsPage students={students} faculty={faculty} />
              </ErrorBoundary>
            }
          />
          <Route
            path="/notifications"
            element={
              <ErrorBoundary>
                <NotificationsPage items={notifs} setItems={setNotifs} />
              </ErrorBoundary>
            }
          />
          <Route
            path="/settings"
            element={
              <ErrorBoundary>
                <SettingsPanel settings={settings} updateSettings={updateSettings} />
              </ErrorBoundary>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {showProfile && user && (
        <ProfileModal
          user={user}
          setUser={(val) => {
            if (typeof val === "function") {
              setUser(val(user));
            } else {
              setUser(val);
            }
          }}
          onClose={() => setShowProfile(false)}
        />
      )}

      {showLogout && (
        <LogoutDialog
          onConfirm={handleLogout}
          onCancel={() => setShowLogout(false)}
        />
      )}
    </AppShell>
  );
}

export function AppRouter() {
  const { user, setUser } = useAppStore();

  const handleLogin = (u: User) => {
    setUser(u);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <Suspense
                fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                }
              >
                <LoginPage onLogin={handleLogin} />
              </Suspense>
            )
          }
        />
        <Route path="*" element={<ProtectedLayout />} />
      </Routes>
    </BrowserRouter>
  );
}
