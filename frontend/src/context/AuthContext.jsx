import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

// Función para verificar si el token está expirado
const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true; // Si no se puede decodificar, considerarlo expirado
  }
};

// Función para verificar si el token expirará pronto (en los próximos 5 minutos)
const isTokenExpiringSoon = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const fiveMinutesFromNow = currentTime + (5 * 60);
    return decoded.exp < fiveMinutesFromNow;
  } catch (error) {
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const storedToken = localStorage.getItem("token");

  const [token, setToken] = useState(storedToken);
  const [user, setUser] = useState(
    storedToken && !isTokenExpired(storedToken) ? jwtDecode(storedToken) : null
  );

  // Función para limpiar datos de autenticación
  const clearAuth = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const login = (newToken) => {
    try {
      const decoded = jwtDecode(newToken);

      // Verificar que el token tenga la estructura esperada
      if (!decoded.id || !decoded.role || !decoded.exp) {
        throw new Error("Token inválido");
      }

      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(decoded);
    } catch (error) {
      console.error("Error al procesar token de login:", error);
      clearAuth();
      throw new Error("Token inválido recibido del servidor");
    }
  };

  const logout = () => {
    clearAuth();
    // Opcional: llamar a endpoint de logout en el backend
    // await api.post('/auth/logout');
  };

  // Efecto para verificar token periódicamente
  useEffect(() => {
    if (!token) return;

    const checkToken = () => {
      if (isTokenExpired(token)) {
        console.log("Token expirado, cerrando sesión");
        logout();
        // Opcional: mostrar notificación al usuario
        alert("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
      } else if (isTokenExpiringSoon(token)) {
        console.log("El token expirará pronto");
        // Aquí podrías implementar renovación automática de token
        // refreshToken();
      }
    };

    // Verificar inmediatamente
    checkToken();

    // Verificar cada minuto
    const interval = setInterval(checkToken, 60 * 1000);

    return () => clearInterval(interval);
  }, [token]);

  // Efecto para manejar cambios en localStorage (por si se modifica desde otra pestaña)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        if (e.newValue) {
          try {
            const decoded = jwtDecode(e.newValue);
            setToken(e.newValue);
            setUser(decoded);
          } catch (error) {
            clearAuth();
          }
        } else {
          clearAuth();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{
      token,
      user,
      login,
      logout,
      isAuthenticated: !!token && !!user && !isTokenExpired(token)
    }}>
      {children}
    </AuthContext.Provider>
  );
};
