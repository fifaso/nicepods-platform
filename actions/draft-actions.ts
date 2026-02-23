//actions/draft-actions.ts
//VERSIÓN: 3.0 (NicePod Draft Engine - Atomic Handover Standard)


"use server";

import { createClient } from "@/lib/supabase/server";
import {
    PodcastScript,
    ResearchSource
} from "@/types/podcast";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "./profile-actions";

/**
 * FUNCIÓN: listUserDrafts
 * Misión: Recuperar el inventario de misiones de investigación en curso del curador.
 * 
 * [ARQUITECTURA]:
 * Extrae los borradores de la tabla especializada 'podcast_drafts', la cual actúa 
 * como el área de 'Staging' para el procesamiento de inteligencia (Fase I y II).
 */
export async function listUserDrafts(): Promise<any[]> {
    const supabase = createClient();

    // 1. HANDSHAKE DE IDENTIDAD
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        console.error("🛑 [Draft-Engine] Intento de acceso a borradores sin sesión válida.");
        return [];
    }

    try {
        const { data, error } = await supabase
            .from("podcast_drafts")
            .select("id, title, script_text, creation_data, sources, status, created_at, updated_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return data || [];
    } catch (error: any) {
        console.error("🔥 [Draft-Engine-Fatal][List]:", error.message);
        return [];
    }
}

/**
 * FUNCIÓN: getDraftById
 * Misión: Recuperar un nodo de creación específico para su edición o visualización.
 */
export async function getDraftById(draftId: number) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    try {
        const { data, error } = await supabase
            .from("podcast_drafts")
            .select("*")
            .eq("id", draftId)
            .eq("user_id", user.id)
            .single();

        if (error) throw error;
        return data;
    } catch (error: any) {
        console.error(`🔥 [Draft-Engine-Fatal][Get]: ID #${draftId}`, error.message);
        return null;
    }
}

/**
 * FUNCIÓN: deleteDraftAction
 * Misión: Purga física de un borrador y liberación de la cuota de concurrencia.
 */
export async function deleteDraftAction(draftId: number): Promise<ActionResponse> {
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

        // Sincronizamos la Workstation para reflejar la disponibilidad de nueva creación.
        revalidatePath("/create");
        revalidatePath("/dashboard");

        return {
            success: true,
            message: "Borrador purgado de la Bóveda temporal. Capacidad de forja restaurada."
        };
    } catch (error: any) {
        console.error("🔥 [Draft-Engine-Fatal][Delete]:", error.message);
        return { success: false, message: "El sistema no pudo procesar la eliminación del borrador." };
    }
}

/**
 * FUNCIÓN: promoteDraftToProduction
 * Misión: Ejecutar el Salto Atómico de 'Borrador' a 'Podcast en Producción'.
 * 
 * [FASE IV DEL CICLO DE VIDA]:
 * Esta acción invoca el RPC 'promote_draft_to_production_v2', el cual:
 * 1. Mueve el registro a la tabla 'micro_pods'.
 * 2. Activa los triggers de materialización binaria (NSP).
 * 3. Inyecta el ADN de creación definitivo.
 */
export async function promoteDraftToProduction(payload: {
    draftId: number;
    finalTitle: string;
    finalScript: PodcastScript;
    sources: ResearchSource[];
}): Promise<ActionResponse<{ podId: number }>> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "IDENTIDAD_NO_VERIFICADA" };

    try {
        console.info(`🚀 [Draft-Engine] Promocionando Borrador #${payload.draftId} a Producción.`);

        // Invocamos el procedimiento almacenado (Soberanía SQL)
        const { data, error } = await supabase.rpc('promote_draft_to_production_v2', {
            p_draft_id: payload.draftId,
            p_final_title: payload.finalTitle,
            p_final_script: payload.finalScript,
            p_sources: payload.sources
        });

        if (error) throw error;

        // El RPC devuelve un conjunto de resultados [{pod_id, success, message}]
        const result = data[0];

        if (!result.success) {
            return { success: false, message: result.message || "Fallo en la validación de integridad del borrador." };
        }

        // Revalidamos rutas críticas para asegurar que el nuevo podcast aparezca en la biblioteca.
        revalidatePath("/podcasts");
        revalidatePath("/dashboard");
        revalidatePath("/create");

        return {
            success: true,
            message: "Materialización iniciada. El podcast ha entrado en la fase de forja binaria.",
            data: { podId: result.pod_id }
        };

    } catch (error: any) {
        console.error("🔥 [Draft-Engine-Fatal][Promotion]:", error.message);
        return {
            success: false,
            message: "Error crítico durante la promoción a producción. Verifique la integridad del guion."
        };
    }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Aislamiento de Staging: Al usar una tabla dedicada (podcast_drafts), 
 *    protegemos la tabla de producción (micro_pods) de registros incompletos.
 * 2. Handover Atómico: La función 'promoteDraftToProduction' es la única puerta 
 *    de entrada autorizada para iniciar la síntesis de audio e imagen (Protocolo NSP).
 * 3. Consistencia JSONB: Los campos 'script_text' y 'creation_data' se manejan 
 *    como objetos estructurados, garantizando que el Agente 38 (Architect) y el 
 *    Harvester de audio compartan el mismo ADN narrativo.
 */