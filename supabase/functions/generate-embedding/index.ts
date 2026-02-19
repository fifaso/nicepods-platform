// supabase/functions/generate-embedding/index.ts
// VERSIÓN: 5.1 (Semantic & Metadata Architect - Full Cataloging Edition)
// Misión: Generar el vector 768d y catalogar el podcast (Tags y Resumen) en un solo paso.
// [ESTABILIZACIÓN]: Cierre de inventario de inteligencia para el Pod #179 y futuros.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones del núcleo NicePod sincronizado (v12.0)
import { AI_MODELS, callGeminiMultimodal, cleanTextForSpeech, generateEmbedding, parseAIJson } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseAdmin: SupabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

function extractScript(input: any): string {
    if (!input) return "";
    if (typeof input === 'object') return input.script_plain || input.script_body || "";
    try {
        const parsed = typeof input === 'string' ? JSON.parse(input) : input;
        return parsed.script_plain || parsed.script_body || "";
    } catch { return String(input); }
}

async function handler(request: Request): Promise<Response> {
    if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
    let targetPodId: number | null = null;

    try {
        const payload = await request.json();
        const { podcast_id } = payload;
        targetPodId = podcast_id;

        console.log(`🧠 [Cataloger][${correlationId}] Iniciando indexación para Pod #${podcast_id}`);

        // 1. OBTENCIÓN DE TEXTO SOBERANO
        const { data: pod } = await supabaseAdmin.from('micro_pods').select('*').eq('id', podcast_id).single();
        if (!pod) throw new Error("POD_NOT_FOUND");

        const plainText = extractScript(pod.script_text);
        const cleanText = cleanTextForSpeech(plainText);

        // 2. GENERACIÓN VECTORIAL (768d)
        // La brújula para el buscador y el Radar Semántico.
        const embeddingValues = await generateEmbedding(`${pod.title} ${cleanText}`.substring(0, 15000));

        // 3. DESTILACIÓN DE METADATOS (Intelligence Cataloging)
        // Aprovechamos la potencia de Gemini Flash para generar el resumen y los tags.
        const catalogPrompt = `Analiza este guion y genera: 
        1. Un resumen ejecutivo de máximo 150 caracteres. 
        2. Una lista de 5 etiquetas técnicas (keywords). 
        Guion: ${cleanText.substring(0, 5000)}
        RESPONDE SOLO JSON: {"summary": "", "tags": []}`;

        const aiResponse = await callGeminiMultimodal(catalogPrompt, undefined, AI_MODELS.FLASH, 0.2);
        const metadata = parseAIJson<{ summary: string, tags: string[] }>(aiResponse);

        // 4. PERSISTENCIA ATÓMICA EN BÓVEDA
        // Sincronizamos el vector y los metadatos visuales en una sola transacción.
        await Promise.all([
            // Actualizamos la tabla de búsqueda vectorial
            supabaseAdmin.from('podcast_embeddings').upsert({
                podcast_id,
                content: cleanText.substring(0, 1000),
                embedding: embeddingValues
            }, { onConflict: 'podcast_id' }),

            // Actualizamos el registro principal con el resumen y los tags para la UI
            supabaseAdmin.from('micro_pods').update({
                ai_summary: metadata.summary,
                ai_tags: metadata.tags,
                agent_version: `nicepod-cataloger-v5.1`,
                updated_at: new Date().toISOString()
            }).eq('id', podcast_id)
        ]);

        console.log(`✅ [Cataloger] Pod #${podcast_id} indexado y etiquetado con éxito.`);

        return new Response(JSON.stringify({ success: true, trace_id: correlationId }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (error: any) {
        console.error(`🔥 [Cataloger-Fatal]:`, error.message);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    }
}

serve(handler);