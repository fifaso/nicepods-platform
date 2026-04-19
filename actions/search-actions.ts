/**
 * ARCHIVO: actions/search-actions.ts
 * VERSIÓN: 8.3 (NicePod Semantic Radar - Sovereign Protocol V8.3)
 * PROTOCOLO: MADRID RESONANCE V8.3
 * MISIÓN: Ejecutar búsquedas de alta resolución y detección de descubrimiento con integridad nominal y Handshake DIS.
 * NIVEL DE INTEGRIDAD: 100% (Soberano / ZAP 2.0 / BSS Green)
 */

"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * INTERFAZ: SearchActionResponse
 * Contrato de respuesta unificado para el sistema de radar semántico.
 * [NOTA]: Se mantienen los campos 'results' y 'error' por compatibilidad con
 * el hook 'use-search-radar.ts' y componentes visuales, mientras se añaden
 * los campos soberanos V8.3.
 */
export type SearchActionResponse<T = any> = {
  success: boolean;
  message: string;
  dataPayload?: T | null;
  results?: T | null; // Legacy support for use-search-radar.ts
  exceptionInformation?: string;
  error?: string; // Legacy support for use-search-radar.ts
  traceIdentification?: string;
};

/**
 * FUNCIÓN: searchGlobalIntelligence
 * Misión: Ejecutar una búsqueda de alta resolución en toda la red de NicePod con Handshake DIS.
 */
export async function searchGlobalIntelligence(
  searchQueryTerm: string,
  latitudeCoordinate?: number,
  longitudeCoordinate?: number,
  resultsLimitMagnitude: number = 8
): Promise<SearchActionResponse> {
  const supabaseSovereignClient = createClient();

  // 1. HANDSHAKE DE SOBERANÍA (DIS DOCTRINE)
  const { data: { user: authenticatedUserSnapshot }, error: authenticationHardwareExceptionInformation } = await supabaseSovereignClient.auth.getUser();
  if (authenticationHardwareExceptionInformation || !authenticatedUserSnapshot) {
    return {
      success: false,
      message: "SESIÓN_REQUERIDA: Inicie sesión para ejecutar búsquedas semánticas.",
      traceIdentification: "AUTH_FAIL"
    };
  }

  // 2. PROTOCOLO DE HIGIENE INICIAL
  const targetSearchQueryContent = searchQueryTerm?.trim();
  if (!targetSearchQueryContent || targetSearchQueryContent.length < 3) {
    return {
      success: false,
      message: "La intención es insuficiente. Proporcione al menos 3 caracteres.",
      results: [],
      dataPayload: []
    };
  }

  try {
    // 3. RECUPERACIÓN DE CREDENCIAL MAESTRA
    const serviceRoleSecretKeyContent = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleSecretKeyContent) {
      console.error("🔥 [Search-Bridge] CRITICAL ERROR: SUPABASE_SERVICE_ROLE_KEY no está definida en el entorno del servidor.");
      throw new Error("INFRASTRUCTURE_KEY_MISSING_EXCEPTION");
    }

    console.info(`🔍 [Search-Bridge] Despachando pulso autorizado: "${targetSearchQueryContent.substring(0, 30)}..."`);

    // 4. INVOCACIÓN DEL MOTOR UNIFICADO (Edge Function V4.1)
    const { data: searchResultsCollection, error: edgeFunctionInvokeHardwareException } = await supabaseSovereignClient.functions.invoke('search-pro', {
      body: {
        query: targetSearchQueryContent,
        userLat: latitudeCoordinate || null,
        userLng: longitudeCoordinate || null,
        match_count: resultsLimitMagnitude,
        match_threshold: 0.5,
        mode: 'search'
      },
      headers: {
        Authorization: `Bearer ${serviceRoleSecretKeyContent}`
      }
    });

    // 5. GESTIÓN DE ERRORES DE SUBSISTEMA
    if (edgeFunctionInvokeHardwareException) {
      console.error(`🛑 [Search-Bridge] El motor de búsqueda devolvió un error técnico:`, edgeFunctionInvokeHardwareException);
      throw new Error(`FALLO_SISTEMA_BUSQUEDA: ${edgeFunctionInvokeHardwareException.message || 'Error desconocido en Edge'}`);
    }

    const localizedResultsInventoryCollection = searchResultsCollection || [];

    return {
      success: true,
      message: `Resonancia establecida. Localizados ${localizedResultsInventoryCollection.length} nodos de interés.`,
      results: localizedResultsInventoryCollection,
      dataPayload: localizedResultsInventoryCollection,
      traceIdentification: "SEARCH_SUCCESS"
    };

  } catch (exceptionMessageInformation: unknown) {
    const exceptionInformationText = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
    console.error("🔥 [Search-Bridge-Fatal]:", exceptionInformationText);

    return {
      success: false,
      message: "El radar semántico no pudo estabilizar la señal.",
      error: exceptionInformationText,
      exceptionInformation: exceptionInformationText,
      results: [],
      dataPayload: [],
      traceIdentification: "FATAL_FAIL"
    };
  }
}

/**
 * FUNCIÓN: getDiscoverySignals
 * Misión: Recuperar el 'Pulso' de la plataforma (Trending/Discovery) con Handshake DIS.
 */
export async function getDiscoverySignals(
  latitudeCoordinate?: number,
  longitudeCoordinate?: number
): Promise<SearchActionResponse> {
  const supabaseSovereignClient = createClient();

  // 1. HANDSHAKE DE SOBERANÍA (DIS DOCTRINE)
  const { data: { user: authenticatedUserSnapshot }, error: authenticationHardwareExceptionInformation } = await supabaseSovereignClient.auth.getUser();
  if (authenticationHardwareExceptionInformation || !authenticatedUserSnapshot) {
    return {
      success: false,
      message: "SESIÓN_REQUERIDA: Inicie sesión para interceptar el pulso de la red.",
      traceIdentification: "AUTH_FAIL"
    };
  }

  try {
    const serviceRoleSecretKeyContent = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleSecretKeyContent) {
      throw new Error("FALLO_INFRAESTRUCTURA: Service Key no detectada.");
    }

    console.info(`🌍 [Search-Bridge] Solicitando señales de descubrimiento global (Autorizado).`);

    // 2. INVOCACIÓN DEL MOTOR (Bypass de vectorización)
    const { data: discoveryResultsCollection, error: edgeFunctionInvokeHardwareException } = await supabaseSovereignClient.functions.invoke('search-pro', {
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

    if (edgeFunctionInvokeHardwareException) throw edgeFunctionInvokeHardwareException;

    return {
      success: true,
      message: "Señales de descubrimiento sincronizadas.",
      results: discoveryResultsCollection || [],
      dataPayload: discoveryResultsCollection || [],
      traceIdentification: "DISCOVERY_SUCCESS"
    };
  } catch (exceptionMessageInformation: unknown) {
    const exceptionInformationText = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
    console.warn("⚠️ [Search-Bridge] Fallo parcial en Discovery Signals:", exceptionInformationText);
    return {
      success: false,
      message: "No se pudo interceptar el pulso de la red.",
      error: exceptionInformationText,
      exceptionInformation: exceptionInformationText,
      results: [],
      dataPayload: [],
      traceIdentification: "FATAL_FAIL"
    };
  }
}
