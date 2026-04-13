// supabase/functions/pulse-matcher/index.ts
// VERSIÓN: 1.1 (Intelligence Matcher - User DNA Sync & Weighted Discovery)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones del ecosistema NicePod
import { corsHeaders } from "@/supabase/functions/_shared/cors.ts";
import { guard } from "@/supabase/functions/_shared/guard.ts";
import { Database } from "@/types/database.types.ts";

const supabaseAdmin = createClient<Database>(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

/**
 * Interface: MatcherResult
 * Estructura de salida optimizada para el Radar visual del Frontend.
 * [ZAP]: Se ha renombrado 'id' a 'identification' para cumplir con el protocolo nominal.
 */
interface MatcherResult {
  identification: string;
  title: string;
  summary: string;
  uniformResourceLocator: string;
  source_name: string;
  content_type: string;
  authority_score: number;
  match_percentage: number; // Traducimos similitud a porcentaje humano
  is_high_value: boolean;
}

interface PersonalisedPulseResult {
  id: string;
  title: string;
  summary: string;
  uniformResourceLocator: string;
  source_name: string;
  content_type: Database["public"]["Enums"]["content_category"];
  authority_score: number;
  similarity: number;
}

const handler = async (request: Request): Promise<Response> => {
  const correlationIdentification = crypto.randomUUID();

  try {
    // 1. AUTENTICACIÓN Y SEGURIDAD
    // Extraemos el usuario del JWT verificado por el Guard
    const authorizationHeader = request.headers.get('Authorization')!;
    const { data: { user: authenticatedUser }, error: authenticationError } = await supabaseAdmin.auth.getUser(authorizationHeader.replace("Bearer ", ""));

    if (authenticationError || !authenticatedUser) throw new Error("No autorizado.");

    console.log(`[Pulse-Matcher][${correlationIdentification}] Buscando señales para: ${authenticatedUser.id}`);

    // 2. RECUPERACIÓN DEL ADN COGNITIVO
    // [METAL]: Se respetan los nombres de columna de la base de datos (user_id).
    const { data: cognitiveDnaData, error: dnaQueryError } = await supabaseAdmin
      .from('user_interest_dna')
      .select('dna_vector, professional_profile, negative_interests')
      .eq('user_id', authenticatedUser.id)
      .single();

    // FALLBACK: Si el usuario no tiene ADN (usuario nuevo), usamos un vector neutro
    // o redirigimos a una búsqueda por tendencias globales.
    if (dnaQueryError || !cognitiveDnaData) {
      console.warn(`[Pulse-Matcher] Usuario sin ADN. Retornando tendencias globales.`);
      return await fetchGlobalTrends(correlationIdentification);
    }

    // 3. EJECUCIÓN DEL MATCHING VECTORIAL (RPC)
    // Invocamos la lógica SQL que ya definimos para máxima velocidad.
    const { data: rawMatchCollection, error: matchingProcessError } = await supabaseAdmin.rpc('fetch_personalized_pulse', {
      p_user_id: authenticatedUser.id,
      p_limit: 20,
      p_threshold: 0.65 // Umbral mínimo de relevancia
    });

    if (matchingProcessError) throw new Error(`Fallo en base de datos: ${matchingProcessError.message}`);

    // 4. NORMALIZACIÓN Y RE-SCORING
    // Aquí podemos aplicar filtros finales (como los 'negative_interests')
    const finalizedIntelligenceSignals: MatcherResult[] = (rawMatchCollection as unknown as PersonalisedPulseResult[] || [])
      .filter((matchItem: PersonalisedPulseResult) => {
        // Filtro de intereses negativos (Ruido configurado por el usuario)
        const isNoiseSignal = cognitiveDnaData.negative_interests?.some((noiseThreshold: string) =>
          matchItem.title.toLowerCase().includes(noiseThreshold.toLowerCase()) ||
          matchItem.summary.toLowerCase().includes(noiseThreshold.toLowerCase())
        );
        return !isNoiseSignal;
      })
      .map((matchItem: PersonalisedPulseResult) => ({
        identification: matchItem.id, // Mapeo nominal: id (Metal) -> identification (Crystal)
        title: matchItem.title,
        summary: matchItem.summary,
        uniformResourceLocator: matchItem.uniformResourceLocator,
        source_name: matchItem.source_name,
        content_type: matchItem.content_type,
        authority_score: matchItem.authority_score,
        match_percentage: Math.round(matchItem.similarity * 100),
        is_high_value: matchItem.authority_score > 8.0
      }));

    console.log(`[Pulse-Matcher] Match completado. ${finalizedIntelligenceSignals.length} señales encontradas.`);

    return new Response(JSON.stringify({
      success: true,
      count: finalizedIntelligenceSignals.length,
      signals: finalizedIntelligenceSignals,
      trace_identification: correlationIdentification
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (caughtError: unknown) {
    const errorMessage = caughtError instanceof Error ? caughtError.message : "Error desconocido";
    console.error(`🔥 [Matcher-Error]:`, errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
};

/**
 * Función de Fallback: Tendencias Globales
 * Se activa si el usuario no ha configurado su ADN todavía.
 */
async function fetchGlobalTrends(traceIdentification: string) {
  const { data: globalTrendsCollection } = await supabaseAdmin
    .from('pulse_staging')
    .select('*')
    .order('authority_score', { ascending: false })
    .limit(20);

  const mappedSignals = (globalTrendsCollection || []).map((trendItem) => ({
    identification: trendItem.id,
    title: trendItem.title,
    summary: trendItem.summary,
    uniformResourceLocator: trendItem.uniformResourceLocator,
    source_name: trendItem.source_name,
    content_type: trendItem.content_type,
    authority_score: trendItem.authority_score,
    match_percentage: 100, // Fallback estático
    is_high_value: trendItem.authority_score > 8.0
  }));

  return new Response(JSON.stringify({
    success: true,
    is_fallback: true,
    signals: mappedSignals,
    trace_identification: traceIdentification
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

serve(guard(handler));
