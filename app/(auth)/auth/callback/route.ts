// app/auth/callback/route.ts
// VERSIÓN: 2.1 (Identity Exchange Protocol - NicePod Standard)
// Misión: Intercambiar tokens de proveedores externos (Google, etc.) por sesiones soberanas de NicePod.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * GET: Endpoint de intercambio de tokens.
 * Invocado por Supabase tras el éxito en el proveedor de identidad.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  // 'next' es la coordenada de destino original del usuario.
  // Por defecto, lo enviamos al Dashboard (el nuevo núcleo operativo).
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';

  if (code) {
    const cookieStore = cookies();

    /**
     * Inicialización del cliente SSR con sincronía total de cookies.
     * Es imperativo usar la misma lógica que el middleware para evitar 
     * desajustes de sesión en el primer renderizado.
     */
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
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    // Ejecutamos el intercambio de código por sesión persistente
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('🔥 [NicePod-Auth-Critical] Fallo en el intercambio de código:', error.message);
      // En caso de código expirado o inválido, redirigimos a login con bandera de error
      return NextResponse.redirect(`${origin}/login?error=auth_handshake_failed`);
    }
  }

  /**
   * [MEJORA ESTRATÉGICA]: Redirección Directa a la Workstation
   * Al redirigir directamente a la ruta 'next' (Dashboard por defecto),
   * aseguramos que el Middleware reciba la petición ya con las cookies 
   * establecidas en el paso anterior.
   */
  return NextResponse.redirect(`${origin}${next}`);
}