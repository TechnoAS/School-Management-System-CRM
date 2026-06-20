/**
 * API base URL. In dev, Vite proxies /api → backend :5000.
 * Set VITE_API_URL in .env.local when backend is running.
 */
export function getApiUrl(): string {
  const fromEnv = import.meta.env.VITE_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  // Default: same-origin proxy (vite.config.ts server.proxy)
  return "/api";
}

/** Live API mode — default on; set VITE_API_ENABLED=false for offline demo. */
export const API_ENABLED = import.meta.env.VITE_API_ENABLED !== "false";
