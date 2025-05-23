"use client";

/**
 * @module AuthContext
 * @description Proveedor de contexto para la autenticación de usuarios en la aplicación
 * @requires react
 * @requires js-cookie
 * @requires next/navigation
 */

import { createContext, useState, useEffect, useContext } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

/**
 * Contexto para la autenticación de usuarios
 * @type {React.Context}
 */
const AuthContext = createContext(null);

/**
 * Componente proveedor que gestiona la autenticación de usuarios
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos que tendrán acceso al contexto
 * @returns {React.ReactElement} Proveedor de contexto de autenticación
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Verifica el estado de autenticación del usuario al cargar la aplicación
   * @function checkAuthStatus
   * @async
   * @description Comprueba si hay una sesión activa utilizando las cookies existentes
   */
  const checkAuthStatus = async () => {
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/me", {
        credentials: 'include',
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      }
    } catch (error) {
      setUser(null);
    }
  };

  /**
   * Obtiene los datos del usuario autenticado
   * @function fetchUser
   * @async
   * @param {string|null} token - Token JWT opcional para la autenticación
   * @description Realiza una petición al servidor para obtener los datos del usuario actual
   */
  const fetchUser = async (token = null) => {
    try {
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/me", {
        credentials: 'include',
        headers,
      });

      if (!res.ok) throw new Error("Token inválido");

      const userData = await res.json();
      setUser(userData);
    } catch (error) {
      setUser(null);
    }
  };

  /**
   * Inicia sesión de usuario
   * @function login
   * @param {string} token - Token JWT recibido al autenticarse
   * @description Obtiene los datos del usuario y redirige al dashboard
   */
  const login = (token) => {
    fetchUser();
    router.push("/dashboard");
  };

  /**
   * Cierra la sesión del usuario
   * @function logout
   * @async
   * @description Elimina la sesión en el servidor, limpia el estado y redirige al login
   */
  const logout = async () => {
    try {
      await fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/logout", {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook personalizado para acceder al contexto de autenticación
 * @function useAuth
 * @returns {Object} Objeto con el usuario actual y funciones de autenticación
 * @throws {Error} Si se utiliza fuera de un AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};