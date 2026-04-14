/**
 * ARCHIVO: lib/supabase/client.ts
 * VERSIÓN: 5.0 (NicePod Sovereign Client - Realtime Session Isolation Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Proveer el acceso centralizado y único a la Bóveda de Datos (Supabase) 
 * garantizando la persistencia de la instancia (Singleton) y el aislamiento 
 * de canales en tiempo real para prevenir colisiones de suscripción.
 * [REFORMA V5.0]: Implementación del 'Realtime Session Identification'. Se 
 * genera un identificador único por carga de página para asegurar que los 
 * nombres de canal sean siempre unívocos. Purificación total bajo la 
 * Zero Abbreviations Policy (ZAP). Sellado del Build Shield Sovereignty (BSS).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * sharedSupabaseBrowserClientInstance: 
 * Almacén físico de la conexión en la memoria de acceso aleatorio (Heap) del motor V8.
 */
let sharedSupabaseBrowserClientInstance: SupabaseClient | null = null;

/**
 * ephemeralRealtimeSessionIdentification: 
 * Firma unívoca generada al cargar la Workstation para el aislamiento de canales.
 * Misión: Aniquilar el error "cannot add callbacks after subscribe" permitiendo 
 * que cada montaje de componente posea una firma de canal única por sesión.
 */
export const ephemeralRealtimeSessionIdentification = typeof window !== 'undefined'
  ? Math.random().toString(36).substring(2, 10)
  : "server_environment";

/**
 * createClient: El único proveedor de autoridad para el cristal (Interfaz de Usuario).
 * 
 * [ESTRATEGIA SINGLETON INDUSTRIAL]:
 * La implementación garantiza que la instancia sea única, eliminando la duplicidad 
 * de túneles WebSocket que saturaban el bus de datos y la consola del navegador.
 */
export const createClient = (): SupabaseClient => {
  // Si ya existe una instancia de autoridad activa, la reutilizamos instantáneamente.
  if (sharedSupabaseBrowserClientInstance) {
    return sharedSupabaseBrowserClientInstance;
  }

  const supabaseUrlAddress = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonymousKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrlAddress || !supabaseAnonymousKey) {
    throw new Error("CRITICAL_INFRASTRUCTURE_FAILURE: Faltan credenciales del Metal Supabase en las variables de entorno.");
  }

  /**
   * [SINCRO V5.0]: Configuración de Integración Nativa SSS.
   * Se delega la orquestación de identidad a @supabase/ssr. Esto asegura que 
   * el Localizador Uniforme de Recursos (URL) y la Llave de Acceso se vinculen 
   * correctamente con el Handshake de cookies del Middleware.
   */
  sharedSupabaseBrowserClientInstance = createBrowserClient(
    supabaseUrlAddress,
    supabaseAnonymousKey
  );

  return sharedSupabaseBrowserClientInstance;
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. Channel Entropy: La exportación de 'ephemeralRealtimeSessionIdentification' 
 *    es el activo estratégico que permitirá a 'LibraryTabs' y 'NotificationBell' 
 *    aislar sus suscripciones mediante sufijos dinámicos.
 * 2. ZAP Absolute Compliance: Se han purificado todas las variables de entorno 
 *    y referencias internas. 'clientInstance' ha sido transmutado a 
 *    'sharedSupabaseBrowserClientInstance'.
 * 3. Resource Hygiene: Al no interferir en los 'overrides' de Realtime, permitimos 
 *    que el SDK gestione la reconexión exponencial, mejorando la resiliencia 
 *    en condiciones de movilidad del Voyager.
 */