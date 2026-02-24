// supabase/functions/search-pro/index.ts
// VERSIÓN: 3.0

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// --- INFRAESTRUCTURA DE INTELIGENCIA Y SEGURIDAD ---
import { generateEmbedding } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { guard } from "../_shared/guard.ts"; // Wrapper para Arcjet + Sentry

/**
 * INTERFACE: SearchPayload
 * Define la estructura de entrada para el radar semántico.
 */
interface SearchPayload {
  query: string;
  userLat?: number;
  userLng?: number;
  match_threshold?: number;
  match_count?: number;
}

/**
 * CLIENTE SUPABASE ADMIN
 * Mantenemos la conexión fuera del handler para optimizar 'Hot Starts'.
 */
const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * handler: El cerebro del motor de búsqueda.
 * 
 * [PROTOCOLOS EJECUTADOS]:
 * 1. Validación de Intención: Bloquea consultas vacías o sospechosas.
 * 2. Transmutación Semántica: Llama a Gemini para generar el vector 768d.
 * 3. Búsqueda Atómica: Invoca al RPC unified_search_v3 para extraer podcasts, usuarios y hechos.
 */
const handler = async (request: Request): Promise<Response> => {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();

  console.info(`🛰️ [Search-Pro][${correlationId}] Iniciando escaneo de radar unificado.`);

  try {
    // 1. RECEPCIÓN Y NORMALIZACIÓN DE PAYLOAD
    const payload: SearchPayload = await request.json();
    const {
      query,
      userLat,
      userLng,
      match_threshold = 0.25, // Umbral optimizado para diversidad semántica
      match_count = 15
    } = payload;

    // Validación de Rigor: Mínimo 3 caracteres para activar el motor.
    if (!query || query.trim().length < 3) {
      throw new Error("CONTENIDO_INSUFICIENTE: Se requieren al menos 3 caracteres para generar resonancia.");
    }

    /**
     * 2. GENERACIÓN DE ADN SEMÁNTICO (Vectorización)
     * Transformamos el lenguaje natural en un vector de 768 dimensiones.
     * [NSP Standard]: Google Gemini-Embedding-001.
     */
    console.info(`🧠 [Search-Pro][${correlationId}] Generando embedding para: "${query.substring(0, 30)}..."`);

    // Invocamos la lógica centralizada en _shared/ai.ts
    const queryVector = await generateEmbedding(query.trim());

    /**
     * 3. BÚSQUEDA OMNICANAL ATÓMICA
     * Invocamos al nuevo RPC unificado. Este proceso es de latencia <20ms en PostgreSQL.
     */
    console.info(`🔍 [Search-Pro][${correlationId}] Consultando Bóveda HNSW con coordenadas: [${userLat || 'N/A'}, ${userLng || 'N/A'}]`);

    const { data: searchResults, error: rpcError } = await supabaseAdmin.rpc("unified_search_v3", {
      p_query_text: query.trim(),
      p_query_embedding: queryVector,
      p_match_threshold: match_threshold,
      p_match_count: match_count,
      p_user_lat: userLat,
      p_user_lng: userLng
    });

    if (rpcError) {
      console.error(`🛑 [Search-Pro][${correlationId}] RPC_ERROR:`, rpcError.message);
      throw new Error(`DATABASE_SEARCH_FAIL: ${rpcError.message}`);
    }

    /**
     * 4. RETORNO DE RESULTADOS CATEGORIZADOS
     * Devolvemos el array de resultados unificados (podcasts, users, chunks).
     */
    console.info(`✅ [Search-Pro][${correlationId}] Escaneo finalizado. Hallazgos: ${searchResults?.length || 0}`);

    return new Response(JSON.stringify(searchResults), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    const errorMsg = err instanceof Error ? err.message : "Fallo desconocido en el motor de búsqueda.";

    // Reporte detallado para observabilidad industrial.
    console.error(`🔥 [Search-Pro-Fatal][${correlationId}]:`, errorMsg);

    return new Response(JSON.stringify({
      error: errorMsg,
      trace_id: correlationId
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

/**
 * [ESCUDO DE SEGURIDAD]: serve(guard(handler))
 * El wrapper guard() inyecta automáticamente:
 * - Arcjet: Rate Limiting y detección de inyecciones maliciosas.
 * - Sentry: Registro de excepciones y trazabilidad de performance.
 */
serve(guard(handler));