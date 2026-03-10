// middleware.ts
// VERSIÓN: 15.0 (NicePod Traffic Control - Sovereign & High Performance)
// Misión: Orquestar la autenticación atómica, el control de acceso y la seguridad industrial.
// [ESTABILIZACIÓN]: Optimización de la respuesta atómica y alineación con la nueva ruta /map.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // 1. INICIALIZACIÓN DE RESPUESTA
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const url = new URL(request.url);
  const pathname = url.pathname;

  // 2. PASILLO DE BYPASS (Prioridad máxima para activos PWA)
  if (
    pathname.startsWith('/auth') ||
    pathname.includes('manifest.json') ||
    pathname.includes('sw.js') ||
    pathname.includes('favicon.ico') ||
    pathname.includes('apple-touch-icon')
  ) {
    return response;
  }

  // 3. INSTANCIACIÓN DEL CLIENTE SSR
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // --- DEFINICIÓN DE PERÍMETROS OPERATIVOS ---
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isLandingPage = pathname === '/';

  // RUTA SOBERANA: Mapa y Admin requieren privilegios elevados.
  const isSovereignRoute = pathname.startsWith('/admin') || pathname.startsWith('/map');

  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/podcasts') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/collection') ||
    pathname.startsWith('/create') ||
    isSovereignRoute;

  // A. PROTECCIÓN DE ACCESO BASE
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // B. BLINDAJE DE SOBERANÍA (RBAC)
  if (user && isSovereignRoute) {
    const appMetadata = user.app_metadata || {};
    const userRole = appMetadata.user_role || appMetadata.role || 'user';

    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // C. OPTIMIZACIÓN DE FLUJO
  if (user && (isAuthPage || isLandingPage)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 4. INYECCIÓN FINAL DE CABECERAS DE SEGURIDAD (Aplicado una sola vez al final)
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-.*|apple-touch-icon.png|icon.png|icon.svg|offline|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Consolidación de Respuesta: Se eliminó la re-instanciación de 'NextResponse' 
 *    dentro del 'setAll'. Ahora, las cookies se aplican directamente al objeto de 
 *    respuesta original, evitando el riesgo de perder cabeceras de seguridad.
 * 2. RBAC de Mapa: Se ha integrado '/map' en 'isSovereignRoute', garantizando 
 *    que la visualización geoespacial avanzada solo esté disponible para curadores 
 *    con rango administrador.
 * 3. Eficiencia: El Middleware ahora es lineal y no condicional, lo que garantiza 
 *    la máxima velocidad en el Edge de Vercel.
 */