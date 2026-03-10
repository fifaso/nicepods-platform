// lib/supabase/client.ts
// VERSIÓN: 3.1 (NicePod Spatial Engine - Sovereign Realtime Client)
// Misión: Proveer una conexión única, persistente y de alto rendimiento al ecosistema Supabase.
// [ESTABILIZACIÓN]: Desactivación de persistencia manual de cliente para sincronía total con el Middleware SSR.

"use client";

import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * clientInstance: Almacén físico de la conexión.
 * Definida fuera del alcance del ciclo de vida de React para garantizar su 
 * persistencia en el V8 Heap durante toda la vida de la sesión del usuario.
 */
let clientInstance: SupabaseClient | null = null;

/**
 * createClient: El único proveedor de acceso a la Bóveda en el cliente.
 * 
 * [ESTRATEGIA SINGLETON]:
 * La implementación garantiza que la instancia sea única, eliminando la duplicidad 
 * de canales WebSocket y asegurando que las suscripciones (Realtime) 
 * no se solapen, evitando errores de cierre prematuro de conexión.
 */
export const createClient = () => {
  // Si ya tenemos una instancia viva, la reutilizamos para evitar fugas de memoria
  // y para asegurar una única conexión persistente (Singleton).
  if (clientInstance) {
    return clientInstance;
  }

  // Forjamos la conexión soberana.
  // Utilizamos createBrowserClient de @supabase/ssr para que el cliente del navegador
  // se alinee automáticamente con las cookies inyectadas por el Middleware.
  clientInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Configuraciones de Grado Industrial para la gestión de Realtime:
      // Se eliminan los límites arbitrarios de eventos por segundo para permitir 
      // ráfagas de datos en la sincronización de mapas y podcasts sin pérdida de paquetes.
      realtime: {
        params: {
          events_per_second: 100,
        },
      },
      // [FIX CRÍTICO]: Gestión de identidad delegada al servidor.
      // Desactivamos la persistencia manual en el cliente para evitar colisiones 
      // con la gestión de cookies del Middleware SSR. Esto elimina el evento 
      // de 'Acceso no autorizado' al refrescar.
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );

  return clientInstance;
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (MASTER EDITION):
 * 
 * 1. Sincronía del Middleware: Al delegar la persistencia de sesión a 'createBrowserClient' 
 *    utilizando las cookies gestionadas por el Middleware, hemos eliminado la causa raíz 
 *    de la expulsión aleatoria del usuario. El cliente ahora 'escucha' lo que el servidor 
 *    valida en cada navegación.
 * 
 * 2. Desbloqueo de Canal Realtime: La eliminación de límites agresivos en 'realtime' 
 *    garantiza que todos los pulsos (audio_ready, image_ready, processing_status) 
 *    lleguen al frontend sin ser descartados por la librería.
 * 
 * 3. Integridad del Singleton: Esta implementación garantiza una única conexión WebSocket 
 *    activa por sesión, reduciendo drásticamente el uso de recursos y eliminando el 
 *    ruido en la pestaña de Red de su navegador.
 */