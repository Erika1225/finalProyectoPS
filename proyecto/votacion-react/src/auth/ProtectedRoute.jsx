import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuth } = useAuth();
  const hasToken = (() => { try { return !!localStorage.getItem('token'); } catch { return false; } })();
  if (!isAuth && !hasToken) return <Navigate to="/no-autorizado" replace />;
  return children;
}
