// supabase/functions/research-intelligence/index.ts
// VERSIÓN: 3.3 (Omni-Intelligence Sovereign - Final Production Standard)
// Misión: Investigar temas con profundidad técnica, priorizando el NKV y activando la Economía Circular.
// [INTEGRACIÓN]: Telemetría de uso, Registro de Backlog y Refinería de Bóveda activa.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Importaciones del núcleo NicePod (Estabilizadas a Nivel 1)
import { generateEmbedding } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * CLIENTE SUPABASE ADMIN:
 * Persistente para maximizar la velocidad de respuesta en el Edge.
 */
const supabaseAdmin: SupabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const handler = async (request: Request): Promise<Response> => {
    // 1. GESTIÓN DE PROTOCOLO DE RED (CORS)
    if (request.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
    let targetDraftId: string | null = null;

    try {
        // 2. RECEPCIÓN DE SOLICITUD
        const payload = await request.json();
        const { draft_id, topic, is_pulse, pulse_source_ids } = payload;

        if (!draft_id || !topic) {
            throw new Error("IDENTIFICADORES_INCOMPLETOS: Se requiere draft_id y topic.");
        }

        targetDraftId = draft_id;
        console.log(`📡 [Researcher][${correlationId}] Iniciando Misión de Inteligencia: ${topic}`);

        // 3. GENERACIÓN DE BRÚJULA SEMÁNTICA (ADN 768d)
        // Utilizamos el nuevo estándar gemini-embedding-001 (v11.7)
        const queryVector = await generateEmbedding(topic);

        let finalSources: any[] = [];

        // 4. BÚSQUEDA ESCALONADA DE INTELIGENCIA SOBERANA
        if (is_pulse && pulse_source_ids?.length > 0) {
            /**
             * CASO PULSE: El usuario seleccionó papers específicos del radar.
             */
            const { data: pulseData } = await supabaseAdmin
                .from('pulse_staging')
                .select('id, title, summary, url, authority_score')
                .in('id', pulse_source_ids);

            finalSources = (pulseData || []).map(p => ({
                id: p.id,
                title: p.title,
                content: p.summary,
                url: p.url,
                origin: 'pulse_selection',
                relevance: 1.0
            }));
        } else {
            /**
             * CASO ESTÁNDAR: Búsqueda Híbrida en Bóvedas NicePod
             */
            // Capa A: Hechos Atómicos validados (Bóveda Permanente)
            const { data: vaultFacts } = await supabaseAdmin.rpc('search_knowledge_vault', {
                query_embedding: queryVector,
                match_threshold: 0.82,
                match_count: 5
            });

            // Capa B: Biblioteca de Papers (Staging del Harvester)
            const { data: freshPapers } = await supabaseAdmin.rpc('search_pulse_staging', {
                query_embedding: queryVector,
                match_threshold: 0.80,
                match_count: 5
            });

            // Consolidación de fuentes internas
            finalSources = [
                ...(vaultFacts || []).map((v: any) => ({
                    id: v.id,
                    title: v.title,
                    content: v.content,
                    url: v.url || "#",
                    origin: 'vault',
                    relevance: v.similarity
                })),
                ...(freshPapers || []).map((p: any) => ({
                    id: p.id,
                    title: p.title,
                    content: p.summary,
                    url: p.url,
                    origin: 'fresh_research',
                    relevance: p.similarity
                }))
            ];
        }

        // 5. TELEMETRÍA DE USO (Incrementar valor de los papers)
        const paperIds = finalSources
            .filter(s => s.origin === 'fresh_research' || s.origin === 'pulse_selection')
            .map(s => s.id);

        if (paperIds.length > 0) {
            console.log(`📈 [Researcher] Registrando uso de ${paperIds.length} papers.`);
            await supabaseAdmin.rpc('increment_paper_usage', { p_ids: paperIds });
        }

        // 6. JUICIO DE SUFICIENCIA Y ECONOMÍA CIRCULAR
        // Si no hay suficiente autoridad interna (NKV), procedemos al rescate externo.
        if (finalSources.length < 3) {
            console.log(`⚠️ [Researcher] Laguna de conocimiento. Activando rescate externo.`);

            // a. Registro de Backlog Cognitivo para el Harvester
            await supabaseAdmin.rpc('push_to_research_backlog', {
                p_topic: topic,
                p_metadata: { correlation_id: correlationId, draft_id: draft_id }
            });

            // b. Invocación a Tavily (Gasto Táctico)
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

                // c. ECONOMÍA CIRCULAR: Capitalizar las fuentes web en el NKV Permanente
                // Lo hacemos fire-and-forget para no bloquear el proceso de creación
                for (const ws of webSources) {
                    supabaseAdmin.functions.invoke('vault-refinery', {
                        body: {
                            title: ws.title,
                            text: ws.content,
                            url: ws.url,
                            source_type: 'user_contribution',
                            is_public: true,
                            metadata: { ingested_via: 'research-intelligence', original_topic: topic }
                        },
                        headers: { "x-correlation-id": correlationId }
                    }).catch(() => { });
                }
            }
        }

        if (finalSources.length === 0) {
            throw new Error("RECURSOS_NO_ENCONTRADOS: El sistema no pudo validar el tema en ninguna fuente.");
        }

        // 7. PERSISTENCIA DE DOSSIER Y RELEVO A REDACCIÓN (FASE III)
        const { error: updateErr } = await supabaseAdmin
            .from('podcast_drafts')
            .update({
                sources: finalSources,
                dossier_text: {
                    status: "sources_found",
                    count: finalSources.length,
                    trace: correlationId
                },
                status: 'writing', // Desbloquea la interfaz
                updated_at: new Date().toISOString()
            })
            .eq('id', draft_id);

        if (updateErr) throw new Error(`DATABASE_UPDATE_FAIL: ${updateErr.message}`);

        // Invocación al Redactor Maestro (Agente 38)
        console.log(`✅ [Researcher][${correlationId}] Handover a Redacción.`);
        supabaseAdmin.functions.invoke('generate-script-draft', {
            body: { draft_id },
            headers: { "x-correlation-id": correlationId }
        }).catch((err) => console.error(`⚠️ [Handover-Fail]: ${err.message}`));

        return new Response(JSON.stringify({
            success: true,
            trace_id: correlationId,
            sources: finalSources.length
        }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (error: any) {
        console.error(`🔥 [Researcher-Fatal][${correlationId}]:`, error.message);

        if (targetDraftId) {
            await supabaseAdmin.from('podcast_drafts').update({
                status: 'failed',
                creation_data: { last_error: error.message, trace: correlationId }
            }).eq('id', targetDraftId);
        }

        return new Response(JSON.stringify({
            error: error.message,
            trace_id: correlationId
        }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
}

serve(handler);