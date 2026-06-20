import { apiRequest, setAuthToken, clearAuthToken, getAuthToken } from "../client";
import { mapUser } from "../mappers";
import type { User } from "@/types";

interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "staff" | "faculty" | "super_admin";
    phone: string | null;
    photoUrl: string | null;
  };
}

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const data = await apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(data.accessToken);
    return mapUser(data.user);
  },

  async refresh(): Promise<string | null> {
    try {
      const data = await apiRequest<{ accessToken: string }>("/auth/refresh", {
        method: "POST",
      });
      setAuthToken(data.accessToken);
      return data.accessToken;
    } catch {
      clearAuthToken();
      return null;
    }
  },

  async restoreSession(): Promise<User | null> {
    if (getAuthToken()) {
      try {
        return await authService.me();
      } catch {
        /* try refresh below */
      }
    }
    const token = await authService.refresh();
    if (!token) return null;
    return authService.me();
  },

  async logout(): Promise<void> {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } finally {
      clearAuthToken();
    }
  },

  async me(): Promise<User> {
    const data = await apiRequest<{ user: Record<string, unknown> }>("/auth/me");
    return mapUser(data.user);
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiRequest("/auth/password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    clearAuthToken();
  },
};
