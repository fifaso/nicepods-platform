// middleware.ts
// VERSIÓN: 17.1 (NicePod Traffic Control - Sovereign Routing & Exorcism Edition)
// Misión: Orquestar la identidad atómica, purgar cachés corruptos y gobernar el acceso.
// [ESTABILIZACIÓN]: Erradicación del Bucle Admin, Inyección Clear-Site-Data y Refresco de Sesión.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * EXPORTACIÓN PRINCIPAL: middleware
 * El punto de control único para todo el tráfico entrante al Edge de Vercel.
 */
export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // 1. [VACUNA DE ENRUTAMIENTO]: REDIRECCIÓN PERMANENTE (308)
  if (pathname === '/geo' || pathname.startsWith('/geo/')) {
    url.pathname = '/map';
    return NextResponse.redirect(url, 308);
  }

  // 2. [PROTOCOLO DE EXORCISMO]: PURGA DEL SERVICE WORKER ZOMBI
  // Si el navegador intenta buscar los archivos del PWA que desactivamos,
  // aprovechamos la petición para enviarle una "Bomba Lógica" que limpie su caché interno.
  // Esto destruye el bucle de redirección causado por estados fantasma en el móvil del Admin.
  if (
    pathname.includes('sw.js') ||
    pathname.includes('workbox-') ||
    pathname.includes('fallback-')
  ) {
    const purgeResponse = NextResponse.next();
    // Cabecera de Grado Militar: Obliga al navegador a borrar cachés y Service Workers.
    purgeResponse.headers.set('Clear-Site-Data', '"cache", "executionContexts"');
    return applySecurityHeaders(purgeResponse);
  }

  // 3. INICIALIZACIÓN DE LA RESPUESTA BASE
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // 4. PASILLO DE BYPASS (Velocidad Máxima para Activos Estáticos)
  if (
    pathname.startsWith('/auth') ||
    pathname.includes('manifest.json') ||
    pathname.includes('favicon.ico') ||
    pathname.includes('apple-touch-icon') ||
    pathname.includes('.png') ||
    pathname.includes('.jpg') ||
    pathname.includes('.svg')
  ) {
    return applySecurityHeaders(response);
  }

  // 5. INSTANCIACIÓN DEL CLIENTE SOBERANO (SSR CLIENT)
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
            // Sincronía bidireccional de cookies para evitar deshidratación
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  /**
   * 6. VERIFICACIÓN DE IDENTIDAD (T0 - FORCED REFRESH)
   * [FIX CRÍTICO]: En lugar de solo getUser(), primero verificamos la sesión.
   * Esto obliga al cliente de Supabase a evaluar si el JWT necesita ser refrescado.
   * Si usted se hizo Admin recientemente, este paso asegura que el nuevo token 
   * (con el claim 'admin') se descargue y se guarde en sus cookies antes de evaluar.
   */
  const { data: { session } } = await supabase.auth.getSession();

  // Extraemos el usuario de forma segura. Si hay sesión, el usuario existe.
  const user = session?.user || null;

  // --- DEFINICIÓN DE PERÍMETROS DE OPERACIÓN ---
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isLandingPage = pathname === '/';

  // [ZONA SOBERANA]: Exclusiva para el Administrador (Moderación, Configuración Global)
  // Nota: /map NO está aquí. El mapa es territorio libre.
  const isSovereignRoute = pathname.startsWith('/admin') || pathname.startsWith('/theme-test');

  // [ZONA PROTEGIDA]: Requiere sesión activa (Cualquier rango: Voyager, Pro, Admin)
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/podcasts') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/collection') ||
    pathname.startsWith('/create') ||
    pathname.startsWith('/map') || // <--- [LIBERADO]: Todo usuario logueado entra.
    isSovereignRoute;

  /**
   * ---------------------------------------------------------------------------
   * II. LÓGICA DE GOBERNANZA (REDIRECCIONES)
   * ---------------------------------------------------------------------------
   */

  // A. PROTOCOLO DE EXPULSIÓN: Invitado intentando acceder a zona protegida.
  if (!user && isProtectedRoute) {
    console.warn(`🛡️ [Middleware] Acceso denegado a ${pathname}. Redirigiendo a Login.`);
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // B. PROTOCOLO DE SOBERANÍA: Usuario autenticado pero sin rango en zona restringida.
  if (user && isSovereignRoute) {
    const appMetadata = user.app_metadata || {};
    // La fuente de verdad absoluta para el enrutamiento es el JWT.
    const userRole = appMetadata.user_role || appMetadata.role || 'user';

    if (userRole !== 'admin') {
      console.warn(`🛡️ [Middleware] Usuario ${user.id} intentó acceder a zona Admin. Redirigiendo a Dashboard.`);
      url.pathname = '/dashboard';
      // 307 Temporary Redirect: Mantiene el método HTTP original
      return NextResponse.redirect(url, 307);
    }
  }

  // C. OPTIMIZACIÓN DE FLUJO: Usuario logueado intentando acceder a Login/Landing.
  if (user && (isAuthPage || isLandingPage)) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url, 307);
  }

  // 7. CIERRE ESTRUCTURAL: INYECCIÓN DE HIGIENE PERIMETRAL
  return applySecurityHeaders(response);
}

/**
 * HELPER: applySecurityHeaders
 * Misión: Inyectar las directivas de seguridad innegociables de NicePod.
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
 * Define el alcance de interceptación del Middleware.
 */
export const config = {
  matcher: [
    // Interceptamos todo excepto la API de Next.js y carpetas estáticas.
    // [IMPORTANTE]: Hemos dejado sw.js y manifest.json dentro del alcance del matcher
    // para que nuestro "Protocolo de Exorcismo" pueda interceptarlos.
    '/((?!api|_next/static|_next/image).*)'
  ],
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (V17.1):
 * 1. Muerte del Bucle Admin: Al usar 'getSession()' en lugar de 'getUser()', 
 *    forzamos la validación del Token de Refresco. Si su cookie local estaba 
 *    desincronizada, este método la repara al vuelo antes de decidir si lo expulsa.
 * 2. La Bomba Lógica PWA: El cambio en el 'matcher' (Línea 145) permite que las 
 *    peticiones a 'sw.js' pasen por el Middleware. Cuando lo hacen (Línea 26), 
 *    inyectamos 'Clear-Site-Data'. Esto limpia remotamente el caché del navegador 
 *    de sus usuarios, solucionando problemas de red sin requerir acción manual.
 * 3. Aislamiento de Malla Urbana: La ruta '/map' ahora es evaluada exclusivamente 
 *    por el bloque A (isProtectedRoute), garantizando que cualquier cuenta con 
 *    una sesión válida pueda renderizar la interfaz cartográfica.
 */