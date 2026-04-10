import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import SignupPage from "./SignupPage";
import { NotificationProvider } from "../providers/NotificationProvider";

vi.mock("../api/hooks", () => ({
  useAuthConfigQuery: vi.fn(),
  useSignupMutation: vi.fn(),
}));

const { useAuthConfigQuery, useSignupMutation } = await import("../api/hooks");

describe("SignupPage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("submits signup abuse-protection fields with the account payload", async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockResolvedValue({
      user: {
        profile: null,
      },
    });

    useSignupMutation.mockReturnValue({
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
        <MemoryRouter initialEntries={["/signup"]}>
          <Routes>
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/onboarding" element={<div>Onboarding</div>} />
          </Routes>
        </MemoryRouter>
      </NotificationProvider>,
    );

    await user.type(screen.getByPlaceholderText("Full name"), "Avery Holt");
    await user.type(screen.getByPlaceholderText("Email address"), "avery@example.com");
    await user.type(screen.getByPlaceholderText("Create password"), "SecurePass1!");
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    expect(mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Avery Holt",
        email: "avery@example.com",
        password: "SecurePass1!",
        website: "",
        form_started_at: expect.any(String),
      }),
    );
    expect(await screen.findByText("Onboarding")).toBeInTheDocument();
  });

  it("still submits while auth config is loading", async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockResolvedValue({
      user: {
        profile: null,
      },
    });

    useSignupMutation.mockReturnValue({
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
        <MemoryRouter initialEntries={["/signup"]}>
          <Routes>
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/onboarding" element={<div>Onboarding</div>} />
          </Routes>
        </MemoryRouter>
      </NotificationProvider>,
    );

    await user.type(screen.getByPlaceholderText("Full name"), "Avery Holt");
    await user.type(screen.getByPlaceholderText("Email address"), "avery@example.com");
    await user.type(screen.getByPlaceholderText("Create password"), "SecurePass1!");
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    expect(mutateAsync).toHaveBeenCalled();
  });
});
