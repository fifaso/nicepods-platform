// actions/collection-actions.ts
// VERSIÓN: 2.1 (Massive Item Insertion & Permission Validation)

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CreateCollectionSchema = z.object({
  title: z.string().min(3).max(60),
  description: z.string().max(500).optional(),
  podIds: z.array(z.number()).min(1, "Debes seleccionar al menos un audio"),
  is_public: z.boolean().default(true),
});

export type ActionResponse = {
  success: boolean;
  message: string;
  data?: any;
};

export async function createCollectionAction(rawPayload: unknown): Promise<ActionResponse> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Sesión expirada. Ingresa de nuevo." };

  // 1. Validación de Schema
  const validated = CreateCollectionSchema.safeParse(rawPayload);
  if (!validated.success) {
    return { success: false, message: "Datos de colección inválidos." };
  }

  try {
    // 2. Transacción Manual: Crear Colección
    const { data: collection, error: colError } = await supabase
      .from("collections")
      .insert({
        owner_id: user.id,
        title: validated.data.title,
        description: validated.data.description,
        is_public: validated.data.is_public
      })
      .select()
      .single();

    if (colError || !collection) throw new Error("Error al crear la cabecera de la colección.");

    // 3. Inserción Masiva de Items
    const itemsToInsert = validated.data.podIds.map((id) => ({
      collection_id: collection.id,
      pod_id: id,
    }));

    const { error: itemsError } = await supabase
      .from("collection_items")
      .insert(itemsToInsert);

    if (itemsError) {
      // Rollback manual (borrar la colección si los items fallan)
      await supabase.from("collections").delete().eq("id", collection.id);
      throw new Error("No se pudieron vincular los audios.");
    }

    revalidatePath("/profile");
    return { success: true, message: "Hilo de conocimiento creado con éxito." };

  } catch (error: any) {
    console.error("Collection Action Error:", error.message);
    return { success: false, message: error.message || "Error interno del servidor." };
  }
}

export async function getMyCollections() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("collections")
    .select("id, title, is_public, cover_image_url, collection_items(count)")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });

  return data || [];
}