import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginPage } from "@/features/auth/LoginPage";

vi.mock("@/api/config", () => ({ API_ENABLED: false }));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows error for empty submit", async () => {
    const onLogin = vi.fn();
    render(<LoginPage onLogin={onLogin} />);
    await userEvent.click(screen.getAllByRole("button", { name: /sign in/i })[0]);
    expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument();
    expect(onLogin).not.toHaveBeenCalled();
  });

  it("logs in with demo super admin quick sign-in", async () => {
    const onLogin = vi.fn();
    render(<LoginPage onLogin={onLogin} />);
    await userEvent.click(screen.getAllByText("Super Admin")[0]);
    await userEvent.click(screen.getAllByRole("button", { name: /sign in/i })[0]);
    await waitFor(() =>
      expect(onLogin).toHaveBeenCalledWith(
        expect.objectContaining({ email: "admin@techacademy.com", role: "super_admin" })
      )
    );
  });
});
