// middleware.ts
// VERSIÓN: 8.6 (NicePod Access Protocol - Safe Corridor Edition)
// Misión: Orquestar el acceso protegiendo la plataforma sin interferir en el proceso de login.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * middleware: Único punto de control de tráfico de la infraestructura.
 */
export async function middleware(request: NextRequest) {
  // 1. Inicialización de respuesta base
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const url = new URL(request.url);
  const pathname = url.pathname;

  /**
   * [PASILLO DE SEGURIDAD]:
   * Si la ruta es el callback de autenticación o assets críticos, 
   * devolvemos la respuesta inmediatamente sin tocar Supabase.
   * Esto previene el error '(cancelado)' al evitar ráfagas de validación.
   */
  if (pathname.startsWith('/auth') || pathname.includes('manifest.json')) {
    return response;
  }

  // 2. Cliente Supabase SSR con Sincronía de Cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });

          // Refrescamos la instancia de respuesta para los Server Components
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  /**
   * 3. VALIDACIÓN DE IDENTIDAD
   * getUser() asegura integridad total contra el servidor de Auth.
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- MAPEO DE RUTAS OPERATIVAS ---
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isPlatformPage =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/create') ||
    pathname.startsWith('/podcasts') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/geo') ||
    pathname.startsWith('/map') ||
    pathname.startsWith('/admin');

  /**
   * 4. LÓGICA DE REDIRECCIÓN SOBERANA
   */

  // Bloqueo de intrusos en la plataforma
  if (!user && isPlatformPage) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Expulsión de usuarios logueados de las páginas de acceso
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirección de eficiencia: de Landing a Dashboard si ya hay sesión
  if (user && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

/**
 * MATCHER: Blindaje de Assets
 */
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-.*|apple-touch-icon.png|icon.png|icon.svg|offline|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};