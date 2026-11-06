import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/app" replace />;
  return children;
}
