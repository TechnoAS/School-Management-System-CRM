import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

const IDLE_MS = 30 * 60 * 1000; // 30 minutes
const EVENTS = ["mousedown", "keydown", "scroll", "touchstart"] as const;

/** Log out after prolonged inactivity (demo / local mode). */
export function useSessionTimeout(enabled: boolean, onTimeout: () => void) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const reset = useCallback(() => {
    if (!enabled) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      toast.info("Session expired due to inactivity");
      onTimeoutRef.current();
    }, IDLE_MS);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    reset();
    for (const ev of EVENTS) {
      window.addEventListener(ev, reset, { passive: true });
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      for (const ev of EVENTS) {
        window.removeEventListener(ev, reset);
      }
    };
  }, [enabled, reset]);
}
