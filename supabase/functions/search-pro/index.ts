// supabase/functions/search-pro/index.ts
// VERSIÓN: 4.1

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// --- INFRAESTRUCTURA DE INTELIGENCIA UNIFICADA ---
// Al importar 'generateEmbedding' desde _shared/ai.ts garantizamos que 
// la vectorización de la búsqueda use EXACTAMENTE el mismo modelo (gemini-embedding-001)
// que usamos para catalogar los podcasts. Esto cura la "Bóveda Ciega".
import { generateEmbedding } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * INTERFACE: SearchPayload
 * Define la estructura de entrada esperada desde la Server Action.
 */
interface SearchPayload {
  query?: string;
  userLat?: number;
  userLng?: number;
  match_threshold?: number;
  match_count?: number;
  mode?: 'search' | 'trending' | 'discovery';
}

/**
 * CLIENTE SUPABASE ADMIN
 * Declarado fuera del handler para maximizar la velocidad en invocaciones 'calientes'.
 */
const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * handler: Ejecución táctica (Lite). 
 * Se ha retirado el wrapper guard() para evitar exceder el tiempo de CPU, 
 * implementando en su lugar una validación de autorización directa.
 */
serve(async (req) => {
  // 1. GESTIÓN DE CORS (Respuesta en 0ms)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const correlationId = req.headers.get("x-correlation-id") ?? crypto.randomUUID();

  try {
    // 2. PROTOCOLO DE SEGURIDAD INDUSTRIAL (Bypass Manual de CPU)
    const authHeader = req.headers.get('Authorization');
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    // Verificamos que la petición viene firmada con el Service Role (desde nuestra Server Action)
    if (!authHeader?.includes(serviceKey ?? "INTERNAL_ONLY")) {
      console.warn(`🛑 [Search-Pro-Lite][${correlationId}] Intento de acceso denegado (Unauthorized).`);
      return new Response(JSON.stringify({ error: "Unauthorized access" }), {
        status: 401,
        headers: corsHeaders
      });
    }

    // 3. RECEPCIÓN Y SANEAMIENTO DEL PAYLOAD
    const payload: SearchPayload = await req.json();
    const {
      query = "",
      userLat,
      userLng,
      match_threshold = 0.18, // Umbral optimizado para alta sensibilidad
      match_count = 20,
      mode = 'search'
    } = payload;

    const cleanQuery = query.trim();
    let searchResult;

    // --- BIFURCACIÓN DE FLUJO (Discovery vs Resonancia) ---

    if (mode === 'trending' || mode === 'discovery' || cleanQuery.length < 3) {
      // ESTADO A: MODO DESCUBRIMIENTO (Sin Vector)
      // Si no hay query o estamos en modo descubrimiento, invocamos una búsqueda genérica
      // usando un vector nulo o llamando a un RPC de trending (simulado aquí buscando podcasts destacados).
      console.info(`🌍 [Search-Pro-Lite][${correlationId}] Ejecutando modo descubrimiento geoespacial.`);

      const { data, error: discoveryError } = await supabaseAdmin
        .from('micro_pods')
        .select('*, profiles(username, full_name, avatar_url, reputation_score)')
        .eq('status', 'published')
        .order('play_count', { ascending: false })
        .limit(match_count);

      if (discoveryError) throw new Error(`DISCOVERY_FAIL: ${discoveryError.message}`);

      // Normalización para simular el tipo de respuesta unificada
      searchResult = (data || []).map(pod => ({
        result_type: 'podcast',
        id: pod.id,
        title: pod.title,
        subtitle: pod.profiles?.full_name || 'Curador',
        image_url: pod.cover_image_url,
        similarity: 1.0, // Match de popularidad
        geo_distance: null,
        metadata: {
          author: pod.profiles?.username,
          mode: pod.creation_mode
        }
      }));

    } else {
      // ESTADO B: MODO RADAR SEMÁNTICO HÍBRIDO
      console.info(`🧠[Search-Pro-Lite][${correlationId}] Vectorizando intención: "${cleanQuery}"`);

      // La clave de la sanación: Usamos la función maestra de _shared/ai.ts
      const queryVector = await generateEmbedding(cleanQuery);

      console.info(`🔍 [Search-Pro-Lite][${correlationId}] Invocando Motor Unificado v4 en PostgreSQL.`);

      const { data, error: rpcError } = await supabaseAdmin.rpc("unified_search_v4", {
        p_query_text: cleanQuery,
        p_query_embedding: queryVector,
        p_match_threshold: match_threshold,
        p_match_count: match_count,
        p_user_lat: userLat,
        p_user_lng: userLng
      });

      if (rpcError) {
        throw new Error(`RPC_HYBRID_FAIL: ${rpcError.message}`);
      }

      searchResult = data || [];
      console.info(`✅[Search-Pro-Lite][${correlationId}] Impactos localizados: ${searchResult.length}`);
    }

    // 4. RETORNO DE INTELIGENCIA
    return new Response(JSON.stringify(searchResult), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : "Desestabilización semántica desconocida";
    console.error(`🔥[Search-Pro-Lite-Fatal][${correlationId}]:`, errorMsg);

    return new Response(JSON.stringify({
      error: errorMsg,
      trace_id: correlationId
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});