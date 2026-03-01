// middleware.ts
// VERSIÓN: 13.0

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * middleware: El Orquestador de Tráfico y Rangos de NicePod V2.5.
 * 
 * [RESPONSABILIDADES TÁCTICAS]:
 * 1. Sincronización de Identidad: Asegura que el servidor y el cliente compartan la sesión.
 * 2. Control de Acceso Granular (RBAC): Diferencia entre creación estándar y soberanía GEO.
 * 3. Seguridad Industrial: Mantiene el escudo contra ataques de inyección y clickjacking.
 */
export async function middleware(request: NextRequest) {
  // 1. INICIALIZACIÓN DE RESPUESTA Y SEGURIDAD
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const url = new URL(request.url);
  const pathname = url.pathname;

  /**
   * 2. CAPA DE SEGURIDAD INDUSTRIAL (Security Headers)
   */
  const securityHeaders = new Headers(response.headers);
  securityHeaders.set('X-Frame-Options', 'DENY');
  securityHeaders.set('X-Content-Type-Options', 'nosniff');
  securityHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  securityHeaders.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  response = new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: securityHeaders,
  });

  /**
   * 3. PASILLO DE BYPASS (Optimización de CPU)
   * Ignoramos activos estáticos y flujos de auth para no penalizar el rendimiento.
   */
  if (
    pathname.startsWith('/auth') ||
    pathname.includes('manifest.json') ||
    pathname.includes('sw.js') ||
    pathname.includes('favicon.ico') ||
    pathname.includes('apple-touch-icon')
  ) {
    return response;
  }

  // 4. INSTANCIACIÓN DEL CLIENTE SUPABASE SSR (Atomic Handshake)
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

          // Handshake Anti-Pestañeo
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
          securityHeaders.forEach((v, k) => response.headers.set(k, v));
        },
      },
    }
  );

  /**
   * 5. VALIDACIÓN DE IDENTIDAD SOBERANA
   * Verificación física contra el motor de autenticación.
   */
  const { data: { user } } = await supabase.auth.getUser();

  // --- DEFINICIÓN DE PERÍMETROS OPERATIVOS ---
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isLandingPage = pathname === '/';

  // ZONAS DE SOBERANÍA ADMINISTRATIVA: 
  // El Admin gestiona el núcleo y la siembra geoespacial directamente.
  const isSovereignRoute = pathname.startsWith('/admin') || pathname.startsWith('/geo');

  // WORKSTATION PRIVADA:
  // Rutas que exigen estar logueado (incluye /create para todos los curadores).
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/podcasts') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/collection') ||
    pathname.startsWith('/map') ||
    pathname.startsWith('/create') || // <--- LIBERADO PARA TODOS LOS AUTENTICADOS
    isSovereignRoute;

  /**
   * 6. LÓGICA DE CONTROL DE ACCESO (RBAC SINCRO)
   */

  // A. PROTECCIÓN DE ACCESO BASE:
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // B. BLINDAJE DE SOBERANÍA (ADMIN ONLY):
  // Si el usuario intenta entrar a /admin o /geo, validamos que su rol sea 'admin'.
  if (user && isSovereignRoute) {
    const userRole = user.app_metadata?.user_role || 'user';
    if (userRole !== 'admin') {
      console.warn(`🛡️ [RBAC] Acceso restringido a zona soberana para: ${user.email}`);
      // El usuario estándar no tiene facultades GEO; lo devolvemos al Dashboard.
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // C. OPTIMIZACIÓN DE FLUJO LOGUEADO:
  if (user && (isAuthPage || isLandingPage)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 7. ENTREGA DE CONTROL
  return response;
}

/**
 * CONFIGURACIÓN DEL MATCH DE TRÁFICO
 */
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-.*|apple-touch-icon.png|icon.png|icon.svg|offline|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Evolución Voyager: Se ha removido 'isCreationRoute' del bloque de restricción 
 *    administrativa. Ahora todos los usuarios 'authenticated' pueden acceder a 
 *    la forja estándar.
 * 2. Protección GEO: Al añadir 'pathname.startsWith("/geo")' a 'isSovereignRoute', 
 *    aseguramos que las herramientas de grabación situacional y anclaje 3D 
 *    queden bajo control exclusivo de la administración.
 * 3. Consistencia de Sesión: La lógica de 'getUser()' garantiza que el rol 
 *    no pueda ser manipulado en el LocalStorage, manteniendo la integridad ACiD.
 */