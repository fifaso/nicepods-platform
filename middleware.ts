// middleware.ts
// VERSIÓN: 12.0

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * middleware: El Único Punto de Control de Tráfico de NicePod V2.5.
 * 
 * [RESPONSABILIDADES TÁCTICAS]:
 * 1. Sincronización de Identidad: Asegura que el servidor Next.js lea la sesión nominal.
 * 2. Blindaje de Creación (RBAC): Protege las rutas de forja (/create, /admin).
 * 3. Seguridad Industrial: Inyecta cabeceras de protección de datos.
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
   * Elevamos la resiliencia del sistema ante ataques de orquestación externa.
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
   * 3. PASILLO DE BYPASS (Activos Técnicos)
   * Optimizamos el presupuesto de CPU del Edge ignorando archivos estáticos y PWA.
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
          // Sincronía bidireccional inmediata para aniquilar el pestañeo visual.
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });

          // Táctica de Refresco de Contexto
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
   * 5. VALIDACIÓN DE IDENTIDAD SOBERANA (T0)
   * Utilizamos getUser() para una verificación física inalterable contra el motor de Auth.
   */
  const { data: { user } } = await supabase.auth.getUser();

  // --- DEFINICIÓN DE PERÍMETROS OPERATIVOS ---
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isLandingPage = pathname === '/';
  
  // Ruta de Creación: Ahora considerada ruta administrativa de facto.
  const isCreationRoute = pathname.startsWith('/create');
  const isAdminRoute = pathname.startsWith('/admin');

  // Workstation Privada: Rutas que exigen al menos ser Voyager (Usuario logueado).
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/podcasts') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/geo') ||
    pathname.startsWith('/map') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/collection') ||
    isCreationRoute ||
    isAdminRoute;

  /**
   * 6. LÓGICA DE CONTROL DE ACCESO (RBAC SOBERANO)
   */

  // A. PROTECCIÓN DE ACCESO BASE:
  // Si no hay sesión activa en una ruta protegida, enviamos al login.
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // B. BLINDAJE DE CREACIÓN Y ADMINISTRACIÓN (EL GIRO ESTRATÉGICO):
  // Solo los curadores con rango 'admin' pueden acceder a /create y /admin.
  // El usuario estándar es espectador; se le deniega el acceso a la forja.
  if (user && (isCreationRoute || isAdminRoute)) {
    const userRole = user.app_metadata?.user_role || 'user';
    if (userRole !== 'admin') {
      console.warn(`🛡️ [Gobernanza] Intento de acceso no autorizado a la Forja por: ${user.email}`);
      // Redirigimos al Dashboard para que continúe su experiencia de consumo.
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // C. OPTIMIZACIÓN DE FLUJO LOGUEADO:
  // Prevenimos que un usuario ya sintonizado regrese a las puertas de entrada.
  if (user && (isAuthPage || isLandingPage)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 7. ENTREGA FINAL DE CONTROL
  return response;
}

/**
 * CONFIGURACIÓN DEL MATCH DE TRÁFICO
 */
export const config = {
  matcher: [
    /*
     * Match de todas las rutas excepto:
     * - api (Next.js internal)
     * - _next/static (archivos compilados)
     * - _next/image (optimización nativa)
     * - Assets estáticos y multimedia
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-.*|apple-touch-icon.png|icon.png|icon.svg|offline|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Control de la Forja: Al incluir 'isCreationRoute' en la validación de 
 *    rol administrativo, NicePod V2.5 se transforma en una plataforma de 
 *    consumo masivo curada por una autoridad única.
 * 2. Integridad del JWT: La validación se basa en 'app_metadata.user_role', 
 *    el cual es inyectado en el servidor durante la creación del perfil, 
 *    impidiendo manipulaciones en el lado del cliente.
 * 3. Rendimiento en el Borde: El matcher excluye agresivamente activos 
 *    multimedia, asegurando que el middleware solo consuma ciclos de CPU 
 *    en decisiones lógicas de navegación.
 */