// actions/search-actions.ts
// VERSIÓN: 4.0

"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * INTERFAZ: SearchActionResponse
 * Contrato de respuesta unificado que define cómo el servidor comunica
 * los hallazgos semánticos a la interfaz de usuario.
 */
export type SearchActionResponse<T = any> = {
  success: boolean;
  message: string;
  results?: T;
  error?: string;
  traceId?: string;
};

/**
 * FUNCIÓN: searchGlobalIntelligence
 * Misión: Ejecutar una búsqueda de alta resolución en toda la red de NicePod.
 * 
 * [ARQUITECTURA V4]:
 * - Invoca la Edge Function 'search-pro' (V4.1 Lite).
 * - Transmite la intención del usuario y el contexto geoespacial.
 * - Actúa como barrera de seguridad Server-Side.
 * 
 * @param query - La intención semántica o término de búsqueda.
 * @param latitude - Coordenada de latitud (Madrid Resonance Anchor).
 * @param longitude - Coordenada de longitud (Madrid Resonance Anchor).
 * @param limit - Volumen de resultados esperado.
 */
export async function searchGlobalIntelligence(
  query: string,
  latitude?: number,
  longitude?: number,
  limit: number = 20
): Promise<SearchActionResponse> {
  const supabase = createClient();

  // 1. PROTOCOLO DE HIGIENE INICIAL
  // Validamos que la intención tenga sustancia antes de gastar recursos de red.
  const targetQuery = query?.trim();
  if (!targetQuery || targetQuery.length < 3) {
    return {
      success: false,
      message: "La intención es insuficiente. Proporcione al menos 3 caracteres.",
      results: []
    };
  }

  try {
    console.info(`🔍 [Search-Bridge] Despachando pulso semántico: "${targetQuery.substring(0, 30)}..."`);

    /**
     * 2. INVOCACIÓN DEL MOTOR UNIFICADO (Edge Function V4.1)
     * Utilizamos invoke() para delegar la vectorización y el matching vectorial.
     * La función 'search-pro' ahora opera en modo Lite (sin guardias pesados) para velocidad.
     */
    const { data, error: functionError } = await supabase.functions.invoke('search-pro', {
      body: {
        query: targetQuery,
        userLat: latitude || null, // Normalización explícita para evitar undefined
        userLng: longitude || null,
        match_count: limit,
        match_threshold: 0.18, // Umbral calibrado para alta sensibilidad en fase de arranque
        mode: 'search'
      }
    });

    // 3. GESTIÓN DE ERRORES DE SUBSISTEMA
    if (functionError) {
      console.error(`🛑 [Search-Bridge] El motor de búsqueda devolvió un error técnico:`, functionError);
      throw new Error(`FALLO_SISTEMA_BUSQUEDA: ${functionError.message || 'Error desconocido en Edge'}`);
    }

    /**
     * 4. NORMALIZACIÓN DE HALLAZGOS
     * Los resultados vienen ya categorizados (podcast, user, place, vault_chunk) 
     * desde el RPC 'unified_search_v4'.
     */
    const localizedResults = data || [];

    return {
      success: true,
      message: `Resonancia establecida. Localizados ${localizedResults.length} nodos de interés.`,
      results: localizedResults
    };

  } catch (error: any) {
    console.error("🔥 [Search-Bridge-Fatal]:", error.message);

    return {
      success: false,
      message: "El radar semántico no pudo estabilizar la señal.",
      error: error.message,
      results: []
    };
  }
}

/**
 * FUNCIÓN: getDiscoverySignals
 * Misión: Recuperar el 'Pulso' de la plataforma (Trending/Discovery) cuando no hay query activa.
 * 
 * Útil para la hidratación inicial del Centro de Descubrimiento o para 
 * sugerir contenido cuando el usuario abre el portal de búsqueda vacío.
 */
export async function getDiscoverySignals(
  latitude?: number,
  longitude?: number
): Promise<SearchActionResponse> {
  const supabase = createClient();

  try {
    console.info(`🌍 [Search-Bridge] Solicitando señales de descubrimiento global.`);

    // Invocamos el motor en modo 'discovery' (Bypass de vectorización)
    const { data, error } = await supabase.functions.invoke('search-pro', {
      body: {
        userLat: latitude || null,
        userLng: longitude || null,
        match_count: 10,
        mode: 'discovery' // Flag estratégico para activar lógica de popularidad/proximidad
      }
    });

    if (error) throw error;

    return {
      success: true,
      message: "Señales de descubrimiento sincronizadas.",
      results: data || []
    };
  } catch (error: any) {
    console.warn("⚠️ [Search-Bridge] Fallo parcial en Discovery Signals:", error.message);
    return {
      success: false,
      message: "No se pudo interceptar el pulso de la red.",
      error: error.message,
      results: []
    };
  }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Eficiencia de Carga: Esta Server Action actúa como un proxy autorizado,
 *    inyectando automáticamente la SERVICE_ROLE_KEY necesaria para que la 
 *    Edge Function 'search-pro' acepte la petición.
 * 2. Normalización de GPS: El tratamiento de 'latitude || null' es crucial. 
 *    Si pasáramos 'undefined', el JSON del cuerpo de la petición podría perder 
 *    esa clave, causando un comportamiento impredecible en la lógica de Deno.
 * 3. Diseño de Respaldo: El método 'getDiscoverySignals' asegura que la UI 
 *    siempre tenga datos para mostrar, incluso si el usuario aún no ha escrito nada.
 */