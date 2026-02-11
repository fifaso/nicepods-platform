// app/auth/callback/route.ts
// VERSIÓN: 2.2 (Identity Exchange Protocol - NicePod Standard)
// Misión: Intercambiar tokens y entregar el control de forma limpia, evitando colisiones de red.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * GET: Endpoint de intercambio de tokens OAuth.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  // Determinamos el destino final. Por defecto, el Dashboard operativo.
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';

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
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    // Intercambio atómico de código por sesión.
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('🔥 [NicePod-Auth-Callback] Error de intercambio:', error.message);
      return NextResponse.redirect(`${origin}/login?error=auth_handshake_failed`);
    }
  }

  /**
   * [PROTOCOLO DE ENTREGA LIMPIA]:
   * Redirigimos a la URL absoluta para asegurar que el navegador procese 
   * el cambio de estado como una navegación nueva y fresca.
   */
  return NextResponse.redirect(new URL(next, request.url));
}