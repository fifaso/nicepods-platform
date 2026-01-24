// supabase/functions/research-intelligence/index.ts
// VERSIÓN: 1.2 (Resilient Intelligence Factory - Layered Search)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { AI_MODELS, buildPrompt, callGeminiMultimodal, parseAIJson } from "../_shared/ai.ts";
import { corsHeaders, guard } from "../_shared/guard.ts";

const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const handler = async (request: Request): Promise<Response> => {
    const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();

    try {
        const { topic, depth, queryVector } = await request.json();

        // 1. BÚSQUEDA HÍBRIDA RESILIENTE
        // No usamos Promise.all para que el fallo de una fuente no mate la otra
        console.log(`🔍 [Intelligence][${correlationId}] Investigando: ${topic}`);

        // A. Bóveda Interna (Costo $0 - Prioridad Alta)
        const { data: vaultData } = await supabaseAdmin.rpc('search_knowledge_vault', {
            query_embedding: queryVector,
            match_threshold: 0.78,
            match_count: depth === "Profundo" ? 10 : 5
        });

        // B. Web Abierta (Tavily - Costo Variable)
        let webData = { results: [] };
        try {
            const tavilyRes = await fetch("https://api.tavily.com/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    api_key: Deno.env.get("TAVILY_API_KEY"),
                    query: topic,
                    search_depth: depth === "Profundo" ? "advanced" : "basic",
                    max_results: 5
                })
            });
            if (tavilyRes.ok) webData = await tavilyRes.json();
        } catch (e) {
            console.warn(`[Intelligence][${correlationId}] Tavily inaccesible. Usando solo NKV.`);
        }

        const allSources = [
            ...(vaultData || []).map((v: any) => ({ title: v.title, snippet: v.content, origin: 'vault', score: v.similarity })),
            ...(webData.results || []).map((w: any) => ({ title: w.title, snippet: w.content, origin: 'web', score: w.score }))
        ];

        if (allSources.length === 0) throw new Error("SIN_CONTEXTO: No se encontró información relevante.");

        // 2. SÍNTESIS DE DOSSIER (Gemini 3.0 Flash)
        const { data: agent } = await supabaseAdmin.from('ai_prompts')
            .select('prompt_template').eq('agent_name', 'research-intelligence-v1').single();

        if (!agent) throw new Error("PROMPT_CONFIG_MISSING: research-intelligence-v1");

        const dossierRaw = await callGeminiMultimodal(
            buildPrompt(agent.prompt_template, { topic, raw_sources: JSON.stringify(allSources) }),
            undefined,
            AI_MODELS.FLASH,
            0.1
        );

        return new Response(JSON.stringify({
            success: true,
            dossier: parseAIJson(dossierRaw),
            sources: allSources,
            trace_id: correlationId
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    } catch (err: any) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: corsHeaders });
    }
};

serve(guard(handler));