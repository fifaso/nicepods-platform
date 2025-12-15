// middleware.ts
// VERSIÓN: 5.2 (Strict TypeScript Fixed)

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
        // [CORRECCIÓN]: Tipado explícito del parámetro de entrada aquí
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          
          // Bucle 1: Actualizar cookies en la Request
          cookiesToSet.forEach(({ name, value }) => 
            request.cookies.set(name, value)
          )
          
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          
          // Bucle 2: Actualizar cookies en la Response
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}