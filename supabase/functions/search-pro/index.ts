// supabase/functions/search-pro/index.ts
// VERSIÓN: 2.0 (Master Search Orchestrator - Hybrid Vault & Geo-Semantic Integration)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones con rutas relativas para estabilidad de despliegue universal
import { generateEmbedding } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { guard } from "../_shared/guard.ts";

/**
 * INTERFACE: SearchPayload
 * Soporta las dos vertientes de búsqueda de NicePod.
 */
interface SearchPayload {
  query: string;
  userLat?: number;
  userLng?: number;
  match_threshold?: number;
  match_count?: number;
  target?: 'vault_only' | 'global'; // Flag estratégico
}

const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();

  console.log(`[Search-Pro][${correlationId}] Iniciando orquestación de búsqueda...`);

  try {
    // 1. RECEPCIÓN Y NORMALIZACIÓN
    const payload: SearchPayload = await request.json();
    const {
      query,
      userLat,
      userLng,
      match_threshold = 0.5,
      match_count = 10,
      target = 'global'
    } = payload;

    if (!query || query.length < 2) {
      throw new Error("CONTENIDO_INSUFICIENTE: Se requiere una consulta de al menos 2 caracteres.");
    }

    // 2. GENERACIÓN DE EMBEDDING (Capa de Inteligencia compartida)
    // Transformamos el texto del usuario en un vector de 768 dimensiones (text-embedding-004)
    console.log(`[Search-Pro][${correlationId}] Vectorizando consulta: "${query}"`);
    const queryVector = await generateEmbedding(query);

    // 3. BIFURCACIÓN ESTRATÉGICA DE BÚSQUEDA
    let searchResult;

    if (target === 'vault_only') {
      // CASO A: AUDITORÍA DEL KNOWLEDGE VAULT (Admin Simulation)
      // Buscamos hechos atómicos destilados en la tabla dedicada.
      console.log(`[Search-Pro][${correlationId}] Ejecutando búsqueda en NKV (Vault Only).`);

      const { data, error } = await supabaseAdmin.rpc("search_knowledge_vault", {
        query_embedding: queryVector,
        match_threshold: match_threshold,
        match_count: match_count,
        only_public: false // El Admin puede auditar contenido no público
      });

      if (error) throw new Error(`VAULT_RPC_ERROR: ${error.message}`);
      searchResult = data;

    } else {
      // CASO B: DISCOVERY 2.0 (Social + Geo-Semántica)
      // Buscamos podcasts cercanos y semánticamente relevantes para el usuario.
      console.log(`[Search-Pro][${correlationId}] Ejecutando búsqueda Geo-Semántica Global.`);

      const { data, error } = await supabaseAdmin.rpc("search_geo_semantic", {
        query_embedding: queryVector,
        user_lat: userLat || 0,
        user_long: userLng || 0,
        radius_units: 0.2, // ~20km de radio para discovery
        match_threshold: match_threshold,
        match_count: match_count
      });

      if (error) throw new Error(`GEO_SEMANTIC_RPC_ERROR: ${error.message}`);
      searchResult = data;
    }

    // 4. RETORNO DE RESULTADOS
    return new Response(JSON.stringify(searchResult), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    const errorMsg = err instanceof Error ? err.message : "Error desconocido en el motor de búsqueda";
    console.error(`🔥 [Search-Pro][${correlationId}] CRITICAL_FAILURE:`, errorMsg);

    return new Response(JSON.stringify({
      error: errorMsg,
      trace_id: correlationId
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

// El guard gestiona la seguridad Arcjet y Sentry automáticamente
serve(guard(handler));