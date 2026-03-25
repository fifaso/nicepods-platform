// middleware.ts
// VERSIÓN: 18.0 (NicePod Traffic Control - Edge Intelligence & Geo-IP Edition)
// Misión: Orquestar la identidad atómica y capturar la telemetría de cortesía de Vercel.
// [ESTABILIZACIÓN]: Captura de Geo-IP headers para materialización de Voyager en fallo de GPS.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * EXPORTACIÓN PRINCIPAL: middleware
 * Actúa como la aduana de seguridad y el sensor de red en el Edge de Vercel.
 */
export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // 1. [PROTOCOLO DE EXORCISMO]: LIMPIEZA DE RASTRO PWA
  if (
    pathname.includes('sw.js') ||
    pathname.includes('workbox-') ||
    pathname.includes('fallback-')
  ) {
    const purgeResponse = NextResponse.next();
    purgeResponse.headers.set('Clear-Site-Data', '"cache", "storage", "executionContexts"');
    return applySecurityHeaders(purgeResponse);
  }

  // 2. [VACUNA DE ENRUTAMIENTO]: REDIRECCIÓN PERMANENTE (308)
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
   * Misión: Si el GPS del móvil falla, el servidor ya sabe dónde está el Voyager.
   * Extraemos la telemetría de red y la inyectamos en una cookie de sesión.
   */
  const vercelLat = request.headers.get('x-vercel-ip-latitude');
  const vercelLng = request.headers.get('x-vercel-ip-longitude');
  const vercelCity = request.headers.get('x-vercel-ip-city');

  if (vercelLat && vercelLng) {
    // Inyectamos la ubicación estimada para que el Layout y el Hook la consuman en T0
    const geoData = JSON.stringify({
      lat: parseFloat(vercelLat),
      lng: parseFloat(vercelLng),
      city: vercelCity ? decodeURIComponent(vercelCity) : 'Unknown',
      source: 'edge-estimate'
    });

    response.cookies.set('nicepod-geo-fallback', geoData, {
      path: '/',
      maxAge: 60 * 60 * 24, // 24 horas de persistencia táctica
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
  }

  // 5. PASILLO DE BYPASS (Activos Estáticos)
  if (
    pathname.startsWith('/auth') ||
    pathname.includes('manifest.json') ||
    pathname.includes('favicon.ico') ||
    pathname.includes('apple-touch-icon') ||
    pathname.match(/\.(png|jpg|jpeg|svg|webp|woff2)$/)
  ) {
    return applySecurityHeaders(response);
  }

  // 6. INSTANCIACIÓN DEL CLIENTE SUPABASE (SSR)
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

  // 7. VALIDACIÓN ACTIVA DE IDENTIDAD ( getUser() )
  const { data: { user } } = await supabase.auth.getUser();

  // --- PERÍMETROS OPERATIVOS ---
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

  // C. OPTIMIZACIÓN DE FLUJO POST-AUTH
  if (user && (isAuthPage || isLandingPage)) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url, 307);
  }

  return applySecurityHeaders(response);
}

/**
 * HELPER: applySecurityHeaders
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
 * NOTA TÉCNICA DEL ARCHITECT (V18.0):
 * 1. Malla de Emergencia Geo-IP: El middleware ahora intercepta la ubicación aproximada 
 *    que Vercel detecta por IP y la guarda en la cookie 'nicepod-geo-fallback'. Esto 
 *    permite que el sistema materialice al usuario instantáneamente incluso si 
 *    el hardware GPS está bloqueado o tardando en responder.
 * 2. Transparencia T0: Esta información se inyecta antes de que el Layout se renderice,
 *    garantizando que la Workstation nazca con conocimiento de causa.
 * 3. Atomicidad SSR: Se mantiene la validación de identidad 'getUser()' sincronizada 
 *    con el despacho de telemetría de red.
 */