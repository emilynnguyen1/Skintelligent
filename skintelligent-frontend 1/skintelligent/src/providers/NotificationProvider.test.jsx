import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NotificationProvider, useNotifications } from "./NotificationProvider";

function TestHarness() {
  const notifications = useNotifications();

  return (
    <div>
      <button
        type="button"
        onClick={() => notifications.success("Profile updated.", { title: "Saved", duration: 1000 })}
      >
        Show toast
      </button>
    </div>
  );
}

function renderNotifications() {
  return render(
    <NotificationProvider>
      <TestHarness />
    </NotificationProvider>,
  );
}

describe("NotificationProvider", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("auto-dismisses a toast after its duration", () => {
    renderNotifications();

    fireEvent.click(screen.getByRole("button", { name: "Show toast" }));

    expect(screen.getByText("Profile updated.")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1300);
    });

    expect(screen.queryByText("Profile updated.")).not.toBeInTheDocument();
  });

  it("pauses while pulled down slightly and resumes on release", () => {
    renderNotifications();

    fireEvent.click(screen.getByRole("button", { name: "Show toast" }));
    const toast = screen.getByRole("status");

    fireEvent.pointerDown(toast, { pointerId: 1, clientY: 100 });
    fireEvent.pointerMove(toast, { pointerId: 1, clientY: 114 });

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText("Profile updated.")).toBeInTheDocument();

    fireEvent.pointerUp(toast, { pointerId: 1, clientY: 114 });

    act(() => {
      vi.advanceTimersByTime(1300);
    });

    expect(screen.queryByText("Profile updated.")).not.toBeInTheDocument();
  });

  it("dismisses when swiped upward past the threshold", () => {
    renderNotifications();

    fireEvent.click(screen.getByRole("button", { name: "Show toast" }));
    const toast = screen.getByRole("status");

    fireEvent.pointerDown(toast, { pointerId: 2, clientY: 120 });
    fireEvent.pointerMove(toast, { pointerId: 2, clientY: 56 });
    fireEvent.pointerUp(toast, { pointerId: 2, clientY: 56 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByText("Profile updated.")).not.toBeInTheDocument();
  });

  it("lets the close button dismiss without starting a drag gesture", () => {
    renderNotifications();

    fireEvent.click(screen.getByRole("button", { name: "Show toast" }));
    const toast = screen.getByRole("status");
    const closeButton = screen.getByRole("button", { name: "Dismiss notification" });

    fireEvent.pointerDown(closeButton, { pointerId: 3, clientY: 120 });

    expect(toast).toHaveStyle({ transform: "translateY(0px) scale(1)" });

    fireEvent.pointerUp(closeButton, { pointerId: 3, clientY: 120 });
    fireEvent.click(closeButton);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByText("Profile updated.")).not.toBeInTheDocument();
  });
});
