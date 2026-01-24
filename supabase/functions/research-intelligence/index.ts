// supabase/functions/research-intelligence/index.ts
// VERSIÓN: 1.3 (Resilient Intelligence Factory - Double-Layer Grounding)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { AI_MODELS, buildPrompt, callGeminiMultimodal, parseAIJson } from "../_shared/ai.ts";
import { guard } from "../_shared/guard.ts";

const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const handler = async (request: Request): Promise<Response> => {
    // 1. EL MANEJADOR PEREZOSO: Solo leemos el body si el Guard ya validó el método
    const { topic, depth, queryVector } = await request.json();
    const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();

    try {
        console.log(`🔍 [Intelligence][${correlationId}] Iniciando Dossier para: ${topic}`);

        // A. Búsqueda en Bóveda (NKV) - Costo $0
        const { data: vaultData } = await supabaseAdmin.rpc('search_knowledge_vault', {
            query_embedding: queryVector,
            match_threshold: 0.78,
            match_count: depth === "Profundo" ? 10 : 5
        });

        // B. Búsqueda en Web (Tavily) - Manejo de fallo silencioso
        let webData = [];
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
            if (tavilyRes.ok) {
                const json = await tavilyRes.json();
                webData = json.results || [];
            }
        } catch (e) {
            console.warn(`[Intelligence] Tavily Timeout/Error. Continuando con NKV.`);
        }

        const allSources = [
            ...(vaultData || []).map((v: any) => ({
                title: v.title, content: v.content, url: v.url || "#", origin: 'vault', score: v.similarity
            })),
            ...webData.map((w: any) => ({
                title: w.title, content: w.content, url: w.url, origin: 'web', score: w.score
            }))
        ];

        if (allSources.length === 0) {
            throw new Error("CONTENIDO_NO_LOCALIZADO: No hay información fidedigna disponible.");
        }

        // 2. SÍNTESIS DE INTELIGENCIA (Gemini 2.0 Flash)
        const { data: agent } = await supabaseAdmin.from('ai_prompts')
            .select('prompt_template').eq('agent_name', 'research-intelligence-v1').single();

        if (!agent) throw new Error("AGENT_CONFIG_MISSING: research-intelligence-v1");

        const dossierPrompt = buildPrompt(agent.prompt_template, {
            topic,
            raw_sources: JSON.stringify(allSources)
        });

        const dossierRaw = await callGeminiMultimodal(dossierPrompt, undefined, AI_MODELS.FLASH, 0.1);
        const dossier = parseAIJson(dossierRaw);

        return new Response(JSON.stringify({
            success: true,
            dossier,
            sources: allSources,
            metadata: { vault_hits: (vaultData || []).length, web_hits: webData.length }
        }), { headers: { 'Content-Type': 'application/json' } });

    } catch (err: any) {
        console.error(`🔥 [Intelligence-Error]:`, err.message);
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
    }
};

serve(guard(handler));