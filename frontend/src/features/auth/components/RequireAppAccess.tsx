import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { LoadingPanel } from "@/components/ui/LoadingPanel";

export default function RequireAppAccess() {
  const { isAuthenticated, isGuest, isHydrating } = useAuth();

  if (isHydrating) {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <LoadingPanel
          title="Checking your session"
          description="Hang tight while we confirm your access and restore your workspace."
          className="w-full max-w-xl"
        />
      </main>
    );
  }

  if (!isAuthenticated && !isGuest) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
