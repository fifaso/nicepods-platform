// supabase/functions/research-intelligence/index.ts
// VERSIÓN: 2.0 (Deep Intelligence Factory - Asynchronous Research & NKV Integration)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { AI_MODELS, buildPrompt, callGeminiMultimodal, parseAIJson } from "../_shared/ai.ts";
import { guard } from "../_shared/guard.ts";

const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const handler = async (request: Request): Promise<Response> => {
    try {
        const { topic, depth, queryVector, draft_id } = await request.json();
        const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();

        console.log(`🧠 [Intelligence][${correlationId}] Iniciando Investigación Profunda: ${topic}`);

        // A. BÚSQUEDA HÍBRIDA MASIVA (Sin limitaciones de tiempo síncrono)
        // Aumentamos a 10 resultados de web y 10 de bóveda para máxima densidad académica
        const [vaultResults, webResults] = await Promise.allSettled([
            supabaseAdmin.rpc('search_knowledge_vault', {
                query_embedding: queryVector,
                match_threshold: 0.70, // Umbral más amplio para exploración profunda
                match_count: 10
            }),
            fetch("https://api.tavily.com/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    api_key: Deno.env.get("TAVILY_API_KEY"),
                    query: topic,
                    search_depth: "advanced",
                    max_results: 10
                })
            })
        ]);

        const vaultData = vaultResults.status === 'fulfilled' ? vaultResults.value.data || [] : [];
        let webData = [];
        if (webResults.status === 'fulfilled' && webResults.value.ok) {
            const json = await webResults.value.json();
            webData = json.results || [];
        }

        const allSources = [
            ...(vaultData || []).map((v: any) => ({ title: v.title, content: v.content, url: v.url || "#", origin: 'vault', score: v.similarity })),
            ...webData.map((w: any) => ({ title: w.title, content: w.content, url: w.url, origin: 'web', score: w.score }))
        ];

        // 2. SÍNTESIS DE DOSSIER DE ALTA FIDELIDAD (Gemini 2.0 Flash)
        const { data: agent } = await supabaseAdmin.from('ai_prompts').select('prompt_template').eq('agent_name', 'research-intelligence-v1').single();
        if (!agent) throw new Error("PROMPT_CONFIG_MISSING");

        const dossierPrompt = buildPrompt(agent.prompt_template, {
            topic,
            raw_sources: JSON.stringify(allSources)
        });

        const dossierRaw = await callGeminiMultimodal(dossierPrompt, undefined, AI_MODELS.FLASH, 0.1);
        const dossier = parseAIJson(dossierRaw);

        // 3. PERSISTENCIA EN EL BORRADOR (Actualizamos estado para el Frontend)
        if (draft_id) {
            await supabaseAdmin.from('podcast_drafts').update({
                sources: allSources,
                creation_data: { dossier_cache: dossier, status: 'writing' }
            }).eq('id', draft_id);

            // 4. DISPARO DEL REDACTOR (Segunda fase de la malla)
            supabaseAdmin.functions.invoke('generate-script-draft', {
                body: { draft_id, internal_trigger: true }
            });
        }

        return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });

    } catch (err: any) {
        console.error(`🔥 [Intelligence-Error]:`, err.message);
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
    }
};

serve(guard(handler));