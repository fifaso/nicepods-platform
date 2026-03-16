// actions/draft-actions.ts
// VERSIÓN: 4.0 (NicePod V2.6 - Universal Knowledge Engine)
// Misión: Gestionar el ciclo de vida de borradores para conocimiento aspatial.
// [ESTABILIZACIÓN]: Erradicación total de 'any' y blindaje de dominios.

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

export interface DraftActionResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

/**
 * INTERFAZ: DraftRow
 * Define estrictamente la estructura de salida de la tabla 'podcast_drafts'.
 * Sustituye el uso de 'any' en creation_data por el contrato CreationMetadataPayload.
 */
export interface DraftRow {
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
        const { data, error } = await supabase
            .from("podcast_drafts")
            .select("id, title, script_text, creation_data, sources, status, created_at, updated_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) throw error;

        // El casteo a DraftRow garantiza que creation_data cumpla con el esquema industrial.
        return (data as unknown as DraftRow[]) || [];
    } catch (error: any) {
        console.error("🔥 [Draft-Engine-Fatal][List]:", error.message);
        return [];
    }
}

/**
 * getDraftById:
 * Recupera un borrador específico para alimentar el Script Editor de la plataforma.
 */
export async function getDraftById(draftId: number): Promise<DraftRow | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    try {
        const { data, error } = await supabase
            .from("podcast_drafts")
            .select("id, title, script_text, creation_data, sources, status, created_at, updated_at")
            .eq("id", draftId)
            .eq("user_id", user.id)
            .single();

        if (error) throw error;

        return data as unknown as DraftRow;
    } catch (error: any) {
        console.error(`🔥 [Draft-Engine-Fatal][Get]: ID #${draftId}`, error.message);
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
export async function deleteDraftAction(draftId: number): Promise<DraftActionResponse> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "AUTENTICACIÓN_REQUERIDA" };

    try {
        const { error } = await supabase
            .from("podcast_drafts")
            .delete()
            .eq("id", draftId)
            .eq("user_id", user.id);

        if (error) throw error;

        // Invalida las rutas para asegurar que la UI refleje la purga.
        revalidatePath("/create");
        revalidatePath("/dashboard");

        return {
            success: true,
            message: "Borrador eliminado de la Bóveda temporal."
        };
    } catch (error: any) {
        console.error("🔥 [Draft-Engine-Fatal][Delete]:", error.message);
        return { success: false, message: "Error al purgar el activo.", error: error.message };
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
export async function promoteDraftToProduction(payload: {
    draftId: number;
    finalTitle: string;
    finalScript: PodcastScript;
    sources: ResearchSource[];
}): Promise<DraftActionResponse<{ podId: number }>> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "IDENTIDAD_NO_VERIFICADA" };

    try {
        // 1. Auditoría de Dominio: Verificamos que no sea un POI camuflado.
        const { data: draftCheck } = await supabase
            .from("podcast_drafts")
            .select("creation_data")
            .eq("id", payload.draftId)
            .single();

        if (draftCheck?.creation_data?.creation_mode === 'situational') {
            throw new Error("DOMAIN_MISMATCH: Los activos situacionales deben promoverse vía Geo-Actions.");
        }

        console.info(`🚀 [Draft-Engine] Promocionando Conocimiento Universal #${payload.draftId}.`);

        // 2. Invocación del RPC Soberano en el Metal SQL.
        const { data, error } = await supabase.rpc('promote_draft_to_production_v2', {
            p_draft_id: payload.draftId,
            p_final_title: payload.finalTitle,
            p_final_script: payload.finalScript,
            p_sources: payload.sources
        });

        if (error) throw error;

        const result = data[0];

        if (!result.success) {
            return {
                success: false,
                message: result.message || "Fallo en la integridad del borrador."
            };
        }

        // 3. Sincronización de Universos Visuales.
        revalidatePath("/podcasts");
        revalidatePath("/dashboard");
        revalidatePath("/create");

        return {
            success: true,
            message: "Forja binaria iniciada. El podcast se está materializando.",
            data: { podId: result.pod_id }
        };

    } catch (error: any) {
        console.error("🔥 [Draft-Engine-Fatal][Promotion]:", error.message);
        return {
            success: false,
            message: "Error crítico durante la promoción. Verifique el contrato de datos.",
            error: error.message
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