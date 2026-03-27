// middleware.ts
// VERSIÓN: 20.0 (NicePod Traffic Control - PWA Exorcism & Edge Geo-IP Edition)
// Misión: Orquestar la identidad atómica y limpiar el canal de datos para la telemetría GPS.
// [ESTABILIZACIÓN]: Erradicación de Service Worker Zombie y captura de malla por IP T0.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * EXPORTACIÓN PRINCIPAL: middleware
 * Actúa como la aduana de seguridad y sensor de red en el Edge de Vercel.
 */
export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  /**
   * 1. [PROTOCOLO DE EXORCISMO]: LIMPIEZA DE RASTRO PWA
   * Misión: El Service Worker corrupto bloquea el hilo del GPS con tareas largas (>100ms).
   * Si detectamos peticiones a scripts de la PWA, forzamos la purga física del navegador.
   */
  if (
    pathname.includes('sw.js') ||
    pathname.includes('workbox-') ||
    pathname.includes('fallback-')
  ) {
    const purgeResponse = new NextResponse(null, { status: 204 });
    // Borra físicamente caché, storage y contextos de ejecución obsoletos del dispositivo móvil.
    purgeResponse.headers.set('Clear-Site-Data', '"cache", "storage", "executionContexts"');
    return purgeResponse;
  }

  /**
   * 2. [VACUNA DE ENRUTAMIENTO]: REDIRECCIÓN SANEADA (308)
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
   * 4. [PROTOCOLO PARACAÍDAS]: CAPTURA GEO-IP DE VERCEL (T0)
   * Misión: Materializar al Voyager instantáneamente. Si el hardware falla, usamos la red.
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

    // Inyectamos la ubicación estimada en una cookie para el Handshake T0 del Layout.
    response.cookies.set('nicepod-geo-fallback', geoData, {
      path: '/',
      maxAge: 60 * 60, // 1 hora de validez táctica
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
  }

  // 5. PASILLO DE BYPASS (Velocidad para Activos Estáticos)
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
   * Garantiza que el Voyager sea validado directamente en el metal de Supabase Auth.
   * Esto aniquila los pestañeos de hidratación al evitar re-direcciones en el cliente.
   */
  const { data: { user } } = await supabase.auth.getUser();

  // --- PERÍMETROS DE GOBERNANZA ---
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
 * Misión: Blindar la respuesta con directivas de seguridad industrial.
 */
function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  // Permissions-Policy reforzado desde el Edge
  res.headers.set('Permissions-Policy', 'geolocation=(self), camera=(self), microphone=(self)');
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
 * NOTA TÉCNICA DEL ARCHITECT (V20.0):
 * 1. Purga Radical (Scorched Earth): El uso de 'Clear-Site-Data' en las rutas del 
 *    Service Worker es nuestra arma definitiva contra el lag de 277ms. Limpia el 
 *    navegador del usuario y detiene el bucle de error de Workbox al instante.
 * 2. Malla de Emergencia T0: La captura de Geo-IP headers permite que NicePod 
 *    muestre la ubicación aproximada del usuario antes de que el GPS físico 
 *    despierte, eliminando el estado de 'Mapa Vacío'.
 * 3. Sincronía de Mando: Se utiliza 'getUser' para asegurar que no haya saltos 
 *    visuales de identidad durante la carga inicial de la Workstation.
 */