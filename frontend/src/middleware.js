/**
 * @module middleware
 * @description Middleware de Next.js para control de autenticación y redirecciones
 * @requires next/server
 */

import { NextResponse } from 'next/server';

/**
 * Middleware que se ejecuta en cada petición para verificar la autenticación
 * @function middleware
 * @param {Request} request - Objeto de petición de Next.js
 * @returns {NextResponse} Respuesta que puede ser una redirección o continuar con la petición
 * @description Verifica si el usuario está autenticado mediante un token JWT y redirige según corresponda
 */
export function middleware(request) {
  // Obtener el token desde la cookie
  const token = request.cookies.get('jwtToken')?.value;

  // Verificar si el token existe y extraer su fecha de expiración
  let isTokenValid = false;

  if (token) {
    try {
      // Decodificar el payload del JWT (segunda parte del token)
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString()
      );

      // Verificar la expiración (exp está en segundos desde la época Unix)
      isTokenValid = payload.exp && payload.exp * 1000 > Date.now();
    } catch (error) {
      // Si hay un error al decodificar, asumimos que el token no es válido
      isTokenValid = false;
    }
  }

  // Verificar si la ruta requiere autenticación
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Si no hay token válido, redirigir al login
    if (!isTokenValid) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // Si es la página de login y ya hay un token válido, redirigir al dashboard
  if (request.nextUrl.pathname === '/login' && isTokenValid) {
    return NextResponse.redirect(new URL('/dashboard/market', request.url));
  }

  return NextResponse.next();
}

/**
 * Configuración del middleware
 * @constant {Object} config
 * @property {string} matcher - Patrón de rutas donde se aplicará el middleware
 * @description Define en qué rutas se ejecutará el middleware
 */
export const config = {
  matcher: '/:path*',
};