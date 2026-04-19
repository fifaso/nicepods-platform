/**
 * ARCHIVO: actions/search-actions.ts
 * VERSIÓN: 8.3 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: Madrid Resonance Protocol V8.3
 * MISIÓN: Ejecutar búsquedas de alta resolución y detección de descubrimiento con integridad nominal e identidad verificada.
 * NIVEL DE INTEGRIDAD: 100% (Soberano / ZAP 2.0 / DIS / BSS Green)
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { nicepodLog } from "@/lib/utils";

/**
 * INTERFAZ: SearchActionResponse
 * Contrato de respuesta unificado para el sistema de radar semántico.
 * [V8.3]: Sincronizado con la Doctrina de Respuesta Soberana preservando compatibilidad BSS.
 */
export type SearchActionResponse<PayloadDataType = any> = {
  success: boolean;
  message: string;
  dataPayload: PayloadDataType | null;
  // Proxies de compatibilidad para hooks/use-search-radar.ts (Legacy BSS)
  results?: PayloadDataType;
  error?: string;
  traceIdentification?: string;
  traceId?: string;
  exceptionInformation?: string;
};

/**
 * FUNCIÓN: searchGlobalIntelligence
 * Misión: Ejecutar una búsqueda de alta resolución en toda la red de NicePod con validación de identidad.
 */
export async function searchGlobalIntelligence(
  searchQueryTerm: string,
  latitudeCoordinate?: number,
  longitudeCoordinate?: number,
  resultsLimitMagnitude: number = 8
): Promise<SearchActionResponse> {
  const supabaseSovereignClient = createClient();

  // 1. HANDSHAKE DE IDENTIDAD SSR (DOCTRINA DIS)
  const { data: { user: authenticatedUserSnapshot }, error: authenticationHardwareExceptionInformation } = await supabaseSovereignClient.auth.getUser();

  if (authenticationHardwareExceptionInformation || !authenticatedUserSnapshot) {
    nicepodLog("🛑 [Search-Action] Acceso denegado: Identidad no verificada.", "AUTHENTICATION_REQUIRED", 'exceptionInformation');
    return {
      success: false,
      message: "IDENTIDAD_REQUERIDA: Inicie sesión para activar el radar semántico.",
      dataPayload: null,
      results: [] as any
    };
  }

  // 2. PROTOCOLO DE HIGIENE INICIAL
  const targetSearchQuery = searchQueryTerm?.trim();
  if (!targetSearchQuery || targetSearchQuery.length < 3) {
    return {
      success: false,
      message: "La intención es insuficiente. Proporcione al menos 3 caracteres.",
      dataPayload: null,
      results: [] as any
    };
  }

  try {
    // 3. RECUPERACIÓN DE CREDENCIAL MAESTRA (Vault Access)
    const serviceRoleSecretKeyContent = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleSecretKeyContent) {
      nicepodLog("🔥 [Search-Action] CRITICAL: SUPABASE_SERVICE_ROLE_KEY no detectada.", null, 'exceptionInformation');
      throw new Error("Error de configuración de infraestructura. Contacte al administrador.");
    }

    nicepodLog(`🔍 [Search-Action] Despachando pulso autorizado para: ${authenticatedUserSnapshot.id}`, { searchQueryPreview: targetSearchQuery.substring(0, 30) });

    // 4. INVOCACIÓN DEL MOTOR UNIFICADO (Edge Function V4.1)
    const { data: searchResultsDatabaseCollection, error: edgeFunctionInvokeHardwareException } = await supabaseSovereignClient.functions.invoke('search-pro', {
      body: {
        query: targetSearchQuery,
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

    // 5. GESTIÓN DE EXCEPCIONES DE SUBSISTEMA
    if (edgeFunctionInvokeHardwareException) {
      nicepodLog(`🛑 [Search-Action] Fallo en Motor de Búsqueda:`, edgeFunctionInvokeHardwareException.message, 'exceptionInformation');
      throw new Error(`FALLO_SISTEMA_BUSQUEDA: ${edgeFunctionInvokeHardwareException.message || 'Error desconocido en Edge'}`);
    }

    const localizedResultsInventory = searchResultsDatabaseCollection || [];

    return {
      success: true,
      message: `Resonancia establecida. Localizados ${localizedResultsInventory.length} nodos de interés.`,
      dataPayload: localizedResultsInventory,
      results: localizedResultsInventory,
      traceIdentification: `SEARCH_${Date.now()}`
    };

  } catch (exceptionMessageInformation: unknown) {
    const exceptionMessageInformationText = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
    nicepodLog("🔥 [Search-Action-Fatal]:", exceptionMessageInformationText, 'exceptionInformation');

    return {
      success: false,
      message: "El radar semántico no pudo estabilizar la señal.",
      exceptionInformation: exceptionMessageInformationText,
      error: exceptionMessageInformationText,
      dataPayload: null,
      results: [] as any
    };
  }
}

/**
 * FUNCIÓN: getDiscoverySignals
 * Misión: Recuperar el 'Pulso' de la plataforma (Trending/Discovery) con validación de identidad.
 */
export async function getDiscoverySignals(
  latitudeCoordinate?: number,
  longitudeCoordinate?: number
): Promise<SearchActionResponse> {
  const supabaseSovereignClient = createClient();

  // 1. HANDSHAKE DE IDENTIDAD SSR (DOCTRINA DIS)
  const { data: { user: authenticatedUserSnapshot }, error: authenticationHardwareExceptionInformation } = await supabaseSovereignClient.auth.getUser();

  if (authenticationHardwareExceptionInformation || !authenticatedUserSnapshot) {
    return {
      success: false,
      message: "IDENTIDAD_REQUERIDA: Inicie sesión para interceptar el pulso de la red.",
      dataPayload: null,
      results: [] as any
    };
  }

  try {
    const serviceRoleSecretKeyContent = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleSecretKeyContent) {
      throw new Error("FALLO_INFRAESTRUCTURA: Service Key no detectada.");
    }

    // 2. INVOCACIÓN DEL MOTOR EN MODO DESCUBRIMIENTO
    const { data: discoverySignalsDatabaseCollection, error: edgeFunctionInvokeHardwareException } = await supabaseSovereignClient.functions.invoke('search-pro', {
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
      dataPayload: discoverySignalsDatabaseCollection || [],
      results: discoverySignalsDatabaseCollection || []
    };
  } catch (exceptionMessageInformation: unknown) {
    const exceptionMessageInformationText = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
    nicepodLog("⚠️ [Search-Action] Fallo en Discovery Signals:", exceptionMessageInformationText, 'warning');
    return {
      success: false,
      message: "No se pudo interceptar el pulso de la red.",
      exceptionInformation: exceptionMessageInformationText,
      error: exceptionMessageInformationText,
      dataPayload: null,
      results: [] as any
    };
  }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V8.3):
 * 1. Identidad SSR: Se ha implementado el Handshake DIS mandatorio. Ninguna búsqueda
 *    se ejecuta sin un contexto de usuario validado, protegiendo los recursos de IA.
 * 2. Zero Abbreviation Policy: Se han purificado los identificadores (exceptionMessageInformationText,
 *    serviceRoleSecretKeyContent, discoverySignalsDatabaseCollection).
 * 3. Compatibilidad Axial: Se preservan las propiedades 'results' y 'error' para garantizar
 *    que use-search-radar.ts y otros componentes visuales no sufran fracturas (BSS Green).
 */
