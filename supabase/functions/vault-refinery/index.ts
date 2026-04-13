// supabase/functions/vault-refinery/index.ts
// VERSIÓN: 1.1 (Master Standard - Atomic Ingestion & FinOps Shield)
// Misión: Orquestar el refinado de capital intelectual, destilando hechos atómicos y vectorizando el conocimiento.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones con rutas relativas directas (Garantía de despliegue universal)
import { extractAtomicFacts, generateEmbedding } from "@/supabase/functions/_shared/ai.ts";
import { guard } from "@/supabase/functions/_shared/guard.ts";
import { corsHeaders } from "@/supabase/functions/_shared/cors.ts";
import { Database } from "@/types/database.types.ts";

/**
 * INTERFACE: RefineryPayload
 * Define el contrato de entrada para la ingesta de conocimiento.
 */
interface RefineryPayload {
    title: string;
    text: string;
    uniformResourceLocator?: string;
    source_type: 'web' | 'admin' | 'user_contribution';
    is_public: boolean;
    metadata?: Record<string, unknown>;
}

const supabaseAdmin: SupabaseClient<Database> = createClient<Database>(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * handler: Orquestador del proceso de refinería.
 */
const handler = async (request: Request): Promise<Response> => {
    const correlationIdentification = request.headers.get("x-correlation-id") ?? crypto.randomUUID();

    console.log(`[NKV-Refinery][${correlationIdentification}] Iniciando proceso de ingesta...`);

    try {
        // 1. VALIDACIÓN DE ENTRADA
        const refinementPayload: RefineryPayload = await request.json();
        const {
            title: sourceTitle,
            text: sourceRawText,
            uniformResourceLocator: sourceUniformResourceLocator,
            source_type: knowledgeSourceType,
            is_public: isPublicKnowledge,
            metadata: sourceMetadata
        } = refinementPayload;

        if (!sourceRawText || sourceRawText.length < 50) {
            throw new Error("CONTENIDO_INSUFICIENTE: El texto debe tener al menos 50 caracteres para ser vectorizado.");
        }

        // 2. MURO DE HASH (FINOPS OPTIMIZATION)
        // Calculamos SHA-256 para evitar pagar por procesar contenido idéntico.
        const textEncoder = new TextEncoder();
        const binaryData = textEncoder.encode(sourceRawText);
        const hashBuffer = await crypto.subtle.digest("SHA-256", binaryData);
        const contentHashHex = Array.from(new Uint8Array(hashBuffer))
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");

        const { data: existingKnowledgeSource } = await supabaseAdmin
            .from('knowledge_sources')
            .select('id')
            .eq('content_hash', contentHashHex)
            .single();

        if (existingKnowledgeSource) {
            console.log(`[NKV-Refinery][${correlationIdentification}] Duplicado detectado. Abortando para ahorro de costos.`);
            return new Response(JSON.stringify({
                success: true,
                message: "Fuente ya existente en el Vault. Proceso omitido por economía de tokens.",
                source_identification: existingKnowledgeSource.id
            }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        // 3. DESTILACIÓN COGNITIVA (Gemini 1.5 Flash)
        // Extraemos cápsulas de información pura, eliminando ruido.
        console.log(`[NKV-Refinery][${correlationIdentification}] Destilando hechos atómicos con Gemini Flash...`);
        const atomicFactsCollection = await extractAtomicFacts(sourceRawText);

        if (atomicFactsCollection.length === 0) {
            throw new Error("IA_DISTILLATION_FAILED: No se pudieron extraer hechos relevantes del contenido.");
        }

        // 4. REGISTRO DE FUENTE (knowledge_sources)
        // [METAL]: Se respetan los nombres de columna de la DB (content_hash, source_type).
        const { data: knowledgeSourceRecord, error: sourceInsertError } = await supabaseAdmin
            .from('knowledge_sources')
            .insert({
                title: sourceTitle,
                uniformResourceLocator: sourceUniformResourceLocator,
                content_hash: contentHashHex,
                source_type: knowledgeSourceType || 'web',
                is_public: isPublicKnowledge || false,
                metadata: { ...sourceMetadata, correlation_identification: correlationIdentification }
            })
            .select('id')
            .single();

        if (sourceInsertError) throw new Error(`DB_SOURCE_ERROR: ${sourceInsertError.message}`);

        // 5. VECTORIZACIÓN SEMÁNTICA (text-embedding-004)
        // Procesamos cada hecho de forma secuencial para respetar los límites de la API de Google.
        console.log(`[NKV-Refinery][${correlationIdentification}] Generando ADN semántico para ${atomicFactsCollection.length} hechos...`);

        const knowledgeChunksToInsert = [];
        for (const atomicFact of atomicFactsCollection) {
            try {
                const semanticEmbedding = await generateEmbedding(atomicFact);
                knowledgeChunksToInsert.push({
                    source_id: knowledgeSourceRecord.id, // [METAL]: FK column source_id
                    content: atomicFact,
                    embedding: semanticEmbedding as unknown as string,
                    token_count: atomicFact.split(/\s+/).length // Estimación conservadora
                });
            } catch (embeddingError) {
                console.error(`[NKV-Refinery][${correlationIdentification}] Fallo en chunk: ${atomicFact.substring(0, 30)}...`);
                continue; // Si un chunk falla, seguimos con el siguiente para no perder toda la fuente
            }
        }

        // 6. PERSISTENCIA EN BÓVEDA (knowledge_chunks)
        if (knowledgeChunksToInsert.length > 0) {
            const { error: chunkPersistenceError } = await supabaseAdmin
                .from('knowledge_chunks')
                .insert(knowledgeChunksToInsert);

            if (chunkPersistenceError) throw new Error(`DB_CHUNK_ERROR: ${chunkPersistenceError.message}`);
        }

        console.log(`[NKV-Refinery][${correlationIdentification}] Éxito. Ingestados ${knowledgeChunksToInsert.length} hechos atómicos.`);

        return new Response(JSON.stringify({
            success: true,
            source_identification: knowledgeSourceRecord.id,
            facts_count: knowledgeChunksToInsert.length,
            trace_identification: correlationIdentification
        }), {
            status: 201,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (caughtError: unknown) {
        const errorMessage = caughtError instanceof Error ? caughtError.message : "Error desconocido en refinería";
        console.error(`🔥 [NKV-Refinery][${correlationIdentification}] CRITICAL_FAILURE:`, errorMessage);

        return new Response(JSON.stringify({
            success: false,
            error: errorMessage,
            trace_identification: correlationIdentification
        }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
};

serve(guard(handler));
