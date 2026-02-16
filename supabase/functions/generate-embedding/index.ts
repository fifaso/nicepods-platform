// supabase/functions/generate-embedding/index.ts
// VERSIÓN: 5.0 (Semantic Intelligence Architect - 768d Standard Edition)
// Misión: Generar el ADN semántico del podcast para su indexación en el Radar de Búsqueda.
// [OPTIMIZACIÓN]: Ejecución directa sin Guard y estandarización a 768 dimensiones.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones del núcleo de inteligencia NicePod (Sincronizadas con Nivel 1)
import { cleanTextForSpeech, generateEmbedding } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * CLIENTE SUPABASE ADMIN:
 * Persistente en el contexto de ejecución para minimizar el tiempo de conexión (Warm-start).
 */
const supabaseAdmin: SupabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * extractScriptContent: Extrae el texto para vectorizar desde el objeto JSONB estabilizado.
 */
function extractScriptContent(script_text: any): string {
    if (!script_text) return "";
    // Priorizamos script_plain ya que es la versión sin ruidos de Markdown (v2.5 Standard)
    if (typeof script_text === 'object') {
        return script_text.script_plain || script_text.script_body || "";
    }
    // Fallback de seguridad para registros legacy o transicionales
    try {
        const parsed = typeof script_text === 'string' ? JSON.parse(script_text) : script_text;
        return parsed.script_plain || parsed.script_body || "";
    } catch {
        return String(script_text);
    }
}

/**
 * handler: Lógica central de vectorización semántica.
 */
async function handler(request: Request): Promise<Response> {
    // 1. GESTIÓN DE PROTOCOLO DE RED (CORS)
    // Respondemos a peticiones pre-vuelo de forma ultra-rápida.
    if (request.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
    let targetPodId: number | null = null;

    try {
        // 2. RECEPCIÓN Y VALIDACIÓN DE PAYLOAD
        const payload = await request.json();
        const { podcast_id } = payload;

        if (!podcast_id) throw new Error("PODCAST_ID_REQUIRED");
        targetPodId = podcast_id;

        console.log(`🧠 [Embedding-Worker][${correlationId}] Procesando Podcast #${podcast_id}`);

        // 3. OBTENCIÓN DE DATOS (Fase IV)
        // Recuperamos el guion estructurado directamente de la Bóveda de Producción.
        const { data: pod, error: podErr } = await supabaseAdmin
            .from('micro_pods')
            .select('script_text, title')
            .eq('id', podcast_id)
            .single();

        if (podErr || !pod) throw new Error("PODCAST_NOT_FOUND");

        // 4. PREPARACIÓN DE TEXTO PARA VECTORIZACIÓN
        // Concatenamos título y guion limpio para que el vector capture ambos contextos.
        const rawScript = extractScriptContent(pod.script_text);
        const textToEmbed = `${pod.title} ${cleanTextForSpeech(rawScript)}`.substring(0, 15000);

        if (textToEmbed.length < 20) throw new Error("INSUFFICIENT_CONTENT_FOR_EMBEDDING");

        // 5. GENERACIÓN VECTORIAL (gemini-embedding-001)
        // La función generateEmbedding (v11.7) ya gestiona el límite de 768 dimensiones.
        console.log(`📡 [Embedding-Worker] Solicitando ADN semántico de 768d a Google AI.`);
        const embeddingValues = await generateEmbedding(textToEmbed);

        // 6. PERSISTENCIA VECTORIAL ATÓMICA
        // Mantenemos una política de "Un solo vector por Podcast" para evitar redundancia en el Radar.
        console.log(`💾 [Embedding-Worker] Guardando vector en podcast_embeddings.`);

        // Limpiamos vectores previos si existieran por re-procesamiento
        await supabaseAdmin.from('podcast_embeddings').delete().eq('podcast_id', podcast_id);

        const { error: insertError } = await supabaseAdmin
            .from('podcast_embeddings')
            .insert({
                podcast_id: podcast_id,
                content: textToEmbed.substring(0, 2000), // Guardamos un fragmento como referencia legible
                embedding: embeddingValues
            });

        if (insertError) throw new Error(`DB_EMBEDDING_INSERT_FAIL: ${insertError.message}`);

        console.log(`✅ [Embedding-Worker] Éxito absoluto para Pod #${podcast_id}.`);

        return new Response(JSON.stringify({
            success: true,
            dimensions: embeddingValues.length,
            trace_id: correlationId
        }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (error: any) {
        console.error(`🔥 [Embedding-Worker-Fatal][${correlationId}]:`, error.message);

        // Registro de error administrativo para monitoreo de Bóveda
        if (targetPodId) {
            await supabaseAdmin.from('micro_pods').update({
                admin_notes: `Embedding Failure: ${error.message} | Trace: ${correlationId}`
            }).eq('id', targetPodId);
        }

        return new Response(JSON.stringify({
            success: false,
            error: error.message,
            trace_id: correlationId
        }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
}

serve(handler);