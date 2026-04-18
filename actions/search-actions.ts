/**
 * ARCHIVO: actions/search-actions.ts
 * VERSIÓN: 4.2 (NicePod Semantic Radar - ZAP & Build Shield Protocol)
 * PROTOCOLO: MADRID RESONANCE V4.2
 * MISIÓN: Ejecutar búsquedas de alta resolución y detección de descubrimiento con integridad nominal.
 * NIVEL DE INTEGRIDAD: 100% (Soberano / ZAP Compliant / Build Shield Green)
 */

"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * INTERFAZ: SearchActionResponse
 * Contrato de respuesta unificado para el sistema de radar semántico.
 * [NOTA]: Se mantiene el default 'any' para preservar la compatibilidad con
 * los ganchos (hooks) existentes en la Workstation.
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
 */
export async function searchGlobalIntelligence(
  searchQueryTerm: string,
  latitudeCoordinate?: number,
  longitudeCoordinate?: number,
  resultsLimitMagnitude: number = 8
): Promise<SearchActionResponse> {
  const supabaseSovereignClient = createClient();

  // 1. PROTOCOLO DE HIGIENE INICIAL
  const targetSearchQuery = searchQueryTerm?.trim();
  if (!targetSearchQuery || targetSearchQuery.length < 3) {
    return {
      success: false,
      message: "La intención es insuficiente. Proporcione al menos 3 caracteres.",
      results: []
    };
  }

  try {
    // 2. RECUPERACIÓN DE CREDENCIAL MAESTRA
    const serviceRoleSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleSecretKey) {
      console.error("🔥 [Search-Bridge] CRITICAL ERROR: SUPABASE_SERVICE_ROLE_KEY no está definida en el entorno del servidor.");
      throw new Error("Error de configuración de infraestructura. Contacte al administrador.");
    }

    console.info(`🔍 [Search-Bridge] Despachando pulso autorizado: "${targetSearchQuery.substring(0, 30)}..."`);

    // 3. INVOCACIÓN DEL MOTOR UNIFICADO (Edge Function V4.1)
    const { data: searchResultsData, error: edgeFunctionInvokeException } = await supabaseSovereignClient.functions.invoke('search-pro', {
      body: {
        query: targetSearchQuery,
        userLat: latitudeCoordinate || null,
        userLng: longitudeCoordinate || null,
        match_count: resultsLimitMagnitude,
        match_threshold: 0.5,
        mode: 'search'
      },
      headers: {
        Authorization: `Bearer ${serviceRoleSecretKey}`
      }
    });

    // 4. GESTIÓN DE ERRORES DE SUBSISTEMA
    if (edgeFunctionInvokeException) {
      console.error(`🛑 [Search-Bridge] El motor de búsqueda devolvió un error técnico:`, edgeFunctionInvokeException);
      throw new Error(`FALLO_SISTEMA_BUSQUEDA: ${edgeFunctionInvokeException.message || 'Error desconocido en Edge'}`);
    }

    const localizedResultsInventory = searchResultsData || [];

    return {
      success: true,
      message: `Resonancia establecida. Localizados ${localizedResultsInventory.length} nodos de interés.`,
      results: localizedResultsInventory
    };

  } catch (exceptionMessageInformation: unknown) {
    const errorMessage = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
    console.error("🔥 [Search-Bridge-Fatal]:", errorMessage);

    return {
      success: false,
      message: "El radar semántico no pudo estabilizar la señal.",
      error: errorMessage,
      results: []
    };
  }
}

/**
 * FUNCIÓN: getDiscoverySignals
 * Misión: Recuperar el 'Pulso' de la plataforma (Trending/Discovery) cuando no hay query activa.
 */
export async function getDiscoverySignals(
  latitudeCoordinate?: number,
  longitudeCoordinate?: number
): Promise<SearchActionResponse> {
  const supabaseSovereignClient = createClient();

  try {
    const serviceRoleSecretKeyContent = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleSecretKeyContent) {
      throw new Error("FALLO_INFRAESTRUCTURA: Service Key no detectada.");
    }

    console.info(`🌍 [Search-Bridge] Solicitando señales de descubrimiento global (Autorizado).`);

    // Invocamos el motor en modo 'discovery' (Bypass de vectorización)
    const { data: discoveryResultsData, error: edgeFunctionInvokeException } = await supabaseSovereignClient.functions.invoke('search-pro', {
      body: {
        userLat: latitudeCoordinate || null,
        userLng: longitudeCoordinate || null,
        match_count: 10,
        mode: 'discovery'
      },
      headers: {
        Authorization: `Bearer ${serviceRoleSecretKeyContent}`
      }
    });

    if (edgeFunctionInvokeException) throw edgeFunctionInvokeException;

    return {
      success: true,
      message: "Señales de descubrimiento sincronizadas.",
      results: discoveryResultsData || []
    };
  } catch (exceptionMessageInformation: unknown) {
    const errorMessage = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
    console.warn("⚠️ [Search-Bridge] Fallo parcial en Discovery Signals:", errorMessage);
    return {
      success: false,
      message: "No se pudo interceptar el pulso de la red.",
      error: errorMessage,
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