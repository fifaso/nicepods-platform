//actions/search-actions.ts
//VERSIÓN: 2.0 (NicePod Search Engine - Hybrid Resonance Standard)
"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * INTERFAZ: SearchActionResponse
 * Contrato unificado para las respuestas del motor de búsqueda global.
 */
export type SearchActionResponse<T = any> = {
  success: boolean;
  message: string;
  results?: T;
  error?: string;
};

/**
 * FUNCIÓN: searchGlobalIntelligence
 * Misión: Ejecutar una búsqueda de alta resolución en toda la red de NicePod.
 * 
 * [ARQUITECTURA]:
 * Esta acción actúa como el Despachador hacia la Edge Function 'search-pro'. 
 * La búsqueda es híbrida:
 * 1. Búsqueda Vectorial (768d): Localiza conceptos por similitud semántica.
 * 2. Búsqueda Léxica: Localiza coincidencias exactas en títulos y etiquetas.
 * 3. Búsqueda Geoespacial: Prioriza resultados cercanos a la ubicación del curador.
 * 
 * @param query - La intención de búsqueda del usuario.
 * @param latitude - Coordenada de latitud para el anclaje 'Madrid Resonance'.
 * @param longitude - Coordenada de longitud para el anclaje 'Madrid Resonance'.
 * @param limit - Cantidad máxima de nodos de información a recuperar.
 */
export async function searchGlobalIntelligence(
  query: string,
  latitude: number,
  longitude: number,
  limit: number = 20
): Promise<SearchActionResponse> {
  const supabase = createClient();

  // 1. PROTOCOLO DE VALIDACIÓN DE INTENCIÓN
  if (!query || query.trim().length < 2) {
    return {
      success: false,
      message: "La intención de búsqueda es demasiado breve para generar resonancia.",
      results: []
    };
  }

  try {
    console.info(`🔍 [Search-Engine] Iniciando rastreo omnicanal para: "${query}"`);

    /**
     * 2. INVOCACIÓN DEL MOTOR DE BÚSQUEDA PRO (Edge Function)
     * Delegamos el procesamiento pesado a Deno 2 para aprovechar la 
     * cercanía con la base de datos vectorial PostgreSQL.
     */
    const { data, error: searchError } = await supabase.functions.invoke('search-pro', {
      body: {
        query: query.trim(),
        userLat: latitude,
        userLng: longitude,
        match_count: limit,
        match_threshold: 0.35 // Umbral de similitud base para el radar semántico.
      }
    });

    if (searchError) {
      throw new Error(`FALLO_MOTOR_BUSQUEDA: ${searchError.message}`);
    }

    /**
     * 3. ANÁLISIS DE RESULTADOS
     * El motor devuelve un objeto categorizado (podcasts, knowledge_chunks, curators).
     */
    return {
      success: true,
      message: `Búsqueda completada. Se han localizado ${data?.length || 0} nodos de interés.`,
      results: data || []
    };

  } catch (error: any) {
    console.error("🔥 [Search-Action-Fatal]:", error.message);

    return {
      success: false,
      message: "El sistema de búsqueda no pudo estabilizar la resonancia.",
      error: error.message,
      results: []
    };
  }
}

/**
 * FUNCIÓN: getTrendingIntelligence
 * Misión: Recuperar los nodos de información con mayor tasa de interacción reciente.
 * 
 * Útil para alimentar el 'Discovery Feed' cuando el usuario no ha ingresado una query.
 */
export async function getTrendingIntelligence(
  latitude: number,
  longitude: number
): Promise<SearchActionResponse> {
  const supabase = createClient();

  try {
    // Invocamos una versión de búsqueda sin query para traer el 'Pulse' (tendencia).
    const { data, error } = await supabase.functions.invoke('search-pro', {
      body: {
        userLat: latitude,
        userLng: longitude,
        mode: 'trending',
        match_count: 10
      }
    });

    if (error) throw error;

    return {
      success: true,
      message: "Pulso de tendencias recuperado.",
      results: data || []
    };
  } catch (error: any) {
    return {
      success: false,
      message: "No se pudo sincronizar con las tendencias globales.",
      error: error.message
    };
  }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Desacoplamiento: El procesamiento de vectores y el cálculo de distancia coseno
 *    residen en el Edge, liberando al servidor Next.js de tareas CPU-intensivas.
 * 2. Resiliencia Geoespacial: Si las coordenadas son (0,0), el motor 'search-pro'
 *    está diseñado para ignorar el factor de distancia y devolver resultados globales.
 * 3. Consistencia de Respuesta: Se utiliza el tipo 'SearchActionResponse' para que 
 *    el componente 'UnifiedSearchBar' maneje los estados de carga y error con rigor.
 */