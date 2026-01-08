// actions/draft-actions.ts
// VERSIÓN: 1.0 (Draft Lifecycle Management - Server Side Security)

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * listUserDrafts: Recupera la lista de borradores activos.
 * Incluye creation_data para la hidratación inmediata en el frontend.
 */
export async function listUserDrafts() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    try {
        const { data, error } = await supabase
            .from("micro_pods")
            .select("id, title, script_text, creation_data, sources, created_at")
            .eq("user_id", user.id)
            .eq("status", "draft")
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error("🔥 [actions/listUserDrafts]:", err);
        return [];
    }
}

/**
 * deleteDraftAction: Elimina físicamente un borrador.
 * Vital para que el usuario pueda gestionar su cuota de borradores simultáneos.
 */
export async function deleteDraftAction(id: number) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "No autorizado" };

    try {
        const { error } = await supabase
            .from("micro_pods")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id); // Doble validación de seguridad

        if (error) throw error;

        // Forzamos a Next.js a refrescar los datos de la página de creación
        revalidatePath("/create");
        return { success: true, message: "Borrador eliminado con éxito." };
    } catch (err: any) {
        return { success: false, message: err.message || "Error al eliminar el borrador." };
    }
}