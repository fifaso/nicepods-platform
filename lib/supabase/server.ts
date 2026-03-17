// lib/supabase/server.ts
// VERSIÓN: 2.0 (NicePod Sovereign Server Bridge - Stable Session Edition)
// Misión: Orquestar el cliente de Supabase en el servidor con persistencia garantizada.
// [ESTABILIZACIÓN]: Normalización de cookies para evitar bucles de redirección.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * createClient:
 * Genera una instancia del cliente de Supabase para su uso en Server Components, 
 * Server Actions y Route Handlers de Next.js.
 */
export const createClient = () => {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /**
         * get: Recupera la llave de sesión del almacén de cookies del servidor.
         */
        get(name: string) {
          return cookieStore.get(name)?.value;
        },

        /**
         * set: Inyecta el token de sesión en la respuesta HTTP.
         * [SANEAMIENTO]: Forzamos el path '/' para que la sesión sea compartida 
         * entre el Dashboard y el Radar de Madrid sin excepciones.
         */
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({
              name,
              value,
              ...options,
              path: '/', // Soberanía total en todas las rutas
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production'
            });
          } catch (error) {
            // El error se captura silenciosamente si se invoca desde un Server Component,
            // ya que el Middleware se encargará de la sincronía de la cookie.
          }
        },

        /**
         * remove: Purga física del token de sesión.
         */
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({
              name,
              value: '',
              ...options,
              path: '/',
              maxAge: 0 // Forzamos expiración inmediata en el navegador
            });
          } catch (error) {
            // Silencio operativo en Server Components
          }
        },
      },
    }
  );
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. Garantía de Ubicuidad: Al fijar 'path: "/"', eliminamos la posibilidad de que 
 *    el navegador cree cookies separadas para subrutas, lo cual era la causa 
 *    probable del bucle infinito de redirección del Admin hacia el login.
 * 2. Seguridad Lax: Usar 'sameSite: "lax"' es el equilibrio perfecto entre 
 *    seguridad contra CSRF y una navegación fluida entre Vercel y Supabase Auth.
 * 3. Robustez SSR: Esta configuración asegura que la sesión se refresque 
 *    correctamente incluso si la petición se origina desde un dispositivo móvil 
 *    con el modo de ahorro de datos activado.
 */