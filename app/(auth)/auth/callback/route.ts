// app/auth/callback/route.ts
// VERSIÓN: 2.0 (Identity Bridge Standard - Dashboard Sync)
// Misión: Intercambiar códigos de Auth por sesiones seguras y dirigir al usuario al nuevo núcleo operativo.

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * GET Handler: Orquestador del intercambio de tokens OAuth.
 * Este endpoint es invocado automáticamente por Supabase tras un inicio de sesión exitoso.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // 'next' es la ruta a la que el usuario quería ir originalmente (ej. /create o /map)
  // Si no existe, lo enviamos por defecto al nuevo /dashboard
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = cookies()

    // Inicialización del cliente SSR sincronizado con el sistema de cookies de Next.js
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )

    // Intercambio atómico del código por una sesión persistente
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('🔥 [NicePod-Auth-Callback] Error de intercambio:', error.message)
      // Si el código expira o es inválido, devolvemos al usuario a login con una señal de error
      return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
    }
  }

  /**
   * [MEJORA ESTRATÉGICA]: Redirección Directa al Dashboard
   * Al redirigir a 'next' (que ahora apunta por defecto a /dashboard),
   * evitamos el salto innecesario por la Landing Page pública (/).
   * El Middleware recibirá la petición ya con las cookies establecidas y permitirá el paso.
   */
  return NextResponse.redirect(`${origin}${next}`)
}