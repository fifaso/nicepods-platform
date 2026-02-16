// middleware.ts
// VERSIÓN: 10.0 (NicePod Access Protocol - Zero-Flicker & RBAC Standard)
// Misión: Orquestar el acceso soberano, blindar el área administrativa y sincronizar la identidad en el borde.
// [ESTABILIZACIÓN]: Eliminación de latencia de hidratación mediante la sincronía de cookies en un solo ciclo de red.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * middleware: Único punto de control de tráfico de la infraestructura NicePod V2.5.
 * Este orquestador intercepta cada petición antes de que llegue a los Server Components.
 */
export async function middleware(request: NextRequest) {
  // 1. INICIALIZACIÓN DEL CONTENEDOR DE RESPUESTA
  // Creamos una respuesta base que permitirá el flujo de la petición.
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const url = new URL(request.url);
  const pathname = url.pathname;

  /**
   * 2. PASILLO DE SEGURIDAD (Bypass de Latencia)
   * Excluimos rutas de autenticación nativa y activos críticos de la PWA.
   * Esto garantiza que el Service Worker y el intercambio de tokens OAuth 
   * operen con latencia cero y sin interrupciones del middleware.
   */
  if (
    pathname.startsWith('/auth') ||
    pathname.includes('manifest.json') ||
    pathname.includes('sw.js') ||
    pathname.includes('favicon.ico')
  ) {
    return response;
  }

  // 3. INSTANCIACIÓN DEL CLIENTE SUPABASE SSR
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

          // Re-aplicamos las cookies a la nueva instancia de respuesta.
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  /**
   * 4. VALIDACIÓN DE IDENTIDAD SOBERANA
   * getUser() valida el token contra el servidor de autenticación. 
   * Es la única forma de garantizar que la sesión no ha sido manipulada localmente.
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- DEFINICIÓN DE PERÍMETROS OPERATIVOS ---
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isAdminPage = pathname.startsWith('/admin');
  const isPlatformPage =
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
   * 5. LÓGICA DE REDIRECCIÓN Y AUTORIDAD (RBAC)
   */

  // A. PROTECCIÓN DE LA WORKSTATION:
  // Si un usuario no autenticado intenta acceder a la plataforma, lo enviamos al login.
  if (!user && isPlatformPage) {
    const redirectUrl = new URL('/login', request.url);
    // Preservamos la ruta original para una redirección suave post-login.
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // B. BLINDAJE ADMINISTRATIVO:
  // Validamos el rol 'admin' directamente desde los metadatos del JWT (Soberanía de Token).
  // Nota: user_role se inyecta vía trigger SQL en auth.users -> raw_app_meta_data.
  if (user && isAdminPage) {
    const userRole = user.app_metadata?.user_role || 'user';
    if (userRole !== 'admin') {
      console.warn(`🛑 [Seguridad] Acceso denegado a /admin para: ${user.email}`);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // C. OPTIMIZACIÓN DE FLUJO:
  // Si el usuario ya está logueado, le impedimos volver a las páginas de acceso (Login/Signup).
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // D. REDIRECCIÓN DE EFICIENCIA:
  // Si el usuario ya está autenticado y llega a la landing, lo llevamos directo a su Centro de Mando.
  if (user && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 6. ENTREGA DE CONTROL
  // La petición continúa hacia el servidor con la sesión perfectamente sincronizada.
  return response;
}

/**
 * CONFIGURACIÓN DEL MATCH TRÁFICO
 * Excluimos archivos estáticos, imágenes y APIs internas para no sobrecargar el middleware.
 */
export const config = {
  matcher: [
    /*
     * Match de todas las rutas excepto:
     * - api (rutas API internas)
     * - _next/static (archivos estáticos de Next.js)
     * - _next/image (optimización de imágenes)
     * - favicon.ico, manifest.json, sw.js (PWA assets)
     * - Extensiones de imagen comunes
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-.*|apple-touch-icon.png|icon.png|icon.svg|offline|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};