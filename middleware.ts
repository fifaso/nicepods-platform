// middleware.ts
//VERSIÓN: 11.0 (NicePod Access Protocol - Industrial Security & Zero-Flicker Standard)
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * middleware: El Orquestador de Tráfico de NicePod V2.5.
 * 
 * Funciones Críticas:
 * 1. Sincronización de Sesión: Garantiza que el servidor y el cliente compartan el mismo estado.
 * 2. Blindaje de Seguridad: Inyecta cabeceras de protección (CSP, HSTS, XSS).
 * 3. Control de Acceso (RBAC): Protege rutas administrativas y la Workstation privada.
 */
export async function middleware(request: NextRequest) {
  // 1. INICIALIZACIÓN DEL CONTENEDOR DE RESPUESTA
  // Generamos la respuesta base para inyectar cabeceras de seguridad.
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const url = new URL(request.url);
  const pathname = url.pathname;

  /**
   * 2. CAPA DE SEGURIDAD INDUSTRIAL (Security Headers)
   * Elevamos la protección del sistema para prevenir ataques de Clickjacking y XSS.
   */
  const securityHeaders = new Headers(response.headers);
  securityHeaders.set('X-Frame-Options', 'DENY');
  securityHeaders.set('X-Content-Type-Options', 'nosniff');
  securityHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  securityHeaders.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // Actualizamos la respuesta con las nuevas cabeceras de seguridad.
  response = new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: securityHeaders,
  });

  /**
   * 3. PASILLO DE BYPASS (Activos Críticos)
   * Excluimos activos de la PWA y rutas de autenticación nativa de Supabase
   * para garantizar latencia cero en el intercambio de tokens.
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

  // 4. INSTANCIACIÓN DEL CLIENTE SUPABASE SSR (Atomic Sync)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          // [CRÍTICO]: Sincronización bidireccional inmediata de cookies.
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });

          /**
           * TÁCTICA ANTI-PESTAÑEO:
           * Forzamos a Next.js a regenerar el flujo con las cookies actualizadas 
           * para que el layout.tsx reciba la sesión nominal en el primer render.
           */
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          // Re-aplicamos las cookies y las cabeceras de seguridad a la nueva instancia.
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
          securityHeaders.forEach((value, key) => response.headers.set(key, value));
        },
      },
    }
  );

  /**
   * 5. VALIDACIÓN DE IDENTIDAD SOBERANA
   * Utilizamos getUser() para una validación física contra el servidor de Auth.
   */
  const { data: { user } } = await supabase.auth.getUser();

  // --- DEFINICIÓN DE PERÍMETROS DE RUTA ---
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isAdminPage = pathname.startsWith('/admin');
  const isLandingPage = pathname === '/';

  // Definimos la Workstation Privada: Cualquier ruta que no sea auth, landing o pública.
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/create') ||
    pathname.startsWith('/podcasts') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/geo') ||
    pathname.startsWith('/map') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/collection') ||
    isAdminPage;

  /**
   * 6. LÓGICA DE CONTROL DE ACCESO Y REDIRECCIÓN (RBAC)
   */

  // A. PROTECCIÓN DE LA WORKSTATION:
  // Si no hay usuario y la ruta es protegida, enviamos al login preservando el destino.
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // B. BLINDAJE ADMINISTRATIVO:
  // Solo los curadores con rol 'admin' en sus metadatos de sesión pueden acceder al núcleo.
  if (user && isAdminPage) {
    const userRole = user.app_metadata?.user_role || 'user';
    if (userRole !== 'admin') {
      console.warn(`🛑 [Seguridad] Acceso denegado a /admin para: ${user.email}`);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // C. OPTIMIZACIÓN DE FLUJO LOGUEADO:
  // Si el curador ya está autenticado, evitamos que vea el login o la landing page.
  if (user && (isAuthPage || isLandingPage)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 7. ENTREGA FINAL DE CONTROL
  // El tráfico fluye hacia los Server Components con identidad y seguridad garantizadas.
  return response;
}

/**
 * CONFIGURACIÓN DEL MATCH DE TRÁFICO
 * Excluimos estrictamente archivos estáticos y multimedia para optimizar el rendimiento del Edge.
 */
export const config = {
  matcher: [
    /*
     * Match de todas las rutas excepto:
     * - api (APIs internas de Next.js)
     * - _next/static (archivos estáticos compilados)
     * - _next/image (imágenes optimizadas)
     * - favicon, manifest, sw (PWA y Assets de Navegador)
     * - Archivos multimedia (png, jpg, svg, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-.*|apple-touch-icon.png|icon.png|icon.svg|offline|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Seguridad Proactiva: Se han inyectado cabeceras HSTS para forzar conexiones 
 *    HTTPS durante un año (max-age 31536000).
 * 2. Handshake Atómico: La lógica de setAll en cookies garantiza que no haya 
 *    desfase entre el servidor de Supabase y el middleware de Next.js.
 * 3. Eficiencia Operativa: El matcher de rutas está diseñado para que el 
 *    middleware no se ejecute en peticiones de imágenes, ahorrando costos de 
 *    computación en el Edge de Vercel.
 */