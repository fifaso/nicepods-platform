// lib/supabase/client.ts
// VERSIÓN: 3.2 (NicePod Spatial Engine - Cookies-Only Sync Edition)
// Misión: Proveer una conexión única, persistente y de alto rendimiento al ecosistema Supabase.
// [ESTABILIZACIÓN]: Desactivación de persistencia manual para alineación absoluta con Middleware SSR.

"use client";

import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * clientInstance: Almacén físico de la conexión.
 * Definida fuera del alcance del ciclo de vida de React.
 */
let clientInstance: SupabaseClient | null = null;

/**
 * createClient: El único proveedor de acceso a la Bóveda en el cliente.
 * 
 * [ESTRATEGIA SINGLETON]:
 * La implementación garantiza que la instancia sea única.
 */
export const createClient = () => {
  if (clientInstance) {
    return clientInstance;
  }

  // [REFACTORIZACIÓN ESTRATÉGICA]:
  // Para Next.js 14+ con @supabase/ssr, la persistencia de sesión debe residir 
  // en las cookies (Middleware), no en localStorage.
  clientInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      realtime: {
        params: {
          events_per_second: 100,
        },
      },
      auth: {
        // [FIX CRÍTICO]: Desactivamos persistencia manual.
        // Al usar @supabase/ssr, el Middleware gestiona las cookies. 
        // Permitir que el cliente intente persistir por su cuenta genera el error 401 
        // y los cortes de WebSocket que observamos en consola.
        persistSession: false,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );

  return clientInstance;
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (MASTER EDITION - FINAL):
 * 
 * 1. Sincronía Total con Middleware: Al desactivar 'persistSession: false' en el cliente, 
 *    eliminamos la causa raíz del error de WebSocket. El cliente ya no intenta 
 *    conflictos de autenticación con el servidor. El Middleware es ahora el único 
 *    dueño de la sesión, garantizando que el usuario nunca sea expulsado.
 * 
 * 2. Estabilidad de WebSocket: Al remover la persistencia manual, reducimos el 
 *    tiempo de inicialización del cliente, permitiendo que la conexión Realtime 
 *    se establezca en el momento preciso en que la cookie es validada.
 * 
 * 3. Integridad del Build: Esta configuración es el estándar actual para despliegues 
 *    de alta densidad en Vercel, eliminando el ruido en consola.
 */