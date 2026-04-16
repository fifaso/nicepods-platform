// supabase/functions/research-intelligence/index.ts
// VERSIÓN: 3.4 (Omni-Intelligence Sovereign - Strict Serialization Edition)
// Misión: Investigar temas con profundidad técnica, priorizando el NKV y activando la Economía Circular.
// [ESTABILIZACIÓN]: Serialización forzada de JSONB para erradicar la fuga silenciosa de fuentes (Sources = 0).

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

    const correlationIdentification = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
    let targetDraftId: string | null = null;

    try {
        // 2. RECEPCIÓN DE SOLICITUD
        const payload = await request.json();
        const { draft_id, topic, is_pulse, pulse_source_ids } = payload;

        if (!draft_id || !topic) {
            throw new Error("IDENTIFICADORES_INCOMPLETOS: Se requiere draft_id y topic.");
        }

        targetDraftId = draft_id;
        console.log(`📡 [Researcher][${correlationIdentification}] Iniciando Misión de Inteligencia: ${topic}`);

        // 3. GENERACIÓN DE BRÚJULA SEMÁNTICA (ADN 768d)
        const queryVector = await generateEmbedding(topic);

        let finalSources: any[] = [];

        // 4. BÚSQUEDA ESCALONADA DE INTELIGENCIA SOBERANA
        if (is_pulse && pulse_source_ids?.length > 0) {
            /**
             * CASO PULSE: El usuario seleccionó papers específicos del radar.
             */
            const { data: pulseData } = await supabaseAdmin
                .from('pulse_staging')
                .select('id, title, summary, uniformResourceLocator, authority_score')
                .in('id', pulse_source_ids);

            finalSources = (pulseData || []).map(p => ({
                id: p.id,
                title: p.title || "Documento Pulse",
                content: p.summary || "Sin resumen disponible.",
                uniformResourceLocator: p.uniformResourceLocator || "#",
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

            // Consolidación de fuentes internas (Sanitizadas)
            finalSources = [
                ...(vaultFacts || []).map((v: any) => ({
                    id: v.source_id || v.id, // Adaptación a posibles cambios de RPC
                    title: v.title || "Archivo de Bóveda",
                    content: v.content || "",
                    uniformResourceLocator: v.uniformResourceLocator || "#",
                    origin: 'vault',
                    relevance: v.similarity || 0.85
                })),
                ...(freshPapers || []).map((p: any) => ({
                    id: p.id,
                    title: p.title || "Investigación Reciente",
                    content: p.summary || "",
                    uniformResourceLocator: p.uniformResourceLocator || "#",
                    origin: 'fresh_research',
                    relevance: p.similarity || 0.85
                }))
            ];
        }

        // 5. TELEMETRÍA DE USO (Incrementar valor de los papers)
        const paperIds = finalSources
            .filter(s => s.origin === 'fresh_research' || s.origin === 'pulse_selection')
            .map(s => s.id)
            .filter(Boolean); // Prevenir nulos

        if (paperIds.length > 0) {
            console.log(`📈 [Researcher] Registrando uso de ${paperIds.length} papers.`);
            await supabaseAdmin.rpc('increment_paper_usage', { p_ids: paperIds });
        }

        // 6. JUICIO DE SUFICIENCIA Y ECONOMÍA CIRCULAR
        // Si no hay suficiente autoridad interna (NKV), procedemos al rescate externo.
        if (finalSources.length < 3) {
            console.log(`⚠️ [Researcher] Laguna de conocimiento. Activando rescate externo (Tavily).`);

            // a. Registro de Backlog Cognitivo para el Harvester
            await supabaseAdmin.rpc('push_to_research_backlog', {
                p_topic: topic,
                p_metadata: { correlation_id: correlationIdentification, draft_id: draft_id }
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
                    title: w.title || "Fuente Web",
                    content: w.content || "",
                    uniformResourceLocator: w.uniformResourceLocator || "#",
                    origin: 'web',
                    relevance: w.score || 0.5
                }));

                finalSources = [...finalSources, ...webSources];

                // c. ECONOMÍA CIRCULAR: Capitalizar las fuentes web en el NKV Permanente
                for (const ws of webSources) {
                    supabaseAdmin.functions.invoke('vault-refinery', {
                        body: {
                            title: ws.title,
                            text: ws.content,
                            uniformResourceLocator: ws.uniformResourceLocator,
                            source_type: 'user_contribution',
                            is_public: true,
                            metadata: { ingested_via: 'research-intelligence', original_topic: topic }
                        },
                        headers: { "x-correlation-id": correlationIdentification }
                    }).catch(() => { });
                }
            } else {
                console.warn(`🔴 [Researcher] Fallo en API externa de investigación (Tavily).`);
            }
        }

        if (finalSources.length === 0) {
            throw new Error("RECURSOS_NO_ENCONTRADOS: El sistema no pudo validar el tema en ninguna fuente.");
        }

        /**
         * [FIX CRÍTICO]: SERIALIZACIÓN ESTRICTA
         * Supabase/PostgreSQL puede fallar silenciosamente al guardar arrays de objetos en columnas JSONB
         * si existen propiedades 'undefined' o proxys de Deno. Al convertir a JSON string y luego a objeto,
         * garantizamos un objeto plano (Plain Object) 100% compatible con JSONB.
         */
        const safeSources = JSON.parse(JSON.stringify(finalSources));

        // 7. PERSISTENCIA DE DOSSIER Y RELEVO A REDACCIÓN (FASE III)
        const { error: updateErr } = await supabaseAdmin
            .from('podcast_drafts')
            .update({
                sources: safeSources, // Objeto serializado y seguro
                dossier_text: {
                    status: "sources_found",
                    count: safeSources.length,
                    trace: correlationIdentification
                },
                status: 'writing',
                updated_at: new Date().toISOString()
            })
            .eq('id', draft_id);

        if (updateErr) {
            throw new Error(`DATABASE_UPDATE_FAIL: ${updateErr.message}`);
        }

        // [TELEMETRÍA DE SEGURIDAD]: Verificamos que la BD haya guardado las fuentes
        const { data: verifyData } = await supabaseAdmin
            .from('podcast_drafts')
            .select('sources')
            .eq('id', draft_id)
            .single();

        console.log(`💾 [Researcher] Auditoría de Guardado: ${verifyData?.sources?.length || 0} fuentes confirmadas en DB.`);

        // Invocación al Redactor Maestro (Agente 38)
        console.log(`✅ [Researcher][${correlationIdentification}] Handover a Redacción.`);
        supabaseAdmin.functions.invoke('generate-script-draft', {
            body: { draft_id },
            headers: { "x-correlation-id": correlationIdentification }
        }).catch((err) => console.error(`⚠️ [Handover-Fail]: ${err.message}`));

        return new Response(JSON.stringify({
            success: true,
            trace_identification: correlationIdentification,
            sources: safeSources.length
        }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (error: any) {
        console.error(`🔥 [Researcher-Fatal][${correlationIdentification}]:`, error.message);

        if (targetDraftId) {
            await supabaseAdmin.from('podcast_drafts').update({
                status: 'failed',
                creation_data: { last_error: error.message, trace: correlationIdentification }
            }).eq('id', targetDraftId);
        }

        return new Response(JSON.stringify({
            error: error.message,
            trace_identification: correlationIdentification
        }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
}

serve(handler);