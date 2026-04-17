import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function RequireAuthenticated() {
  const { isAuthenticated, isGuest, isHydrating } = useAuth();

  if (isHydrating) {
    return <div className="p-6 text-sm text-input-foreground/70">Checking your session...</div>;
  }

  if (isAuthenticated) {
    return <Outlet />;
  }

  if (isGuest) {
    return <Navigate to="/app" replace />;
  }

  return <Navigate to="/" replace />;
}
