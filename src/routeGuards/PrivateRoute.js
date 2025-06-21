import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";

export function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null; // or show a spinner
  return user ? children : <Navigate to="/login" />;
}
