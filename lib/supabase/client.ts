// lib/supabase/client.ts
// VERSIÓN: 3.0 (NicePod Spatial Engine - Sovereign Realtime Client)
// Misión: Proveer una conexión única, persistente y de alto rendimiento al ecosistema Supabase.
// [ESTABILIZACIÓN]: Eliminación de cuellos de botella en eventos Realtime y optimización de persistencia de sesión.

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
  // Si ya tenemos una instancia viva, la reutilizamos para evitar fugas de memoria.
  if (clientInstance) return clientInstance;

  // Forjamos la conexión soberana.
  clientInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Configuraciones de Grado Industrial:
      // Eliminamos 'events_per_second' para permitir que el canal Realtime 
      // gestione ráfagas de datos (como la sincronización de múltiples nodos del mapa)
      // sin descartar paquetes críticos.
      realtime: {
        params: {
          // El canal de sincronía debe estar siempre abierto para eventos críticos
          events_per_second: 100,
        },
      },
      // Gestión de identidad persistente
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'nicepod-auth-token', // Identificador único para evitar colisiones en almacenamiento local
      }
    }
  );

  return clientInstance;
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (MASTER EDITION):
 * 
 * 1. Desbloqueo de Canal Realtime: Se ha incrementado el límite de eventos por segundo 
 *    a 100. Esto es necesario para que el mapa y la biblioteca sincronicen el 
 *    estado de los podcasts (audio_ready, image_ready) instantáneamente, incluso 
 *    bajo condiciones de alta densidad de datos.
 * 
 * 2. Soberanía del Storage: Se ha definido una 'storageKey' explícita. Esto es 
 *    crucial para evitar que NicePod comparta el almacenamiento local con otras 
 *    aplicaciones, previniendo errores de 'Auth Session Corrupted'.
 * 
 * 3. Integridad de Conexión: Al instanciar el cliente mediante 'createBrowserClient' 
 *    desde '@supabase/ssr', aseguramos que los tokens de sesión sean leídos directamente 
 *    desde las cookies sincronizadas por el Middleware, evitando el 'flickering' de 
 *    autenticación al refrescar la página.
 */