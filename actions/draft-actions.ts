// actions/draft-actions.ts
// VERSIÓN: 2.0 (Draft Management - Dedicated Table Connector)

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function listUserDrafts() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("podcast_drafts")
        .select("id, title, script_text, creation_data, sources, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("🔥 Error listUserDrafts:", error.message);
        return [];
    }
    return data || [];
}

export async function deleteDraftAction(draftId: number) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Sesión no válida." };

    const { error } = await supabase
        .from("podcast_drafts")
        .delete()
        .eq("id", draftId)
        .eq("user_id", user.id);

    if (error) return { success: false, message: error.message };

    revalidatePath("/create");
    return { success: true, message: "Borrador eliminado. Cuota liberada." };
}