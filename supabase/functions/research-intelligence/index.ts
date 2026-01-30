// supabase/functions/research-intelligence/index.ts
// VERSIÓN: 2.1 (Resilient Deep Research - Layered Intelligence)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { AI_MODELS, buildPrompt, callGeminiMultimodal, generateEmbedding, parseAIJson } from "../_shared/ai.ts";

const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

serve(async (req) => {
    let currentDraftId: string | null = null;

    try {
        const payload = await req.json();
        const { draft_id, topic, depth, is_pulse, pulse_source_ids } = payload;
        currentDraftId = draft_id;

        console.log(`🧠 [Intelligence] Investigando: ${topic}`);

        let allSources = [];

        // --- BIFURCACIÓN ESTRATÉGICA DE FUENTES ---
        if (is_pulse && pulse_source_ids?.length > 0) {
            // Caso Pulse: Usamos lo ya cosechado en el radar
            const { data: pulseData } = await supabaseAdmin.from('pulse_staging').select('*').in('id', pulse_source_ids);
            allSources = (pulseData || []).map(p => ({ title: p.title, content: p.summary, url: p.url, origin: 'web', score: p.authority_score }));
        } else {
            // Caso Estándar: Búsqueda Híbrida Completa
            const queryVector = await generateEmbedding(topic);
            const [vaultRes, webRes] = await Promise.allSettled([
                supabaseAdmin.rpc('search_knowledge_vault', { query_embedding: queryVector, match_threshold: 0.75, match_count: 8 }),
                fetch("https://api.tavily.com/search", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ api_key: Deno.env.get("TAVILY_API_KEY"), query: topic, search_depth: "advanced", max_results: 6 })
                })
            ]);

            const vaultData = vaultRes.status === 'fulfilled' ? vaultRes.value.data || [] : [];
            let webData = [];
            if (webRes.status === 'fulfilled' && webRes.value.ok) webData = (await webRes.value.json()).results || [];

            allSources = [
                ...vaultData.map((v: any) => ({ title: v.title, content: v.content, url: v.url || "#", origin: 'vault', score: v.similarity })),
                ...webData.map((w: any) => ({ title: w.title, content: w.content, url: w.url, origin: 'web', score: w.score }))
            ];
        }

        if (allSources.length === 0) throw new Error("NO_SOURCES_FOUND");

        // --- SÍNTESIS DEL DOSSIER (IA Flash) ---
        const { data: agent } = await supabaseAdmin.from('ai_prompts').select('prompt_template').eq('agent_name', 'research-intelligence-v1').single();
        if (!agent) throw new Error("PROMPT_MISSING");

        const dossierPrompt = buildPrompt(agent.prompt_template, { topic, raw_sources: JSON.stringify(allSources) });
        const dossierRaw = await callGeminiMultimodal(dossierPrompt, undefined, AI_MODELS.FLASH, 0.1);
        const dossier = parseAIJson(dossierRaw);

        // --- PERSISTENCIA Y HANDOVER A FASE C ---
        await supabaseAdmin.from('podcast_drafts').update({
            dossier_text: dossier,
            sources: allSources,
            status: 'writing'
        }).eq('id', draft_id);

        // Despertar al Redactor
        supabaseAdmin.functions.invoke('generate-script-draft', { body: { draft_id } });

        return new Response("OK");

    } catch (e: any) {
        console.error(`🔥 [Intelligence-Fatal]:`, e.message);
        if (currentDraftId) {
            await supabaseAdmin.from('podcast_drafts').update({ status: 'failed' }).eq('id', currentDraftId);
        }
        return new Response(e.message, { status: 500 });
    }
});