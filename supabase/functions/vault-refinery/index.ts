// supabase/functions/vault-refinery/index.ts
// VERSIÓN: 1.0 (Master Standard - Atomic Ingestion & FinOps Shield)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones con rutas relativas directas (Garantía de despliegue universal)
import { extractAtomicFacts, generateEmbedding } from "../_shared/ai.ts";
import { guard } from "../_shared/guard.ts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * INTERFACE: RefineryPayload
 * Define el contrato de entrada para la ingesta de conocimiento.
 */
interface RefineryPayload {
    title: string;
    text: string;
    url?: string;
    source_type: 'web' | 'admin' | 'user_contribution';
    is_public: boolean;
    metadata?: Record<string, unknown>;
}

const supabaseAdmin: SupabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * handler: Orquestador del proceso de refinería.
 */
const handler = async (request: Request): Promise<Response> => {
    const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();

    console.log(`[NKV-Refinery][${correlationId}] Iniciando proceso de ingesta...`);

    try {
        // 1. VALIDACIÓN DE ENTRADA
        const payload: RefineryPayload = await request.json();
        const { title, text, url, source_type, is_public, metadata } = payload;

        if (!text || text.length < 50) {
            throw new Error("CONTENIDO_INSUFICIENTE: El texto debe tener al menos 50 caracteres para ser vectorizado.");
        }

        // 2. MURO DE HASH (FINOPS OPTIMIZATION)
        // Calculamos SHA-256 para evitar pagar por procesar contenido idéntico.
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const contentHash = Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");

        const { data: existingSource } = await supabaseAdmin
            .from('knowledge_sources')
            .select('id')
            .eq('content_hash', contentHash)
            .single();

        if (existingSource) {
            console.log(`[NKV-Refinery][${correlationId}] Duplicado detectado. Abortando para ahorro de costos.`);
            return new Response(JSON.stringify({
                success: true,
                message: "Fuente ya existente en el Vault. Proceso omitido por economía de tokens.",
                source_id: existingSource.id
            }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        // 3. DESTILACIÓN COGNITIVA (Gemini 1.5 Flash)
        // Extraemos cápsulas de información pura, eliminando ruido.
        console.log(`[NKV-Refinery][${correlationId}] Destilando hechos atómicos con Gemini Flash...`);
        const atomicFacts = await extractAtomicFacts(text);

        if (atomicFacts.length === 0) {
            throw new Error("IA_DISTILLATION_FAILED: No se pudieron extraer hechos relevantes del contenido.");
        }

        // 4. REGISTRO DE FUENTE (knowledge_sources)
        const { data: source, error: sourceErr } = await supabaseAdmin
            .from('knowledge_sources')
            .insert({
                title,
                url,
                content_hash: contentHash,
                source_type: source_type || 'web',
                is_public: is_public || false,
                metadata: { ...metadata, correlation_id: correlationId }
            })
            .select('id')
            .single();

        if (sourceErr) throw new Error(`DB_SOURCE_ERROR: ${sourceErr.message}`);

        // 5. VECTORIZACIÓN SEMÁNTICA (text-embedding-004)
        // Procesamos cada hecho de forma secuencial para respetar los límites de la API de Google.
        console.log(`[NKV-Refinery][${correlationId}] Generando ADN semántico para ${atomicFacts.length} hechos...`);

        const chunksToInsert = [];
        for (const fact of atomicFacts) {
            try {
                const embedding = await generateEmbedding(fact);
                chunksToInsert.push({
                    source_id: source.id,
                    content: fact,
                    embedding: embedding,
                    token_count: fact.split(/\s+/).length // Estimación conservadora
                });
            } catch (embErr) {
                console.error(`[NKV-Refinery][${correlationId}] Fallo en chunk: ${fact.substring(0, 30)}...`);
                continue; // Si un chunk falla, seguimos con el siguiente para no perder toda la fuente
            }
        }

        // 6. PERSISTENCIA EN BÓVEDA (knowledge_chunks)
        if (chunksToInsert.length > 0) {
            const { error: chunkErr } = await supabaseAdmin
                .from('knowledge_chunks')
                .insert(chunksToInsert);

            if (chunkErr) throw new Error(`DB_CHUNK_ERROR: ${chunkErr.message}`);
        }

        console.log(`[NKV-Refinery][${correlationId}] Éxito. Ingestados ${chunksToInsert.length} hechos atómicos.`);

        return new Response(JSON.stringify({
            success: true,
            source_id: source.id,
            facts_count: chunksToInsert.length,
            trace_id: correlationId
        }), {
            status: 201,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (err: any) {
        const errorMsg = err instanceof Error ? err.message : "Error desconocido en refinería";
        console.error(`🔥 [NKV-Refinery][${correlationId}] CRITICAL_FAILURE:`, errorMsg);

        return new Response(JSON.stringify({
            success: false,
            error: errorMsg,
            trace_id: correlationId
        }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
};

serve(guard(handler));