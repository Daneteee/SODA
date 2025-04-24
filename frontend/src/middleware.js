import { NextResponse } from 'next/server';

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

// Configurar las rutas que usarán el middleware
export const config = {
  matcher: '/:path*',
};