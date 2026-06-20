import { Suspense, lazy, useState, useEffect, useCallback } from "react";
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
import { LogoutDialog, PageSkeleton } from "@/components/shared";
import { ProfileModal } from "@/components/layout/ProfileModal";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { User } from "@/types";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { useApiSync } from "@/hooks/useApiSync";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { useAuthBootstrap } from "@/hooks/useAuthBootstrap";
import { API_ENABLED } from "@/api/config";
import { authService } from "@/api/services/auth.service";
import { onAuthExpired } from "@/api/client";

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
    deleteExam,
    examMarks,
    setExamMarks,
    certificates,
    addCertificate,
    attendanceRecords,
    saveAttendanceSession,
    settings,
    updateSettings,
    feeReminders,
    queueFeeReminders,
  } = useAppStore();

  const navigate = useNavigate();
  const location = useLocation();
  const { loading: apiLoading } = useApiSync();

  const [showLogout, setShowLogout] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = useCallback(async () => {
    setShowLogout(false);
    if (API_ENABLED) {
      try {
        await authService.logout();
      } catch {
        /* clear local session even if API logout fails */
      }
    }
    setUser(null);
    navigate("/login");
  }, [setUser, navigate]);

  useSessionTimeout(!!user, handleLogout);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const current =
    location.pathname === "/"
      ? "dashboard"
      : location.pathname.substring(1).split("/")[0];

  const unreadCount = notifs.filter((n) => !n.read).length;

  const handleNavigate = (id: string) => {
    if (id.includes("?")) {
      const [path, query] = id.split("?");
      navigate(path === "dashboard" ? `/?${query}` : `/${path}?${query}`);
      return;
    }
    navigate(id === "dashboard" ? "/" : `/${id}`);
  };

  return (
    <AppShell
      user={user}
      current={current || "dashboard"}
      unreadCount={unreadCount}
      students={students}
      onNavigate={handleNavigate}
      onShowProfile={() => setShowProfile(true)}
      onShowLogout={() => setShowLogout(true)}
    >
      {API_ENABLED && apiLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <p className="text-sm text-muted-foreground">Syncing data from server…</p>
          </div>
        </div>
      )}
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route
            path="/"
            element={
              <RoleGuard moduleId="dashboard">
                <ErrorBoundary>
                  <DashboardPage
                    students={students}
                    courses={courses}
                    batches={batches}
                    payments={payments}
                    settings={settings}
                  />
                </ErrorBoundary>
              </RoleGuard>
            }
          />
          <Route
            path="/students"
            element={
              <RoleGuard moduleId="students">
                <ErrorBoundary>
                  <StudentsPage
                    students={students}
                    setStudents={setStudents}
                    courses={courses}
                    batches={batches}
                  />
                </ErrorBoundary>
              </RoleGuard>
            }
          />
          <Route
            path="/courses"
            element={
              <RoleGuard moduleId="courses">
                <ErrorBoundary>
                  <CoursesPage courses={courses} setCourses={setCourses} />
                </ErrorBoundary>
              </RoleGuard>
            }
          />
          <Route
            path="/batches"
            element={
              <RoleGuard moduleId="batches">
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
              </RoleGuard>
            }
          />
          <Route
            path="/attendance"
            element={
              <RoleGuard moduleId="attendance">
                <ErrorBoundary>
                  <AttendancePage
                    students={students}
                    batches={batches}
                    attendanceRecords={attendanceRecords}
                    saveAttendanceSession={saveAttendanceSession}
                  />
                </ErrorBoundary>
              </RoleGuard>
            }
          />
          <Route
            path="/fees"
            element={
              <RoleGuard moduleId="fees">
                <ErrorBoundary>
                  <FeesPage
                    students={students}
                    setStudents={setStudents}
                    payments={payments}
                    addPayment={addPayment}
                    settings={settings}
                    feeReminders={feeReminders}
                    queueFeeReminders={queueFeeReminders}
                  />
                </ErrorBoundary>
              </RoleGuard>
            }
          />
          <Route
            path="/faculty"
            element={
              <RoleGuard moduleId="faculty">
                <ErrorBoundary>
                  <FacultyPage
                    faculty={faculty}
                    setFaculty={setFaculty}
                    courses={courses}
                  />
                </ErrorBoundary>
              </RoleGuard>
            }
          />
          <Route
            path="/exams"
            element={
              <RoleGuard moduleId="exams">
                <ErrorBoundary>
                  <ExamsPage
                    courses={courses}
                    batches={batches}
                    exams={exams}
                    addExam={addExam}
                    deleteExam={deleteExam}
                    students={students}
                    examMarks={examMarks}
                    setExamMarks={setExamMarks}
                  />
                </ErrorBoundary>
              </RoleGuard>
            }
          />
          <Route
            path="/certificates"
            element={
              <RoleGuard moduleId="certificates">
                <ErrorBoundary>
                  <CertificatesPage
                    students={students}
                    courses={courses}
                    certificates={certificates}
                    addCertificate={addCertificate}
                    settings={settings}
                    attendanceRecords={attendanceRecords}
                    examMarks={examMarks}
                  />
                </ErrorBoundary>
              </RoleGuard>
            }
          />
          <Route
            path="/reports"
            element={
              <RoleGuard moduleId="reports">
                <ErrorBoundary>
                  <ReportsPage
                    students={students}
                    faculty={faculty}
                    payments={payments}
                    attendanceRecords={attendanceRecords}
                    batches={batches}
                  />
                </ErrorBoundary>
              </RoleGuard>
            }
          />
          <Route
            path="/notifications"
            element={
              <RoleGuard moduleId="notifications">
                <ErrorBoundary>
                  <NotificationsPage items={notifs} setItems={setNotifs} />
                </ErrorBoundary>
              </RoleGuard>
            }
          />
          <Route
            path="/settings"
            element={
              <RoleGuard moduleId="settings">
                <ErrorBoundary>
                  <SettingsPanel settings={settings} updateSettings={updateSettings} />
                </ErrorBoundary>
              </RoleGuard>
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
  const { ready: authReady } = useAuthBootstrap();

  useEffect(() => {
    if (!API_ENABLED) return;
    return onAuthExpired(() => {
      setUser(null);
      window.location.assign("/login");
    });
  }, [setUser]);

  const handleLogin = (u: User) => {
    setUser(u);
  };

  if (API_ENABLED && !authReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Restoring session…</p>
        </div>
      </div>
    );
  }

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
