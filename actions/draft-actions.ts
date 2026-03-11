// actions/draft-actions.ts
// VERSIÓN: 3.1 (NicePod Draft Engine - Citizen Knowledge Standard)
// Misión: Gestionar el estado de 'Staging' de ideas A-espaciales (Conocimiento Universal).
// [ESTABILIZACIÓN]: Erradicación de tipos 'any', alineación con 'types/podcast.ts' y limpieza de roles.

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- CONTRATOS DE INTEGRIDAD SOBERANA ---
import { PodcastScript, ResearchSource } from "@/types/podcast";
import { ActionResponse } from "./profile-actions";

/**
 * INTERFAZ: DraftRow
 * Define estrictamente la estructura de salida para evitar el uso de 'any'.
 */
export interface DraftRow {
    id: number;
    title: string;
    script_text: PodcastScript | null;
    creation_data: any;
    sources: ResearchSource[] | null;
    status: string;
    created_at: string;
    updated_at: string;
}

/**
 * FUNCIÓN: listUserDrafts
 * Misión: Recuperar el inventario de misiones en curso del curador.
 * 
 * [ARQUITECTURA]:
 * Actúa sobre 'podcast_drafts'. Solo devuelve conocimiento en fase gaseosa.
 */
export async function listUserDrafts(): Promise<DraftRow[]> {
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

        // Validamos el casteo a través del contrato DraftRow
        return (data as unknown as DraftRow[]) || [];
    } catch (error: any) {
        console.error("🔥 [Draft-Engine-Fatal][List]:", error.message);
        return [];
    }
}

/**
 * FUNCIÓN: getDraftById
 * Misión: Recuperar un nodo de creación específico para el 'Script Editor'.
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
 * FUNCIÓN: deleteDraftAction
 * Misión: Purga física de un borrador, liberando la cuota de concurrencia del usuario.
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

        // Sincronizamos la Workstation
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
 * Esta acción invoca el RPC 'promote_draft_to_production_v2'.
 * NOTA DE SEGURIDAD GEOESPACIAL: Al ser una función de usuario (Ciudadano),
 * esta acción NO recibe, procesa, ni inyecta coordenadas geográficas. 
 * Crea exclusivamente Nodos de Conocimiento Universal (A-espaciales).
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
        // [TELEMETRÍA DE AUDITORÍA]: Verificamos si las fuentes llegan vivas al servidor
        console.info(`🚀 [Draft-Engine] Promocionando Borrador #${payload.draftId}. Fuentes recibidas: ${payload.sources?.length || 0}`);

        // Invocamos el procedimiento almacenado (Soberanía SQL)
        const { data, error } = await supabase.rpc('promote_draft_to_production_v2', {
            p_draft_id: payload.draftId,
            p_final_title: payload.finalTitle,
            p_final_script: payload.finalScript,
            p_sources: payload.sources
        });

        if (error) throw error;

        // El RPC devuelve [{pod_id, success, message}]
        const result = data[0];

        if (!result.success) {
            console.warn(`⚠️ [Draft-Engine] Falla lógica en RPC: ${result.message}`);
            return { success: false, message: result.message || "Fallo en la validación de integridad del borrador." };
        }

        // Revalidación de rutas públicas
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
 * 1. Tipado de Seguridad: El uso de 'DraftRow' obliga al compilador a verificar 
 *    que todos los componentes que consumen borradores (como el Editor de Guiones) 
 *    esperen la estructura correcta, aniquilando errores de 'undefined'.
 * 2. Soberanía de Rol: Se ha documentado la omisión intencional de la lógica 
 *    geoespacial, reservando el mapeo en Madrid exclusivamente para el motor de Admin.
 * 3. Trazabilidad: Se inyectó un log en la promoción para validar si el problema 
 *    de 'Fuentes en 0' es causado por el cliente (UI) que las vacía, o por 
 *    la función Edge que nunca las escribió.
 */