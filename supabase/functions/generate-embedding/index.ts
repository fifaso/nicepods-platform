// supabase/functions/generate-embedding/index.ts
// VERSIÓN: 6.0 (NicePod Cataloger - Atomic Sync Edition)
// Misión: Indexación vectorial estricta con señalización de integridad (embedding_ready) y categorización automática.
// [ESTABILIZACIÓN]: Inyección de bandera 'embedding_ready' y persistencia de categoría semántica.

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
 */
const supabaseAdmin: SupabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

function extractScript(input: any): string {
    if (!input) return "";
    if (typeof input === 'object' && input !== null) {
        return input.script_plain || input.script_body || "";
    }
    try {
        const parsed = typeof input === 'string' ? JSON.parse(input) : input;
        return parsed.script_plain || parsed.script_body || "";
    } catch {
        return String(input);
    }
}

async function handler(request: Request): Promise<Response> {
    if (request.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const correlationIdentification = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
    let targetPodId: number | null = null;

    try {
        const payload = await request.json();
        const { podcast_id } = payload;

        if (!podcast_id) {
            throw new Error("RECHAZO_TÉCNICO: Se requiere el identificador del podcast (podcast_id).");
        }
        targetPodId = podcast_id;

        console.info(`🧠 [Cataloger-V6.0][${correlationIdentification}] Iniciando indexación atómica para Pod #${podcast_id}`);

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

        // --- FASE I: VECTORIZACIÓN 768d ---
        const embeddingContext = `${pod.title} ${cleanText}`.substring(0, 15000);
        const embeddingValues = await generateEmbedding(embeddingContext);

        const { error: vectorError } = await supabaseAdmin
            .from('podcast_embeddings')
            .upsert({
                podcast_id: podcast_id,
                content: cleanText.substring(0, 1000),
                embedding: embeddingValues
            }, { onConflict: 'podcast_id' });

        if (vectorError) throw new Error(`VECTOR_SAVE_CRITICAL_FAIL: ${vectorError.message}`);

        // --- FASE II: CATEGORIZACIÓN E INTELIGENCIA ---
        let categoryDetected = "Pensamiento"; // Fallback por defecto

        try {
            const catalogPrompt = `Analiza este guion y genera: 
            1. Un resumen ejecutivo de máximo 150 caracteres. 
            2. Una lista de 5 etiquetas técnicas (keywords). 
            3. Clasifica el guion en EXACTAMENTE UNA de estas categorías: "Pensamiento", "Herramientas", "Tecnología", "Bienestar", "Narrativa". 
            Guion: ${cleanText.substring(0, 5000)}
            RESPONDE ÚNICA Y EXCLUSIVAMENTE CON ESTE FORMATO JSON EXACTO: {"summary": "...", "tags": ["...", "..."], "category": "..."}`;

            const aiResponse = await callGeminiMultimodal(catalogPrompt, undefined, AI_MODELS.FLASH, 0.2);
            const metadata = parseAIJson<{ summary: string, tags: string[], category: string }>(aiResponse);

            categoryDetected = metadata.category;

            // [FIX CRÍTICO]: Marcamos embedding_ready = true y actualizamos la categoría
            await supabaseAdmin
                .from('micro_pods')
                .update({
                    ai_summary: metadata.summary,
                    ai_tags: metadata.tags,
                    category: categoryDetected,
                    embedding_ready: true,
                    agent_version: `nicepod-cataloger-v6.0`,
                    updated_at: new Date().toISOString()
                })
                .eq('id', podcast_id);

        } catch (metadataException: any) {
            console.warn(`⚠️ [Cataloger] Falló síntesis de metadatos. Marcando embedding_ready=true por defecto.`);
            await supabaseAdmin.from('micro_pods').update({ embedding_ready: true }).eq('id', podcast_id);
        }

        console.info(`✅ [Cataloger][${correlationIdentification}] Misión finalizada. Vector y Categoría anclados.`);

        return new Response(JSON.stringify({ success: true, trace_identification: correlationIdentification }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (error: any) {
        console.error(`🔥 [Cataloger-Fatal][${correlationIdentification}]:`, error.message);
        if (targetPodId) {
            await supabaseAdmin.from('micro_pods').update({
                admin_notes: `Error Crítico en Catalogación (V6.0): ${error.message} | Trazabilidad: ${correlationIdentification}`
            }).eq('id', targetPodId);
        }
        return new Response(JSON.stringify({ error: error.message, trace_identification: correlationIdentification }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
}

serve(handler);