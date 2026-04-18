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
 * executeResearchIntelligenceOrchestrator:
 * Misión: Orquestar misiones de investigación profunda con integridad perimetral y nominal.
 */
const executeResearchIntelligenceOrchestrator = async (request: Request, context: GuardContext): Promise<Response> => {
    const correlationIdentification = context.correlationIdentification;
    let targetDraftIdentification: string | null = null;

    try {
        const researchIntelligencePayload = await request.json();
        const {
          draft_id: draftIdentification,
          topic: researchTopicContent,
          is_pulse: isPulseSovereigntyActive,
          pulse_source_ids: pulseSourceIdentificationsCollection
        } = researchIntelligencePayload;

        if (!draftIdentification || !researchTopicContent) {
            throw new Error("IDENTIFICADORES_INCOMPLETOS: Se requiere draft_identification y research_topic.");
        }

        targetDraftIdentification = draftIdentification;
        console.info(`📡 [Researcher][${correlationIdentification}] Iniciando Misión de Inteligencia: ${researchTopicContent}`);

        // VALIDACIÓN DE PROPIEDAD: DOCTRINA DIS
        if (!context.isTrusted) {
            const authorizationHeader = request.headers.get('Authorization');
            if (!authorizationHeader) throw new Error("AUTORIZACION_REQUERIDA: No se detectó token de acceso.");

            const temporarySovereignClient = createClient(
                Deno.env.get("SUPABASE_URL") ?? "",
                Deno.env.get("SUPABASE_ANON_KEY") ?? "",
                { global: { headers: { Authorization: authorizationHeader } } }
            );

            const { data: { user: authenticatedUserSnapshot }, error: authException } = await temporarySovereignClient.auth.getUser();
            if (authException || !authenticatedUserSnapshot) throw new Error("SESION_INVALIDA: La identidad del Voyager no pudo ser verificada.");

            const { data: ownershipCheckRecord, error: ownershipQueryHardwareException } = await supabaseAdmin
                .from('podcast_drafts')
                .select('user_id')
                .eq('id', draftIdentification)
                .single();

            if (ownershipQueryHardwareException || ownershipCheckRecord.user_id !== authenticatedUserSnapshot.id) {
                throw new Error("ACCESO_PROHIBIDO: No tiene autoridad sobre este borrador.");
            }
        }

        const queryVector = await generateEmbedding(researchTopicContent);

        let finalIntelligenceSourcesCollection: any[] = [];

        if (isPulseSovereigntyActive && pulseSourceIdentificationsCollection?.length > 0) {
            const { data: pulseDatabaseResultsCollection } = await supabaseAdmin
                .from('pulse_staging')
                .select('id, title, summary, uniformResourceLocator, authority_score')
                .in('id', pulseSourceIdentificationsCollection);

            finalIntelligenceSourcesCollection = (pulseDatabaseResultsCollection || []).map(pulseRecord => ({
                id: pulseRecord.id,
                title: pulseRecord.title || "Documento Pulse",
                content: pulseRecord.summary || "Sin resumen disponible.",
                uniformResourceLocator: pulseRecord.uniformResourceLocator || "#",
                origin: 'pulse_selection',
                relevance: 1.0
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
            await supabaseAdmin.rpc('push_to_research_backlog', {
                p_topic: researchTopicContent,
                p_metadata: { correlation_id: correlationIdentification, draft_id: draftIdentification }
            });

            const webSearchResponse = await fetch("https://api.tavily.com/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    api_key: Deno.env.get("TAVILY_API_KEY"),
                    query: researchTopicContent,
                    search_depth: "basic",
                    max_results: 5
                })
            });

            if (webSearchResponse.ok) {
                const webSearchDataResults = await webSearchResponse.json();
                const webIntelligenceSourcesCollection = (webSearchDataResults.results || []).map((webResult: any) => ({
                    title: webResult.title || "Fuente Web",
                    content: webResult.content || "",
                    uniformResourceLocator: webResult.uniformResourceLocator || "#",
                    origin: 'web',
                    relevance: webResult.score || 0.5
                }));

                finalIntelligenceSourcesCollection = [...finalIntelligenceSourcesCollection, ...webIntelligenceSourcesCollection];

                for (const webSourceItem of webIntelligenceSourcesCollection) {
                    supabaseAdmin.functions.invoke('vault-refinery', {
                        body: {
                            title: webSourceItem.title,
                            text: webSourceItem.content,
                            uniformResourceLocator: webSourceItem.uniformResourceLocator,
                            source_type: 'user_contribution',
                            is_public: true,
                            metadata: { ingested_via: 'research-intelligence', original_topic: researchTopicContent }
                        },
                        headers: { "x-correlation-id": correlationIdentification }
                    }).catch(() => { });
                }
            }
        }

        if (finalIntelligenceSourcesCollection.length === 0) {
            throw new Error("RECURSOS_NO_ENCONTRADOS: El sistema no pudo validar el tema en ninguna fuente.");
        }

        const safeIntelligenceSourcesSnapshot = JSON.parse(JSON.stringify(finalIntelligenceSourcesCollection));

        const { error: updateDatabaseExceptionInformation } = await supabaseAdmin
            .from('podcast_drafts')
            .update({
                sources: safeIntelligenceSourcesSnapshot,
                dossier_text: {
                    status: "sources_found",
                    count: safeIntelligenceSourcesSnapshot.length,
                    trace: correlationIdentification
                },
                status: 'writing',
                updated_at: new Date().toISOString()
            })
            .eq('id', draftIdentification);

        if (updateDatabaseExceptionInformation) throw new Error(`DATABASE_UPDATE_FAIL: ${updateDatabaseExceptionInformation.message}`);

        supabaseAdmin.functions.invoke('generate-script-draft', {
            body: { draft_id: draftIdentification },
            headers: { "x-correlation-id": correlationIdentification }
        }).catch((handoverException) => console.error(`⚠️ [Handover-Fail]: ${handoverException.message}`));

        return new Response(JSON.stringify({
            success: true,
            trace_identification: correlationIdentification,
            sources_count: safeIntelligenceSourcesSnapshot.length
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (exceptionMessageInformation: unknown) {
        const exceptionMessageInformationText = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido en investigación";
        console.error(`🔥 [Researcher-Fatal][${correlationIdentification}]:`, exceptionMessageInformationText);

        if (targetDraftIdentification) {
            await supabaseAdmin.from('podcast_drafts').update({
                status: 'failed',
                creation_data: { last_error: exceptionMessageInformationText, trace: correlationIdentification }
            }).eq('id', targetDraftIdentification);
        }

        throw exceptionMessageInformation;
    }
};

Deno.serve(guard(executeResearchIntelligenceOrchestrator));
