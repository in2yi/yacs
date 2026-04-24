import React from "react";
import { screen } from "@testing-library/react";
import RequireAppAccess from "./RequireAppAccess";
import { renderWithAuth } from "@/testing/auth-test-utils";

test("shows a loading message while auth state is hydrating", () => {
  renderWithAuth(<RequireAppAccess />, {
    auth: { isHydrating: true },
  });

  expect(screen.getByText(/checking your session/i)).toBeInTheDocument();
});

test("redirects anonymous users back to the landing page", () => {
  renderWithAuth(<RequireAppAccess />);

  expect(screen.getByTestId("navigate")).toHaveAttribute("data-to", "/");
});

test("renders nested app content for guests", () => {
  renderWithAuth(<RequireAppAccess />, {
    auth: { isGuest: true },
  });

  expect(screen.getByTestId("outlet")).toBeInTheDocument();
});
