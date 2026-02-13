// supabase/functions/research-intelligence/index.ts
// VERSIÓN: 3.0 (Omni-Vault Researcher - Layered Intelligence Standard)
// Misión: Recolectar fuentes de alto valor priorizando la soberanía de datos del NKV.
// [OPTIMIZACIÓN]: Búsqueda híbrida en knowledge_chunks y pulse_staging (768d).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones del núcleo NicePod sincronizado (v11.6+)
import { generateEmbedding } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseAdmin: SupabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const handler = async (request: Request): Promise<Response> => {
    if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
    let targetDraftId: string | null = null;

    try {
        const payload = await request.json();
        const { draft_id, topic } = payload;

        if (!draft_id || !topic) throw new Error("IDENTIFICADORES_FALTANTES");
        targetDraftId = draft_id;

        console.log(`📡 [Researcher][${correlationId}] Analizando requerimiento: ${topic}`);

        // 1. GENERACIÓN DE VECTOR DE CONSULTA (768d)
        // Convertimos la intención del usuario en un vector para navegar la Bóveda.
        const queryVector = await generateEmbedding(topic);

        // 2. BÚSQUEDA ESCALONADA DE INTELIGENCIA

        // A. Búsqueda en Bóveda Permanente (Hechos Atómicos)
        const { data: vaultFacts } = await supabaseAdmin.rpc('search_knowledge_vault', {
            query_embedding: queryVector,
            match_threshold: 0.82,
            match_count: 5
        });

        // B. Búsqueda en Inteligencia Fresca (Papers del Harvester)
        const { data: freshPapers } = await supabaseAdmin
            .from('pulse_staging')
            .select('title, summary, url, authority_score')
            .filter('embedding', 'is', 'not', null)
            // Usamos el operador de distancia de pgvector directamente
            .order('embedding', { ascending: true, foreignTable: '', reference: queryVector as any })
            .limit(5);

        // 3. CONSOLIDACIÓN DE RESULTADOS INTERNOS
        let finalSources = [
            ...(vaultFacts || []).map((v: any) => ({
                title: v.title,
                content: v.content,
                url: v.url || "#",
                origin: 'vault',
                relevance: v.similarity
            })),
            ...(freshPapers || []).map((p: any) => ({
                title: p.title,
                content: p.summary,
                url: p.url,
                origin: 'fresh_research',
                relevance: p.authority_score / 10 // Normalización simple
            }))
        ];

        // 4. JUICIO DE SUFICIENCIA (FinOps)
        // Si ya tenemos suficiente autoridad interna, evitamos el gasto de Tavily.
        if (finalSources.length < 3) {
            console.log(`🌐 [Researcher] Bóveda insuficiente. Invocando fallback externo.`);

            const webRes = await fetch("https://api.tavily.com/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    api_key: Deno.env.get("TAVILY_API_KEY"),
                    query: topic,
                    search_depth: "basic",
                    max_results: 5
                })
            });

            if (webRes.ok) {
                const webData = await webRes.json();
                const webSources = (webData.results || []).map((w: any) => ({
                    title: w.title,
                    content: w.content,
                    url: w.url,
                    origin: 'web',
                    relevance: w.score
                }));
                finalSources = [...finalSources, ...webSources];
            }
        }

        if (finalSources.length === 0) throw new Error("RECURSOS_NO_ENCONTRADOS");

        // 5. PERSISTENCIA DE FUENTES Y HANDOVER
        // Guardamos las fuentes recolectadas para que el Redactor las procese.
        // Limpiamos rastro de etiquetas innecesarias para ahorrar CPU en la Fase III.
        const { error: updateErr } = await supabaseAdmin
            .from('podcast_drafts')
            .update({
                sources: finalSources,
                dossier_text: {
                    status: "sources_finalized",
                    internal_count: (vaultFacts?.length || 0) + (freshPapers?.length || 0),
                    web_count: finalSources.length - ((vaultFacts?.length || 0) + (freshPapers?.length || 0))
                },
                status: 'writing', // Cambiamos estado para activar el front
                updated_at: new Date().toISOString()
            })
            .eq('id', draft_id);

        if (updateErr) throw updateErr;

        // 6. DISPARO ASÍNCRONO DE REDACCIÓN
        // La Fase III (generate-script-draft) tomará estas fuentes y creará el guion.
        supabaseAdmin.functions.invoke('generate-script-draft', {
            body: { draft_id },
            headers: { "x-correlation-id": correlationId }
        }).catch((err) => console.error(`⚠️ [Handover-Fail]: ${err.message}`));

        return new Response(JSON.stringify({
            success: true,
            sources_ingested: finalSources.length,
            trace_id: correlationId
        }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (e: any) {
        console.error(`🔥 [Researcher-Fatal][${correlationId}]:`, e.message);

        if (targetDraftId) {
            await supabaseAdmin.from('podcast_drafts').update({
                status: 'failed',
                creation_data: { error_log: e.message, trace: correlationId }
            }).eq('id', targetDraftId);
        }

        return new Response(JSON.stringify({ error: e.message, trace_id: correlationId }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
};

serve(handler);