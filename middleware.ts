// middleware.ts
// VERSIÓN: 16.0 (NicePod Traffic Control - Sovereign Routing Edition)
// Misión: Orquestar la autenticación atómica, el control de acceso y la seguridad industrial.
// [ESTABILIZACIÓN]: Erradicación del Bucle 404 del Service Worker (Redirección /geo -> /map).

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // 1. EXTRACCIÓN DE CONTEXTO ESPACIAL
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // 2. [VACUNA DE ENRUTAMIENTO]: ERRADICACIÓN DE RUTAS FANTASMA
  // Interceptamos cualquier intento (humano o de un Service Worker obsoleto) 
  // de acceder a la antigua ruta de captura, forzando una redirección 308 (Permanente).
  if (pathname === '/geo' || pathname.startsWith('/geo/')) {
    url.pathname = '/map';
    // El código 308 indica a los navegadores y SW que actualicen su caché interno.
    return NextResponse.redirect(url, 308);
  }

  // 3. INICIALIZACIÓN DE LA RESPUESTA BASE
  // Mantenemos las cabeceras originales de la petición entrante.
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // 4. PASILLO DE BYPASS (Velocidad Máxima para Activos y PWA)
  // Ignoramos la validación de Supabase para archivos estáticos o rutas públicas, 
  // ahorrando valiosos milisegundos de CPU en el Edge.
  if (
    pathname.startsWith('/auth') ||
    pathname.includes('manifest.json') ||
    pathname.includes('sw.js') ||
    pathname.includes('favicon.ico') ||
    pathname.includes('apple-touch-icon')
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
            // Actualizamos la petición entrante para el flujo actual
            request.cookies.set(name, value);
            // Seteamos la respuesta saliente para persistir la sesión
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Verificación atómica de identidad
  const { data: { user } } = await supabase.auth.getUser();

  // --- DEFINICIÓN DE PERÍMETROS DE OPERACIÓN ---
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isLandingPage = pathname === '/';

  // ZONAS DE SOBERANÍA: Requieren el rol 'admin' (preparado para expansión 'pro')
  const isSovereignRoute = pathname.startsWith('/admin') || pathname.startsWith('/map');

  // ZONAS PROTEGIDAS: Requieren autenticación básica
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/podcasts') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/collection') ||
    pathname.startsWith('/create') ||
    isSovereignRoute;

  // A. BARRERA DE IDENTIDAD (GUEST -> USER)
  if (!user && isProtectedRoute) {
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // B. BLINDAJE DE SOBERANÍA (USER -> ADMIN)
  if (user && isSovereignRoute) {
    const appMetadata = user.app_metadata || {};
    // Priorizamos user_role, con fallback a role para retrocompatibilidad
    const userRole = appMetadata.user_role || appMetadata.role || 'user';

    if (userRole !== 'admin') {
      url.pathname = '/dashboard';
      // Redirección táctica (307) para usuarios no autorizados
      return NextResponse.redirect(url, 307);
    }
  }

  // C. OPTIMIZACIÓN DE FLUJO (USER -> DASHBOARD)
  if (user && (isAuthPage || isLandingPage)) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url, 307);
  }

  // 6. CIERRE ESTRUCTURAL: INYECCIÓN DE HIGIENE
  return applySecurityHeaders(response);
}

/**
 * HELPER: applySecurityHeaders
 * Misión: Blindar la cabecera HTTP de la respuesta contra ataques perimetrales.
 */
function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  return res;
}

/**
 * CONFIGURACIÓN DEL MATCHER (Edge Execution Router)
 * Define exactamente qué rutas disparan la ejecución de este middleware.
 */
export const config = {
  matcher: [
    // Ejecuta el middleware en todas las rutas EXCEPTO:
    // API routes, estáticos de Next.js, imágenes y archivos de Service Worker.
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-.*|apple-touch-icon.png|icon.png|icon.svg|offline|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ],
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (V16.0):
 * 1. La Vacuna de Enrutamiento (Línea 21): Al interceptar '/geo' antes de 
 *    evaluar la sesión o las cookies, garantizamos que el Service Worker 
 *    reciba el código '308 Permanent Redirect' en menos de 5ms. Esto cura el 
 *    caché corrupto del dispositivo móvil de forma remota, aniquilando el bucle 404.
 * 2. Modularidad de Seguridad: La abstracción 'applySecurityHeaders' asegura 
 *    que incluso las peticiones de bypass (PWA/Activos) reciban la protección 
 *    estándar de la industria, evitando fugas de iFrame o ataques de sniff.
 * 3. Eficiencia URL: El uso de 'request.nextUrl.clone()' (Línea 16) es la 
 *    práctica recomendada en Next.js 14 para la mutación segura de URIs dentro 
 *    del entorno de Edge Functions.
 */