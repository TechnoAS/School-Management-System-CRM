import { ApiError } from "@/api/client";

/** User-friendly login error copy for the sign-in form. */
export function getLoginErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.code === "TOO_MANY_REQUESTS") {
      return "Too many sign-in attempts. Please wait a few minutes and try again.";
    }
    if (err.status === 401) {
      return "Invalid email or password. Check your credentials and try again.";
    }
    if (err.status === 0 || err.message === "Failed to fetch") {
      return "Cannot reach the server. Start the API with npm run dev:api or npm run dev:all.";
    }
    if (err.message && err.message !== "[object Object]") {
      return err.message;
    }
    return "Sign in failed. Please try again.";
  }

  if (err instanceof TypeError && err.message === "Failed to fetch") {
    return "Cannot reach the server. Start the API with npm run dev:api or npm run dev:all.";
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  return "Sign in failed. Please try again.";
}
