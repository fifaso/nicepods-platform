// middleware.ts
// VERSIÓN: 7.0 (Critical PWA Exclusion)

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Crear respuesta inicial
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Cliente Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => 
            request.cookies.set(name, value)
          )
          
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Refrescar sesión
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    /*
     * Matcher Negativo (Exclusiones):
     * - _next/static, _next/image, favicon.ico: Assets estáticos.
     * - offline: La página de fallback debe ser estática y sin auth de servidor.
     * - manifest.json: El manifiesto de la PWA.
     * - sw.js: El Service Worker.
     * - workbox-*.js: Scripts internos de Workbox.
     * - Extensiones de imágenes.
     */
    '/((?!_next/static|_next/image|favicon.ico|offline|manifest.json|sw.js|workbox-.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}