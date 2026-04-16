/**
 * ARCHIVO: supabase/functions/search-pro/index.ts
 * VERSIÓN: 4.2
 * PROTOCOLO: MADRID RESONANCE V4.0
 * MISIÓN: Ejecución táctica de búsqueda semántica y descubrimiento con integridad nominal.
 * NIVEL DE INTEGRIDAD: 100%
 */

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { generateEmbedding } from "../_shared/ai.ts";
import { guard, GuardContext } from "../_shared/guard.ts";

interface SearchPayload {
  searchQueryTerm?: string;
  latitudeCoordinate?: number;
  longitudeCoordinate?: number;
  matchThresholdMagnitude?: number;
  matchResultsLimit?: number;
  executionMode?: 'search' | 'trending' | 'discovery';
  // Legacy fields for backward compatibility with existing Server Actions if any
  query?: string;
  userLat?: number;
  userLng?: number;
  match_threshold?: number;
  match_count?: number;
  mode?: 'search' | 'trending' | 'discovery';
}

const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const handler = async (request: Request, context: GuardContext): Promise<Response> => {
  const correlationIdentification = context.correlationIdentification;

  try {
    // PROTOCOLO DE SEGURIDAD: Solo permitimos acceso interno (Trusted Zone) para búsqueda pro.
    if (!context.isTrusted) {
      console.warn(`🛑 [Search-Pro][${correlationIdentification}] Intento de acceso externo bloqueado.`);
      return new Response(JSON.stringify({ error: "Unauthorized: Internal infrastructure only." }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 3. RECEPCIÓN Y SANEAMIENTO DEL PAYLOAD
    const submissionPayload: SearchPayload = await req.json();
    const {
      searchQueryTerm = submissionPayload.query || "",
      latitudeCoordinate = submissionPayload.userLat,
      longitudeCoordinate = submissionPayload.userLng,
      matchThresholdMagnitude = submissionPayload.match_threshold || 0.18, // Umbral optimizado para alta sensibilidad
      matchResultsLimit = submissionPayload.match_count || 20,
      executionMode = submissionPayload.mode || 'search'
    } = submissionPayload;

    const cleanedSearchQueryTerm = searchQueryTerm.trim();
    let searchResultsCollection;

    // --- BIFURCACIÓN DE FLUJO (Discovery vs Resonancia) ---

    if (executionMode === 'trending' || executionMode === 'discovery' || cleanedSearchQueryTerm.length < 3) {
      // ESTADO A: MODO DESCUBRIMIENTO (Sin Vector)
      // Si no hay query o estamos en modo descubrimiento, invocamos una búsqueda genérica
      // usando un vector nulo o llamando a un RPC de trending (simulado aquí buscando podcasts destacados).
      console.info(`🌍 [Search-Pro-Lite][${correlationIdentification}] Ejecutando modo descubrimiento geoespacial.`);

      const { data: discoveryDatabaseResults, error: discoveryDatabaseExceptionInformation } = await supabaseAdmin
        .from('micro_pods')
        .select('*, profiles(username, full_name, avatar_url, reputation_score)')
        .eq('status', 'published')
        .order('play_count', { ascending: false })
        .limit(matchResultsLimit);

      if (discoveryDatabaseExceptionInformation) throw new Error(`DISCOVERY_FAIL: ${discoveryDatabaseExceptionInformation.message}`);

      // Normalización para simular el tipo de respuesta unificada
      searchResultsCollection = (discoveryDatabaseResults || []).map(pod => ({
        result_type: 'podcast',
        id: pod.id,
        title: pod.title,
        subtitle: pod.profiles?.full_name || 'Curador',
        image_url: pod.cover_image_url,
        similarity: 1.0,
        geo_distance: null,
        metadata: {
          author: pod.profiles?.username,
          mode: pod.creation_mode
        }
      }));

    } else {
      // ESTADO B: MODO RADAR SEMÁNTICO HÍBRIDO
      console.info(`🧠[Search-Pro-Lite][${correlationIdentification}] Vectorizando intención: "${cleanedSearchQueryTerm}"`);

      // La clave de la sanación: Usamos la función maestra de _shared/ai.ts
      const queryVector = await generateEmbedding(cleanedSearchQueryTerm);

      console.info(`🔍 [Search-Pro-Lite][${correlationIdentification}] Invocando Motor Unificado v4 en PostgreSQL.`);

      const { data: hybridDatabaseResults, error: databaseRpcExceptionInformation } = await supabaseAdmin.rpc("unified_search_v4", {
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

      searchResultsCollection = hybridDatabaseResults || [];
      console.info(`✅[Search-Pro-Lite][${correlationIdentification}] Impactos localizados: ${searchResultsCollection.length}`);
    }

    // 4. RETORNO DE INTELIGENCIA
    return new Response(JSON.stringify(searchResultsCollection), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (exceptionMessageInformation: unknown) {
    const errorMessage = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Desestabilización semántica desconocida";
    console.error(`🔥[Search-Pro-Lite-Fatal][${correlationIdentification}]:`, errorMessage);

    return new Response(JSON.stringify({
      error: errorMessage,
      trace_identification: correlationIdentification
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

Deno.serve(guard(handler));
