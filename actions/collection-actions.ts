//actions/collection-actions.ts
//VERSIÓN: 3.0 (NicePod Curation Engine - Atomic Transaction Standard)

"use server";

import { createClient } from "@/lib/supabase/server";
import { CollectionSchema } from "@/lib/validation/social-schema";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActionResponse } from "./profile-actions";

/**
 * ESQUEMA EXTENDIDO: CreateCollectionWithItemsSchema
 * Misión: Validar la cabecera de la colección (basada en el estándar social) 
 * y asegurar que incluya al menos un activo sonoro válido.
 */
const CreateCollectionWithItemsSchema = CollectionSchema.extend({
  podcastIdentifications: z
    .array(z.number())
    .min(1, { message: "Un Hilo de Sabiduría debe contener al menos una crónica." })
});

// Tipado inferido para el payload de creación
export type CreateCollectionPayload = z.infer<typeof CreateCollectionWithItemsSchema>;

/**
 * FUNCIÓN: createCollectionAction
 * Misión: Orquestar la creación de una Bóveda Temática (Colección) vinculando crónicas existentes.
 * 
 * [PROTOCOLO ATÓMICO SIMULADO]:
 * 1. Creación de la Entidad Padre (Collection Header).
 * 2. Inserción Masiva de Relaciones (Collection Items).
 * 3. Rollback Manual (Si la inserción masiva falla, se purga la cabecera para evitar colecciones fantasma).
 */
export async function createCollectionAction(
  rawPayload: unknown
): Promise<ActionResponse<{ collectionId: string }>> {
  const supabase = createClient();

  // 1. HANDSHAKE DE SOBERANÍA
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, message: "SESIÓN_REQUERIDA: Inicie sesión para crear colecciones." };
  }

  // 2. VALIDACIÓN DE INTEGRIDAD ESTRUCTURAL
  const validationResult = CreateCollectionWithItemsSchema.safeParse(rawPayload);
  if (!validationResult.success) {
    return {
      success: false,
      message: "El esquema de la colección no cumple con los estándares de NicePod.",
      errors: validationResult.error.flatten().fieldErrors
    };
  }

  const { title, description, isPublic, coverImageUniformResourceLocator, podcastIdentifications } = validationResult.data;

  try {
    // 3. FASE I: INSERCIÓN DE CABECERA (Entity Creation)
    const { data: collection, error: colError } = await supabase
      .from("collections")
      .insert({
        owner_id: user.id,
        title,
        description,
        is_public: isPublic,
        cover_image_url: coverImageUniformResourceLocator
      })
      .select('id')
      .single();

    if (colError || !collection) {
      throw new Error(`DB_HEADER_FAIL: ${colError?.message || 'Error desconocido'}`);
    }

    // 4. FASE II: VINCULACIÓN MASIVA (Bulk Insert)
    const itemsToInsert = podcastIdentifications.map((podId) => ({
      collection_id: collection.id,
      pod_id: podId,
    }));

    const { error: itemsError } = await supabase
      .from("collection_items")
      .insert(itemsToInsert);

    // 5. PROTOCOLO DE CONTENCIÓN (Manual Rollback)
    if (itemsError) {
      console.warn(`⚠️ [Curation-Engine] Fallo en vinculación. Purgando cabecera huérfana: ${collection.id}`);
      await supabase.from("collections").delete().eq("id", collection.id);
      throw new Error(`DB_ITEMS_FAIL: ${itemsError.message}`);
    }

    // 6. REVALIDACIÓN DE CACHÉ DE ALTA DENSIDAD
    // Para asegurar que la colección aparezca instantáneamente, purgamos el perfil del curador.
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    if (profile?.username) {
      revalidatePath(`/u/${profile.username}`); // Vista pública
    }
    revalidatePath("/profile"); // Dashboard privado
    revalidatePath("/podcasts"); // Explorador general

    return {
      success: true,
      message: "Hilo de conocimiento materializado con éxito en la Bóveda.",
      data: { collectionId: collection.id }
    };

  } catch (error: any) {
    console.error("🔥 [Curation-Engine-Fatal][Create]:", error.message);
    return {
      success: false,
      message: "El sistema no pudo procesar la creación de la colección."
    };
  }
}

/**
 * FUNCIÓN: getMyCollections
 * Misión: Recuperar el inventario de hilos curados por el usuario activo.
 * 
 * [OPTIMIZACIÓN]: Incluye la función .count() de Supabase para obtener el 
 * número de crónicas vinculadas sin necesidad de descargar todos los registros hijos.
 */
export async function getMyCollections() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.warn("🛑 [Curation-Engine] Intento de acceso a colecciones sin sesión.");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("collections")
      .select(`
        id, 
        title, 
        description,
        is_public, 
        cover_image_url,
        updated_at,
        collection_items (count)
      `)
      .eq("owner_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error: any) {
    console.error("🔥 [Curation-Engine-Fatal][GetMy]:", error.message);
    return [];
  }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Rigor de Tipos: Al extender 'CollectionSchema' de nuestro archivo de 
 *    validación social, garantizamos que las reglas de longitud y formato 
 *    sean las mismas en el backend y en la UI.
 * 2. Economía de Red: El select() del insert solo recupera el 'id' de la 
 *    nueva colección, minimizando el payload de respuesta de la base de datos.
 * 3. Consistencia Visual: La revalidación dinámica por 'username' asegura 
 *    que el 'PublicContentTabs' (Fase 2) muestre la nueva colección de 
 *    inmediato al visitante.
 */