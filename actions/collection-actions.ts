"use server";

import { createClient } from "@/lib/supabase/server";
import { CreateCollectionSchema, AddToCollectionSchema, CreateCollectionPayload } from "@/lib/validation/social-schema";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "./profile-actions";

// --- CREAR COLECCIÓN ---
export async function createCollectionAction(payload: CreateCollectionPayload): Promise<ActionResponse> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Debes iniciar sesión." };

  const validated = CreateCollectionSchema.safeParse(payload);
  if (!validated.success) return { success: false, message: "Datos inválidos" };

  const { error } = await supabase
    .from("collections")
    .insert({
      owner_id: user.id,
      title: validated.data.title,
      description: validated.data.description,
      is_public: validated.data.is_public,
      cover_image_url: validated.data.cover_image_url
    });

  if (error) return { success: false, message: error.message };

  revalidatePath("/library"); // Asumiendo ruta de librería
  return { success: true, message: "Colección creada." };
}

// --- GUARDAR EN COLECCIÓN (Curaduría) ---
export async function togglePinToCollection(collectionId: string, podId: number): Promise<ActionResponse> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "No autorizado" };

  // 1. Verificar propiedad de la colección
  // (Aunque RLS protege, hacemos check rápido para UX feedback preciso)
  const { data: collection } = await supabase
    .from("collections")
    .select("owner_id")
    .eq("id", collectionId)
    .single();

  if (!collection || collection.owner_id !== user.id) {
    return { success: false, message: "No tienes permiso sobre esta colección." };
  }

  // 2. Verificar si ya existe (Toggle)
  const { data: existing } = await supabase
    .from("collection_items")
    .select("*")
    .eq("collection_id", collectionId)
    .eq("pod_id", podId)
    .single();

  if (existing) {
    // Si existe, borrar (Unpin)
    await supabase.from("collection_items").delete().eq("collection_id", collectionId).eq("pod_id", podId);
    revalidatePath("/library");
    return { success: true, message: "Eliminado de la colección." };
  } else {
    // Si no, insertar (Pin)
    const { error } = await supabase.from("collection_items").insert({
      collection_id: collectionId,
      pod_id: podId
    });
    
    if (error) return { success: false, message: "Error al guardar." };
    revalidatePath("/library");
    return { success: true, message: "Guardado en colección." };
  }
}

// --- LEER MIS COLECCIONES (Para el Modal de Guardado) ---
export async function getMyCollections() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("collections")
    .select("id, title, is_public, collection_items(count)")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });

  return data || [];
}