import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuth, setIsAuth] = useState(() => localStorage.getItem("isAuth") === "true");
  const login = async (dni) => { await import('../services/api').then(m => m.loginWithDni(dni)); localStorage.setItem('isAuth', 'true'); setIsAuth(true); };
  const logout = () => { localStorage.removeItem("isAuth"); setIsAuth(false); };

  return (
    <AuthContext.Provider value={{ isAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
