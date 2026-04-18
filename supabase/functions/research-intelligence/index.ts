/**
 * ARCHIVO: supabase/functions/research-intelligence/index.ts
 * VERSIÓN: 5.0
 * PROTOCOLO: Madrid Resonance Protocol V8.0
 * MISIÓN: Omni-Intelligence Sovereign with Perimeter Guard and ZAP compliance.
 * NIVEL DE INTEGRIDAD: 100%
 */

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { generateEmbedding } from "../_shared/ai.ts";
import { guard, GuardContext } from "../_shared/guard.ts";

/**
 * CLIENTE SUPABASE ADMIN:
 * Persistente para maximizar la velocidad de respuesta en el Edge.
 */
const supabaseSovereignAdmin: SupabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * executeIntelligenceResearchHandler:
 * Orquestador para la cosecha de conocimiento universal y validación de fuentes.
 */
const executeIntelligenceResearchHandler = async (incomingRequest: Request, context: GuardContext): Promise<Response> => {
    const correlationIdentification = context.correlationIdentification;
    let targetDraftIdentification: number | null = null;

    try {
        const submissionPayload = await incomingRequest.json();
        const {
            draftIdentification,
            researchTopicContent,
            isPulseSovereignty,
            pulseSourceIdentificationsCollection
        } = submissionPayload;

        // Legacy compatibility
        const targetDraftId = draftIdentification || submissionPayload.draft_id;
        const targetTopic = researchTopicContent || submissionPayload.topic;
        const targetIsPulse = isPulseSovereignty !== undefined ? isPulseSovereignty : submissionPayload.is_pulse;
        const targetPulseIds = pulseSourceIdentificationsCollection || submissionPayload.pulse_ids || submissionPayload.pulse_source_ids;

        if (!targetDraftId || !targetTopic) {
            throw new Error("IDENTIFICADORES_INCOMPLETOS: Se requiere draftIdentification y researchTopicContent.");
        }

        targetDraftIdentification = targetDraftId;
        console.info(`📡 [Researcher][${correlationIdentification}] Iniciando Misión de Inteligencia: ${targetTopic}`);

        // VALIDACIÓN DE PROPIEDAD: DOCTRINA DIS
        if (!context.isTrusted) {
            const authorizationHeader = incomingRequest.headers.get('Authorization');
            if (!authorizationHeader) throw new Error("AUTH_REQUIRED");

            const supabaseSovereignClient = createClient(
                Deno.env.get("SUPABASE_URL") ?? "",
                Deno.env.get("SUPABASE_ANON_KEY") ?? "",
                { global: { headers: { Authorization: authorizationHeader } } }
            );

            const { data: { user: authenticatedUserSnapshot } } = await supabaseSovereignClient.auth.getUser();
            if (!authenticatedUserSnapshot) throw new Error("INVALID_SESSION");

            const { data: ownershipVerificationSnapshot, error: ownershipHardwareException } = await supabaseSovereignAdmin
                .from('podcast_drafts')
                .select('user_id')
                .eq('id', targetDraftId)
                .single();

            if (ownershipHardwareException || ownershipVerificationSnapshot.user_id !== authenticatedUserSnapshot.id) {
                throw new Error("FORBIDDEN_ACCESS: No tiene autoridad sobre este borrador.");
            }
        }

        const queryVectorData = await generateEmbedding(targetTopic);

        let finalIntelligenceSourcesCollection: any[] = [];

        if (targetIsPulse && targetPulseIds?.length > 0) {
            const { data: pulseDatabaseResults } = await supabaseSovereignAdmin
                .from('pulse_staging')
                .select('id, title, summary, url, authority_score')
                .in('id', targetPulseIds);

            finalIntelligenceSourcesCollection = (pulseDatabaseResults || []).map(pulseRecord => ({
                identification: pulseRecord.id,
                titleTextContent: pulseRecord.title || "Documento Pulse",
                summaryTextContent: pulseRecord.summary || "Sin resumen disponible.",
                uniformResourceLocator: pulseRecord.url || "#",
                originDescriptor: 'pulse_selection',
                relevanceMagnitude: 1.0
            }));
        } else {
            const [
                { data: vaultFactsResults },
                { data: freshResearchResults }
            ] = await Promise.all([
                supabaseSovereignAdmin.rpc('search_knowledge_vault', {
                    query_embedding: queryVectorData,
                    match_threshold: 0.82,
                    match_count: 5
                }),
                supabaseSovereignAdmin.rpc('search_pulse_staging', {
                    query_embedding: queryVectorData,
                    match_threshold: 0.80,
                    match_count: 5
                })
            ]);

            finalIntelligenceSourcesCollection = [
                ...(vaultFactsResults || []).map((vaultItem: any) => ({
                    identification: vaultItem.source_id || vaultItem.id,
                    titleTextContent: vaultItem.title || "Archivo de Bóveda",
                    summaryTextContent: vaultItem.content || "",
                    uniformResourceLocator: vaultItem.url || "#",
                    originDescriptor: 'vault',
                    relevanceMagnitude: vaultItem.similarity || 0.85
                })),
                ...(freshResearchResults || []).map((researchItem: any) => ({
                    identification: researchItem.id,
                    titleTextContent: researchItem.title || "Investigación Reciente",
                    summaryTextContent: researchItem.summary || "",
                    uniformResourceLocator: researchItem.url || "#",
                    originDescriptor: 'fresh_research',
                    relevanceMagnitude: researchItem.similarity || 0.85
                }))
            ];
        }

        const paperIdentificationsCollection = finalIntelligenceSourcesCollection
            .filter(source => source.originDescriptor === 'fresh_research' || source.originDescriptor === 'pulse_selection')
            .map(source => source.identification)
            .filter(Boolean);

        if (paperIdentificationsCollection.length > 0) {
            await supabaseSovereignAdmin.rpc('increment_paper_usage', { p_ids: paperIdentificationsCollection });
        }

        if (finalIntelligenceSourcesCollection.length < 3) {
            await supabaseSovereignAdmin.rpc('push_to_research_backlog', {
                p_topic: targetTopic,
                p_metadata: { correlationIdentification: correlationIdentification, draftIdentification: targetDraftId }
            });

            const tavilyNetworkResponse = await fetch("https://api.tavily.com/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    api_key: Deno.env.get("TAVILY_API_KEY"),
                    query: targetTopic,
                    search_depth: "basic",
                    max_results: 5
                })
            });

            if (tavilyNetworkResponse.ok) {
                const tavilyResultsData = await tavilyNetworkResponse.json();
                const webSourcesCollection = (tavilyResultsData.results || []).map((webResult: any) => ({
                    titleTextContent: webResult.title || "Fuente Web",
                    summaryTextContent: webResult.content || "",
                    uniformResourceLocator: webResult.url || "#",
                    originDescriptor: 'web',
                    relevanceMagnitude: webResult.score || 0.5
                }));

                finalIntelligenceSourcesCollection = [...finalIntelligenceSourcesCollection, ...webSourcesCollection];

                for (const webSource of webSourcesCollection) {
                    supabaseSovereignAdmin.functions.invoke('vault-refinery', {
                        body: {
                            title: webSource.titleTextContent,
                            text: webSource.summaryTextContent,
                            uniformResourceLocator: webSource.uniformResourceLocator,
                            source_type: 'user_contribution',
                            is_public: true,
                            metadata: { ingested_via: 'research-intelligence', original_topic: targetTopic }
                        },
                        headers: { "x-correlation-id": correlationIdentification }
                    }).catch(() => { });
                }
            }
        }

        if (finalIntelligenceSourcesCollection.length === 0) {
            throw new Error("RECURSOS_NO_ENCONTRADOS: El sistema no pudo validar el tema en ninguna fuente.");
        }

        const serializedSourcesSnapshot = JSON.parse(JSON.stringify(finalIntelligenceSourcesCollection));

        const { error: databaseUpdateHardwareException } = await supabaseSovereignAdmin
            .from('podcast_drafts')
            .update({
                sources: serializedSourcesSnapshot,
                dossier_text: {
                    status: "sources_found",
                    count: serializedSourcesSnapshot.length,
                    trace: correlationIdentification
                },
                status: 'writing',
                updated_at: new Date().toISOString()
            })
            .eq('id', targetDraftId);

        if (databaseUpdateHardwareException) throw new Error(`DATABASE_UPDATE_FAIL: ${databaseUpdateHardwareException.message}`);

        supabaseSovereignAdmin.functions.invoke('generate-script-draft', {
            body: { draft_id: targetDraftId },
            headers: { "x-correlation-id": correlationIdentification }
        }).catch((handoverException) => console.error(`⚠️ [Handover-Fail]: ${handoverException.message}`));

        return new Response(JSON.stringify({
            success: true,
            trace_identification: correlationIdentification,
            sourcesCount: serializedSourcesSnapshot.length
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (hardwareException: any) {
        console.error(`🔥 [Researcher-Fatal][${correlationIdentification}]:`, hardwareException.message);

        if (targetDraftIdentification) {
            await supabaseSovereignAdmin.from('podcast_drafts').update({
                status: 'failed',
                creation_data: { last_exception: hardwareException.message, traceIdentification: correlationIdentification }
            }).eq('id', targetDraftIdentification);
        }

        return new Response(JSON.stringify({
            error: hardwareException.message,
            trace_identification: correlationIdentification
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};

Deno.serve(guard(executeIntelligenceResearchHandler));
