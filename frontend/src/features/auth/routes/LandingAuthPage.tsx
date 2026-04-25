import React, { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Spinner } from "@/components/ui/spinner";

type AuthMode = "login" | "signup";

type FieldErrors = {
  email?: string;
  password?: string;
  name?: string;
};

export default function LandingAuthPage() {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    isBusy,
    error,
    clearError,
    login,
    signup,
    continueAsGuest,
  } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/app", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    clearError();
    setFieldErrors({});
    setGeneralError(null);
  }, [mode, clearError]);

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateEmail = (emailValue: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue.trim()) {
      setFieldErrors((prev) => ({ ...prev, email: "Email is required." }));
      return false;
    }
    if (!emailRegex.test(emailValue)) {
      setFieldErrors((prev) => ({ ...prev, email: "Please enter a valid email address." }));
      return false;
    }
    clearFieldError("email");
    return true;
  };

  const validatePassword = (passwordValue: string): boolean => {
    if (!passwordValue) {
      setFieldErrors((prev) => ({ ...prev, password: "Password is required." }));
      return false;
    }
    if (mode === "signup" && passwordValue.length < 8) {
      setFieldErrors((prev) => ({
        ...prev,
        password: "Password must be at least 8 characters.",
      }));
      return false;
    }
    clearFieldError("password");
    return true;
  };

  const validateName = (nameValue: string): boolean => {
    if (mode === "signup" && !nameValue.trim()) {
      setFieldErrors((prev) => ({ ...prev, name: "Full name is required." }));
      return false;
    }
    clearFieldError("name");
    return true;
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (fieldErrors.email) {
      validateEmail(value);
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (fieldErrors.password) {
      validatePassword(value);
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (fieldErrors.name) {
      validateName(value);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});
    setGeneralError(null);
    clearError();

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isNameValid = mode === "signup" ? validateName(name) : true;
    if (!isEmailValid || !isPasswordValid || !isNameValid) {
      return;
    }

    const result =
      mode === "login"
        ? await login({ email, password })
        : await signup({ name, email, password });

    if (result.success) {
      navigate("/app", { replace: true });
      return;
    }

    if (result.fieldErrors) {
      setFieldErrors(result.fieldErrors);
    }

    if (result.message) {
      setGeneralError(result.message);
    } else if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
      setGeneralError("Please fix the highlighted fields and try again.");
    } else {
      setGeneralError("Unable to complete authentication. Please try again.");
    }
  };

  const handleContinueAsGuest = () => {
    continueAsGuest();
    navigate("/app", { replace: true });
  };

  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const formError = generalError || error || (hasFieldErrors ? "Please fix the highlighted fields and try again." : null);
  const isSignupMode = mode === "signup";
  const submitLabel = isSignupMode ? "Create account" : "Log in to YACS";
  const busyLabel = isSignupMode ? "Creating your account..." : "Logging you in...";
  const guestBusyLabel = "Preparing guest access...";
  const busyDescription = isSignupMode
    ? "We’re setting up your account and signing you in."
    : "We’re checking your credentials and loading your workspace.";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10 text-foreground">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

      <section className="relative z-10 w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl shadow-black/10">
        <div className="grid md:grid-cols-2">
          <div className="flex flex-col justify-between bg-header p-8 md:p-10">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">YACS</h1>
              <p className="mt-3 text-sm text-input-foreground/80">
                Plan your schedule, track your progress, and stay ready for the semester.
              </p>
            </div>
            <div className="mt-10 space-y-4">
              <p className="rounded-xl border border-border bg-background/80 p-4 text-sm">
                Save schedules, build a 4-year plan, and keep your classes organized in one place.
              </p>
              <button
                type="button"
                onClick={handleContinueAsGuest}
                disabled={isBusy}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isBusy ? (
                  <>
                    <Spinner className="size-4" />
                    {guestBusyLabel}
                  </>
                ) : (
                  "Continue as Guest"
                )}
              </button>
            </div>
          </div>

          <div className="p-8 md:p-10">
            <div className="mb-6 flex rounded-lg bg-background p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                disabled={isBusy}
                className={`w-1/2 rounded-md px-3 py-2 text-sm font-semibold transition ${
                  mode === "login" ? "bg-muted" : "hover:bg-muted/60"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                disabled={isBusy}
                className={`w-1/2 rounded-md px-3 py-2 text-sm font-semibold transition ${
                  mode === "signup" ? "bg-muted" : "hover:bg-muted/60"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                Sign up
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {isBusy && (
                <div className="flex items-start gap-3 rounded-lg border border-border/70 bg-background/80 px-3 py-3 text-sm text-input-foreground/80">
                  <Spinner className="mt-0.5 size-4 text-footer" />
                  <div>
                    <p className="font-semibold text-foreground">{busyLabel}</p>
                    <p>{busyDescription}</p>
                  </div>
                </div>
              )}

              {formError && (
                <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                  <p className="font-semibold mb-1">Error:</p>
                  <p>{formError}</p>
                  {mode === "login" && formError.toLowerCase().includes("sign up") && (
                    <p className="text-xs text-center mt-2">
                      <button
                        type="button"
                        onClick={() => setMode("signup")}
                        className="text-blue-500 hover:text-blue-400 font-semibold underline"
                      >
                        Click here to sign up
                      </button>
                    </p>
                  )}
                </div>
              )}

              {mode === "signup" && (
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium">Full name</span>
                  <input
                    value={name}
                    onChange={(event) => handleNameChange(event.target.value)}
                    placeholder="Jane Doe"
                    disabled={isBusy}
                    className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-input-foreground outline-none ring-blue-500 transition focus:ring-2"
                    required
                  />
                  {fieldErrors.name && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{fieldErrors.name}</p>
                  )}
                </label>
              )}

              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => handleEmailChange(event.target.value)}
                    placeholder="you@school.edu"
                    disabled={isBusy}
                    className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-input-foreground outline-none ring-blue-500 transition focus:ring-2"
                    required
                  />
                {fieldErrors.email && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{fieldErrors.email}</p>
                )}
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => handlePasswordChange(event.target.value)}
                    placeholder="********"
                    disabled={isBusy}
                    className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-input-foreground outline-none ring-blue-500 transition focus:ring-2"
                    required
                  />
                {fieldErrors.password && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{fieldErrors.password}</p>
                )}
              </label>

              <button
                type="submit"
                disabled={isBusy}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-footer px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed"
              >
                {isBusy
                  ? (
                    <>
                      <Spinner className="size-4" />
                      {busyLabel}
                    </>
                  )
                  : submitLabel}
              </button>
            </form>

            {!formError && mode === "login" && (
              <p className="mt-4 text-center text-xs text-input-foreground/70">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-blue-500 hover:text-blue-400 font-semibold"
                >
                  Sign up here
                </button>
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
