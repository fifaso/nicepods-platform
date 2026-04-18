/**
 * ARCHIVO: actions/draft-actions.ts
 * VERSIÓN: 8.1 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V8.0
 * MISIÓN: Gestionar el ciclo de vida de borradores para conocimiento aspatial con integridad nominal y trazabilidad industrial.
 * NIVEL DE INTEGRIDAD: 100% (Soberano / ZAP Compliant / Build Shield Green)
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { nicepodLog } from "@/lib/utils";

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
 */
export async function listUserDrafts(): Promise<DraftRow[]> {
    const supabaseSovereignClient = createClient();

    // 1. Handshake de Identidad SSR
    const { data: { user: authenticatedUserSnapshot }, error: authenticationHardwareExceptionInformation } = await supabaseSovereignClient.auth.getUser();
    if (authenticationHardwareExceptionInformation || !authenticatedUserSnapshot) {
        nicepodLog("🛑 [Draft-Engine] Acceso denegado: Sesión no válida.", "AUTHENTICATION_REQUIRED", 'error');
        return [];
    }

    try {
        const { data: podcastDraftDatabaseResultsCollection, error: databaseQueryExceptionInformation } = await supabaseSovereignClient
            .from("podcast_drafts")
            .select("id, title, script_text, creation_data, sources, status, created_at, updated_at")
            .eq("user_id", authenticatedUserSnapshot.id)
            .order("created_at", { ascending: false });

        if (databaseQueryExceptionInformation) throw databaseQueryExceptionInformation;

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
        nicepodLog("🔥 [Draft-Engine-Fatal][List]:", exceptionMessageInformationText, 'error');
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
        nicepodLog(`🔥 [Draft-Engine-Fatal][Get]: ID #${draftIdentification}`, exceptionMessageInformationText, 'error');
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

        revalidatePath("/create");
        revalidatePath("/dashboard");

        return {
            success: true,
            message: "Borrador eliminado de la Bóveda temporal."
        };
    } catch (exceptionMessageInformation: unknown) {
        const exceptionMessageInformationText = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
        nicepodLog("🔥 [Draft-Engine-Fatal][Delete]:", exceptionMessageInformationText, 'error');
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
        const { data: draftExistenceVerificationSnapshot } = await supabaseSovereignClient
            .from("podcast_drafts")
            .select("creation_data")
            .eq("id", submissionPayload.draftIdentification)
            .single();

        if (draftExistenceVerificationSnapshot?.creation_data?.creation_mode === 'situational') {
            throw new Error("DOMAIN_MISMATCH: Los activos situacionales deben promoverse vía Geo-Actions.");
        }

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
        nicepodLog("🔥 [Draft-Engine-Fatal][Promotion]:", exceptionMessageInformationText, 'error');
        return {
            success: false,
            message: "Error crítico durante la promoción. Verifique el contrato de datos.",
            exceptionMessageInformation: exceptionMessageInformationText,
            error: exceptionMessageInformationText
        };
    }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V8.1):
 * 1. Industrial Traceability: Reemplazo de console.error por nicepodLog en todos los bloques catch para peritaje industrial.
 * 2. ZAP Absolute Compliance: Purificación nominal exhaustiva en logs y respuestas.
 * 3. Security: Handshake de identidad SSR obligatorio para todas las mutaciones.
 */
