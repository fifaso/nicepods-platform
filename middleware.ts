// middleware.ts
// VERSIÓN: 17.2 (NicePod Traffic Control - Supreme Integrity Edition)
// Misión: Orquestar la identidad atómica y gobernar el acceso con validación activa.
// [ESTABILIZACIÓN]: Migración a getUser() para eliminar advertencias de seguridad y bucles.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * EXPORTACIÓN PRINCIPAL: middleware
 * Actúa como la aduana de seguridad en el Edge de Vercel antes de procesar cualquier ruta.
 */
export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // 1. [PROTOCOLO DE EXORCISMO]: LIMPIEZA DE RASTRO PWA
  // Interceptamos activamente las peticiones al Service Worker residual
  // e inyectamos la orden de purga de caché en el navegador del usuario.
  if (
    pathname.includes('sw.js') ||
    pathname.includes('workbox-') ||
    pathname.includes('fallback-')
  ) {
    const purgeResponse = NextResponse.next();
    // Borra físicamente el caché y los contextos de ejecución obsoletos del móvil
    purgeResponse.headers.set('Clear-Site-Data', '"cache", "storage", "executionContexts"');
    return applySecurityHeaders(purgeResponse);
  }

  // 2. [VACUNA DE ENRUTAMIENTO]: REDIRECCIÓN PERMANENTE (308)
  // Saneamos el historial de navegación moviendo el tráfico de /geo a /map.
  if (pathname === '/geo' || pathname.startsWith('/geo/')) {
    url.pathname = '/map';
    return NextResponse.redirect(url, 308);
  }

  // 3. INICIALIZACIÓN DE RESPUESTA
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // 4. PASILLO DE BYPASS (Velocidad para Activos Estáticos)
  // No ejecutamos lógica de base de datos para imágenes, iconos o manifiestos.
  if (
    pathname.startsWith('/auth') ||
    pathname.includes('manifest.json') ||
    pathname.includes('favicon.ico') ||
    pathname.includes('apple-touch-icon') ||
    pathname.match(/\.(png|jpg|jpeg|svg|webp|woff2)$/)
  ) {
    return applySecurityHeaders(response);
  }

  // 5. INSTANCIACIÓN DEL CLIENTE SOBERANO (SSR)
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
            // Sincronía atómica de cookies entre petición y respuesta
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  /**
   * 6. VALIDACIÓN ACTIVA DE IDENTIDAD (T0 - ACTIVE CHECK)
   * [CAMBIO ESTRATÉGICO]: Sustituimos getSession() por getUser().
   * Esto elimina la advertencia de Vercel y garantiza que el token sea verificado
   * directamente con el servidor de Supabase Auth en cada navegación. 
   * Esto aniquila los bucles de redirección donde el cliente cree que es 
   * Admin pero el servidor no lo ha confirmado.
   */
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  // --- DEFINICIÓN DE PERÍMETROS OPERATIVOS ---
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isLandingPage = pathname === '/';

  // [ZONA SOBERANA]: Exclusiva para el Administrador
  const isSovereignRoute = pathname.startsWith('/admin') || pathname.startsWith('/theme-test');

  // [ZONA PROTEGIDA]: Requiere sesión activa
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/podcasts') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/collection') ||
    pathname.startsWith('/create') ||
    pathname.startsWith('/map') ||
    isSovereignRoute;

  /**
   * ---------------------------------------------------------------------------
   * II. LÓGICA DE REDIRECCIÓN Y GOBERNANZA
   * ---------------------------------------------------------------------------
   */

  // A. PROTECCIÓN CONTRA INVITADOS: Expulsión a Login
  if (!user && isProtectedRoute) {
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // B. PROTECCIÓN CONTRA INTRUSOS: Expulsión de Zonas Admin
  if (user && isSovereignRoute) {
    const appMetadata = user.app_metadata || {};
    const userRole = appMetadata.user_role || appMetadata.role || 'user';

    if (userRole !== 'admin') {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url, 307);
    }
  }

  // C. OPTIMIZACIÓN DE FLUJO: Redirección post-autenticación
  if (user && (isAuthPage || isLandingPage)) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url, 307);
  }

  // 7. CIERRE ESTRUCTURAL: INYECCIÓN DE CABECERAS DE SEGURIDAD
  return applySecurityHeaders(response);
}

/**
 * HELPER: applySecurityHeaders
 * Misión: Blindar la respuesta HTTP con las directivas de seguridad NicePod.
 */
function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  return res;
}

/**
 * CONFIGURACIÓN DEL MATCHER
 */
export const config = {
  matcher: [
    // Interceptamos todo excepto la API nativa de Next.js
    '/((?!api|_next/static|_next/image).*)'
  ],
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (V17.2):
 * 1. Cumplimiento de Seguridad: El uso de 'supabase.auth.getUser()' es el estándar 
 *    de oro. Aunque consume unos milisegundos más de red, elimina el riesgo de 
 *    falsificación de identidad por cookies cacheadas en el móvil.
 * 2. Purga Remota: La cabecera 'Clear-Site-Data' en el bloque de sw.js es una 
 *    herramienta de gestión de flota. Limpiará los navegadores de sus usuarios 
 *    sin que ellos tengan que hacer nada manual, resolviendo errores de red de raíz.
 * 3. Robusto ante Redirecciones: Al clonar la URL con 'request.nextUrl.clone()', 
 *    aseguramos que las redirecciones mantengan los parámetros de búsqueda 
 *    (searchParams) necesarios para el flujo de 'redirect back'.
 */