import { describe, it, expect } from "vitest";
import { ApiError } from "@/api/client";
import { getLoginErrorMessage } from "@/lib/loginErrors";

describe("getLoginErrorMessage", () => {
  it("maps 401 to friendly invalid credentials message", () => {
    const err = new ApiError("Invalid email or password", 401, "UNAUTHORIZED");
    expect(getLoginErrorMessage(err)).toBe(
      "Invalid email or password. Check your credentials and try again."
    );
  });

  it("maps rate limit errors", () => {
    const err = new ApiError("Too many login attempts", 429, "TOO_MANY_REQUESTS");
    expect(getLoginErrorMessage(err)).toContain("Too many sign-in attempts");
  });

  it("maps network failures", () => {
    expect(getLoginErrorMessage(new TypeError("Failed to fetch"))).toContain(
      "Cannot reach the server"
    );
  });

  it("avoids [object Object] from malformed messages", () => {
    const err = new ApiError("[object Object]", 400);
    expect(getLoginErrorMessage(err)).toBe("Sign in failed. Please try again.");
  });
});
