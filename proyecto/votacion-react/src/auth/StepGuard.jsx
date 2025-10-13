import { Navigate, useLocation } from "react-router-dom";

export default function StepGuard({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const faceVerified = localStorage.getItem("face_verified") === "1";

  // 1) Debe estar logueado
  if (!token) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  // 2) Debe haber completado verificación de DNI/rostro antes de biometría
  if (!faceVerified) {
    return <Navigate to="/verificacion/dni" replace state={{ from: location }} />;
  }
  return children;
}
