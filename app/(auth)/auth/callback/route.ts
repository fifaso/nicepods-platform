// app/auth/callback/route.ts
// VERSIÓN: 2.3 (Identity Exchange Protocol - Zero-Collision Edition)
// Misión: Intercambiar tokens de forma atómica y redirigir al usuario eliminando colisiones con el Service Worker.
// [OPTIMIZACIÓN]: Resolución del error '(cancelado)' mediante cabeceras de control de caché y redirección absoluta.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * GET: Handler principal para el intercambio de códigos de Supabase Auth.
 * Este endpoint es el puente crítico entre el proveedor de identidad (Google/Github) 
 * y la sesión persistente en la plataforma NicePod.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  // Determinamos el destino post-autenticación (por defecto el Dashboard).
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';

  /**
   * 1. PROCESAMIENTO DEL CÓDIGO DE INTERCAMBIO
   */
  if (code) {
    const cookieStore = cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    // Intercambio de código por sesión persistente en cookies.
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('🔥 [NicePod-Auth-Handshake] Error crítico de intercambio:', error.message);
      // Redirigimos al login con un parámetro de error para informar al usuario.
      return NextResponse.redirect(`${origin}/login?error=auth_handshake_failed`);
    }
  }

  /**
   * 2. PROTOCOLO DE DESBLOQUEO DE RED (Anti-Cancelación)
   * [RESOLUCIÓN TÉCNICA]:
   * El error '(cancelado)' ocurre porque el Service Worker intenta cachear la respuesta 
   * de redirección mientras el navegador está procesando el cambio de origen.
   * 
   * Aplicamos:
   * - URL Absoluta: Para evitar interpretaciones relativas del Service Worker.
   * - Cache-Control 'no-store': Para que el navegador no intente buscar el Dashboard en disco,
   *   forzando una petición de red fresca que incluya las nuevas cookies de sesión.
   */
  const destinationUrl = new URL(next, origin);

  // Creamos la respuesta de redirección.
  const response = NextResponse.redirect(destinationUrl);

  // Inyectamos cabeceras de bypass para el motor de caché y el Service Worker.
  response.headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  console.log(`✅ [NicePod-Auth] Sesión establecida. Entregando control a: ${next}`);

  return response;
}