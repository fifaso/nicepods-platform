/**
 * ARCHIVO: supabase/functions/search-pro/index.ts
 * VERSIÓN: 5.0
 * PROTOCOLO: Madrid Resonance Protocol V4.0
 * MISIÓN: Hybrid Semantic Radar with Perimeter Security.
 * NIVEL DE INTEGRIDAD: 100%
 */

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { generateEmbedding } from "../_shared/ai.ts";
import { guard, GuardContext } from "../_shared/guard.ts";

interface SearchPayload {
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

    const payload: SearchPayload = await request.json();
    const {
      query = "",
      userLat,
      userLng,
      match_threshold = 0.18,
      match_count = 20,
      mode = 'search'
    } = payload;

    const cleanQuery = query.trim();
    let searchResult;

    if (mode === 'trending' || mode === 'discovery' || cleanQuery.length < 3) {
      console.info(`🌍 [Search-Pro][${correlationIdentification}] Discovery mode activated.`);

      const { data, error: discoveryError } = await supabaseAdmin
        .from('micro_pods')
        .select('*, profiles(username, full_name, avatar_url, reputation_score)')
        .eq('status', 'published')
        .order('play_count', { ascending: false })
        .limit(match_count);

      if (discoveryError) throw new Error(`DISCOVERY_FAIL: ${discoveryError.message}`);

      searchResult = (data || []).map(pod => ({
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
      console.info(`🧠 [Search-Pro][${correlationIdentification}] Vectorizing intent: "${cleanQuery}"`);
      const queryVector = await generateEmbedding(cleanQuery);

      const { data, error: rpcError } = await supabaseAdmin.rpc("unified_search_v4", {
        p_query_text: cleanQuery,
        p_query_embedding: queryVector,
        p_match_threshold: match_threshold,
        p_match_count: match_count,
        p_user_lat: userLat,
        p_user_lng: userLng
      });

      if (rpcError) throw new Error(`RPC_HYBRID_FAIL: ${rpcError.message}`);

      searchResult = data || [];
    }

    return new Response(JSON.stringify(searchResult), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (exceptionMessageInformation: any) {
    console.error(`🔥 [Search-Pro-Fatal][${correlationIdentification}]:`, exceptionMessageInformation.message);
    throw exceptionMessageInformation;
  }
};

Deno.serve(guard(handler));
