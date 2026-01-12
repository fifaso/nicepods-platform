// supabase/functions/research-intelligence/index.ts
// VERSIÓN: 1.1 (Master Intelligence Factory - Hybrid Search & Multi-Source Synthesis)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones de núcleo con rutas relativas para estabilidad en el despliegue
import { AI_MODELS, callGeminiMultimodal, parseAIJson, buildPrompt } from "../_shared/ai.ts";
import { guard } from "../_shared/guard.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface ResearchSource {
    title: string;
    url: string;
    snippet: string;
    origin: 'vault' | 'web';
    relevance?: number;
}

const TAVILY_API_KEY = Deno.env.get("TAVILY_API_KEY") ?? "";
const supabaseAdmin: SupabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * handler: Orquestador de la fase de investigación.
 * Realiza búsqueda híbrida y síntesis de dossier técnico.
 */
const handler = async (request: Request): Promise<Response> => {
    const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();

    try {
        const { topic, depth, queryVector } = await request.json();

        if (!topic || !queryVector) {
            throw new Error("REQUISITOS_INSUFICIENTES: Se requiere 'topic' y 'queryVector'.");
        }

        console.log(`🔍 [Intelligence][${correlationId}] Iniciando investigación profunda para: ${topic}`);

        // 1. BÚSQUEDA HÍBRIDA SIMULTÁNEA (NKV + WEB)
        // Definimos límites según la profundidad solicitada
        const vaultLimit = depth === "Profundo" ? 8 : 4;
        const webLimit = depth === "Profundo" ? 6 : 3;

        const [vaultResponse, webSearchResponse] = await Promise.all([
            // Consulta a la Sabiduría Comunitaria (Costo $0)
            supabaseAdmin.rpc('search_knowledge_vault', {
                query_embedding: queryVector,
                match_threshold: 0.75,
                match_count: vaultLimit
            }),
            // Consulta a la Actualidad Mundial (Tavily)
            fetch("https://api.tavily.com/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    api_key: TAVILY_API_KEY,
                    query: topic,
                    search_depth: depth === "Profundo" ? "advanced" : "basic",
                    max_results: webLimit,
                    include_answer: false
                })
            })
        ]);

        // 2. NORMALIZACIÓN DE RESULTADOS
        const vaultData = vaultResponse.data || [];
        const webData = webSearchResponse.ok ? await webSearchResponse.json() : { results: [] };

        const allSources: ResearchSource[] = [
            ...vaultData.map((v: any) => ({
                title: v.title,
                url: v.url || "#",
                snippet: v.content,
                origin: 'vault' as const,
                relevance: v.similarity
            })),
            ...(webData.results || []).map((w: any) => ({
                title: w.title,
                url: w.url,
                snippet: w.content,
                origin: 'web' as const,
                relevance: w.score
            }))
        ];

        // 3. GENERACIÓN DEL DOSSIER DE INTELIGENCIA (IA Flash 1.5)
        // Usamos el modelo Flash para destilar la información masiva en un dossier estructurado.
        const { data: agent } = await supabaseAdmin
            .from('ai_prompts')
            .select('prompt_template')
            .eq('agent_name', 'research-intelligence-v1')
            .single();

        if (!agent) throw new Error("CONFIG_ERROR: Agente 'research-intelligence-v1' no localizado.");

        const finalPrompt = buildPrompt(agent.prompt_template, {
            topic,
            depth,
            raw_sources: JSON.stringify(allSources)
        });

        console.log(`🧠 [Intelligence][${correlationId}] Sintetizando dossier con Gemini Flash...`);

        const dossierRaw = await callGeminiMultimodal(
            finalPrompt,
            undefined,
            AI_MODELS.FLASH, // [OPTIMIZACIÓN]: Flash 1.5 para bajo costo en análisis
            0.3 // Temperatura baja para máxima precisión en hechos
        );

        const dossier = parseAIJson(dossierRaw);

        // 4. RESPUESTA TÉCNICA
        return new Response(JSON.stringify({
            success: true,
            dossier,
            sources: allSources,
            metadata: {
                vault_hits: vaultData.length,
                web_hits: (webData.results || []).length,
                correlation_id: correlationId
            }
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (err: any) {
        console.error(`🔥 [Intelligence Error][${correlationId}]:`, err.message);
        return new Response(JSON.stringify({
            success: false,
            error: err.message,
            trace_id: correlationId
        }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
};

serve(guard(handler));