import { useEffect, useState } from "react";
import { API_ENABLED } from "@/api/config";
import { authService } from "@/api/services/auth.service";
import { useAppStore } from "@/store/useAppStore";

/** Restore JWT session from storage / refresh cookie before rendering the app. */
export function useAuthBootstrap() {
  const setUser = useAppStore(s => s.setUser);
  const [ready, setReady] = useState(!API_ENABLED);

  useEffect(() => {
    if (!API_ENABLED) return;

    let cancelled = false;

    authService
      .restoreSession()
      .then(user => {
        if (cancelled) return;
        setUser(user);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [setUser]);

  return { ready };
}
