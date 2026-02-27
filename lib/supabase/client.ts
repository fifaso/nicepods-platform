// lib/supabase/client.ts
// VERSIÓN: 2.0

import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * clientInstance: Almacén físico de la conexión.
 * Definida fuera de la función para persistir en la memoria del módulo (V8 Heap).
 */
let clientInstance: SupabaseClient | null = null;

/**
 * createClient: El único proveedor de acceso a la Bóveda en el cliente.
 * 
 * [ESTRATEGIA SINGLETON]:
 * Si la instancia ya existe, la devolvemos inmediatamente sin crear una nueva.
 * Esto aniquila la duplicidad de WebSockets y silencia el error 'closed before established'.
 */
export const createClient = () => {
  // Si ya tenemos una instancia viva, la reutilizamos.
  if (clientInstance) return clientInstance;

  // Si es la primera invocación, forjamos la conexión soberana.
  clientInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Configuraciones de Grado Industrial para Realtime
      realtime: {
        params: {
          events_per_second: 10, // Limitamos para evitar saturación del hilo principal
        },
      },
      // Habilitamos la persistencia de sesión nativa
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );

  return clientInstance;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Eficiencia de Memoria: Al usar una variable let externa, garantizamos que 
 *    el recolector de basura (Garbage Collector) no elimine la conexión 
 *    durante las transiciones de ruta en Next.js.
 * 2. Unificación de Sockets: Todos los hooks (usePodcastSync, useNotifications) 
 *    compartirán ahora el mismo túnel wss://, reduciendo el consumo de CPU 
 *    y eliminando el ruido en la pestaña de Red (Network).
 * 3. Sincronía SSR: Este cliente está diseñado para trabajar en armonía con 
 *    nuestro middleware, detectando el JWT inyectado en las cookies de forma atómica.
 */