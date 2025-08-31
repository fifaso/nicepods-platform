// app/auth/callback/route.ts

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { type CookieOptions, createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Si tenemos un 'code', lo intercambiamos por una sesión.
  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }) },
          remove(name: string, options: CookieOptions) { cookieStore.delete({ name, ...options }) },
        },
      }
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('Error al intercambiar el código por la sesión:', error)
      return NextResponse.redirect(`${origin}/login?error=auth_error`)
    }
  }

  // LA MEJORA CLAVE:
  // En lugar de redirigir a una ruta específica como '/create', SIEMPRE redirigimos
  // a una URL de "siguiente paso" que el middleware interceptará. Esto le da al
  // middleware la oportunidad de procesar las cookies recién establecidas ANTES
  // de decidir el destino final del usuario.
  return NextResponse.redirect(`${origin}/`)
}