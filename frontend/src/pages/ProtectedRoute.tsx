import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { JSX } from "react";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;