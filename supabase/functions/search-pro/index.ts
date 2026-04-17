/**
 * ARCHIVO: supabase/functions/search-pro/index.ts
 * VERSIÓN: 4.3 (NicePod Search Pro - Sovereign Protocol V4.3)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * MISIÓN: Ejecución táctica de búsqueda semántica y descubrimiento con integridad nominal.
 * NIVEL DE INTEGRIDAD: 100% (Sovereign / ZAP Compliant / BSS Green)
 */

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { generateEmbedding } from "../_shared/ai.ts";
import { guard, GuardContext } from "../_shared/guard.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface SearchPayload {
  searchQueryTerm?: string;
  latitudeCoordinate?: number;
  longitudeCoordinate?: number;
  matchThresholdMagnitude?: number;
  matchResultsLimit?: number;
  executionMode?: 'search' | 'trending' | 'discovery';
  // Legacy fields for backward compatibility with existing Server Actions
  query?: string;
  userLat?: number;
  userLng?: number;
  match_threshold?: number;
  match_count?: number;
  mode?: 'search' | 'trending' | 'discovery';
}

const supabaseSovereignAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * executeSearchOrchestrationHandler:
 * Misión: Orquestar la recuperación de inteligencia semántica o señales de descubrimiento.
 */
const executeSearchOrchestrationHandler = async (incomingRequest: Request, context: GuardContext): Promise<Response> => {
  const correlationIdentification = context.correlationIdentification;

  try {
    // PROTOCOLO DE SEGURIDAD: Solo permitimos acceso interno (Trusted Zone) para búsqueda pro.
    if (!context.isTrusted) {
      console.warn(`🛑 [Search-Pro][${correlationIdentification}] Intento de acceso externo bloqueado.`);
      return new Response(JSON.stringify({ error: "Unauthorized: Internal infrastructure only." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 3. RECEPCIÓN Y SANEAMIENTO DEL PAYLOAD
    const searchSubmissionPayload: SearchPayload = await incomingRequest.json();
    const {
      searchQueryTerm = searchSubmissionPayload.query || "",
      latitudeCoordinate = searchSubmissionPayload.userLat,
      longitudeCoordinate = searchSubmissionPayload.userLng,
      matchThresholdMagnitude = searchSubmissionPayload.match_threshold || 0.18, // Umbral optimizado para alta sensibilidad
      matchResultsLimit = searchSubmissionPayload.match_count || 20,
      executionMode = searchSubmissionPayload.mode || 'search'
    } = searchSubmissionPayload;

    const cleanedSearchQueryTerm = searchQueryTerm.trim();
    let searchIntelligenceResultsCollection;

    // --- BIFURCACIÓN DE FLUJO (Discovery vs Resonancia) ---

    if (executionMode === 'trending' || executionMode === 'discovery' || cleanedSearchQueryTerm.length < 3) {
      // ESTADO A: MODO DESCUBRIMIENTO (Sin Vector)
      console.info(`🌍 [Search-Pro-Lite][${correlationIdentification}] Ejecutando modo descubrimiento geoespacial.`);

      const { data: discoveryDatabaseResults, error: discoveryDatabaseExceptionInformation } = await supabaseSovereignAdmin
        .from('micro_pods')
        .select('*, profiles(username, full_name, avatar_url, reputation_score)')
        .eq('status', 'published')
        .order('play_count', { ascending: false })
        .limit(matchResultsLimit);

      if (discoveryDatabaseExceptionInformation) throw new Error(`DISCOVERY_FAIL: ${discoveryDatabaseExceptionInformation.message}`);

      // Normalización para simular el tipo de respuesta unificada
      searchIntelligenceResultsCollection = (discoveryDatabaseResults || []).map(podcastDatabaseRowSnapshot => ({
        result_type: 'podcast',
        id: podcastDatabaseRowSnapshot.id,
        title: podcastDatabaseRowSnapshot.title,
        subtitle: podcastDatabaseRowSnapshot.profiles?.full_name || 'Curador',
        image_url: podcastDatabaseRowSnapshot.cover_image_url,
        similarity: 1.0,
        geo_distance: null,
        metadata: {
          author: podcastDatabaseRowSnapshot.profiles?.username,
          mode: podcastDatabaseRowSnapshot.creation_mode
        }
      }));

    } else {
      // ESTADO B: MODO RADAR SEMÁNTICO HÍBRIDO
      console.info(`🧠 [Search-Pro-Lite][${correlationIdentification}] Vectorizando intención: "${cleanedSearchQueryTerm}"`);

      // La clave de la sanación: Usamos la función maestra de _shared/ai.ts
      const queryVector = await generateEmbedding(cleanedSearchQueryTerm);

      console.info(`🔍 [Search-Pro-Lite][${correlationIdentification}] Invocando Motor Unificado v4 en PostgreSQL.`);

      const { data: hybridDatabaseResults, error: databaseRpcExceptionInformation } = await supabaseSovereignAdmin.rpc("unified_search_v4", {
        p_query_text: cleanedSearchQueryTerm,
        p_query_embedding: queryVector,
        p_match_threshold: matchThresholdMagnitude,
        p_match_count: matchResultsLimit,
        p_user_lat: latitudeCoordinate,
        p_user_lng: longitudeCoordinate
      });

      if (databaseRpcExceptionInformation) {
        throw new Error(`RPC_HYBRID_FAIL: ${databaseRpcExceptionInformation.message}`);
      }

      searchIntelligenceResultsCollection = hybridDatabaseResults || [];
      console.info(`✅ [Search-Pro-Lite][${correlationIdentification}] Impactos localizados: ${searchIntelligenceResultsCollection.length}`);
    }

    // 4. RETORNO DE INTELIGENCIA
    return new Response(JSON.stringify(searchIntelligenceResultsCollection), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (exceptionMessageInformation: unknown) {
    const errorMessage = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Desestabilización semántica desconocida";
    console.error(`🔥 [Search-Pro-Lite-Fatal][${correlationIdentification}]:`, errorMessage);

    return new Response(JSON.stringify({
      error: errorMessage,
      trace_identification: correlationIdentification
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

Deno.serve(guard(executeSearchOrchestrationHandler));
