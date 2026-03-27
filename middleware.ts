// middleware.ts
// VERSIÓN: 19.0 (NicePod Traffic Control - PWA Purge & Geo-IP Materialization Edition)
// Misión: Orquestar la identidad atómica y limpiar el canal de datos para el hardware GPS.
// [ESTABILIZACIÓN]: Bloqueo radical de Service Worker residual y captura de telemetría de red.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * EXPORTACIÓN PRINCIPAL: middleware
 * Aduana de seguridad y sensor de red en el Edge de Vercel.
 */
export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  /**
   * 1. [PROTOCOLO DE EXORCISMO]: LIMPIEZA DE RASTRO PWA
   * Misión: El Service Worker corrupto está bloqueando el hilo del GPS.
   * Si detectamos peticiones a scripts de PWA, devolvemos 'Tierra Quemada'.
   */
  if (
    pathname.includes('sw.js') ||
    pathname.includes('workbox-') ||
    pathname.includes('fallback-')
  ) {
    // 204 No Content: Corta la ejecución del registro del Service Worker inmediatamente.
    const purgeResponse = new NextResponse(null, { status: 204 });
    // Limpia físicamente el almacenamiento del navegador del Voyager.
    purgeResponse.headers.set('Clear-Site-Data', '"cache", "storage", "executionContexts"');
    return purgeResponse;
  }

  /**
   * 2. [VACUNA DE ENRUTAMIENTO]: REDIRECCIÓN 308
   * Saneamos el tráfico obsoleto hacia la nueva Malla Unificada.
   */
  if (pathname === '/geo' || pathname.startsWith('/geo/')) {
    url.pathname = '/map';
    return NextResponse.redirect(url, 308);
  }

  // 3. INICIALIZACIÓN DE RESPUESTA SOBERANA
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  /**
   * 4. [PROTOCOLO PARACAÍDAS]: CAPTURA GEO-IP DE VERCEL
   * Misión: Materialización T0. Si el GPS falla, el servidor ya sabe dónde estás.
   */
  const vercelLat = request.headers.get('x-vercel-ip-latitude');
  const vercelLng = request.headers.get('x-vercel-ip-longitude');
  const vercelCity = request.headers.get('x-vercel-ip-city');

  if (vercelLat && vercelLng) {
    const geoData = JSON.stringify({
      lat: parseFloat(vercelLat),
      lng: parseFloat(vercelLng),
      city: vercelCity ? decodeURIComponent(vercelCity) : 'Unknown',
      source: 'edge-ip'
    });

    // Inyectamos la 'Malla de Rescate' en una cookie de larga duración.
    response.cookies.set('nicepod-geo-fallback', geoData, {
      path: '/',
      maxAge: 60 * 60 * 24, // 24 Horas
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
  }

  // 5. PASILLO DE BYPASS (Aceleración de Activos Estáticos)
  if (
    pathname.startsWith('/auth') ||
    pathname.includes('manifest.json') ||
    pathname.includes('favicon.ico') ||
    pathname.includes('apple-touch-icon') ||
    pathname.match(/\.(png|jpg|jpeg|svg|webp|woff2)$/)
  ) {
    return applySecurityHeaders(response);
  }

  // 6. INSTANCIACIÓN DEL CLIENTE SOBERANO (SSR)
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
        },
      },
    }
  );

  /**
   * 7. VALIDACIÓN ACTIVA DE IDENTIDAD (getUser)
   * Garantiza que el token sea verificado contra la DB de Auth en cada navegación.
   */
  const { data: { user } } = await supabase.auth.getUser();

  // --- PERÍMETROS DE ACCESO ---
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isLandingPage = pathname === '/';
  const isSovereignRoute = pathname.startsWith('/admin') || pathname.startsWith('/theme-test');
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/podcasts') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/collection') ||
    pathname.startsWith('/create') ||
    pathname.startsWith('/map') ||
    isSovereignRoute;

  // A. PROTECCIÓN CONTRA INVITADOS
  if (!user && isProtectedRoute) {
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // B. PROTECCIÓN CONTRA INTRUSOS (RBAC)
  if (user && isSovereignRoute) {
    const appMetadata = user.app_metadata || {};
    const userRole = appMetadata.user_role || appMetadata.role || 'user';
    if (userRole !== 'admin') {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url, 307);
    }
  }

  // C. OPTIMIZACIÓN DE FLUJO POST-AUTENTICACIÓN
  if (user && (isAuthPage || isLandingPage)) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url, 307);
  }

  return applySecurityHeaders(response);
}

/**
 * HELPER: applySecurityHeaders
 * Misión: Blindar la respuesta con directivas de seguridad NCIS.
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
    '/((?!api|_next/static|_next/image).*)'
  ],
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (V19.0):
 * 1. Purga Radical de PWA: Se implementó una respuesta 204 para scripts de sw.js. 
 *    Esto detiene los errores de consola y libera los recursos de la CPU 
 *    necesarios para el renderizado 3D y la captura GPS.
 * 2. Malla IP Robusta: La cookie 'nicepod-geo-fallback' es inyectada antes 
 *    de cualquier renderizado, permitiendo que el sistema nazca localizado.
 * 3. Seguridad SSR: Uso de 'getUser' para aniquilar bucles de redirección.
 */