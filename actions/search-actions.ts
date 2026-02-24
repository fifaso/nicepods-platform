"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * INTERFAZ: SearchActionResponse
 * Contrato de respuesta unificado para el sistema de radar semántico.
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
 * [ARQUITECTURA V3]:
 * Esta acción despacha la intención del usuario a la Edge Function 'search-pro',
 * la cual centraliza la vectorización y la consulta SQL en un solo viaje de red.
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
  limit: number = 15
): Promise<SearchActionResponse> {
  const supabase = createClient();

  // 1. PROTOCOLO DE HIGIENE INICIAL
  const targetQuery = query?.trim();
  if (!targetQuery || targetQuery.length < 3) {
    return {
      success: false,
      message: "La intención es insuficiente. Proporcione al menos 3 caracteres.",
      results: []
    };
  }

  try {
    console.info(`🔍 [Search-Bridge] Despachando pulso semántico: "${targetQuery.substring(0, 20)}..."`);

    /**
     * 2. INVOCACIÓN DEL MOTOR UNIFICADO (Edge Function V3)
     * Utilizamos invoke() para delegar la vectorización (Gemini) y 
     * el matching vectorial (HNSW) al borde de la red.
     */
    const { data, error: functionError } = await supabase.functions.invoke('search-pro', {
      body: {
        query: targetQuery,
        userLat: latitude,
        userLng: longitude,
        match_count: limit,
        match_threshold: 0.25 // Umbral calibrado para diversidad en NicePod V2.5
      }
    });

    // 3. GESTIÓN DE ERRORES DE SUBSISTEMA
    if (functionError) {
      console.error(`🛑 [Search-Bridge] El motor de búsqueda devolvió un error:`, functionError.message);
      throw new Error(`FALLO_SISTEMA_BUSQUEDA: ${functionError.message}`);
    }

    /**
     * 4. NORMALIZACIÓN DE HALLAZGOS
     * Los resultados vienen categorizados por el RPC 'unified_search_v3'.
     */
    return {
      success: true,
      message: `Resonancia establecida. Localizados ${data?.length || 0} nodos de interés.`,
      results: data || []
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
 * Misión: Recuperar el 'Pulso' de la plataforma (Trending) cuando no hay query activa.
 * 
 * Útil para la hidratación inicial del Centro de Descubrimiento.
 */
export async function getDiscoverySignals(
  latitude?: number,
  longitude?: number
): Promise<SearchActionResponse> {
  const supabase = createClient();

  try {
    // Invocamos el motor en modo descubrimiento (sin query de usuario)
    const { data, error } = await supabase.functions.invoke('search-pro', {
      body: {
        userLat: latitude,
        userLng: longitude,
        match_count: 10,
        mode: 'discovery' // Flag para que el motor use ranking de popularidad/proximidad
      }
    });

    if (error) throw error;

    return {
      success: true,
      message: "Señales de descubrimiento sincronizadas.",
      results: data || []
    };
  } catch (error: any) {
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
 * 1. Eficiencia de Carga: Esta Server Action elimina la necesidad de cargar 
 *    librerías de embeddings en el cliente, ahorrando ~2MB de bundle JS.
 * 2. Seguridad RBAC: Al ejecutarse en el servidor, podemos inyectar 
 *    automáticamente metadatos de auditoría antes de llamar a la Edge Function.
 * 3. Diseño Profesional: Se ha implementado el método getDiscoverySignals para 
 *    asegurar que el buscador nunca muestre un vacío absoluto al iniciarse.
 */