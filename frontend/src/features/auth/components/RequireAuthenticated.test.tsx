import React from "react";
import { screen } from "@testing-library/react";
import RequireAuthenticated from "./RequireAuthenticated";
import { renderWithAuth } from "@/testing/auth-test-utils";

test("renders protected content for authenticated users", () => {
  renderWithAuth(<RequireAuthenticated />, {
    auth: { isAuthenticated: true },
  });

  expect(screen.getByTestId("outlet")).toBeInTheDocument();
});

test("redirects guests back to the app home page", () => {
  renderWithAuth(<RequireAuthenticated />, {
    auth: { isGuest: true },
  });

  expect(screen.getByTestId("navigate")).toHaveAttribute("data-to", "/app");
});

test("redirects anonymous users to the landing page", () => {
  renderWithAuth(<RequireAuthenticated />);

  expect(screen.getByTestId("navigate")).toHaveAttribute("data-to", "/");
});
