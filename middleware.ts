// middleware.ts
// VERSIÓN: 6.0 (Offline Route Exclusion for PWA Stability)

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
    // [CAMBIO ESTRATÉGICO]: Agregamos '|offline' a la lista de exclusión.
    // Esto garantiza que la página estática de fallback se sirva instantáneamente
    // sin procesamiento de servidor, permitiendo que el Service Worker la cachee limpiamente.
    '/((?!_next/static|_next/image|favicon.ico|offline|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}