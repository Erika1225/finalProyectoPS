import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sendOtp, verifyOtp } from "../services/api";

export default function PhoneVerification() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const navigate = useNavigate();

  const dni = typeof window !== 'undefined' ? localStorage.getItem('dni') : null;

  useEffect(() => {
    if (!dni) {
      navigate('/', { replace: true });
    }
  }, [dni, navigate]);

  const onSend = async () => {
    if (!phone) return setError("Ingrese un número de teléfono en formato internacional, ej: +51999999999");
    setError(""); setInfo("");
    try {
      setSending(true);
      const res = await sendOtp(dni, phone);
      if (res?.ok) setInfo("Código enviado por SMS");
      else setError(res?.error || "No se pudo enviar el código");
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Error enviando OTP");
    } finally { setSending(false); }
  };

  const onVerify = async () => {
    if (!otp) return setError("Ingrese el código recibido por SMS");
    setError(""); setInfo("");
    try {
      setVerifying(true);
      const res = await verifyOtp(dni, phone, otp);
      if (res?.ok) {
        setInfo("Teléfono verificado");
        navigate('/verificacion/rostro');
      } else {
        setError(res?.error || "Código incorrecto");
      }
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Error verificando OTP");
    } finally { setVerifying(false); }
  };

  return (
    <div className="container-fluid vh-100 d-flex p-0">
      <div className="col-md-6 bg-dark text-white d-flex flex-column align-items-center justify-content-center">
        <div className="text-center p-4">
          <img src="/dni.png" alt="SMS" style={{ width: 220, marginBottom: 24, background: "#fff", padding: 12 }} />
          <h4 className="mb-3">Verificación de Teléfono</h4>
          {dni && <div className="small text-white-50">DNI: <b className="text-success">{dni}</b></div>}
        </div>
      </div>
      <div className="col-md-6 d-flex flex-column align-items-center justify-content-center p-4">
        <div style={{ maxWidth: 480, width: '100%' }}>
          {error && <div className="alert alert-danger">{error}</div>}
          {info && <div className="alert alert-success">{info}</div>}

          <div className="mb-3">
            <label className="form-label">Número de teléfono</label>
            <input className="form-control" placeholder="+51999999999" value={phone} onChange={e=>setPhone(e.target.value)} />
            <div className="form-text">Incluye el prefijo del país (ej: +51)</div>
          </div>
          <button className="btn btn-dark w-100 mb-3" onClick={onSend} disabled={sending || !phone}>
            {sending ? 'Enviando...' : 'Enviar código'}
          </button>

          <div className="mb-2">
            <label className="form-label">Código recibido</label>
            <input className="form-control" value={otp} onChange={e=>setOtp(e.target.value)} />
          </div>
          <button className="btn btn-success w-100" onClick={onVerify} disabled={verifying || !otp}>
            {verifying ? 'Verificando...' : 'Verificar y continuar'}
          </button>
        </div>
      </div>
    </div>
  );
}
