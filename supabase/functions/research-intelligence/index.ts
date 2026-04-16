/**
 * ARCHIVO: supabase/functions/research-intelligence/index.ts
 * VERSIÓN: 4.0
 * PROTOCOLO: Madrid Resonance Protocol V4.0
 * MISIÓN: Omni-Intelligence Sovereign with Perimeter Security.
 * NIVEL DE INTEGRIDAD: 100%
 */

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { generateEmbedding } from "../_shared/ai.ts";
import { guard, GuardContext } from "../_shared/guard.ts";

/**
 * CLIENTE SUPABASE ADMIN:
 * Persistente para maximizar la velocidad de respuesta en el Edge.
 */
const supabaseAdmin: SupabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const handler = async (request: Request, context: GuardContext): Promise<Response> => {
    const correlationIdentification = context.correlationIdentification;
    let targetDraftId: string | null = null;

    try {
        const payload = await request.json();
        const { draft_id, topic, is_pulse, pulse_source_ids } = payload;

        if (!draft_id || !topic) {
            throw new Error("IDENTIFICADORES_INCOMPLETOS: Se requiere draft_id y topic.");
        }

        targetDraftId = draft_id;
        console.info(`📡 [Researcher][${correlationIdentification}] Iniciando Misión de Inteligencia: ${topic}`);

        // VALIDACIÓN DE PROPIEDAD: Aunque usamos Service Role, verificamos que el borrador pertenezca al usuario si no es una petición interna.
        if (!context.isTrusted) {
            const authorizationHeader = request.headers.get('Authorization');
            if (!authorizationHeader) throw new Error("AUTH_REQUIRED");

            const tempClient = createClient(
                Deno.env.get("SUPABASE_URL") ?? "",
                Deno.env.get("SUPABASE_ANON_KEY") ?? "",
                { global: { headers: { Authorization: authorizationHeader } } }
            );

            const { data: { user: authenticatedUser } } = await tempClient.auth.getUser();
            if (!authenticatedUser) throw new Error("INVALID_SESSION");

            const { data: ownershipCheck, error: ownershipError } = await supabaseAdmin
                .from('podcast_drafts')
                .select('user_id')
                .eq('id', draft_id)
                .single();

            if (ownershipError || ownershipCheck.user_id !== authenticatedUser.id) {
                throw new Error("FORBIDDEN_ACCESS: No tiene autoridad sobre este borrador.");
            }
        }

        const queryVector = await generateEmbedding(topic);

        let finalSources: any[] = [];

        if (is_pulse && pulse_source_ids?.length > 0) {
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
            const { data: vaultFacts } = await supabaseAdmin.rpc('search_knowledge_vault', {
                query_embedding: queryVector,
                match_threshold: 0.82,
                match_count: 5
            });

            const { data: freshPapers } = await supabaseAdmin.rpc('search_pulse_staging', {
                query_embedding: queryVector,
                match_threshold: 0.80,
                match_count: 5
            });

            finalSources = [
                ...(vaultFacts || []).map((v: any) => ({
                    id: v.source_id || v.id,
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

        const paperIds = finalSources
            .filter(s => s.origin === 'fresh_research' || s.origin === 'pulse_selection')
            .map(s => s.id)
            .filter(Boolean);

        if (paperIds.length > 0) {
            await supabaseAdmin.rpc('increment_paper_usage', { p_ids: paperIds });
        }

        if (finalSources.length < 3) {
            await supabaseAdmin.rpc('push_to_research_backlog', {
                p_topic: topic,
                p_metadata: { correlation_id: correlationIdentification, draft_id: draft_id }
            });

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
            }
        }

        if (finalSources.length === 0) {
            throw new Error("RECURSOS_NO_ENCONTRADOS: El sistema no pudo validar el tema en ninguna fuente.");
        }

        const safeSources = JSON.parse(JSON.stringify(finalSources));

        const { error: updateErr } = await supabaseAdmin
            .from('podcast_drafts')
            .update({
                sources: safeSources,
                dossier_text: {
                    status: "sources_found",
                    count: safeSources.length,
                    trace: correlationIdentification
                },
                status: 'writing',
                updated_at: new Date().toISOString()
            })
            .eq('id', draft_id);

        if (updateErr) throw new Error(`DATABASE_UPDATE_FAIL: ${updateErr.message}`);

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
            headers: { "Content-Type": "application/json" }
        });

    } catch (error: any) {
        console.error(`🔥 [Researcher-Fatal][${correlationIdentification}]:`, error.message);

        if (targetDraftId) {
            await supabaseAdmin.from('podcast_drafts').update({
                status: 'failed',
                creation_data: { last_error: error.message, trace: correlationIdentification }
            }).eq('id', targetDraftId);
        }

        throw error;
    }
};

Deno.serve(guard(handler));
