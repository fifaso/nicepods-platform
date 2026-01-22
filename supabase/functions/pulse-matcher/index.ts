// supabase/functions/pulse-matcher/index.ts
// VERSIÓN: 1.0 (Intelligence Matcher - User DNA Sync & Weighted Discovery)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones del ecosistema NicePod
import { corsHeaders } from "../_shared/cors.ts";
import { guard } from "../_shared/guard.ts";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

/**
 * Interface: MatcherResult
 * Estructura de salida optimizada para el Radar visual del Frontend.
 */
interface MatcherResult {
  id: string;
  title: string;
  summary: string;
  url: string;
  source_name: string;
  content_type: string;
  authority_score: number;
  match_percentage: number; // Traducimos similitud a porcentaje humano
  is_high_value: boolean;
}

const handler = async (request: Request): Promise<Response> => {
  const correlationId = crypto.randomUUID();

  try {
    // 1. AUTENTICACIÓN Y SEGURIDAD
    // Extraemos el usuario del JWT verificado por el Guard
    const authHeader = request.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) throw new Error("No autorizado.");

    console.log(`[Pulse-Matcher][${correlationId}] Buscando señales para: ${user.id}`);

    // 2. RECUPERACIÓN DEL ADN COGNITIVO
    const { data: dnaData, error: dnaError } = await supabaseAdmin
      .from('user_interest_dna')
      .select('dna_vector, professional_profile, negative_interests')
      .eq('user_id', user.id)
      .single();

    // FALLBACK: Si el usuario no tiene ADN (usuario nuevo), usamos un vector neutro
    // o redirigimos a una búsqueda por tendencias globales.
    if (dnaError || !dnaData) {
      console.warn(`[Pulse-Matcher] Usuario sin ADN. Retornando tendencias globales.`);
      return await fetchGlobalTrends(correlationId);
    }

    // 3. EJECUCIÓN DEL MATCHING VECTORIAL (RPC)
    // Invocamos la lógica SQL que ya definimos para máxima velocidad.
    const { data: rawMatches, error: matchError } = await supabaseAdmin.rpc('fetch_personalized_pulse', {
      p_user_id: user.id,
      p_limit: 20,
      p_threshold: 0.65 // Umbral mínimo de relevancia
    });

    if (matchError) throw new Error(`Fallo en base de datos: ${matchError.message}`);

    // 4. NORMALIZACIÓN Y RE-SCORING
    // Aquí podemos aplicar filtros finales (como los 'negative_interests')
    const finalResults: MatcherResult[] = rawMatches
      .filter((m: any) => {
        // Filtro de intereses negativos (Ruido configurado por el usuario)
        const isNoise = dnaData.negative_interests?.some((noise: string) =>
          m.title.toLowerCase().includes(noise.toLowerCase()) ||
          m.summary.toLowerCase().includes(noise.toLowerCase())
        );
        return !isNoise;
      })
      .map((m: any) => ({
        id: m.id,
        title: m.title,
        summary: m.summary,
        url: m.url,
        source_name: m.source_name,
        content_type: m.content_type,
        authority_score: m.authority_score,
        match_percentage: Math.round(m.similarity * 100),
        is_high_value: m.authority_score > 8.0
      }));

    console.log(`[Pulse-Matcher] Match completado. ${finalResults.length} señales encontradas.`);

    return new Response(JSON.stringify({
      success: true,
      count: finalResults.length,
      signals: finalResults,
      trace_id: correlationId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error(`🔥 [Matcher-Error]:`, error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

/**
 * Función de Fallback: Tendencias Globales
 * Se activa si el usuario no ha configurado su ADN todavía.
 */
async function fetchGlobalTrends(traceId: string) {
  const { data: trends } = await supabaseAdmin
    .from('pulse_staging')
    .select('*')
    .order('authority_score', { ascending: false })
    .limit(20);

  return new Response(JSON.stringify({
    success: true,
    is_fallback: true,
    signals: trends || [],
    trace_id: traceId
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

serve(guard(handler));