import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithDni, perudevsLookup, addressFetch } from "../services/api";

export default function Login() {
  const [dni, setDni] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!dni) {
      setError("Por favor ingrese su DNI");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      
      // 1) Login por DNI (guarda token y dni en localStorage)
      await loginWithDni(dni);

      // 2) Consultar PeruDevs (obtener fecha_nacimiento) y validar mayoría de edad
      try {
        const pd = await perudevsLookup(dni).catch(() => null);
        const birthStr = pd?.persona?.fecha_nacimiento; // formato esperado: DD/MM/YYYY
        // Exigir fecha de nacimiento para continuar
        if (!birthStr) {
          setError("Solo esta permitido votar a mayores de edad");
          return; // Detener flujo si no podemos validar la mayoría de edad
        }
        if (birthStr) {
          const [dd, mm, yyyy] = birthStr.split("/");
          const birthDate = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
          if (age < 18) {
            setError("Debes ser mayor de edad para continuar");
            return; // Detener flujo
          }
        }
        // Guardar algunos datos opcionales
        if (pd?.persona) {
          localStorage.setItem("persona_nombre", pd.persona.nombre_completo || "");
          localStorage.setItem("persona_genero", pd.persona.genero || "");
          localStorage.setItem("persona_fnac", birthStr || "");
        }
      } catch {
        // Si falla PeruDevs, no impedimos el flujo (política de tolerancia)
      }

      // 3) Dirección/distrito (no bloqueante)
      addressFetch(dni)
        .then(addr => {
          if (addr?.distrito) localStorage.setItem("persona_distrito", addr.distrito || "");
        })
        .catch(() => {});

      // 4) Ir a verificación por teléfono (OTP)
      navigate("/verificacion/telefono");
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError(err.response?.data?.error || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  // Manejar la tecla Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex" style={{ backgroundColor: "#f4f4f4" }}>
      {/* Sección izquierda */}
      <div className="col-md-6 bg-dark text-white d-flex flex-column justify-content-center align-items-center">
        <div
          className="d-flex align-items-center justify-content-center shadow-sm"
          style={{ width: 280, height: 280, borderRadius: 8, backgroundColor: "#e5e7eb" }}
        >
          <img 
            src="/onpe.png" 
            alt="ONPE" 
            style={{ width: 200 }} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/200x200?text=ONPE';
            }}
          />
        </div>
        <h2 className="mt-4 fw-bold">Bienvenido</h2>
        <p className="mb-0">Sistema de Votación</p>
      </div>

      {/* Sección derecha */}
      <div className="col-md-6 d-flex flex-column justify-content-center align-items-center px-5">
        <h1 className="display-5 fw-bold text-center mb-5">Iniciar sesión</h1>

        <div className="w-100" style={{ maxWidth: 420 }}>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          <div className="mb-3">
            <label htmlFor="dni" className="form-label">Número de DNI</label>
            <input
              id="dni"
              type="text"
              className="form-control form-control-lg"
              placeholder="Ingrese su DNI"
              value={dni}
              onChange={(e) => setDni(e.target.value.replace(/\D/g, '').substring(0, 8))}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <div className="form-text">Ingrese su número de DNI (8 dígitos)</div>
          </div>
          
          <button 
            type="button" 
            className="btn btn-dark btn-lg w-100 py-2" 
            onClick={handleLogin}
            disabled={loading || !dni}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Verificando...
              </>
            ) : (
              'Continuar'
            )}
          </button>
          
          <button
            type="button"
            className="btn btn-link w-100 mt-2"
            onClick={() => navigate("/registro")}
          >
            Registrarse
          </button>
        </div>
      </div>
    </div>
  );
}
