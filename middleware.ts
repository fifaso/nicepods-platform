// middleware.ts
// VERSIÓN: 8.5 (NicePod Access Protocol - Multi-Domain Shield)
// Misión: Gestionar el túnel de acceso, sincronizar la persistencia de cookies y prevenir bucles de redirección.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * [NICEPOD ACCESS PROTOCOL V2.5]
 * Este orquestador intercepta cada petición al borde (Edge) para validar la soberanía del usuario.
 */
export async function middleware(request: NextRequest) {
  // 1. Inicializamos la respuesta base manteniendo los encabezados de la petición
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Cliente Supabase SSR con Gestión de Cookies Blindada
  // El uso de setAll garantiza que los tokens refrescados se inyecten tanto en la petición (para Next.js)
  // como en la respuesta (para el Navegador).
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          // Sincronización dual de cookies
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });

          // Re-generamos la respuesta para asegurar que los Server Components reciban las cookies frescas
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          // Aplicamos nuevamente las cookies a la instancia final de respuesta
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  /**
   * 3. VALIDACIÓN DE IDENTIDAD SOBERANA
   * Utilizamos getUser() en lugar de getSession() porque realiza una validación real 
   * contra el servidor de Auth, evitando la suplantación por manipulación local de cookies.
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = new URL(request.url);
  const pathname = url.pathname;

  // --- MAPA DE RUTAS ESTRATÉGICAS ---

  // Rutas de Acceso (Túnel de Auth)
  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password');

  // Rutas de la Workstation (Zona Protegida)
  const isPlatformRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/create') ||
    pathname.startsWith('/podcasts') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/geo') ||
    pathname.startsWith('/map') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/collection') ||
    pathname.startsWith('/compass');

  // Rutas Públicas de Marca (Marketing)
  const isPublicMarketingRoute = pathname === '/' || pathname === '/pricing';

  /**
   * 4. MOTOR DE REDIRECCIÓN DINÁMICA (Resolución de Conflictos)
   */

  // REGLA 1: Blindaje de la Workstation
  // Si un usuario no autenticado intenta entrar a la plataforma, lo enviamos al login
  // preservando su intención original en el parámetro 'redirect'.
  if (!user && isPlatformRoute) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // REGLA 2: Prevención de Duplicidad en Auth
  // Si un usuario ya está logueado, no debe ver las páginas de login/signup.
  // Lo enviamos directo a su Centro de Mando (Dashboard).
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // REGLA 3: Salto de Landing para Usuarios Activos
  // Si el usuario está logueado y entra a la Landing Page (raíz), 
  // aceleramos su acceso enviándolo directamente al Dashboard.
  if (user && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

/**
 * CONFIGURACIÓN DEL MATCHER (PROTECCIÓN DE INFRAESTRUCTURA)
 * Excluimos rastro de assets, PWA y servicios internos para maximizar la velocidad del Edge.
 */
export const config = {
  matcher: [
    /*
     * Matcher Negativo:
     * - Excluye archivos estáticos de Next.js (_next/static, _next/image)
     * - Excluye manifiesto y service workers de la PWA (manifest.json, sw.js)
     * - Excluye el favicon e iconos del sistema
     * - Excluye extensiones de imagen comunes
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-.*|apple-touch-icon.png|icon.png|icon.svg|offline|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};