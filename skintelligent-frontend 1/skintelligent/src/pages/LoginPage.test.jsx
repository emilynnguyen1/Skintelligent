import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import LoginPage from "./LoginPage";
import { NotificationProvider } from "../providers/NotificationProvider";

vi.mock("../api/hooks", () => ({
  useAuthConfigQuery: vi.fn(),
  useLoginMutation: vi.fn(),
}));

const { useAuthConfigQuery, useLoginMutation } = await import("../api/hooks");

describe("LoginPage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("submits credentials and redirects to the dashboard when a profile exists", async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockResolvedValue({
      user: {
        profile: { skin_type: "oily" },
      },
    });

    useLoginMutation.mockReturnValue({
      mutateAsync,
      isPending: false,
      error: null,
    });
    useAuthConfigQuery.mockReturnValue({
      data: { turnstile_required: false, turnstile_site_key: null },
      isLoading: false,
      isSuccess: true,
    });

    render(
      <NotificationProvider>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<div>Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      </NotificationProvider>,
    );

    await user.type(screen.getByPlaceholderText("Email address"), "maya@example.com");
    await user.type(screen.getByPlaceholderText("Password"), "Password123!");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(mutateAsync).toHaveBeenCalledWith({
      email: "maya@example.com",
      password: "Password123!",
      captcha_token: undefined,
    });
    expect(await screen.findByText("Dashboard")).toBeInTheDocument();
  });

  it("still submits while auth config is loading", async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockResolvedValue({
      user: {
        profile: { skin_type: "oily" },
      },
    });

    useLoginMutation.mockReturnValue({
      mutateAsync,
      isPending: false,
      error: null,
    });
    useAuthConfigQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isSuccess: false,
    });

    render(
      <NotificationProvider>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<div>Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      </NotificationProvider>,
    );

    await user.type(screen.getByPlaceholderText("Email address"), "maya@example.com");
    await user.type(screen.getByPlaceholderText("Password"), "Password123!");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(mutateAsync).toHaveBeenCalled();
  });
});
