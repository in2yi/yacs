import React from "react";
import { render } from "@testing-library/react";
import { AuthContext, type AuthUser } from "@/features/auth/context/AuthContext";

type AuthOverride = Partial<React.ContextType<typeof AuthContext>>;

type RenderOptions = {
  auth?: AuthOverride;
};

function createAuthValue(overrides: AuthOverride = {}) {
  return {
    state: "anonymous" as const,
    user: null as AuthUser | null,
    isAuthenticated: false,
    isGuest: false,
    isBusy: false,
    isHydrating: false,
    error: null as string | null,
    clearError: jest.fn(),
    login: jest.fn().mockResolvedValue({ success: true }),
    signup: jest.fn().mockResolvedValue({ success: true }),
    logout: jest.fn().mockResolvedValue(undefined),
    continueAsGuest: jest.fn(),
    ...overrides,
  };
}

export function renderWithAuth(ui: React.ReactElement, options: RenderOptions = {}) {
  const authValue = createAuthValue(options.auth);

  return {
    ...render(<AuthContext.Provider value={authValue}>{ui}</AuthContext.Provider>),
    authValue,
  };
}
