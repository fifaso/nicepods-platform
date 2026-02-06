import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * [NICEPOD ACCESS PROTOCOL V2.5 - STRICTURE TYPE-SAFE]
 * Este middleware gestiona el túnel de acceso y la persistencia de sesión
 * eliminando ruidos de hidratación y bucles de redirección.
 */
export async function middleware(request: NextRequest) {
  // 1. Inicializar respuesta base
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Cliente Supabase SSR con Tipado Explícito
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        /**
         * Tipamos explícitamente el array de cookies para resolver errores TS7006 y TS7031.
         */
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Actualizar cookies en el objeto de petición original
            request.cookies.set(name, value)
            // Actualizar cookies en la respuesta final que va al navegador
            response.cookies.set(name, value, options)
          })

          // Sincronizar la respuesta para reflejar el nuevo estado de la sesión
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })

          // Re-aplicar las cookies a la nueva instancia de respuesta
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Validación de Identidad del Servidor
  // Usamos getUser() para una validación real contra el Auth de Supabase (No manipulable)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = new URL(request.url)
  const isAuthPage = url.pathname === '/login' || url.pathname === '/signup'

  /**
   * DEFINICIÓN DE RUTAS DE LA PLATAFORMA (PROTEGIDAS)
   */
  const isPlatformPage =
    url.pathname.startsWith('/create') ||
    url.pathname.startsWith('/podcasts') ||
    url.pathname.startsWith('/profile') ||
    url.pathname.startsWith('/geo') ||
    url.pathname.startsWith('/map') ||
    url.pathname.startsWith('/dashboard') ||
    url.pathname.startsWith('/admin')

  // 4. LÓGICA DE REDIRECCIÓN MAESTRA (Resolución del Loop)

  // REGLA 1: Evitar que usuarios logueados vean la página de Login
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // REGLA 2: Bloquear acceso de invitados a la Workstation
  if (!user && isPlatformPage) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', url.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // REGLA 3: Redirigir de la Landing (/) al Dashboard si ya hay sesión
  if (user && url.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

/**
 * CONFIGURACIÓN DEL MATCHER (PROTECCIÓN PWA Y ASSETS)
 */
export const config = {
  matcher: [
    /*
     * Excluimos assets estáticos, archivos de PWA y Service Workers
     * para maximizar la velocidad y evitar refrescos innecesarios.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-.*|offline|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}