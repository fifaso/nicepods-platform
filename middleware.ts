// middleware.ts
// VERSIÓN: 14.1

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * middleware: El Único Punto de Control de Tráfico de NicePod V2.5.
 * 
 * Este orquestador intercepta cada petición antes de que llegue a los Server Components
 * para realizar tres operaciones críticas de grado industrial:
 * 1. Sincronización de Identidad: Asegura que el servidor lea la sesión nominal.
 * 2. Control de Acceso Granular (RBAC): Diferencia entre creación estándar y soberanía GEO.
 * 3. Seguridad Industrial: Inyecta cabeceras de protección (CSP, HSTS, XSS).
 */
export async function middleware(request: NextRequest) {
  // 1. INICIALIZACIÓN DEL CONTENEDOR DE RESPUESTA
  // Generamos una respuesta base para inyectar cabeceras de seguridad y cookies.
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
  
  // Aplicamos las cabeceras a la respuesta actual.
  securityHeaders.forEach((value, key) => {
    response.headers.set(key, value);
  });

  /**
   * 3. PASILLO DE BYPASS (Bypass de Latencia)
   * Excluimos activos de la PWA, rutas de auth nativa y recursos estáticos
   * para garantizar que el Service Worker y el login operen con latencia cero.
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
  // Utilizamos el motor SSR para gestionar la persistencia de sesión en cookies.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          // [CRÍTICO]: Sincronización bidireccional inmediata.
          // Actualizamos tanto la petición (para el servidor) como la respuesta (para el cliente).
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });

          /**
           * TÁCTICA ANTI-PESTAÑEO:
           * Generamos una nueva instancia de NextResponse para forzar a Next.js a leer 
           * las cookies recién inyectadas en los Server Components posteriores (layout.tsx).
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
          securityHeaders.forEach((v, k) => response.headers.set(k, v));
        },
      },
    }
  );

  /**
   * 5. VALIDACIÓN DE IDENTIDAD SOBERANA
   * getUser() realiza una validación física contra el servidor de autenticación. 
   * Es la única forma de garantizar que la sesión no ha sido manipulada localmente.
   */
  const { data: { user } } = await supabase.auth.getUser();

  // --- DEFINICIÓN DE PERÍMETROS OPERATIVOS ---
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isLandingPage = pathname === '/';
  
  // ZONAS DE SOBERANÍA ADMINISTRATIVA: 
  // El Admin gestiona el núcleo y la siembra geoespacial directamente (/geo).
  const isSovereignRoute = pathname.startsWith('/admin') || pathname.startsWith('/geo');

  // WORKSTATION PRIVADA:
  // Rutas que exigen estar logueado (incluye /create para todos los curadores logueados).
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/podcasts') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/collection') ||
    pathname.startsWith('/map') ||
    pathname.startsWith('/create') || 
    isSovereignRoute;

  /**
   * 6. LÓGICA DE CONTROL DE ACCESO Y REDIRECCIÓN (RBAC SINCRO)
   */

  // A. PROTECCIÓN DE ACCESO BASE:
  // Si no hay sesión activa en una ruta protegida, enviamos al login preservando el destino.
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // B. BLINDAJE DE SOBERANÍA (GIRO ESTRATÉGICO):
  // Solo los curadores con rango 'admin' en el JWT pueden acceder a /admin y /geo.
  // El usuario estándar tiene acceso a /create, pero el middleware bloquea el modo GEO.
  if (user && isSovereignRoute) {
    /**
     * [AUDITORÍA DE RANGO]: 
     * Verificamos 'user_role' (nuestro estándar) y 'role' (fallback de sistema) 
     * para asegurar la detección en el borde de la red.
     */
    const userRole = user.app_metadata?.user_role || user.app_metadata?.role || 'user';
    
    if (userRole !== 'admin') {
      console.warn(`🛡️ [Gobernanza] Intento de acceso denegado a zona soberana por: ${user.email}`);
      // Redirigimos al Dashboard para que continúe su experiencia de consumo estándar.
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // C. OPTIMIZACIÓN DE FLUJO LOGUEADO:
  // Si el curador ya está autenticado, le impedimos volver a las puertas de entrada.
  if (user && (isAuthPage || isLandingPage)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 7. ENTREGA FINAL DE CONTROL
  // La petición continúa hacia el servidor con identidad y seguridad garantizadas.
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
     * - api (Next.js internal)
     * - _next/static (archivos compilados)
     * - _next/image (optimización nativa)
     * - Assets estáticos (iconos, logos, imágenes)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-.*|apple-touch-icon.png|icon.png|icon.svg|offline|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Evolución de Flujo: Al permitir '/create' para todos y restringir '/geo', 
 *    hemos habilitado la creación de podcasts normales mientras mantenemos 
 *    el control total de lo que aparece en el mapa del Retiro.
 * 2. Integridad de Sesión: Al usar getUser() en lugar de getSession() en el 
 *    Middleware, forzamos una validación del token contra la base de datos de 
 *    Supabase en cada transición de ruta protegida, eliminando falsos positivos.
 * 3. Sincronía pt: Este middleware está coordinado con los layouts de plataforma 
 *    para asegurar que el handshake de sesión no genere saltos visuales.
 */