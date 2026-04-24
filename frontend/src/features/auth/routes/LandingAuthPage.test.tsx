import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import LandingAuthPage from "./LandingAuthPage";
import { AppProviders } from "@/providers/AppProviders";
import { __getNavigateMock, __resetRouterMocks } from "@/testing/mocks/react-router-dom";

beforeEach(() => {
  localStorage.clear();
  __resetRouterMocks();
  global.fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);

    if (url.includes("/api/session/me")) {
      return Promise.resolve({
        ok: false,
        status: 401,
        text: () => Promise.resolve(JSON.stringify({ code: "user_not_found" })),
      } as Response);
    }

    if (url.includes("/api/session") && init?.method === "POST") {
      return Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              success: true,
              user: { user_id: 1, name: "Test User", email: "student@rpi.edu" },
            })
          ),
      } as Response);
    }

    if (url.includes("/api/user") && init?.method === "POST") {
      return Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ success: true })),
      } as Response);
    }

    return Promise.resolve({
      ok: true,
      status: 200,
      text: () => Promise.resolve(""),
    } as Response);
  }) as jest.Mock;
});

function renderPage() {
  return render(
    <AppProviders>
      <LandingAuthPage />
    </AppProviders>
  );
}

async function waitForReadyState() {
  return screen.findByRole("button", { name: /log in to yacs/i });
}

test("shows login validation errors before submitting invalid credentials", async () => {
  renderPage();

  fireEvent.click(await waitForReadyState());

  expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  expect(screen.getByText(/please fix the highlighted fields and try again/i)).toBeInTheDocument();
});

test("submits login credentials and navigates to the app on success", async () => {
  renderPage();
  await waitForReadyState();

  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: "student@rpi.edu" },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: "correct-horse-battery-staple" },
  });
  fireEvent.click(screen.getByRole("button", { name: /log in to yacs/i }));

  await waitFor(() => {
    expect(__getNavigateMock()).toHaveBeenCalledWith("/app", { replace: true });
  });
});

test("switches to signup mode and validates signup-specific fields", async () => {
  renderPage();
  await waitForReadyState();

  fireEvent.click(screen.getByRole("button", { name: /sign up$/i }));
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: "not-an-email" },
  });
  fireEvent.change(screen.getByLabelText(/^password$/i), {
    target: { value: "short" },
  });
  fireEvent.click(screen.getByRole("button", { name: /create account/i }));

  expect(await screen.findByText(/full name is required/i)).toBeInTheDocument();
  expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
  expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
});

test("continues as guest and redirects into the app", async () => {
  renderPage();
  await waitForReadyState();

  fireEvent.click(screen.getByRole("button", { name: /continue as guest/i }));

  await waitFor(() => {
    expect(__getNavigateMock()).toHaveBeenCalledWith("/app", { replace: true });
  });
  expect(localStorage.getItem("yacs.auth.guest")).toBe("true");
});
