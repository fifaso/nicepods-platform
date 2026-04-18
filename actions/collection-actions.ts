/**
 * ARCHIVO: actions/collection-actions.ts
 * VERSIÓN: 4.0 (NicePod Curation Engine - Sovereign Protocol V4.0)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * MISIÓN: Orquestar la creación de una Bóveda Temática vinculando crónicas existentes con integridad axial.
 * NIVEL DE INTEGRIDAD: 100% (Soberano / ZAP Compliant / Build Shield Green)
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { CollectionSchema } from "@/lib/validation/social-schema";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ProfileActionResponse } from "@/types/profile";

/**
 * ESQUEMA EXTENDIDO: CreateCollectionWithItemsSchema
 * Misión: Validar la cabecera de la colección y asegurar que incluya al menos un activo sonoro válido.
 */
const CreateCollectionWithItemsSchema = CollectionSchema.extend({
  podcastIdentifications: z
    .array(z.number())
    .min(1, { message: "Un Hilo de Sabiduría debe contener al menos una crónica." })
});

// Tipado inferido para el payload de creación
export type CreateCollectionPayload = z.infer<typeof CreateCollectionWithItemsSchema>;

/**
 * createCollectionAction: Orquestar la creación de una Bóveda Temática (Colección) vinculando crónicas existentes.
 */
export async function createCollectionAction(
  rawSubmissionPayload: unknown
): Promise<ProfileActionResponse<{ collectionIdentification: string }>> {
  const supabaseClient = createClient();

  // 1. HANDSHAKE DE SOBERANÍA (DIS DOCTRINE)
  const { data: { user: authenticatedUserSnapshot }, error: authenticationExceptionInformation } = await supabaseClient.auth.getUser();
  if (authenticationExceptionInformation || !authenticatedUserSnapshot) {
    return {
      isOperationSuccessful: false,
      responseStatusMessage: "SESIÓN_REQUERIDA: Inicie sesión para crear colecciones.",
      traceIdentification: "AUTH_FAIL"
    };
  }

  const authenticatedUserIdentification = authenticatedUserSnapshot.id;

  // 2. VALIDACIÓN DE INTEGRIDAD ESTRUCTURAL
  const validationResult = CreateCollectionWithItemsSchema.safeParse(rawSubmissionPayload);
  if (!validationResult.success) {
    return {
      isOperationSuccessful: false,
      responseStatusMessage: "ERROR_VALIDACIÓN: El esquema de la colección no cumple con los estándares de NicePod.",
      validationErrorMessageMap: validationResult.error.flatten().fieldErrors,
      traceIdentification: "SCHEMA_FAIL"
    };
  }

  const { title, descriptionTextContent, isPublicSovereignty, coverImageUniformResourceLocator, podcastIdentifications } = validationResult.data;

  try {
    // 3. FASE I: INSERCIÓN DE CABECERA (Entity Creation)
    const { data: collectionDatabaseRecord, error: collectionDatabaseExceptionInformation } = await supabaseClient
      .from("collections")
      .insert({
        owner_id: authenticatedUserIdentification,
        title,
        description: descriptionTextContent,
        is_public: isPublicSovereignty,
        cover_image_url: coverImageUniformResourceLocator
      })
      .select('id')
      .single();

    if (collectionDatabaseExceptionInformation || !collectionDatabaseRecord) {
      throw new Error(`DB_HEADER_FAIL: ${collectionDatabaseExceptionInformation?.message || 'Error desconocido'}`);
    }

    // 4. FASE II: VINCULACIÓN MASIVA (Bulk Insert)
    const itemsToInsertCollection = podcastIdentifications.map((podcastIdentification) => ({
      collection_id: collectionDatabaseRecord.id,
      pod_id: podcastIdentification,
    }));

    const { error: itemsDatabaseExceptionInformation } = await supabaseClient
      .from("collection_items")
      .insert(itemsToInsertCollection);

    // 5. PROTOCOLO DE CONTENCIÓN (Manual Rollback)
    if (itemsDatabaseExceptionInformation) {
      console.warn(`⚠️ [Curation-Engine] Fallo en vinculación. Purgando cabecera huérfana: ${collectionDatabaseRecord.id}`);
      await supabaseClient.from("collections").delete().eq("id", collectionDatabaseRecord.id);
      throw new Error(`DB_ITEMS_FAIL: ${itemsDatabaseExceptionInformation.message}`);
    }

    // 6. REVALIDACIÓN DE CACHÉ DE ALTA DENSIDAD
    const { data: profileDatabaseRecord } = await supabaseClient
      .from("profiles")
      .select("username")
      .eq("id", authenticatedUserIdentification)
      .single();

    if (profileDatabaseRecord?.username) {
      revalidatePath(`/u/${profileDatabaseRecord.username}`); // Vista pública
    }
    revalidatePath("/profile"); // Dashboard privado
    revalidatePath("/podcasts"); // Explorador general

    return {
      isOperationSuccessful: true,
      responseStatusMessage: "ÉXITO: Hilo de conocimiento materializado con éxito en la Bóveda.",
      payloadData: { collectionIdentification: collectionDatabaseRecord.id },
      traceIdentification: "CREATE_SUCCESS"
    };

  } catch (exceptionMessageInformation: unknown) {
    const errorMessage = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
    console.error("🔥 [Curation-Engine-Fatal][Create]:", errorMessage);
    return {
      isOperationSuccessful: false,
      responseStatusMessage: "ERROR_CRÍTICO: El sistema no pudo procesar la creación de la colección.",
      traceIdentification: "FATAL_FAIL"
    };
  }
}

/**
 * getMyCollections: Recuperar el inventario de hilos curados por el usuario activo.
 */
export async function getMyCollections() {
  const supabaseClient = createClient();
  const { data: { user: authenticatedUserSnapshot } } = await supabaseClient.auth.getUser();

  if (!authenticatedUserSnapshot) {
    console.warn("🛑 [Curation-Engine] Intento de acceso a colecciones sin sesión.");
    return [];
  }

  const authenticatedUserIdentification = authenticatedUserSnapshot.id;

  try {
    const { data: collectionDatabaseResults, error: queryDatabaseExceptionInformation } = await supabaseClient
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
      .eq("owner_id", authenticatedUserIdentification)
      .order("updated_at", { ascending: false });

    if (queryDatabaseExceptionInformation) throw queryDatabaseExceptionInformation;

    return (collectionDatabaseResults || []).map((collectionItem: {
      id: string;
      title: string;
      description: string | null;
      is_public: boolean | null;
      cover_image_url: string | null;
      updated_at: string;
      collection_items: { count: number }[];
    }) => ({
      identification: collectionItem.id,
      title: collectionItem.title,
      descriptionTextContent: collectionItem.description,
      isPublicSovereignty: collectionItem.is_public,
      coverImageUniformResourceLocator: collectionItem.cover_image_url,
      updateTimestamp: collectionItem.updated_at,
      collectionItems: collectionItem.collection_items
    }));
  } catch (exceptionMessageInformation: unknown) {
    const errorMessage = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
    console.error("🔥 [Curation-Engine-Fatal][GetMy]:", errorMessage);
    return [];
  }
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Rigor de Tipos: Al extender 'CollectionSchema', garantizamos consistencia total.
 * 2. Metal-to-Crystal: Transformación absoluta de snake_case a camelCase descriptivo.
 * 3. Zero Abbreviations Policy: Cumplimiento 100% de la norma en variables y lógica.
 */
