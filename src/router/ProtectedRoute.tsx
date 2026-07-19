import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuthUser } from "../hooks/useAuthUser";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuthUser();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
