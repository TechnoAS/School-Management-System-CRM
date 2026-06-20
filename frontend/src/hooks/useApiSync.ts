import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { API_ENABLED } from "@/api/config";
import { syncAppData } from "@/api/sync";
import { useAppStore } from "@/store/useAppStore";
import { ApiError } from "@/api/client";

export function useApiSync() {
  const user = useAppStore(s => s.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!API_ENABLED || !user) {
      syncedRef.current = false;
      return;
    }

    syncedRef.current = false;

    let cancelled = false;
    setLoading(true);
    setError(null);

    syncAppData(user.role)
      .then(data => {
        if (cancelled) return;
        const store = useAppStore.getState();
        store.setCourses(data.courses);
        store.setBatches(data.batches);
        store.setStudents(data.students);
        store.setFaculty(data.faculty);
        store.setPayments(data.payments);
        store.setExams(data.exams);
        store.setCertificates(data.certificates);
        store.setNotifs(data.notifs);
        store.setSettings(data.settings);
        store.setAttendanceRecords(data.attendanceRecords);
        store.setExamMarks(data.examMarks);
        syncedRef.current = true;
      })
      .catch(err => {
        if (cancelled) return;
        const msg =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to load data from server";
        setError(msg);
        toast.error("Could not sync with API", { description: msg });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  const refresh = async () => {
    if (!API_ENABLED || !user) return;
    setLoading(true);
    try {
      const data = await syncAppData(user.role);
      const store = useAppStore.getState();
      store.setCourses(data.courses);
      store.setBatches(data.batches);
      store.setStudents(data.students);
      store.setFaculty(data.faculty);
      store.setPayments(data.payments);
      store.setExams(data.exams);
      store.setCertificates(data.certificates);
      store.setNotifs(data.notifs);
      store.setSettings(data.settings);
      store.setAttendanceRecords(data.attendanceRecords);
      store.setExamMarks(data.examMarks);
      syncedRef.current = true;
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sync failed";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, refresh };
}
