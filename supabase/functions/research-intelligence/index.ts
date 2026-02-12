// supabase/functions/research-intelligence/index.ts
// VERSIÓN: 2.5 (High-Speed Deep Research - Gemini 3.0 Flash Edition)
// Misión: Cosechar fuentes y destilar el dossier en tiempo récord optimizando el uso de CPU.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones del núcleo NicePod estabilizado (Nivel 1)
import { AI_MODELS, buildPrompt, callGeminiMultimodal, generateEmbedding, parseAIJson } from "../_shared/ai.ts";
import { corsHeaders, guard } from "../_shared/guard.ts";

const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const handler = async (req: Request): Promise<Response> => {
    // Trazabilidad por Correlation ID (Inyectado por Guard V5.0)
    const correlationId = req.headers.get("x-correlation-id") ?? crypto.randomUUID();
    let currentDraftId: string | null = null;

    try {
        const payload = await request.json();
        const { draft_id, topic, is_pulse, pulse_source_ids } = payload;
        currentDraftId = draft_id;

        if (!draft_id || !topic) throw new Error("PARAMETROS_INCOMPLETOS");

        console.log(`🧠 [Intelligence][${correlationId}] Iniciando investigación Gen 3: ${topic}`);

        let allSources = [];

        // 1. CAPTURA ESTRATÉGICA DE FUENTES
        if (is_pulse && pulse_source_ids?.length > 0) {
            // Caso Pulse: Recuperamos del Staging del Radar Semántico
            const { data } = await supabaseAdmin
                .from('pulse_staging')
                .select('title, summary, url, authority_score')
                .in('id', pulse_source_ids);

            allSources = (data || []).map(p => ({
                t: p.title,
                c: p.summary.substring(0, 1500), // Poda de seguridad para CPU
                u: p.url,
                o: 'web',
                s: p.authority_score
            }));
        } else {
            // Caso Estándar: Búsqueda Híbrida (NKV + Web)
            const queryVector = await generateEmbedding(topic);

            const [vaultRes, webRes] = await Promise.allSettled([
                supabaseAdmin.rpc('search_knowledge_vault', {
                    query_embedding: queryVector,
                    match_threshold: 0.70,
                    match_count: 5
                }),
                fetch("https://api.tavily.com/search", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        api_key: Deno.env.get("TAVILY_API_KEY"),
                        query: topic,
                        search_depth: "basic",
                        max_results: 4
                    })
                })
            ]);

            const vaultData = vaultRes.status === 'fulfilled' ? vaultRes.value.data || [] : [];
            let webData = [];
            if (webRes.status === 'fulfilled' && webRes.value.ok) {
                const json = await webRes.value.json();
                webData = json.results || [];
            }

            // Unificamos fuentes con estructura minimalista para no saturar el prompt
            allSources = [
                ...vaultData.map((v: any) => ({
                    t: v.title,
                    c: v.content.substring(0, 1800),
                    u: v.url || "#",
                    o: 'vault',
                    s: v.similarity
                })),
                ...webData.map((w: any) => ({
                    t: w.title,
                    c: w.content.substring(0, 1800),
                    u: w.url,
                    o: 'web',
                    s: w.score
                }))
            ];
        }

        if (allSources.length === 0) throw new Error("NO_SOURCES_FOUND_FOR_TOPIC");

        // 2. SÍNTESIS DEL DOSSIER DE VERDAD (Gemini 3.0 Flash)
        const { data: agent } = await supabaseAdmin
            .from('ai_prompts')
            .select('prompt_template')
            .eq('agent_name', 'research-intelligence-v1')
            .single();

        if (!agent) throw new Error("PROMPT_CONFIGURATION_MISSING");

        // Construcción ultra-rápida del prompt (O(n) Efficiency)
        const dossierPrompt = buildPrompt(agent.prompt_template, {
            topic,
            raw_sources: JSON.stringify(allSources)
        });

        // Invocación a la bestia 3.0 Flash
        const dossierRaw = await callGeminiMultimodal(dossierPrompt, undefined, AI_MODELS.FLASH, 0.1);
        const dossier = parseAIJson(dossierRaw);

        // 3. PERSISTENCIA EN BÓVEDA EFÍMERA (Drafts)
        const { error: updateErr } = await supabaseAdmin
            .from('podcast_drafts')
            .update({
                dossier_text: dossier,
                sources: allSources, // Guardamos fuentes para transparencia
                status: 'writing',
                updated_at: new Date().toISOString()
            })
            .eq('id', draft_id);

        if (updateErr) throw updateErr;

        // 4. HANDOVER ASÍNCRONO A FASE III (Redacción)
        // Despachamos al redactor con el mismo Correlation ID para trazabilidad
        supabaseAdmin.functions.invoke('generate-script-draft', {
            body: { draft_id },
            headers: { "x-correlation-id": correlationId }
        }).catch((err) => console.error(`⚠️ [Handover-Fail]: ${err.message}`));

        console.log(`✅ [Intelligence][${correlationId}] Dossier forjado exitosamente.`);

        return new Response(JSON.stringify({
            success: true,
            message: "Investigación completada. Pasando a redacción.",
            trace_id: correlationId
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (e: any) {
        console.error(`🔥 [Intelligence-Fatal][${correlationId}]:`, e.message);

        if (currentDraftId) {
            await supabaseAdmin.from('podcast_drafts').update({
                status: 'failed',
                creation_data: { error_log: e.message, correlation_id: correlationId }
            }).eq('id', currentDraftId);
        }

        return new Response(JSON.stringify({
            success: false,
            error: e.message,
            trace_id: correlationId
        }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
};

// Blindaje perimetral activo
serve(guard(handler));