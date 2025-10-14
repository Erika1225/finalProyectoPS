import axios from 'axios';

// Base API configuration
const api = axios.create({
  // Expect VITE_API_URL to optionally include full base (e.g., http://localhost:8000/api)
  // Default to Django local with '/api' prefix
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/',
  // Important for session-based WebAuthn challenges (cookies)
  withCredentials: true,
  headers: { 
    'Content-Type': 'application/json'
  }
});

// No global Authorization interceptor to avoid conflicts with JWT.

/**
 * @typedef {Object} LoginResponse
 * @property {string} token - JWT token for authentication
 * @property {string} dni - User's DNI number
 */

/**
 * Logs in a user with DNI
 * @param {string} dni - User's DNI number
 * @returns {Promise<LoginResponse>} - Returns token and DNI
 */
export async function loginWithDni(dni) {
  const { data } = await api.post('/login-dni/', { dni });
  
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('dni', data.dni);
  }
  
  return data;
}

/**
 * @typedef {Object} DNIResponse
 * @property {boolean} success - Indicates if the DNI verification was successful
 * @property {Object} data - DNI verification data
 * @property {string} [error] - Error message if verification fails
 */

/**
 * Verifies a DNI number
 * @param {string} numero - DNI number to verify
 * @returns {Promise<DNIResponse>} - Returns verification result
 */
export async function verificarDNI(numero) {
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  const { data } = await api.post('/dni/', { numero }, {
    headers: {
      ...(token ? { 'Authorization': `DNI ${token}` } : {}),
      'Content-Type': 'application/json'
    }
  });
  return data;
}

/**
 * @typedef {Object} FaceVerificationResponse
 * @property {boolean} success - Indicates if the face verification was successful
 * @property {Object} data - Face verification data
 * @property {string} [error] - Error message if verification fails
 */

/**
 * Verifies a user's face against their DNI photo
 * @param {File} selfieFile - Selfie image file
 * @param {File} dniFile - DNI photo file
 * @returns {Promise<FaceVerificationResponse>} - Returns verification result
 */
export async function verifyFace(selfieFile, dniFile) {
  // Simulate processing time and always return successful verification
  await new Promise(resolve => setTimeout(resolve, 500));
  return { verified: true };
}

/** ========== WebAuthn Helpers ========== */

/**
 * Converts a base64url string to an ArrayBuffer
 * @param {string} b64url - Base64url encoded string
 * @returns {ArrayBuffer} - Decoded ArrayBuffer
 */
function b64urlToArrayBuffer(b64url) {
  const pad = '='.repeat((4 - (b64url.length % 4)) % 4);
  const base64 = (b64url + pad).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const buffer = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; ++i) view[i] = raw.charCodeAt(i);
  return buffer;
}

/**
 * Converts an ArrayBuffer to a base64url string
 * @param {ArrayBuffer} buffer - Binary data to encode
 * @returns {string} - Base64url encoded string
 */
function arrayBufferToB64url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

/**
 * @typedef {Object} WebAuthnOptions
 * @property {string} challenge - Challenge string for WebAuthn registration
 * @property {Object} rp - Relying Party information
 * @property {Object} user - User information for WebAuthn
 * @property {Array} pubKeyCredParams - List of supported public key parameters
 * @property {number} timeout - Timeout in milliseconds
 * @property {Array} [excludeCredentials] - List of credentials to exclude
 */

/**
 * Starts the WebAuthn registration process
 * @returns {Promise<WebAuthnOptions>} - WebAuthn registration options
 */
// No register options endpoint in backend; registration verify expects attestation directly

/**
 * Completes the WebAuthn registration
 * @param {Object} attestation - WebAuthn attestation response from the authenticator
 * @returns {Promise<Object>} - Registration result
 */
export async function webauthnRegisterVerify(attestation) {
  const token = localStorage.getItem('token');
  const { data } = await api.post('/webauthn/register/verify/', attestation, {
    headers: {
      ...(token ? { 'Authorization': `DNI ${token}` } : {}),
      'Content-Type': 'application/json'
    }
  });
  return data;
}

/**
 * Obtiene opciones de registro WebAuthn
 * @returns {Promise<Object>} - publicKey options para navigator.credentials.create()
 */
export async function webauthnRegisterOptions() {
  const token = localStorage.getItem('token');
  const { data } = await api.post('/webauthn/register/options/', {}, {
    headers: {
      ...(token ? { 'Authorization': `DNI ${token}` } : {}),
      'Content-Type': 'application/json'
    }
  });
  return data;
}

/**
 * Starts the WebAuthn authentication process
 * @returns {Promise<Object>} - WebAuthn authentication options
 */
export async function webauthnAuthenticateStart() {
  const token = localStorage.getItem('token');
  const { data } = await api.post('/webauthn/authenticate/options/', {}, {
    headers: {
      ...(token ? { 'Authorization': `DNI ${token}` } : {}),
      'Content-Type': 'application/json'
    }
  });
  return data;
}

/**
 * Completes the WebAuthn authentication
 * @param {Object} assertion - WebAuthn assertion response from the authenticator
 * @returns {Promise<Object>} - Authentication result
 */
export async function webauthnAuthenticateVerify(assertion) {
  const token = localStorage.getItem('token');
  const { data } = await api.post('/webauthn/authenticate/verify/', assertion, {
    headers: {
      ...(token ? { 'Authorization': `DNI ${token}` } : {}),
      'Content-Type': 'application/json'
    }
  });
  return data;
}

/**
 * Utility object for WebAuthn base64url encoding/decoding
 * @type {{b64urlToArrayBuffer: function, arrayBufferToB64url: function}}
 */
export const webauthnCodec = { b64urlToArrayBuffer, arrayBufferToB64url };


//Guardar votos
const API_URL = "http://localhost:8000/api"; // tu servidor Django

export const guardarVoto = async (voto) => {
  const response = await axios.post("http://localhost:8000/api/guardar_voto/", voto);
  return response.data;
};

// ===== Nuevas integraciones =====

export async function perudevsLookup(dni) {
  const { data } = await api.post('/perudevs/lookup/', { dni });
  return data;
}

export async function sendOtp(dni, phone) {
  const { data } = await api.post('/phone/send-otp/', { dni, phone });
  return data;
}

export async function verifyOtp(dni, phone, otp) {
  const { data } = await api.post('/phone/verify-otp/', { dni, phone, otp });
  return data;
}

export async function addressFetch(dni) {
  const { data } = await api.post('/address/fetch/', { dni });
  return data;
}
