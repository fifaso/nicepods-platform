// supabase/functions/research-intelligence/index.ts
// VERSIÓN: 2.8 (CPU-Optimized Deep Research - High Efficiency Standard)
// Misión: Cosechar hechos del Vault y la Web para forjar el Dossier de Verdad.
// [OPTIMIZACIÓN]: Eliminación de Guard externo para maximizar el presupuesto de CPU en el Edge.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones del núcleo de inteligencia NicePod (Nivel 1 de Estabilización)
import { AI_MODELS, buildPrompt, callGeminiMultimodal, generateEmbedding, parseAIJson } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * CLIENTE SUPABASE ADMIN:
 * Inicializado fuera del handler para reutilizar la conexión TCP entre ejecuciones (Warm-start).
 */
const supabaseAdmin: SupabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * handler: Lógica central de investigación asíncrona.
 */
async function handler(request: Request): Promise<Response> {
    // 1. GESTIÓN DE PROTOCOLO CORS (Bypass rápido)
    if (request.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
    let currentDraftId: string | null = null;

    try {
        // 2. RECEPCIÓN Y VALIDACIÓN DE PAYLOAD
        const payload = await request.json();
        const { draft_id, topic, is_pulse, pulse_source_ids } = payload;

        if (!draft_id || !topic) {
            throw new Error("PARAMETROS_INCOMPLETOS: Se requiere draft_id y topic.");
        }

        currentDraftId = draft_id;
        console.log(`🧠 [Intelligence][${correlationId}] Iniciando investigación: ${topic}`);

        // 3. RESOLUCIÓN DE PROFUNDIDAD OPERATIVA
        const { data: draftData, error: draftFetchError } = await supabaseAdmin
            .from('podcast_drafts')
            .select('creation_data')
            .eq('id', draft_id)
            .single();

        if (draftFetchError || !draftData) throw new Error("DRAFT_NOT_FOUND");

        const depth = draftData.creation_data?.narrativeDepth || "Intermedia";

        // Mapeo estricto de límites para no saturar el CPU de Deno
        const limits = {
            "Superficial": { vault: 2, web: 1, chars: 1000 },
            "Intermedia": { vault: 3, web: 2, chars: 1500 },
            "Profunda": { vault: 5, web: 3, chars: 2000 }
        }[depth as "Superficial" | "Intermedia" | "Profunda"] || { vault: 3, web: 2, chars: 1500 };

        let allSources = [];

        // 4. CAPTURA HÍBRIDA DE FUENTES
        if (is_pulse && pulse_source_ids?.length > 0) {
            // Caso Pulse: Recuperación directa de Staging
            const { data: pulseData } = await supabaseAdmin
                .from('pulse_staging')
                .select('title, summary, url, authority_score')
                .in('id', pulse_source_ids);

            allSources = (pulseData || []).map(p => ({
                title: p.title,
                content: p.summary.substring(0, limits.chars),
                url: p.url,
                origin: 'web'
            }));
        } else {
            // Caso Estándar: Búsqueda Semántica + Web (Tavily)
            const queryVector = await generateEmbedding(topic);

            const [vaultRes, webRes] = await Promise.allSettled([
                supabaseAdmin.rpc('search_knowledge_vault', {
                    query_embedding: queryVector,
                    match_threshold: 0.75,
                    match_count: limits.vault
                }),
                fetch("https://api.tavily.com/search", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        api_key: Deno.env.get("TAVILY_API_KEY"),
                        query: topic,
                        search_depth: "basic",
                        max_results: limits.web
                    })
                })
            ]);

            const vaultData = vaultRes.status === 'fulfilled' ? vaultRes.value.data || [] : [];
            let webData = [];
            if (webRes.status === 'fulfilled' && webRes.value.ok) {
                const json = await webRes.value.json();
                webData = json.results || [];
            }

            // Normalización minimalista para reducir el overhead de procesamiento de strings
            allSources = [
                ...vaultData.map((v: any) => ({
                    title: v.title,
                    content: v.content.substring(0, limits.chars),
                    url: v.url || "#",
                    origin: 'vault'
                })),
                ...webData.map((w: any) => ({
                    title: w.title,
                    content: w.content.substring(0, limits.chars),
                    url: w.url,
                    origin: 'web'
                }))
            ];
        }

        if (allSources.length === 0) throw new Error("FUENTES_INSUFICIENTES");

        // 5. SÍNTESIS DEL DOSSIER (Fase II)
        // Invocación al modelo Gemini 3.0 Flash para máxima eficiencia
        const { data: agent } = await supabaseAdmin
            .from('ai_prompts')
            .select('prompt_template')
            .eq('agent_name', 'research-intelligence-v1')
            .single();

        if (!agent) throw new Error("PROMPT_CONFIG_MISSING");

        // buildPrompt V10.5 usa Regex para evitar picos de CPU
        const dossierPrompt = buildPrompt(agent.prompt_template, {
            topic,
            raw_sources: JSON.stringify(allSources.map(s => ({ t: s.title, c: s.content })))
        });

        const dossierRaw = await callGeminiMultimodal(dossierPrompt, undefined, AI_MODELS.FLASH, 0.1);
        const dossier = parseAIJson(dossierRaw);

        // 6. PERSISTENCIA FINAL EN BASE DE DATOS
        const { error: updateError } = await supabaseAdmin
            .from('podcast_drafts')
            .update({
                dossier_text: dossier,
                sources: allSources,
                status: 'writing',
                updated_at: new Date().toISOString()
            })
            .eq('id', draft_id);

        if (updateError) throw updateError;

        // 7. DESPACHO ASÍNCRONO AL REDACTOR (Fase III)
        // Usamos invoke sin await para liberar esta función de inmediato
        supabaseAdmin.functions.invoke('generate-script-draft', {
            body: { draft_id },
            headers: { "x-correlation-id": correlationId }
        }).catch((e) => console.error(`⚠️ [Handover-Error]: ${e.message}`));

        console.log(`✅ [Intelligence][${correlationId}] Dossier forjado exitosamente.`);

        return new Response(JSON.stringify({
            success: true,
            trace_id: correlationId
        }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (error: any) {
        console.error(`🔥 [Intelligence-Fatal][${correlationId}]:`, error.message);

        if (currentDraftId) {
            await supabaseAdmin.from('podcast_drafts').update({
                status: 'failed',
                creation_data: { last_error: error.message, trace: correlationId }
            }).eq('id', currentDraftId);
        }

        return new Response(JSON.stringify({ error: error.message, trace_id: correlationId }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
}

serve(handler);