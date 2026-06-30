import { Navigate, Outlet } from "react-router";
import { getToken, getUser } from "../lib/auth";

/**
 * requireRegistered (default true):
 *   true  → user must be authenticated AND isRegistered=true
 *   false → user must be authenticated but isRegistered=false (registration step)
 */
export default function ProtectedRoute({
  requireRegistered = true,
}: {
  requireRegistered?: boolean;
}) {
  const token = getToken();
  const user = getUser();

  // Not authenticated → send to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated, needs registration step but already registered → skip to home
  if (!requireRegistered && user.isRegistered) {
    return <Navigate to="/home" replace />;
  }

  // Authenticated, requires registration but not yet registered → send to register
  if (requireRegistered && !user.isRegistered) {
    return <Navigate to="/register" replace />;
  }

  return <Outlet />;
}
