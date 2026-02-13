// supabase/functions/research-intelligence/index.ts
// VERSIÓN: 3.1 (Cognitive Resilience - Circular Economy & Backlog Edition)
// Misión: Recolectar fuentes priorizando el NKV, registrando lagunas de conocimiento 
// y capitalizando búsquedas externas en la Bóveda permanente.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones del núcleo NicePod (Estándar 768d y FinOps)
import { generateEmbedding } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * CONFIGURACIÓN DE CLIENTE SOBERANO
 * Inicializado fuera del handler para optimizar el Warm-start en el Edge.
 */
const supabaseAdmin: SupabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const handler = async (request: Request): Promise<Response> => {
    // Protocolo rápido de CORS
    if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    // Trazabilidad por Correlation ID para auditoría de la Economía Circular
    const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
    let targetDraftId: string | null = null;

    try {
        const payload = await request.json();
        const { draft_id, topic } = payload;

        if (!draft_id || !topic) throw new Error("IDENTIFICADORES_INCOMPLETOS");
        targetDraftId = draft_id;

        console.log(`📡 [Researcher][${correlationId}] Iniciando Misión de Inteligencia: ${topic}`);

        // 1. GENERACIÓN DE BRÚJULA SEMÁNTICA (768d)
        // Única llamada a API de Google en esta fase para navegación vectorial.
        const queryVector = await generateEmbedding(topic);

        // 2. BÚSQUEDA EN MEMORIA INTERNA (NKV + Pulse Staging)
        // Capa A: Hechos Atómicos validados
        const { data: vaultFacts } = await supabaseAdmin.rpc('search_knowledge_vault', {
            query_embedding: queryVector,
            match_threshold: 0.82,
            match_count: 5
        });

        // Capa B: Papers frescos del Harvester (Uso del nuevo RPC optimizado)
        const { data: freshPapers } = await supabaseAdmin.rpc('search_pulse_staging', {
            query_embedding: queryVector,
            match_threshold: 0.80,
            match_count: 5
        });

        // 3. CONSOLIDACIÓN DE SOBERANÍA
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
                relevance: p.similarity
            }))
        ];

        // 4. JUICIO DE SUFICIENCIA Y ACTIVACIÓN DE BACKLOG
        // Si el Vault tiene menos de 3 fuentes relevantes, registramos una "Laguna de Conocimiento"
        if (finalSources.length < 3) {
            console.log(`⚠️ [Researcher] Laguna detectada. Registrando en Research Backlog.`);

            // Registramos el tema para que el Harvester lo priorice en su próximo ciclo
            await supabaseAdmin.rpc('push_to_research_backlog', {
                p_topic: topic,
                p_metadata: { correlation_id: correlationId, draft_id: draft_id }
            });

            // 5. FALLBACK EXTERNO (Gasto Táctico en Tavily)
            console.log(`🌐 [Researcher] Invocando inteligencia externa para completar dossier.`);

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

                // 6. ECONOMÍA CIRCULAR: Ingesta inmediata en Bóveda
                // No esperamos (fire and forget) para no penalizar el tiempo de respuesta del usuario
                console.log(`♻️ [Researcher] Capitalizando ${webSources.length} fuentes web en NKV.`);

                for (const ws of webSources) {
                    supabaseAdmin.functions.invoke('vault-refinery', {
                        body: {
                            title: ws.title,
                            text: ws.content,
                            url: ws.url,
                            source_type: 'web',
                            is_public: true,
                            metadata: { ingested_via: 'research-intelligence', original_topic: topic }
                        },
                        headers: { "x-correlation-id": correlationId }
                    }).catch(() => { });
                }
            }
        }

        if (finalSources.length === 0) throw new Error("RECURSOS_INSATISFECHOS: El tema no pudo ser validado ni en Bóveda ni en Red.");

        // 7. PERSISTENCIA DE FUENTES Y RELEVO A REDACCIÓN
        const { error: updateErr } = await supabaseAdmin
            .from('podcast_drafts')
            .update({
                sources: finalSources,
                dossier_text: {
                    status: "sources_finalized",
                    internal_count: (vaultFacts?.length || 0) + (freshPapers?.length || 0),
                    web_count: finalSources.length - ((vaultFacts?.length || 0) + (freshPapers?.length || 0)),
                    circular_economy_active: true
                },
                status: 'writing', // Desbloquea la Fase III
                updated_at: new Date().toISOString()
            })
            .eq('id', draft_id);

        if (updateErr) throw updateErr;

        // Invocamos al Redactor (Fase III)
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