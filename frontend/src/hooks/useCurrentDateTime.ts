import { useEffect, useState } from "react";

/** Keeps a live `Date` in sync with the system clock (updates every minute). */
export function useCurrentDateTime(updateMs = 60_000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = setInterval(tick, updateMs);
    return () => clearInterval(id);
  }, [updateMs]);

  return now;
}
