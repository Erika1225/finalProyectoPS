import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyFace } from "../services/api";

export default function FacialVerification() {
  const [selfie, setSelfie] = useState(null);
  const [dniImg, setDniImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onVerify = async () => {
    if (!selfie || !dniImg) return alert("Selecciona ambos archivos (selfie y DNI).");
    try {
      setLoading(true);
      const data = await verifyFace(selfie, dniImg);
      if (data?.verified) { setOk(true); setError(""); }
      else { setOk(false); setError(data?.error || "No coincide la verificación facial."); }
    } catch (e) {
      console.error(e);
      setOk(false);
      setError(e?.response?.data?.error || "Error al verificar rostro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex p-0">
      <div className="col-md-6 bg-dark text-white d-flex flex-column align-items-center justify-content-center">
        <div className="text-center p-4">
          <img src="/dactilar.png" alt="Face" style={{ width: 220, marginBottom: 24, background: "#fff", padding: 12 }} />
          <h4 className="mb-3">Validación Facial (Selfie vs DNI)</h4>
          <div className="mb-2">Selfie (JPG/PNG): <input type="file" accept="image/*" onChange={e=>setSelfie(e.target.files?.[0] || null)} /></div>
          <div className="mb-3">Foto del DNI (JPG/PNG): <input type="file" accept="image/*" onChange={e=>setDniImg(e.target.files?.[0] || null)} /></div>
          <button className="btn btn-secondary" onClick={onVerify} disabled={loading}>
            { loading ? "Verificando..." : "Verificar" }
          </button>
          { ok && <div className="alert alert-success mt-3">Rostro verificado correctamente.</div> }
          { !!error && <div className="alert alert-danger mt-3">Error: {error}</div> }
        </div>
      </div>
      <div className="col-md-6 d-flex flex-column align-items-center justify-content-center">
        <div style={{ maxWidth: 520 }}>
          <h2 className="mb-3">Paso 3: Verificación Facial</h2>
          <p>Sube tu selfie y una foto del DNI. Comprobaremos si coinciden.</p>
          <div className="mt-4 d-flex justify-content-center">
            <button className="btn btn-dark btn-lg px-4" disabled={!ok} onClick={() => navigate("/votar")}>
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
