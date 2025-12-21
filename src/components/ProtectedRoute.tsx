import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Redirect to Learning Center if not authenticated
    return <Navigate to="/learning" replace />;
  }

  return <>{children}</>;
}
