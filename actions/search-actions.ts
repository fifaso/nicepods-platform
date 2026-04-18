/**
 * ARCHIVO: actions/search-actions.ts
 * VERSIÓN: 4.3 (NicePod Semantic Radar - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V8.0
 * MISIÓN: Ejecutar búsquedas de alta resolución y detección de descubrimiento con integridad nominal y trazabilidad industrial.
 * NIVEL DE INTEGRIDAD: 100% (Soberano / ZAP Compliant / Build Shield Green)
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { nicepodLog } from "@/lib/utils";

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
 */
export async function searchGlobalIntelligence(
  searchQueryTerm: string,
  latitudeCoordinate?: number,
  longitudeCoordinate?: number,
  resultsLimitMagnitude: number = 8
): Promise<SearchActionResponse> {
  const supabaseSovereignClient = createClient();

  // 1. PROTOCOLO DE HIGIENE INICIAL
  const targetSearchQueryTextContent = searchQueryTerm?.trim();
  if (!targetSearchQueryTextContent || targetSearchQueryTextContent.length < 3) {
    return {
      success: false,
      message: "La intención es insuficiente. Proporcione al menos 3 caracteres.",
      results: []
    };
  }

  try {
    // 2. RECUPERACIÓN DE CREDENCIAL MAESTRA
    const serviceRoleSecretKeyContent = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleSecretKeyContent) {
      nicepodLog("🔥 [Search-Bridge] CRITICAL ERROR: SUPABASE_SERVICE_ROLE_KEY no detectada.", null, 'error');
      throw new Error("Error de configuración de infraestructura. Contacte al administrador.");
    }

    nicepodLog(`🔍 [Search-Bridge] Despachando pulso autorizado: "${targetSearchQueryTextContent.substring(0, 30)}..."`);

    // 3. INVOCACIÓN DEL MOTOR UNIFICADO (Edge Function V4.3)
    const { data: searchResultsCollection, error: edgeFunctionInvokeHardwareExceptionInformation } = await supabaseSovereignClient.functions.invoke('search-pro', {
      body: {
        query: targetSearchQueryTextContent,
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

    // 4. GESTIÓN DE ERRORES DE SUBSISTEMA
    if (edgeFunctionInvokeHardwareExceptionInformation) {
      nicepodLog("🛑 [Search-Bridge] El motor de búsqueda reportó anomalía técnica.", edgeFunctionInvokeHardwareExceptionInformation, 'error');
      throw new Error(`FALLO_SISTEMA_BUSQUEDA: ${edgeFunctionInvokeHardwareExceptionInformation.message || 'Error desconocido en Edge'}`);
    }

    const localizedResultsInventory = searchResultsCollection || [];

    return {
      success: true,
      message: `Resonancia establecida. Localizados ${localizedResultsInventory.length} nodos de interés.`,
      results: localizedResultsInventory
    };

  } catch (exceptionMessageInformation: unknown) {
    const exceptionMessageInformationText = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
    nicepodLog("🔥 [Search-Bridge-Fatal]:", exceptionMessageInformationText, 'error');

    return {
      success: false,
      message: "El radar semántico no pudo estabilizar la señal.",
      error: exceptionMessageInformationText,
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
      throw new Error("Service Role Key Missing");
    }

    nicepodLog("🌍 [Search-Bridge] Solicitando señales de descubrimiento global (Handshake Autorizado).");

    // Invocamos el motor en modo 'discovery' (Bypass de vectorización)
    const { data: discoveryResultsCollection, error: edgeFunctionInvokeHardwareExceptionInformation } = await supabaseSovereignClient.functions.invoke('search-pro', {
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

    if (edgeFunctionInvokeHardwareExceptionInformation) throw edgeFunctionInvokeHardwareExceptionInformation;

    return {
      success: true,
      message: "Señales de descubrimiento sincronizadas con éxito.",
      results: discoveryResultsCollection || []
    };
  } catch (exceptionMessageInformation: unknown) {
    const exceptionMessageInformationText = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
    nicepodLog("⚠️ [Search-Bridge] Fallo parcial en Discovery Signals:", exceptionMessageInformationText, 'warn');
    return {
      success: false,
      message: "No se pudo interceptar el pulso de la red de descubrimiento.",
      error: exceptionMessageInformationText,
      results: []
    };
  }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.3):
 * 1. Industrial Observability: Sustitución de console.error por nicepodLog para integración con el peritaje industrial de la Workstation.
 * 2. ZAP Compliance: Purificación de nomenclatura de variables ('resultsLimit' -> 'resultsLimitMagnitude', 'serviceRoleSecretKey' -> 'serviceRoleSecretKeyContent').
 * 3. Infrastructure Safety: Centralización de la gestión de secretos del servidor para evitar fugas al Cristal.
 */
