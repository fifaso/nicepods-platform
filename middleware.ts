/**
 * ARCHIVO: middleware.ts
 * VERSIÓN: 21.0 (NicePod Traffic Control - Geodetic Seed & Absolute ZAP Edition)
 * PROTOCOLO: MADRID RESONANCE V4.8
 * 
 * Misión: Orquestar la identidad atómica, la seguridad perimetral y la inyección de 
 * telemetría aproximada mediante el protocolo Internet-Protocol-Geolocation (T0).
 * [REFORMA V21.0]: Implementación absoluta de la Zero Abbreviations Policy (ZAP).
 * Sincronización de la cookie de semilla geodésica para el Handshake inicial del Layout.
 * Fortalecimiento de la protección de rutas y purga física de rastro de aplicaciones obsoletas.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * EXPORTACIÓN PRINCIPAL: middleware
 * Actúa como la aduana de seguridad y sensor de red en el Edge de la infraestructura.
 */
export async function middleware(request: NextRequest) {
  const requestUrlReference = request.nextUrl.clone();
  const requestPathname = requestUrlReference.pathname;

  /**
   * 1. PROTOCOLO DE LIMPIEZA ATÓMICA (HARDWARE HYGIENE)
   * Misión: Eliminar procesos de Progressive Web Apps obsoletos que puedan interferir 
   * con el rendimiento del Hilo Principal y el acceso a sensores.
   */
  if (
    requestPathname.includes('sw.js') ||
    requestPathname.includes('workbox-') ||
    requestPathname.includes('fallback-')
  ) {
    const purgeResponse = new NextResponse(null, { status: 204 });
    // Mando de purga: Elimina físicamente caché y almacenamiento para restaurar el estado térmico.
    purgeResponse.headers.set('Clear-Site-Data', '"cache", "storage", "executionContexts"');
    return purgeResponse;
  }

  /**
   * 2. PROTOCOLO DE REDIRECCIÓN NOMINAL
   * Misión: Unificar el acceso al Reactor Visual.
   */
  if (requestPathname === '/geo' || requestPathname.startsWith('/geo/')) {
    requestUrlReference.pathname = '/map';
    return NextResponse.redirect(requestUrlReference, 308);
  }

  // 3. INICIALIZACIÓN DE RESPUESTA SOBERANA CON CABECERAS ORIGINALES
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  /**
   * 4. PROTOCOLO SEMILLA T0: CAPTURA GEODÉSICA POR INTERNET-PROTOCOL (IP)
   * Misión: Proveer una ubicación estimada instantánea al Voyager para evitar el "Cold Start".
   */
  const vercelLatitudeCoordinate = request.headers.get('x-vercel-ip-latitude');
  const vercelLongitudeCoordinate = request.headers.get('x-vercel-ip-longitude');
  const vercelCityName = request.headers.get('x-vercel-ip-city');

  if (vercelLatitudeCoordinate && vercelLongitudeCoordinate) {
    const geodeticSeedData = JSON.stringify({
      latitudeCoordinate: parseFloat(vercelLatitudeCoordinate),
      longitudeCoordinate: parseFloat(vercelLongitudeCoordinate),
      cityName: vercelCityName ? decodeURIComponent(vercelCityName) : 'Madrid-NKV',
      geographicSource: 'edge-internet-protocol'
    });

    // Inyectamos la semilla en una cookie técnica para el Handshake T0 del Layout global.
    response.cookies.set('nicepod-geodetic-seed-t0', geodeticSeedData, {
      path: '/',
      maxAge: 3600, // 1 hora de validez táctica
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
  }

  // 5. PROTOCOLO DE PASILLO RÁPIDO (STATIC ASSETS BYPASS)
  if (
    requestPathname.startsWith('/auth') ||
    requestPathname.includes('manifest.json') ||
    requestPathname.includes('favicon.ico') ||
    requestPathname.includes('apple-touch-icon') ||
    requestPathname.match(/\.(png|jpg|jpeg|svg|webp|woff2)$/)
  ) {
    return applySecurityHeadersAction(response);
  }

  // 6. INSTANCIACIÓN DEL CLIENTE DE AUTORIDAD (SUPABASE SSR)
  const supabaseSovereignClient = createServerClient(
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
   * 7. VALIDACIÓN ACTIVA DE IDENTIDAD (BUILD SHIELD)
   * Garantiza que el Voyager sea validado directamente contra el Metal de la Bóveda Auth.
   * Esto aniquila los pestañeos de hidratación (flicker) al pre-autenticar en el borde.
   */
  const { data: { user: authenticatedUser } } = await supabaseSovereignClient.auth.getUser();

  // --- DEFINICIÓN DE PERÍMETROS DE GOBERNANZA ---
  const isAuthenticationPage = requestPathname === '/login' || requestPathname === '/signup';
  const isLandingPage = requestPathname === '/';
  const isSovereignAdministrationRoute = requestPathname.startsWith('/admin') || requestPathname.startsWith('/theme-test');
  
  const isProtectedRoute =
    requestPathname.startsWith('/dashboard') ||
    requestPathname.startsWith('/podcasts') ||
    requestPathname.startsWith('/profile') ||
    requestPathname.startsWith('/notifications') ||
    requestPathname.startsWith('/collection') ||
    requestPathname.startsWith('/create') ||
    requestPathname.startsWith('/map') ||
    isSovereignAdministrationRoute;

  // A. PROTOCOLO DE EXCLUSIÓN DE INVITADOS (GUEST PROTECTION)
  if (!authenticatedUser && isProtectedRoute) {
    requestUrlReference.pathname = '/login';
    requestUrlReference.searchParams.set('redirect', requestPathname);
    return NextResponse.redirect(requestUrlReference);
  }

  // B. PROTOCOLO DE AUTORIDAD (ROLE BASED ACCESS CONTROL)
  if (authenticatedUser && isSovereignAdministrationRoute) {
    const userApplicationMetadata = authenticatedUser.app_metadata || {};
    const authorizedUserRole = userApplicationMetadata.user_role || userApplicationMetadata.role || 'user';
    
    if (authorizedUserRole !== 'admin') {
      requestUrlReference.pathname = '/dashboard';
      return NextResponse.redirect(requestUrlReference, 307);
    }
  }

  // C. OPTIMIZACIÓN DE FLUJO POST-AUTENTICACIÓN
  if (authenticatedUser && (isAuthenticationPage || isLandingPage)) {
    requestUrlReference.pathname = '/dashboard';
    return NextResponse.redirect(requestUrlReference, 307);
  }

  return applySecurityHeadersAction(response);
}

/**
 * HELPER: applySecurityHeadersAction
 * Misión: Blindar la respuesta con directivas de seguridad de grado industrial.
 */
function applySecurityHeadersAction(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  // Permissions-Policy reforzado desde el Edge para acceso soberano a sensores
  response.headers.set('Permissions-Policy', 'geolocation=(self), camera=(self), microphone=(self)');
  return response;
}

/**
 * CONFIGURACIÓN DEL MATCHER (FRONTERA DE FILTRADO)
 */
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image).*)'
  ],
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (V21.0):
 * 1. Zero Abbreviations Policy: Se han purificado todas las variables (requestUrlReference, 
 *    isAuthenticationPage, vercelLatitudeCoordinate). El código es ahora autodescriptivo.
 * 2. Geodetic Seed Inversion: La cookie 'nicepod-geodetic-seed-t0' provee al Layout global
 *    los datos necesarios para el primer renderizado, eliminando la asimetría visual.
 * 3. Hardware Hygiene: El protocolo de purga PWA asegura que el dispositivo móvil no
 *    tenga hilos en segundo plano que compitan por el bus del GPS.
 */