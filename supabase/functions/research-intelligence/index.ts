// supabase/functions/research-intelligence/index.ts
// VERSIÓN: 2.9 (FinOps Collector - Ultra-Fast Data Harvesting)
// Misión: Recolectar fuentes priorizando el Vault (NKV) y recurriendo a la Web solo por insuficiencia.
// [OPTIMIZACIÓN]: 0% tokens de generación. 100% velocidad de recuperación.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones del núcleo NicePod (Sincronizadas con Nivel 1)
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

        if (!draft_id || !topic) throw new Error("IDENTIFICADORES_INCOMPLETOS");
        targetDraftId = draft_id;

        console.log(`📡 [Collector][${correlationId}] Iniciando recolección para: ${topic}`);

        // 1. GENERACIÓN DE ADN SEMÁNTICO (Única llamada a API Google - Vectorial)
        // Utilizamos el endpoint v1 estabilizado en _shared/ai.ts (v10.7)
        const queryVector = await generateEmbedding(topic);

        // 2. BÚSQUEDA EN BÓVEDA (NKV) - Prioridad Soberana
        // Buscamos hechos ya validados en nuestra base de datos vectorial
        const { data: vaultSources, error: vaultError } = await supabaseAdmin.rpc('search_knowledge_vault', {
            query_embedding: queryVector,
            match_threshold: 0.80, // Umbral de alta relevancia
            match_count: 5
        });

        if (vaultError) console.error("⚠️ [Collector] Error en consulta NKV:", vaultError.message);

        let finalSources = (vaultSources || []).map((v: any) => ({
            title: v.title,
            content: v.content.substring(0, 2000),
            url: v.url || "#",
            origin: 'vault',
            relevance: v.similarity
        }));

        // 3. ESTRATEGIA DE COMPLEMENTO WEB (Tavily)
        // Solo invocamos la Web si la Bóveda tiene menos de 2 fuentes de alta calidad
        if (finalSources.length < 2) {
            console.log(`🌐 [Collector] Vault insuficiente. Ampliando búsqueda a la Web.`);
            const webRes = await fetch("https://api.tavily.com/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    api_key: Deno.env.get("TAVILY_API_KEY"),
                    query: topic,
                    search_depth: "basic",
                    max_results: 4
                })
            });

            if (webRes.ok) {
                const webData = await webRes.json();
                const webSources = (webData.results || []).map((w: any) => ({
                    title: w.title,
                    content: w.content.substring(0, 2000),
                    url: w.url,
                    origin: 'web',
                    relevance: w.score
                }));
                finalSources = [...finalSources, ...webSources];
            }
        }

        if (finalSources.length === 0) throw new Error("SIN_FUENTES_DISPONIBLES");

        // 4. PERSISTENCIA DE CHECKPOINT Y HANDOVER
        // Guardamos las fuentes crudas directamente. El estado pasa a 'writing'.
        // dossier_text se mantiene con un placeholder para satisfacer la integridad visual.
        const { error: updateErr } = await supabaseAdmin
            .from('podcast_drafts')
            .update({
                sources: finalSources,
                dossier_text: { status: "sources_collected", timestamp: new Date().toISOString() },
                status: 'writing',
                updated_at: new Date().toISOString()
            })
            .eq('id', draft_id);

        if (updateErr) throw updateErr;

        // 5. DISPARO ASÍNCRONO DE REDACCIÓN (Fase III)
        // La IA de redacción ahora se encargará de destilar estas fuentes.
        console.log(`✅ [Collector][${correlationId}] Fuentes listas (${finalSources.length}). Invocando Redactor.`);

        supabaseAdmin.functions.invoke('generate-script-draft', {
            body: { draft_id },
            headers: { "x-correlation-id": correlationId }
        }).catch(() => { });

        return new Response(JSON.stringify({
            success: true,
            sources_count: finalSources.length,
            trace_id: correlationId
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (e: any) {
        console.error(`🔥 [Collector-Fatal][${correlationId}]:`, e.message);
        if (targetDraftId) {
            await supabaseAdmin.from('podcast_drafts').update({ status: 'failed' }).eq('id', targetDraftId);
        }
        return new Response(JSON.stringify({ error: e.message, trace_id: correlationId }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
};

serve(handler);