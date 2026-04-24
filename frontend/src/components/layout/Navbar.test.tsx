import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Navbar from "./Navbar";
import { AuthContext } from "@/features/auth/context/AuthContext";
import { ScheduleProvider } from "@/features/schedule/context/schedule-context";
import { __getNavigateMock, __resetRouterMocks } from "@/testing/mocks/react-router-dom";

jest.mock("@/features/schedule/components/ClassSearch", () => () => (
  <div data-testid="class-search">Class Search</div>
));

jest.mock("@/components/theme/ThemeToggle", () => () => (
  <button type="button">Toggle theme</button>
));

type RenderNavbarOptions = {
  isAuthenticated?: boolean;
  isGuest?: boolean;
  userEmail?: string | null;
  logout?: jest.Mock;
  isBusy?: boolean;
};

function renderNavbar(options: RenderNavbarOptions = {}) {
  const logout = options.logout ?? jest.fn().mockResolvedValue(undefined);

  return {
    logout,
    ...render(
      <AuthContext.Provider
        value={{
          state: options.isAuthenticated ? "authenticated" : options.isGuest ? "guest" : "anonymous",
          user: options.userEmail
            ? {
                name: "Test User",
                email: options.userEmail,
                source: "local",
              }
            : null,
          isAuthenticated: options.isAuthenticated ?? false,
          isGuest: options.isGuest ?? false,
          isBusy: options.isBusy ?? false,
          isHydrating: false,
          error: null,
          clearError: jest.fn(),
          login: jest.fn(),
          signup: jest.fn(),
          logout,
          continueAsGuest: jest.fn(),
        }}
      >
        <ScheduleProvider>
          <Navbar />
        </ScheduleProvider>
      </AuthContext.Provider>
    ),
  };
}

beforeEach(() => {
  localStorage.clear();
  __resetRouterMocks();
});

test("shows guest navigation state when the user is browsing as a guest", () => {
  renderNavbar({ isGuest: true });

  expect(screen.getByText(/guest mode/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/");
  expect(screen.getByLabelText(/semester/i)).toBeInTheDocument();
});

test("shows authenticated actions and logs out back to the landing page", async () => {
  const { logout } = renderNavbar({
    isAuthenticated: true,
    userEmail: "student@rpi.edu",
  });

  expect(screen.getByText("student@rpi.edu")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /profile/i })).toHaveAttribute("href", "/app/profile");

  fireEvent.click(screen.getByRole("button", { name: /log out/i }));

  await waitFor(() => {
    expect(logout).toHaveBeenCalledTimes(1);
    expect(__getNavigateMock()).toHaveBeenCalledWith("/", { replace: true });
  });
});

test("updates the selected semester from the navbar selector", async () => {
  renderNavbar();

  fireEvent.change(screen.getByLabelText(/semester/i), {
    target: { value: "Fall 2026" },
  });

  await waitFor(() => {
    expect(localStorage.getItem("yacs.selectedSemester")).toBe("Fall 2026");
  });
  expect(screen.getByDisplayValue("Fall 2026")).toBeInTheDocument();
});
