// actions/search-actions.ts
// VERSIÓN: 4.1

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
 * [ARQUITECTURA DE SEGURIDAD]:
 * Esta acción actúa como un proxy privilegiado. Al ejecutarse en el servidor ('use server'),
 * tiene acceso a las variables de entorno privadas (SUPABASE_SERVICE_ROLE_KEY).
 * Inyecta esta llave en la cabecera 'Authorization' para que la Edge Function 'search-pro'
 * acepte la petición y ejecute la vectorización y consulta SQL.
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
  limit: number = 8
): Promise<SearchActionResponse> {
  const supabase = createClient();

  // 1. PROTOCOLO DE HIGIENE INICIAL
  // Validamos que la intención tenga sustancia antes de iniciar el proceso.
  const targetQuery = query?.trim();
  if (!targetQuery || targetQuery.length < 3) {
    return {
      success: false,
      message: "La intención es insuficiente. Proporcione al menos 3 caracteres.",
      results: []
    };
  }

  try {
    // 2. RECUPERACIÓN DE CREDENCIAL MAESTRA
    // Esta llave debe estar configurada en Vercel (Environment Variables).
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      console.error("🔥 [Search-Bridge] CRITICAL ERROR: SUPABASE_SERVICE_ROLE_KEY no está definida en el entorno del servidor.");
      throw new Error("Error de configuración de infraestructura. Contacte al administrador.");
    }

    console.info(`🔍 [Search-Bridge] Despachando pulso autorizado: "${targetQuery.substring(0, 30)}..."`);

    /**
     * 3. INVOCACIÓN DEL MOTOR UNIFICADO (Edge Function V4.1)
     * Utilizamos invoke() con una cabecera Authorization personalizada.
     * Esto permite saltarse el RLS y ejecutar la lógica 'Lite' sin cargar middlewares pesados.
     */
    const { data, error: functionError } = await supabase.functions.invoke('search-pro', {
      body: {
        query: targetQuery,
        userLat: latitude || null, // Normalización explícita para evitar 'undefined' en JSON
        userLng: longitude || null,
        match_count: limit,
        match_threshold: 0.5, // Umbral calibrado para alta sensibilidad
        mode: 'search'
      },
      // [FIX CRÍTICO]: Inyección manual de la llave maestra
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`
      }
    });

    // 4. GESTIÓN DE ERRORES DE SUBSISTEMA
    if (functionError) {
      console.error(`🛑 [Search-Bridge] El motor de búsqueda devolvió un error técnico:`, functionError);
      throw new Error(`FALLO_SISTEMA_BUSQUEDA: ${functionError.message || 'Error desconocido en Edge'}`);
    }

    /**
     * 5. NORMALIZACIÓN DE HALLAZGOS
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
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      throw new Error("Service Key Missing");
    }

    console.info(`🌍 [Search-Bridge] Solicitando señales de descubrimiento global (Autorizado).`);

    // Invocamos el motor en modo 'discovery' (Bypass de vectorización)
    const { data, error } = await supabase.functions.invoke('search-pro', {
      body: {
        userLat: latitude || null,
        userLng: longitude || null,
        match_count: 10,
        mode: 'discovery' // Flag estratégico para activar lógica de popularidad/proximidad
      },
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`
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
 * 1. Seguridad Server-Side: Esta acción es la única autorizada para portar la 
 *    SERVICE_ROLE_KEY. Al ejecutarse en el servidor de Next.js, la llave nunca 
 *    se filtra al cliente.
 * 2. Autenticación Edge: La cabecera 'Authorization: Bearer KEY' es el estándar 
 *    que nuestra función 'search-pro' verifica manualmente en su línea 40.
 * 3. Resiliencia: Si la llave falta en Vercel, el error es capturado y logueado 
 *    claramente, evitando comportamientos zombis.
 */