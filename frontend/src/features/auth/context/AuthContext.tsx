import React, { createContext, useCallback, useEffect, useRef, useState } from "react";
import {
  getCurrentSessionUser,
  loginUser,
  logoutUser,
  signupUser,
} from "@/features/auth/api/authApi";

type AuthState = "anonymous" | "guest" | "authenticated";
type UserSource = "backend" | "local";

export type AuthUser = {
  name: string;
  email: string;
  source: UserSource;
  preferredSemester?: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type SignupInput = {
  name: string;
  email: string;
  password: string;
  preferredSemester?: string;
};

type MockAccount = {
  name: string;
  email: string;
  password: string;
};

type AuthFieldErrors = {
  email?: string;
  password?: string;
  name?: string;
};

type AuthResult = {
  success: boolean;
  message?: string;
  code?: string;
  fieldErrors?: AuthFieldErrors;
};

type AuthContextValue = {
  state: AuthState;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isBusy: boolean;
  isHydrating: boolean;
  error: string | null;
  clearError: () => void;
  login: (input: LoginInput) => Promise<AuthResult>;
  signup: (input: SignupInput) => Promise<AuthResult>;
  logout: () => Promise<void>;
  continueAsGuest: () => void;
};

const STORAGE_AUTH_USER = "yacs.auth.user";
const STORAGE_GUEST = "yacs.auth.guest";
const STORAGE_MOCK_ACCOUNTS = "yacs.auth.mockAccounts";
const INVALID_LOGIN_MESSAGE = "No account matches that email/password.";

function readStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function clearStorage(key: string) {
  localStorage.removeItem(key);
}

function getMockAccounts() {
  return readStorage<MockAccount[]>(STORAGE_MOCK_ACCOUNTS) ?? [];
}

function saveMockAccounts(accounts: MockAccount[]) {
  writeStorage(STORAGE_MOCK_ACCOUNTS, accounts);
}

function findMockAccount(email: string) {
  return getMockAccounts().find(
    (account) => account.email.toLowerCase() === email.toLowerCase()
  );
}

function upsertMockAccount(input: SignupInput) {
  const existing = findMockAccount(input.email);
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const accounts = getMockAccounts();
  accounts.push({
    name: input.name,
    email: input.email,
    password: input.password,
  });
  saveMockAccounts(accounts);
}

function getInitialAuth() {
  const storedUser = readStorage<AuthUser>(STORAGE_AUTH_USER);
  if (storedUser) {
    return { state: "authenticated" as AuthState, user: storedUser };
  }

  const isGuest = readStorage<boolean>(STORAGE_GUEST);
  if (isGuest) {
    return { state: "guest" as AuthState, user: null };
  }

  return { state: "anonymous" as AuthState, user: null };
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initial = getInitialAuth();
  const initialRef = useRef(initial);
  const shouldHydrateAuth = initial.state !== "guest";
  const [state, setState] = useState<AuthState>(initial.state);
  const [user, setUser] = useState<AuthUser | null>(initial.user);
  const [isBusy, setIsBusy] = useState(shouldHydrateAuth);
  const [isHydrating, setIsHydrating] = useState(shouldHydrateAuth);
  const [error, setError] = useState<string | null>(null);

  const clearAuthenticated = () => {
    setState("anonymous");
    setUser(null);
    clearStorage(STORAGE_AUTH_USER);
    clearStorage(STORAGE_GUEST);
  };

  const setAuthenticated = (nextUser: AuthUser) => {
    setState("authenticated");
    setUser(nextUser);
    writeStorage(STORAGE_AUTH_USER, nextUser);
    clearStorage(STORAGE_GUEST);
  };

  useEffect(() => {
    let cancelled = false;

    const hydrateAuthFromServer = async () => {
      const mountedInitial = initialRef.current;
      if (mountedInitial.state === "guest") {
        setIsHydrating(false);
        setIsBusy(false);
        return;
      }

      setIsBusy(true);
      try {
        const response = await getCurrentSessionUser();
        if (cancelled) {
          return;
        }

        if (response.ok && response.success && response.user) {
          setAuthenticated({
            name: response.user.name,
            email: response.user.email,
            source: "backend",
            preferredSemester: response.user.preferred_semester,
          });
          return;
        }

        if (response.statusCode === 401 && mountedInitial.user?.source === "backend") {
          clearAuthenticated();
        }
      } catch {
        // Keep existing local state on network failures.
      } finally {
        if (!cancelled) {
          setIsHydrating(false);
          setIsBusy(false);
        }
      }
    };

    void hydrateAuthFromServer();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (input: LoginInput): Promise<AuthResult> => {
    setError(null);
    setIsBusy(true);

    try {
      const response = await loginUser(input);

      if (response.ok && response.success) {
        setAuthenticated({
          name: response.user?.name ?? input.email,
          email: response.user?.email ?? input.email,
          source: "backend",
          preferredSemester: response.user?.preferred_semester,
        });
        return { success: true };
      }

      const mockAccount = findMockAccount(input.email);
      if (mockAccount && mockAccount.password === input.password) {
        setAuthenticated({
          name: mockAccount.name,
          email: mockAccount.email,
          source: "local",
        });
        return { success: true };
      }

      const fieldErrors: AuthFieldErrors = {};
      let errorMsg = "";

      if (response.statusCode === 429 || response.code === "rate_limited") {
        errorMsg = response.message ?? "Too many failed login attempts. Please wait and try again.";
      } else if (response.code === "missing_credentials") {
        fieldErrors.email = "Email is required.";
        fieldErrors.password = "Password is required.";
      } else if (response.code === "user_not_found") {
        errorMsg = response.message ?? INVALID_LOGIN_MESSAGE;
      } else if (response.code === "invalid_password") {
        errorMsg = response.message ?? INVALID_LOGIN_MESSAGE;
      } else if (response.statusCode === 401 || response.statusCode === 400) {
        errorMsg = response.message ?? INVALID_LOGIN_MESSAGE;
      } else {
        errorMsg = response.message ?? "Unable to log in. Please try again.";
      }

      if (!errorMsg && Object.keys(fieldErrors).length === 0) {
        errorMsg = response.message ?? "Unable to log in. Please try again.";
      }

      setError(errorMsg || null);
      return {
        success: false,
        message: errorMsg || undefined,
        code: response.code,
        fieldErrors: Object.keys(fieldErrors).length ? fieldErrors : undefined,
      };
    } catch (error) {
      const mockAccount = findMockAccount(input.email);
      if (mockAccount && mockAccount.password === input.password) {
        setAuthenticated({
          name: mockAccount.name,
          email: mockAccount.email,
          source: "local",
        });
        return { success: true };
      }

      const errorMsg =
        error instanceof Error
          ? error.message
          : "Login failed. Please check your credentials and try again.";
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setIsBusy(false);
    }
  };

  const signup = async (input: SignupInput): Promise<AuthResult> => {
    setError(null);
    setIsBusy(true);

    try {
      const signupResponse = await signupUser(input);
      if (!signupResponse.ok || !signupResponse.success) {
        const fieldErrors: AuthFieldErrors = {};
        let errorMessage = "";

        if (signupResponse.code === "invalid_email") {
          fieldErrors.email = "Please enter a valid email address.";
        } else if (signupResponse.code === "email_taken") {
          fieldErrors.email = "An account with this email already exists. Please log in instead.";
        } else if (signupResponse.code === "invalid_password") {
          fieldErrors.password = "Password must be at least 8 characters.";
        } else if (signupResponse.code === "missing_name") {
          fieldErrors.name = "Full name is required.";
        } else {
          errorMessage = signupResponse.message ?? "Unable to create account.";
        }

        setError(errorMessage || null);
        return {
          success: false,
          message: errorMessage || signupResponse.message || undefined,
          code: signupResponse.code,
          fieldErrors: Object.keys(fieldErrors).length ? fieldErrors : undefined,
        };
      }

      // Signup succeeded, now log in
      try {
        upsertMockAccount(input);
      } catch {
        // Mock account error is non-fatal
      }

      const loginResponse = await loginUser({
        email: input.email,
        password: input.password,
      });

      if (loginResponse.ok && loginResponse.success) {
        setAuthenticated({
          name: input.name,
          email: input.email,
          source: "backend",
          preferredSemester: loginResponse.user?.preferred_semester,
        });
        return { success: true };
      }

      setAuthenticated({
        name: input.name,
        email: input.email,
        source: "local",
      });
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Network error during signup.";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsBusy(false);
    }
  };

  const logout = async () => {
    setError(null);
    setIsBusy(true);

    try {
      await logoutUser();
    } catch {
      // Ignore network errors during logout; local state still clears.
    } finally {
      clearAuthenticated();
      setIsBusy(false);
    }
  };

  const continueAsGuest = () => {
    setError(null);
    setState("guest");
    setUser(null);
    writeStorage(STORAGE_GUEST, true);
    clearStorage(STORAGE_AUTH_USER);
  };

  const clearError = useCallback(() => setError(null), []);

  const value: AuthContextValue = {
    state,
    user,
    isAuthenticated: state === "authenticated" && !isHydrating,
    isGuest: state === "guest",
    isBusy,
    isHydrating,
    error,
    clearError,
    login,
    signup,
    logout,
    continueAsGuest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
