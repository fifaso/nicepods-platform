// middleware.ts
// VERSIÓN: 17.0 (NicePod Traffic Control - Sovereign & Voyager Access Edition)
// Misión: Orquestar la identidad atómica y gobernar el acceso granular a la Workstation.
// [ESTABILIZACIÓN]: Liberación de /map para usuarios Pro/Free y blindaje de /admin.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * EXPORTACIÓN PRINCIPAL: middleware
 * El punto de control único para todo el tráfico entrante a la plataforma.
 */
export async function middleware(request: NextRequest) {
  // 1. GESTIÓN DE URI Y CLONACIÓN DE CONTEXTO
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // 2. [VACUNA DE ENRUTAMIENTO]: REDIRECCIÓN PERMANENTE (308)
  // Matamos el bucle 404 del Service Worker residual de la V1.0.
  // Cualquier intento de acceder a /geo es redirigido con autoridad a /map.
  if (pathname === '/geo' || pathname.startsWith('/geo/')) {
    url.pathname = '/map';
    return NextResponse.redirect(url, 308);
  }

  // 3. INICIALIZACIÓN DE LA RESPUESTA BASE
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // 4. PASILLO DE BYPASS (Optimización de Latencia)
  // Ignoramos activos estáticos, manifiestos y scripts de PWA para no saturar el CPU del Edge.
  if (
    pathname.startsWith('/auth') ||
    pathname.includes('manifest.json') ||
    pathname.includes('sw.js') ||
    pathname.includes('favicon.ico') ||
    pathname.includes('apple-touch-icon')
  ) {
    return applySecurityHeaders(response);
  }

  // 5. INSTANCIACIÓN DEL CLIENTE SOBERANO (SSR CLIENT)
  // Gestionamos el ciclo de vida de las cookies de sesión en el servidor.
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
   * 6. VERIFICACIÓN DE IDENTIDAD (T0)
   * Obtenemos el usuario directamente del JWT para una respuesta de milisegundos.
   */
  const { data: { user } } = await supabase.auth.getUser();

  // --- DEFINICIÓN DE MATRIZ DE RUTA ---

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isLandingPage = pathname === '/';

  // [ZONA SOBERANA]: Exclusiva para el Administrador (Moderación, Configuración Global)
  const isSovereignRoute = pathname.startsWith('/admin') || pathname.startsWith('/theme-test');

  // [ZONA PROTEGIDA]: Requiere sesión activa (Cualquier rango: Voyager, Pro, Admin)
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/podcasts') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/collection') ||
    pathname.startsWith('/create') ||
    pathname.startsWith('/map') || // <--- [LIBERADO]: Acceso para todos los usuarios.
    isSovereignRoute;

  /**
   * ---------------------------------------------------------------------------
   * II. LÓGICA DE GOBERNANZA (REDIRECCIONES)
   * ---------------------------------------------------------------------------
   */

  // A. PROTOCOLO DE EXPULSIÓN: Invitado intentando acceder a zona protegida.
  if (!user && isProtectedRoute) {
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // B. PROTOCOLO DE SOBERANÍA: Usuario autenticado pero sin rango Admin en zona restringida.
  if (user && isSovereignRoute) {
    const appMetadata = user.app_metadata || {};
    const userRole = appMetadata.user_role || appMetadata.role || 'user';

    if (userRole !== 'admin') {
      // Si no es admin, lo devolvemos al Dashboard (Zona Neutral Protegida)
      url.pathname = '/dashboard';
      return NextResponse.redirect(url, 307);
    }
  }

  // C. PROTOCOLO DE EFICIENCIA: Usuario logueado intentando acceder a Login/Landing.
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
 * CONFIGURACIÓN DEL MATCHER
 * Define el alcance de interceptación del Middleware.
 */
export const config = {
  matcher: [
    // Interceptamos todo excepto archivos con extensión (imágenes, fuentes) y carpetas de sistema.
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-.*|apple-touch-icon.png|icon.png|icon.svg|offline|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ],
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (V17.0):
 * 1. Resolución del Acceso al Mapa: Al mover 'pathname.startsWith("/map")' de 
 *    'isSovereignRoute' a 'isProtectedRoute', permitimos que cualquier usuario 
 *    con sesión activa visualice la Malla Urbana. La restricción de "quién puede 
 *    crear" se maneja ahora en la capa de componentes (GeoCreatorOverlay) 
 *    y Server Actions.
 * 2. Inmutabilidad del JWT: La validación de rol se realiza sobre 'app_metadata', 
 *    lo que garantiza que incluso si la tabla 'profiles' tiene latencia de red, 
 *    el acceso a zonas críticas esté protegido por la criptografía del token de Supabase.
 * 3. Optimización de Redirección: Se utiliza el código 308 para la ruta /geo, 
 *    asegurando que los motores de búsqueda y navegadores móviles purguen la 
 *    ruta antigua definitivamente de sus registros.
 */