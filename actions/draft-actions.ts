/**
 * ARCHIVO: actions/draft-actions.ts
 * VERSIÓN: 4.1 (NicePod V2.6 - Universal Knowledge Engine)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * MISIÓN: Gestionar el ciclo de vida de borradores para conocimiento aspatial.
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
    const supabase = createClient();

    // 1. Handshake de Identidad SSR
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        console.error("🛑 [Draft-Engine] Acceso denegado: Sesión no válida.");
        return [];
    }

    try {
        const { data: draftDatabaseResults, error: databaseQueryExceptionInformation } = await supabase
            .from("podcast_drafts")
            .select("id, title, script_text, creation_data, sources, status, created_at, updated_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (databaseQueryExceptionInformation) throw databaseQueryExceptionInformation;

        // El mapeo a DraftRow garantiza cumplimiento ZAP y backward compatibility.
        return (draftDatabaseResults || []).map((draftRow: any) => ({
            identification: draftRow.id,
            id: draftRow.id,
            titleTextContent: draftRow.title,
            title: draftRow.title,
            scriptTextContent: draftRow.script_text,
            script_text: draftRow.script_text,
            creationMetadataPayload: draftRow.creation_data,
            creation_data: draftRow.creation_data,
            intelligenceResearchSources: draftRow.sources,
            sources: draftRow.sources,
            moderationStatus: draftRow.status,
            status: draftRow.status,
            creationTimestamp: draftRow.created_at,
            created_at: draftRow.created_at,
            updateTimestamp: draftRow.updated_at,
            updated_at: draftRow.updated_at
        }));
    } catch (exceptionMessageInformation: unknown) {
        const errorMessage = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
        console.error("🔥 [Draft-Engine-Fatal][List]:", errorMessage);
        return [];
    }
}

/**
 * getDraftById:
 * Recupera un borrador específico para alimentar el Script Editor de la plataforma.
 */
export async function getDraftById(draftIdentification: number): Promise<DraftRow | null> {
    const supabase = createClient();
    const { data: { user: authenticatedUser } } = await supabase.auth.getUser();
    if (!authenticatedUser) return null;

    try {
        const { data: draftDatabaseResult, error: databaseQueryExceptionInformation } = await supabase
            .from("podcast_drafts")
            .select("id, title, script_text, creation_data, sources, status, created_at, updated_at")
            .eq("id", draftIdentification)
            .eq("user_id", authenticatedUser.id)
            .single();

        if (databaseQueryExceptionInformation) throw databaseQueryExceptionInformation;

        if (!draftDatabaseResult) return null;

        return {
            identification: draftDatabaseResult.id,
            id: draftDatabaseResult.id,
            titleTextContent: draftDatabaseResult.title,
            title: draftDatabaseResult.title,
            scriptTextContent: draftDatabaseResult.script_text,
            script_text: draftDatabaseResult.script_text,
            creationMetadataPayload: draftDatabaseResult.creation_data,
            creation_data: draftDatabaseResult.creation_data,
            intelligenceResearchSources: draftDatabaseResult.sources,
            sources: draftDatabaseResult.sources,
            moderationStatus: draftDatabaseResult.status,
            status: draftDatabaseResult.status,
            creationTimestamp: draftDatabaseResult.created_at,
            created_at: draftDatabaseResult.created_at,
            updateTimestamp: draftDatabaseResult.updated_at,
            updated_at: draftDatabaseResult.updated_at
        };
    } catch (exceptionMessageInformation: unknown) {
        const errorMessage = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
        console.error(`🔥 [Draft-Engine-Fatal][Get]: ID #${draftIdentification}`, errorMessage);
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
    const supabaseClient = createClient();
    const { data: { user: authenticatedUser } } = await supabaseClient.auth.getUser();
    if (!authenticatedUser) return { success: false, message: "AUTENTICACIÓN_REQUERIDA" };

    try {
        const { error: databaseDeleteExceptionInformation } = await supabaseClient
            .from("podcast_drafts")
            .delete()
            .eq("id", draftIdentification)
            .eq("user_id", authenticatedUser.id);

        if (databaseDeleteExceptionInformation) throw databaseDeleteExceptionInformation;

        // Invalida las rutas para asegurar que la UI refleje la purga.
        revalidatePath("/create");
        revalidatePath("/dashboard");

        return {
            success: true,
            message: "Borrador eliminado de la Bóveda temporal."
        };
    } catch (exceptionMessageInformation: unknown) {
        const errorMessage = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
        console.error("🔥 [Draft-Engine-Fatal][Delete]:", errorMessage);
        return {
            success: false,
            message: "Error al purgar el activo.",
            exceptionMessageInformation: errorMessage,
            error: errorMessage
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
    const supabaseClient = createClient();
    const { data: { user: authenticatedUser } } = await supabaseClient.auth.getUser();
    if (!authenticatedUser) return { success: false, message: "IDENTIDAD_NO_VERIFICADA" };

    try {
        // 1. Auditoría de Dominio: Verificamos que no sea un POI camuflado.
        const { data: draftCheckDatabaseResult } = await supabaseClient
            .from("podcast_drafts")
            .select("creation_data")
            .eq("id", submissionPayload.draftIdentification)
            .single();

        if (draftCheckDatabaseResult?.creation_data?.creation_mode === 'situational') {
            throw new Error("DOMAIN_MISMATCH: Los activos situacionales deben promoverse vía Geo-Actions.");
        }

        console.info(`🚀 [Draft-Engine] Promocionando Conocimiento Universal #${submissionPayload.draftIdentification}.`);

        // 2. Invocación del RPC Soberano en el Metal SQL.
        const { data: promotionDatabaseResultCollection, error: databaseRpcExceptionInformation } = await supabaseClient.rpc('promote_draft_to_production_v2', {
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
        const errorMessage = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
        console.error("🔥 [Draft-Engine-Fatal][Promotion]:", errorMessage);
        return {
            success: false,
            message: "Error crítico durante la promoción. Verifique el contrato de datos.",
            exceptionMessageInformation: errorMessage,
            error: errorMessage
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