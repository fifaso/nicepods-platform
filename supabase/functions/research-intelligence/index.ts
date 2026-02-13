// supabase/functions/research-intelligence/index.ts
// VERSIÓN: 3.0 (Smart Collector - Vault-First & FinOps Logic)
// Misión: Recolectar fuentes para el podcast priorizando el ahorro de tokens y ciclos de CPU.
// [ESTRATEGIA]: Búsqueda vectorial pura -> Fallback Web -> Cero llamadas a Gemini Pro/Flash en esta fase.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones del núcleo NicePod consolidado
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

        console.log(`📡 [Collector][${correlationId}] Iniciando búsqueda estratégica para: ${topic}`);

        // 1. GENERACIÓN DE VECTOR (Único uso de API AI en esta fase)
        // Usamos el nuevo modelo embedding-001 via _shared/ai.ts
        const queryVector = await generateEmbedding(topic);

        // 2. RECUPERACIÓN DE BÓVEDA (NKV)
        // Intentamos resolver la solicitud con conocimiento ya validado
        const { data: vaultSources, error: vaultError } = await supabaseAdmin.rpc('search_knowledge_vault', {
            query_embedding: queryVector,
            match_threshold: 0.85, // Exigimos alta fidelidad
            match_count: 5
        });

        if (vaultError) console.error("⚠️ [Collector] Error NKV:", vaultError.message);

        let finalSources = (vaultSources || []).map((v: any) => ({
            title: v.title,
            content: v.content.substring(0, 2000),
            url: v.url || "#",
            origin: 'vault',
            relevance: v.similarity
        }));

        // 3. ESTRATEGIA DE FALLBACK (FinOps)
        // Solo si el Vault no aporta suficiente contexto, acudimos a la Web (Gasto de créditos Tavily)
        if (finalSources.length < 2) {
            console.log(`🌐 [Collector] Vault insuficiente. Invocando inteligencia externa.`);

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

        if (finalSources.length === 0) throw new Error("SIN_FUENTES_RELEVANTES_ENCONTRADAS");

        // 4. PERSISTENCIA DE CHECKPOINT
        // Guardamos las fuentes recolectadas. El borrador ya no estará vacío.
        const { error: updateErr } = await supabaseAdmin
            .from('podcast_drafts')
            .update({
                sources: finalSources,
                dossier_text: { status: "ready_for_synthesis", source_count: finalSources.length },
                status: 'writing',
                updated_at: new Date().toISOString()
            })
            .eq('id', draft_id);

        if (updateErr) throw updateErr;

        // 5. RELEVO ASÍNCRONO (Handover)
        // Invocamos a la Fase de Redacción. Esta función termina aquí, salvando CPU.
        supabaseAdmin.functions.invoke('generate-script-draft', {
            body: { draft_id },
            headers: { "x-correlation-id": correlationId }
        }).catch(() => { });

        return new Response(JSON.stringify({
            success: true,
            trace_id: correlationId,
            sources_collected: finalSources.length
        }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (e: any) {
        console.error(`🔥 [Collector-Fatal][${correlationId}]:`, e.message);

        if (targetDraftId) {
            await supabaseAdmin.from('podcast_drafts').update({
                status: 'failed',
                creation_data: { error: e.message, trace: correlationId }
            }).eq('id', targetDraftId);
        }

        return new Response(JSON.stringify({ error: e.message, trace_id: correlationId }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
};

serve(handler);