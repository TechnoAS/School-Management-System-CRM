import { getApiUrl } from "./config";

const AUTH_EXPIRED_EVENT = "auth:expired";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const TOKEN_KEY = "auth_token";

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function emitAuthExpired(): void {
  clearAuthToken();
  window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
}

export function onAuthExpired(handler: () => void): () => void {
  window.addEventListener(AUTH_EXPIRED_EVENT, handler);
  return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handler);
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const url = `${getApiUrl()}/auth/refresh`;
      const res = await fetch(url, { method: "POST", credentials: "include" });
      if (!res.ok) return null;
      const json = (await res.json()) as ApiResponse<{ accessToken: string }>;
      const token = json.data?.accessToken;
      if (token) {
        setAuthToken(token);
        return token;
      }
      return null;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  message?: string;
}

function isAuthPath(path: string): boolean {
  return path.startsWith("/auth/login") || path.startsWith("/auth/refresh");
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  retried = false
): Promise<T> {
  const url = `${getApiUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const token = getAuthToken();

  const headers = new Headers(options.headers);
  if (
    !headers.has("Content-Type") &&
    options.body &&
    !(options.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers, credentials: "include" });

  if (res.status === 401 && !retried && !isAuthPath(path)) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest<T>(path, options, true);
    }
    emitAuthExpired();
  }

  if (!res.ok) {
    let message = res.statusText;
    let code: string | undefined;
    try {
      const body = (await res.json()) as {
        message?: string;
        error?: string | { code?: string; message?: string };
      };
      if (body.error && typeof body.error === "object") {
        message = body.error.message ?? message;
        code = body.error.code;
      } else if (typeof body.error === "string") {
        message = body.error;
        code = body.error;
      } else if (body.message) {
        message = body.message;
      }
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(message, res.status, code);
  }

  if (res.status === 204) return undefined as T;

  const json = (await res.json()) as ApiResponse<T> | T;
  if (json && typeof json === "object" && "success" in json && "data" in json) {
    return (json as ApiResponse<T>).data;
  }
  return json as T;
}
