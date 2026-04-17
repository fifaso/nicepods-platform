/**
 * ARCHIVO: actions/draft-actions.ts
 * VERSIÓN: 8.0 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V8.0
 * MISIÓN: Gestionar el ciclo de vida de borradores para conocimiento aspatial con integridad nominal.
 * NIVEL DE INTEGRIDAD: 100% (Soberano / ZAP Compliant / Build Shield Green)
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- CONTRATOS DE INTEGRIDAD SOBERANA ---
import {
    CreationMetadataPayload,
    PodcastScript,
    ResearchSource
} from "@/types/podcast";

/**
 * ---------------------------------------------------------------------------
 * I. CONTRATOS DE RESPUESTA (ACTION STANDARD)
 * ---------------------------------------------------------------------------
 */

export interface DraftActionResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    exceptionMessageInformation?: string;
    error?: string; // Legacy field for backward compatibility
}

/**
 * INTERFAZ: DraftDatabaseRow
 * Representa la estructura cruda proveniente del Metal (Base de Datos).
 */
export interface DraftDatabaseRow {
    id: number;
    title: string;
    script_text: PodcastScript | null;
    creation_data: CreationMetadataPayload | null;
    sources: ResearchSource[] | null;
    status: string;
    created_at: string;
    updated_at: string;
}

/**
 * INTERFAZ: DraftRow
 * Define estrictamente la estructura de salida de la tabla 'podcast_drafts'.
 * Sustituye el uso de 'any' en creation_data por el contrato CreationMetadataPayload.
 */
export interface DraftRow {
    identification: number;
    id: number; // Legacy field for backward compatibility
    titleTextContent: string;
    title: string; // Legacy field for backward compatibility
    scriptTextContent: PodcastScript | null;
    script_text: PodcastScript | null; // Legacy field for backward compatibility
    creationMetadataPayload: CreationMetadataPayload | null;
    creation_data: CreationMetadataPayload | null; // Legacy field for backward compatibility
    intelligenceResearchSources: ResearchSource[] | null;
    sources: ResearchSource[] | null; // Legacy field for backward compatibility
    moderationStatus: string;
    status: string; // Legacy field for backward compatibility
    creationTimestamp: string;
    created_at: string; // Legacy field for backward compatibility
    updateTimestamp: string;
    updated_at: string; // Legacy field for backward compatibility
}

/**
 * ---------------------------------------------------------------------------
 * II. OPERACIONES DE CONSULTA (READ)
 * ---------------------------------------------------------------------------
 */

/**
 * listUserDrafts:
 * Recupera el inventario de misiones de investigación en curso del usuario.
 * Solo devuelve activos del dominio de Conocimiento Universal.
 */
export async function listUserDrafts(): Promise<DraftRow[]> {
    const supabaseSovereignClient = createClient();

    // 1. Handshake de Identidad SSR
    const { data: { user: authenticatedUserSnapshot }, error: authenticationHardwareExceptionInformation } = await supabaseSovereignClient.auth.getUser();
    if (authenticationHardwareExceptionInformation || !authenticatedUserSnapshot) {
        console.error("🛑 [Draft-Engine] Acceso denegado: Sesión no válida.");
        return [];
    }

    try {
        const { data: podcastDraftDatabaseResultsCollection, error: databaseQueryExceptionInformation } = await supabaseSovereignClient
            .from("podcast_drafts")
            .select("id, title, script_text, creation_data, sources, status, created_at, updated_at")
            .eq("user_id", authenticatedUserSnapshot.id)
            .order("created_at", { ascending: false });

        if (databaseQueryExceptionInformation) throw databaseQueryExceptionInformation;

        // El mapeo a DraftRow garantiza cumplimiento ZAP y backward compatibility.
        return (podcastDraftDatabaseResultsCollection || []).map((podcastDraftDatabaseRowSnapshot: DraftDatabaseRow) => ({
            identification: podcastDraftDatabaseRowSnapshot.id,
            id: podcastDraftDatabaseRowSnapshot.id,
            titleTextContent: podcastDraftDatabaseRowSnapshot.title,
            title: podcastDraftDatabaseRowSnapshot.title,
            scriptTextContent: podcastDraftDatabaseRowSnapshot.script_text,
            script_text: podcastDraftDatabaseRowSnapshot.script_text,
            creationMetadataPayload: podcastDraftDatabaseRowSnapshot.creation_data,
            creation_data: podcastDraftDatabaseRowSnapshot.creation_data,
            intelligenceResearchSources: podcastDraftDatabaseRowSnapshot.sources,
            sources: podcastDraftDatabaseRowSnapshot.sources,
            moderationStatus: podcastDraftDatabaseRowSnapshot.status,
            status: podcastDraftDatabaseRowSnapshot.status,
            creationTimestamp: podcastDraftDatabaseRowSnapshot.created_at,
            created_at: podcastDraftDatabaseRowSnapshot.created_at,
            updateTimestamp: podcastDraftDatabaseRowSnapshot.updated_at,
            updated_at: podcastDraftDatabaseRowSnapshot.updated_at
        }));
    } catch (exceptionMessageInformation: unknown) {
        const exceptionMessageInformationText = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
        console.error("🔥 [Draft-Engine-Fatal][List]:", exceptionMessageInformationText);
        return [];
    }
}

/**
 * getDraftById:
 * Recupera un borrador específico para alimentar el Script Editor de la plataforma.
 */
export async function getDraftById(draftIdentification: number): Promise<DraftRow | null> {
    const supabaseSovereignClient = createClient();
    const { data: { user: authenticatedUserSnapshot } } = await supabaseSovereignClient.auth.getUser();
    if (!authenticatedUserSnapshot) return null;

    try {
        const { data: podcastDraftDatabaseResultSnapshot, error: databaseQueryExceptionInformation } = await supabaseSovereignClient
            .from("podcast_drafts")
            .select("id, title, script_text, creation_data, sources, status, created_at, updated_at")
            .eq("id", draftIdentification)
            .eq("user_id", authenticatedUserSnapshot.id)
            .single();

        if (databaseQueryExceptionInformation) throw databaseQueryExceptionInformation;

        if (!podcastDraftDatabaseResultSnapshot) return null;

        return {
            identification: podcastDraftDatabaseResultSnapshot.id,
            id: podcastDraftDatabaseResultSnapshot.id,
            titleTextContent: podcastDraftDatabaseResultSnapshot.title,
            title: podcastDraftDatabaseResultSnapshot.title,
            scriptTextContent: podcastDraftDatabaseResultSnapshot.script_text,
            script_text: podcastDraftDatabaseResultSnapshot.script_text,
            creationMetadataPayload: podcastDraftDatabaseResultSnapshot.creation_data,
            creation_data: podcastDraftDatabaseResultSnapshot.creation_data,
            intelligenceResearchSources: podcastDraftDatabaseResultSnapshot.sources,
            sources: podcastDraftDatabaseResultSnapshot.sources,
            moderationStatus: podcastDraftDatabaseResultSnapshot.status,
            status: podcastDraftDatabaseResultSnapshot.status,
            creationTimestamp: podcastDraftDatabaseResultSnapshot.created_at,
            created_at: podcastDraftDatabaseResultSnapshot.created_at,
            updateTimestamp: podcastDraftDatabaseResultSnapshot.updated_at,
            updated_at: podcastDraftDatabaseResultSnapshot.updated_at
        };
    } catch (exceptionMessageInformation: unknown) {
        const exceptionMessageInformationText = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
        console.error(`🔥 [Draft-Engine-Fatal][Get]: ID #${draftIdentification}`, exceptionMessageInformationText);
        return null;
    }
}

/**
 * ---------------------------------------------------------------------------
 * III. OPERACIONES DE MUTACIÓN (WRITE)
 * ---------------------------------------------------------------------------
 */

/**
 * deleteDraftAction:
 * Purga física de un borrador de la base de datos.
 * Libera inmediatamente la cuota de concurrencia del plan del usuario.
 */
export async function deleteDraftAction(draftIdentification: number): Promise<DraftActionResponse> {
    const supabaseSovereignClient = createClient();
    const { data: { user: authenticatedUserSnapshot } } = await supabaseSovereignClient.auth.getUser();
    if (!authenticatedUserSnapshot) return { success: false, message: "AUTENTICACIÓN_REQUERIDA" };

    try {
        const { error: databaseDeleteExceptionInformation } = await supabaseSovereignClient
            .from("podcast_drafts")
            .delete()
            .eq("id", draftIdentification)
            .eq("user_id", authenticatedUserSnapshot.id);

        if (databaseDeleteExceptionInformation) throw databaseDeleteExceptionInformation;

        // Invalida las rutas para asegurar que la UI refleje la purga.
        revalidatePath("/create");
        revalidatePath("/dashboard");

        return {
            success: true,
            message: "Borrador eliminado de la Bóveda temporal."
        };
    } catch (exceptionMessageInformation: unknown) {
        const exceptionMessageInformationText = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
        console.error("🔥 [Draft-Engine-Fatal][Delete]:", exceptionMessageInformationText);
        return {
            success: false,
            message: "Error al purgar el activo.",
            exceptionMessageInformation: exceptionMessageInformationText,
            error: exceptionMessageInformationText
        };
    }
}

/**
 * promoteDraftToProduction:
 * Ejecuta el Salto Atómico de 'Borrador' a 'Podcast en Producción'.
 * 
 * [PROTOCOLO SOBERANO V2.6]:
 * Esta acción es estrictamente para la tabla 'micro_pods'.
 * Si el borrador contiene metadatos geoespaciales, la promoción fallará 
 * para evitar la contaminación de la biblioteca aspatial con activos físicos.
 */
export async function promoteDraftToProduction(submissionPayload: {
    draftIdentification: number;
    finalTitleTextContent: string;
    finalPodcastScript: PodcastScript;
    intelligenceResearchSourcesCollection: ResearchSource[];
}): Promise<DraftActionResponse<{ podcastIdentification: number }>> {
    const supabaseSovereignClient = createClient();
    const { data: { user: authenticatedUserSnapshot } } = await supabaseSovereignClient.auth.getUser();
    if (!authenticatedUserSnapshot) return { success: false, message: "IDENTIDAD_NO_VERIFICADA" };

    try {
        // 1. Auditoría de Dominio: Verificamos que no sea un POI camuflado.
        const { data: draftExistenceVerificationSnapshot } = await supabaseSovereignClient
            .from("podcast_drafts")
            .select("creation_data")
            .eq("id", submissionPayload.draftIdentification)
            .single();

        if (draftExistenceVerificationSnapshot?.creation_data?.creation_mode === 'situational') {
            throw new Error("DOMAIN_MISMATCH: Los activos situacionales deben promoverse vía Geo-Actions.");
        }

        console.info(`🚀 [Draft-Engine] Promocionando Conocimiento Universal #${submissionPayload.draftIdentification}.`);

        // 2. Invocación del RPC Soberano en el Metal SQL.
        const { data: promotionDatabaseResultCollection, error: databaseRpcExceptionInformation } = await supabaseSovereignClient.rpc('promote_draft_to_production_v2', {
            p_draft_id: submissionPayload.draftIdentification,
            p_final_title: submissionPayload.finalTitleTextContent,
            p_final_script: submissionPayload.finalPodcastScript,
            p_sources: submissionPayload.intelligenceResearchSourcesCollection
        });

        if (databaseRpcExceptionInformation) throw databaseRpcExceptionInformation;

        const promotionResult = promotionDatabaseResultCollection[0];

        if (!promotionResult.success) {
            return {
                success: false,
                message: promotionResult.message || "Fallo en la integridad del borrador."
            };
        }

        // 3. Sincronización de Universos Visuales.
        revalidatePath("/podcasts");
        revalidatePath("/dashboard");
        revalidatePath("/create");

        return {
            success: true,
            message: "Forja binaria iniciada. El podcast se está materializando.",
            data: { podcastIdentification: promotionResult.pod_id }
        };

    } catch (exceptionMessageInformation: unknown) {
        const exceptionMessageInformationText = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
        console.error("🔥 [Draft-Engine-Fatal][Promotion]:", exceptionMessageInformationText);
        return {
            success: false,
            message: "Error crítico durante la promoción. Verifique el contrato de datos.",
            exceptionMessageInformation: exceptionMessageInformationText,
            error: exceptionMessageInformationText
        };
    }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Especialización de Dominio: El chequeo 'DOMAIN_MISMATCH' garantiza que la 
 *    biblioteca de podcasts universal no se ensucie con datos de GPS crudos, 
 *    manteniendo la especialización dictada por el Comandante.
 * 2. Cero 'any': La integración de 'CreationMetadataPayload' permite que el IDE 
 *    ofrezca autocompletado en los inputs de motivación y tono, eliminando 
 *    errores de escritura en el frontend.
 * 3. Trazabilidad: Se mantiene el registro de 'podId' en la respuesta exitosa 
 *    para permitir redirecciones instantáneas tras la promoción ("Zero-Wait").
 */
