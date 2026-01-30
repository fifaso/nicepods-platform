// supabase/functions/research-intelligence/index.ts
// VERSIÓN: 2.2 (Resilient Deep Research - Pulse & Standard Support)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { AI_MODELS, buildPrompt, callGeminiMultimodal, parseAIJson } from "../_shared/ai.ts";
import { corsHeaders, guard } from "../_shared/guard.ts";

const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const handler = async (request: Request): Promise<Response> => {
    const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();

    try {
        const bodyText = await request.text();
        const { topic, depth, queryVector, draft_id, is_pulse, pulse_ids } = JSON.parse(bodyText);

        console.log(`🧠 [Intelligence][${correlationId}] Iniciando fase de suministro para: ${topic}`);

        let allSources = [];
        let dossier = null;

        // --- CASO A: INGESTA PULSE (Radar-based) ---
        if (is_pulse && pulse_ids?.length > 0) {
            const { data: pulseData } = await supabaseAdmin.from('pulse_staging').select('*').in('id', pulse_ids);
            allSources = (pulseData || []).map(p => ({
                title: p.title, content: p.summary, url: p.url, origin: 'web', score: p.authority_score
            }));
        }
        // --- CASO B: INVESTIGACIÓN PROFUNDA (Web + NKV) ---
        else {
            const [vaultResults, webResults] = await Promise.allSettled([
                supabaseAdmin.rpc('search_knowledge_vault', {
                    query_embedding: queryVector, match_threshold: 0.70, match_count: 8
                }),
                fetch("https://api.tavily.com/search", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ api_key: Deno.env.get("TAVILY_API_KEY"), query: topic, search_depth: "advanced", max_results: 6 })
                })
            ]);

            const vaultData = vaultResults.status === 'fulfilled' ? vaultResults.value.data || [] : [];
            let webData = [];
            if (webResults.status === 'fulfilled' && webResults.value.ok) {
                const json = await webResults.value.json();
                webData = json.results || [];
            }

            allSources = [
                ...vaultData.map((v: any) => ({ title: v.title, content: v.content, url: v.url || "#", origin: 'vault', score: v.similarity })),
                ...webData.map((w: any) => ({ title: w.title, content: w.content, url: w.url, origin: 'web', score: w.score }))
            ];
        }

        if (allSources.length === 0) throw new Error("NO_SOURCES_IDENTIFIED");

        // SÍNTESIS DE DOSSIER (IA Flash)
        const { data: agent } = await supabaseAdmin.from('ai_prompts').select('prompt_template').eq('agent_name', 'research-intelligence-v1').single();
        const dossierPrompt = buildPrompt(agent!.prompt_template, { topic, raw_sources: JSON.stringify(allSources) });
        const dossierRaw = await callGeminiMultimodal(dossierPrompt, undefined, AI_MODELS.FLASH, 0.1);
        dossier = parseAIJson(dossierRaw);

        // ACTUALIZACIÓN DE BORRADOR Y HANDOVER AL REDACTOR
        if (draft_id) {
            await supabaseAdmin.from('podcast_drafts').update({
                sources: allSources,
                creation_data: { dossier_cache: dossier, status: 'writing' }
            }).eq('id', draft_id);

            // Disparo de redacción final (Segunda fase asíncrona)
            supabaseAdmin.functions.invoke('generate-script-draft', {
                body: { draft_id, internal_trigger: true }
            });
        }

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } catch (err: any) {
        console.error(`🔥 [Intelligence-Error]:`, err.message);
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500, headers: corsHeaders
        });
    }
};

serve(guard(handler));