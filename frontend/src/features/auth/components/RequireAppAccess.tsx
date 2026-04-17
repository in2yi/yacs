import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function RequireAppAccess() {
  const { isAuthenticated, isGuest, isHydrating } = useAuth();

  if (isHydrating) {
    return <div className="p-6 text-sm text-input-foreground/70">Checking your session...</div>;
  }

  if (!isAuthenticated && !isGuest) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
