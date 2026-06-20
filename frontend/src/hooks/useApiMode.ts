import { API_ENABLED } from "@/api/config";

/** Whether the UI reads/writes via the Node API or local Zustand demo store. */
export function useApiMode() {
  return {
    apiEnabled: API_ENABLED,
    source: API_ENABLED ? ("api" as const) : ("local" as const),
  };
}
