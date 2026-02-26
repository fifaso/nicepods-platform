// supabase/functions/generate-embedding/index.ts
// VERSIÓN: 5.2

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones del núcleo NicePod sincronizado
import {
    AI_MODELS,
    callGeminiMultimodal,
    cleanTextForSpeech,
    generateEmbedding,
    parseAIJson
} from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * CLIENTE SUPABASE ADMIN
 * Mantenemos la conexión fuera del handler para optimizar 'Hot Starts'.
 */
const supabaseAdmin: SupabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * UTILIDAD: extractScript
 * Misión: Normalizar la entrada del guion independientemente de si viene como
 * un objeto JSONB nativo de Supabase o como un string serializado.
 */
function extractScript(input: any): string {
    if (!input) return "";

    // Caso 1: Supabase ya lo parseó como Objeto JSON
    if (typeof input === 'object' && input !== null) {
        return input.script_plain || input.script_body || "";
    }

    // Caso 2: Viene como String (Posible doble escape)
    try {
        const parsed = typeof input === 'string' ? JSON.parse(input) : input;
        return parsed.script_plain || parsed.script_body || "";
    } catch {
        // Caso de rescate: Si falla el parseo, devolvemos el crudo para no romper el flujo
        return String(input);
    }
}

/**
 * WORKER: generate-embedding
 * Orquestador de la catalogación semántica.
 */
async function handler(request: Request): Promise<Response> {
    // 1. GESTIÓN DE RED (CORS Preflight)
    if (request.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
    let targetPodId: number | null = null;

    try {
        // 2. VALIDACIÓN DE PAYLOAD Y SEGURIDAD INTERNA
        const payload = await request.json();
        const { podcast_id } = payload;

        if (!podcast_id) {
            throw new Error("RECHAZO_TÉCNICO: Se requiere el identificador del podcast (podcast_id).");
        }
        targetPodId = podcast_id;

        console.info(`🧠 [Cataloger-V5.2][${correlationId}] Iniciando indexación atómica para Pod #${podcast_id}`);

        // 3. RECUPERACIÓN DEL CRÚDO SOBERANO
        const { data: pod, error: podError } = await supabaseAdmin
            .from('micro_pods')
            .select('title, script_text')
            .eq('id', podcast_id)
            .single();

        if (podError || !pod) {
            throw new Error(`DB_FETCH_FAIL: No se localizó el podcast en la matriz principal.`);
        }

        const plainText = extractScript(pod.script_text);
        const cleanText = cleanTextForSpeech(plainText);

        if (cleanText.length < 50) {
            console.warn(`⚠️ [Cataloger][${correlationId}] Guion inusualmente corto. Procediendo con cautela.`);
        }

        // =========================================================================
        // 🔴 FASE I: OPERACIÓN PRIMARIA (EL VECTOR HNSW)
        // Esta fase es inquebrantable. Si el vector no se guarda, el worker falla.
        // =========================================================================

        console.info(`   > Generando matriz de 768 dimensiones...`);
        // Concatenamos el título y el texto para darle máximo contexto semántico.
        // Limitamos a 15,000 caracteres para respetar el payload de Google Gemini.
        const embeddingContext = `${pod.title} ${cleanText}`.substring(0, 15000);
        const embeddingValues = await generateEmbedding(embeddingContext);

        console.info(`   > Persistiendo vector en la tabla 'podcast_embeddings'...`);
        const { error: vectorError } = await supabaseAdmin
            .from('podcast_embeddings')
            .upsert({
                podcast_id: podcast_id,
                content: cleanText.substring(0, 1000), // Guardamos el inicio como extracto de apoyo
                embedding: embeddingValues
            }, { onConflict: 'podcast_id' });

        if (vectorError) {
            throw new Error(`VECTOR_SAVE_CRITICAL_FAIL: ${vectorError.message}`);
        }

        console.info(`   ✅ Vector anclado. Podcast visible para el Radar Semántico.`);

        // =========================================================================
        // 🟡 FASE II: OPERACIÓN SECUNDARIA (METADATA VISUAL)
        // Esta fase es 'Silenciosa'. Si falla, no arruinamos el éxito del worker.
        // =========================================================================

        try {
            console.info(`   > Extrayendo metadatos ejecutivos con Gemini Flash...`);

            const catalogPrompt = `Analiza este guion y genera: 
            1. Un resumen ejecutivo de máximo 150 caracteres. 
            2. Una lista de 5 etiquetas técnicas (keywords). 
            Guion: ${cleanText.substring(0, 5000)}
            RESPONDE ÚNICA Y EXCLUSIVAMENTE CON ESTE FORMATO JSON EXACTO: {"summary": "...", "tags": ["...", "..."]}`;

            // Usamos una temperatura baja (0.2) para que el LLM sea estricto y no alucine.
            const aiResponse = await callGeminiMultimodal(catalogPrompt, undefined, AI_MODELS.FLASH, 0.2);

            // Parser resiliente importado de _shared/ai.ts
            const metadata = parseAIJson<{ summary: string, tags: string[] }>(aiResponse);

            console.info(`   > Inyectando metadatos en 'micro_pods'...`);
            const { error: metadataError } = await supabaseAdmin
                .from('micro_pods')
                .update({
                    ai_summary: metadata.summary,
                    ai_tags: metadata.tags,
                    agent_version: `nicepod-cataloger-v5.2`,
                    updated_at: new Date().toISOString()
                })
                .eq('id', podcast_id);

            if (metadataError) {
                console.warn(`   ⚠️ Error no letal guardando metadatos:`, metadataError.message);
            }

        } catch (metadataException: any) {
            //[CLAVE]: Capturamos el error pero NO lanzamos un 'throw'.
            // El podcast ya tiene su vector, así que el buscador lo encontrará aunque 
            // le falte el resumen generado por IA.
            console.warn(`   ⚠️ [Cataloger][Warning] Falló la síntesis de metadata (JSON/Timeout). El proceso continuará. Detalle: ${metadataException.message}`);
        }

        // =========================================================================
        // CIERRE DE OPERACIÓN
        // =========================================================================

        console.info(`🏁 [Cataloger][${correlationId}] Misión de catalogación finalizada para Pod #${podcast_id}.`);

        return new Response(JSON.stringify({
            success: true,
            message: "Catalogación estructural completada.",
            trace_id: correlationId
        }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (error: any) {
        console.error(`🔥 [Cataloger-Fatal][${correlationId}]:`, error.message);

        // Registrar el error en la base de datos para auditoría administrativa
        if (targetPodId) {
            await supabaseAdmin.from('micro_pods').update({
                admin_notes: `Error Crítico en Catalogación (V5.2): ${error.message} | Trazabilidad: ${correlationId}`
            }).eq('id', targetPodId);
        }

        return new Response(JSON.stringify({
            error: error.message,
            trace_id: correlationId
        }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
}

serve(handler);