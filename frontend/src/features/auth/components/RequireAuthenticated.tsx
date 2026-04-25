import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { LoadingPanel } from "@/components/ui/LoadingPanel";

export default function RequireAuthenticated() {
  const { isAuthenticated, isGuest, isHydrating } = useAuth();

  if (isHydrating) {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <LoadingPanel
          title="Checking your session"
          description="We’re making sure this page is ready for your account."
          className="w-full max-w-xl"
        />
      </main>
    );
  }

  if (isAuthenticated) {
    return <Outlet />;
  }

  if (isGuest) {
    return <Navigate to="/app" replace />;
  }

  return <Navigate to="/" replace />;
}
