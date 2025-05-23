/**
 * @module ProtectedRoute
 * @description Módulo para proteger rutas que requieren autenticación
 * @requires react
 * @requires next/navigation
 * @requires js-cookie
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

/**
 * Hook personalizado para proteger rutas que requieren autenticación
 * @function useProtectedRoute
 * @description Verifica si existe un token JWT en las cookies y redirige al login si no existe
 * @returns {void}
 */
export const useProtectedRoute = () => {
  const router = useRouter();

  /**
   * Efecto que verifica la autenticación al montar el componente
   * @effect
   * @description Comprueba si existe un token JWT y redirige si no está autenticado
   */
  useEffect(() => {
    const token = Cookies.get("jwtToken");

    if (!token) {
      router.replace("/login");
    }
  }, [router]);
};