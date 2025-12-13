// middleware.ts
// VERSIÓN: 3.0 (Security First: Arcjet + Supabase)

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import arcjet, { detectBot, tokenBucket } from "@arcjet/next";

// DEFINICIÓN DE SEGURIDAD
const aj = arcjet({
  key: process.env.ARCJET_KEY!, // ¡Asegúrate de tener esta ENV!
  rules: [
    // 1. Bloqueo de Bots automatizados (permite buscadores como Google)
    detectBot({
      mode: "LIVE", 
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
    // 2. Rate Limiting: 20 peticiones cada 60s por IP (Prevención de DDoS ligero)
    tokenBucket({
      mode: "LIVE",
      refillRate: 20,
      interval: 60,
      capacity: 20,
    }),
  ],
});

export async function middleware(request: NextRequest) {
  // --- CAPA 1: SEGURIDAD (ARCJET) ---
  // Solo aplicamos seguridad estricta a rutas API y de autenticación para no afectar navegación estática
  if (request.nextUrl.pathname.startsWith('/api') || request.nextUrl.pathname.startsWith('/auth')) {
    const decision = await aj.protect(request, { requested: 1 });

    if (decision.isDenied()) {
      console.warn(`[Arcjet] Acceso denegado: ${decision.reason.type} - IP: ${request.ip}`);
      
      if (decision.reason.isRateLimit()) {
        return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
      }
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // --- CAPA 2: RESPUESTA INICIAL ---
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // --- CAPA 3: SUPABASE AUTH (Gestión de Sesión) ---
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Refrescar sesión (Mantiene la cookie viva)
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    // Excluir archivos estáticos, imágenes y favicon
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}