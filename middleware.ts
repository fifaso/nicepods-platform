// middleware.ts
// VERSIÓN: 9.0 (NicePod Access Protocol - Role-Based Authority Edition)
// Misión: Orquestar el acceso soberano, blindar el área administrativa y sincronizar la identidad en el borde.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * middleware: Único punto de control de tráfico de la infraestructura NicePod.
 */
export async function middleware(request: NextRequest) {
  // 1. INICIALIZACIÓN DE RESPUESTA BASE
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const url = new URL(request.url);
  const pathname = url.pathname;

  /**
   * [PASILLO DE SEGURIDAD]:
   * Bypasseamos el middleware para rutas de autenticación nativa y assets críticos.
   * Esto previene el error 'cancelled' en intercambios de tokens OAuth y carga de PWA.
   */
  if (
    pathname.startsWith('/auth') ||
    pathname.includes('manifest.json') ||
    pathname.includes('sw.js')
  ) {
    return response;
  }

  // 2. CLIENTE SUPABASE SSR CON SINCRONÍA DE COOKIES
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          // Sincronizamos cookies en la petición y en la respuesta simultáneamente
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });

          /**
           * RE-INSTANCIACIÓN TÁCTICA:
           * Forzamos una nueva instancia de NextResponse para que los Server Components
           * posteriores hereden el estado de cookies actualizado en este mismo ciclo.
           */
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
   * 3. VALIDACIÓN DE IDENTIDAD SOBERANA
   * getUser() realiza una validación contra el servidor de Auth de Supabase, 
   * garantizando que el JWT no haya sido manipulado.
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- MAPEO DE RUTAS OPERATIVAS ---
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isAdminPage = pathname.startsWith('/admin');
  const isPlatformPage =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/create') ||
    pathname.startsWith('/podcasts') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/geo') ||
    pathname.startsWith('/map') ||
    isAdminPage;

  /**
   * 4. LÓGICA DE REDIRECCIÓN Y AUTORIZACIÓN (RBAC)
   */

  // A. Bloqueo de intrusos: Si no hay usuario y la ruta es protegida.
  if (!user && isPlatformPage) {
    const redirectUrl = new URL('/login', request.url);
    // Preservamos la intención original para re-dirigir tras el login
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // B. Protección Administrativa: Si hay usuario pero intenta acceder a /admin sin rol.
  if (user && isAdminPage) {
    const userRole = user.app_metadata?.user_role || user.user_metadata?.role;
    if (userRole !== 'admin') {
      console.warn(`🛑 [Auth-Security] Intento de acceso no autorizado a /admin por: ${user.email}`);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // C. Eficiencia de Sesión: Expulsión de usuarios logueados de las páginas de acceso.
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // D. Redirección de Inicio: De la Landing al Dashboard si ya hay sesión activa.
  if (user && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

/**
 * MATCHER: Blindaje de Assets y Rutas del Sistema
 * Filtra qué rutas deben pasar por el middleware. Excluye estáticos y APIs internas.
 */
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-.*|apple-touch-icon.png|icon.png|icon.svg|offline|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};