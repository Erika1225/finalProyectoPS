import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerificationSelection from "./pages/VerificationSelection";
import ValidacionDNI from "./pages/ValidacionDNI"; // used for rostro
import DniCheck from "./pages/DniCheck"; // DNI API check step
import PhoneVerification from "./pages/PhoneVerification";
import Votacion from "./pages/votacion";
import Confirmacion from "./pages/confirmation";
import Reportes from "./pages/reportes";
import NoAutorizado from "./pages/NoAutorizado";
import ProtectedRoute from "./auth/ProtectedRoute";
import StepGuard from "./auth/StepGuard";
import BioGuard from "./auth/BioGuard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/verificacion" element={<VerificationSelection />} />
      <Route path="/verificacion/dni" element={<DniCheck />} />
      <Route path="/verificacion/telefono" element={<PhoneVerification />} />
      <Route path="/verificacion/rostro" element={<ValidacionDNI />} />
      <Route path="/votacion" element={<Votacion />}/>
      <Route path="/confirmacion" element={<Confirmacion />} />
      <Route path="/reportes" element={<ProtectedRoute><Reportes /></ProtectedRoute>} />
      <Route path="/no-autorizado" element={<NoAutorizado />} />
    </Routes>
  );
}
