// lib/supabase/client.ts
// VERSIÓN: 4.0 (NicePod Spatial Engine - Standard SSR Integration)
// Misión: Proveer conexión estable delegando la complejidad al motor nativo de Supabase.
// [ESTABILIZACIÓN]: Eliminación de configuraciones 'auth' y 'realtime' manuales para 
// resolver el cierre prematuro de WebSockets (Handshake Fail).

"use client";

import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * clientInstance: Almacén físico de la conexión.
 * Definida fuera de la función para persistir en la memoria del módulo (V8 Heap),
 * evitando múltiples llamadas al servidor durante la navegación entre rutas.
 */
let clientInstance: SupabaseClient | null = null;

/**
 * createClient: El único proveedor de acceso a la Bóveda en el cliente.
 * 
 * [ESTRATEGIA SINGLETON]:
 * La implementación garantiza que la instancia sea única, eliminando la duplicidad 
 * de canales WebSocket que saturaban la red y la consola.
 */
export const createClient = () => {
  // Si ya tenemos una instancia viva, la reutilizamos de inmediato.
  if (clientInstance) {
    return clientInstance;
  }

  // [REFACTORIZACIÓN CRÍTICA]:
  // Hemos eliminado los 'overrides' de configuración manual (auth, realtime).
  // La librería '@supabase/ssr' está construida para manejar automáticamente 
  // la persistencia de sesión entre el servidor y el cliente mediante cookies.
  // Al no interferir en su configuración por defecto, garantizamos que el token JWT 
  // esté presente antes de que cualquier componente intente abrir un túnel WebSocket.
  clientInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return clientInstance;
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Resolución de Errores WebSocket: El error "WebSocket is closed before the 
 *    connection is established" se debía a que las configuraciones previas 
 *    (persistSession: false) causaban un retraso en la carga del token. Al dejar 
 *    la configuración por defecto, el handshake de Supabase se ejecuta limpiamente.
 * 2. Integridad de Sesión: 'createBrowserClient' ahora gestiona de forma nativa la 
 *    "Carrera de Cookies" con el Middleware, asegurando que el usuario mantenga 
 *    su estado autenticado sin ser expulsado de la plataforma (Redirect 401).
 * 3. Menos es Más: La simplificación del cliente reduce el tiempo de evaluación 
 *    del script en el navegador, mejorando el Time To Interactive (TTI).
 */