// supabase/functions/search-pro/index.ts
// VERSIÓN: 4.0

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { corsHeaders } from "../_shared/cors.ts";

// --- CONFIGURACIÓN DE INTELIGENCIA DIRECTA ---
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
const EMBEDDING_MODEL = "models/gemini-embedding-001"; // Modelo optimizado v4

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * handler: Ejecución ultra-ligera para evitar 'CPU Timeout'.
 */
serve(async (req) => {
  // 1. GESTIÓN DE CORS (Costo CPU: 0ms)
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // 2. VALIDACIÓN DE SEGURIDAD MANUAL (Bypass de guard() pesado)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.includes(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const { query, userLat, userLng, match_threshold = 0.25, match_count = 15 } = await req.json();
    if (!query || query.length < 3) throw new Error("QUERY_TOO_SHORT");

    /**
     * 3. VECTORIZACIÓN RAW (Ahorro masivo de ciclos de CPU)
     * Usamos fetch directo para evitar el overhead de la librería de Google.
     */
    const googleResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${EMBEDDING_MODEL}:embedContent?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: { parts: [{ text: query }] },
          taskType: "RETRIEVAL_QUERY",
          outputDimensionality: 768 // Bloqueo estricto a nuestro estándar
        })
      }
    );

    if (!googleResponse.ok) throw new Error("GOOGLE_API_FAIL");
    const googleData = await googleResponse.json();
    const queryVector = googleData.embedding?.values;

    /**
     * 4. BÚSQUEDA HÍBRIDA UNIFICADA
     */
    const { data: searchResults, error: rpcError } = await supabaseAdmin.rpc("unified_search_v4", {
      p_query_text: query,
      p_query_embedding: queryVector,
      p_match_threshold: match_threshold,
      p_match_count: match_count,
      p_user_lat: userLat,
      p_user_lng: userLng
    });

    if (rpcError) throw rpcError;

    // 5. RESPUESTA ATÓMICA
    return new Response(JSON.stringify(searchResults), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error: any) {
    console.error("🔥 [Search-Pro-Lite-Fatal]:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});