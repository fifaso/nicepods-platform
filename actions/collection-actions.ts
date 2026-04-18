/**
 * ARCHIVO: actions/collection-actions.ts
 * VERSIÓN: 8.0 (NicePod Curation Engine - Madrid Resonance V8.0)
 * PROTOCOLO: MADRID RESONANCE V8.0
 * MISIÓN: Orquestar la creación de una Bóveda Temática con integridad axial y doctrina DIS.
 * [CORRECCIÓN V8.0]: Reparación de Integridad Axial y Soberanía Nominal (ZAP 2.0).
 * NIVEL DE INTEGRIDAD: 100% (Soberano / ZAP 2.0 / Build Shield Green)
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { CollectionSchema } from "@/lib/validation/social-schema";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ProfileActionResponse, Collection } from "@/types/profile";
import { nicepodLog } from "@/lib/utils";

/**
 * ESQUEMA EXTENDIDO: CreateCollectionWithItemsSchema
 * Misión: Validar la cabecera de la colección y asegurar que incluya al menos un activo sonoro válido.
 */
const CreateCollectionWithItemsSchema = CollectionSchema.extend({
  podcastIdentificationsCollection: z
    .array(z.number())
    .min(1, { message: "Un Hilo de Sabiduría debe contener al menos una crónica." })
});

// Tipado inferido para el payload de creación
export type CreateCollectionPayload = z.infer<typeof CreateCollectionWithItemsSchema>;

/**
 * createCollectionAction:
 * Orquestador para la materialización de Bóvedas Temáticas (Colecciones).
 */
export async function createCollectionAction(
  rawSubmissionPayloadSnapshot: unknown
): Promise<ProfileActionResponse<{ collectionIdentification: string }>> {
  const supabaseSovereignClient = createClient();

  // 1. HANDSHAKE DE SOBERANÍA (DIS DOCTRINE)
  const { data: { user: authenticatedUserSnapshot }, error: authenticationExceptionInformation } = await supabaseSovereignClient.auth.getUser();
  if (authenticationExceptionInformation || !authenticatedUserSnapshot) {
    return {
      isOperationSuccessful: false,
      responseStatusMessage: "SESIÓN_REQUERIDA: Inicie sesión para crear colecciones.",
      traceIdentification: "AUTH_FAIL"
    };
  }

  const authenticatedUserIdentification = authenticatedUserSnapshot.id;

  // 2. VALIDACIÓN DE INTEGRIDAD ESTRUCTURAL
  const validationResultSnapshot = CreateCollectionWithItemsSchema.safeParse(rawSubmissionPayloadSnapshot);
  if (!validationResultSnapshot.success) {
    return {
      isOperationSuccessful: false,
      responseStatusMessage: "ERROR_VALIDACIÓN: El esquema de la colección no cumple con los estándares de NicePod.",
      validationErrorMessageMap: validationResultSnapshot.error.flatten().fieldErrors,
      traceIdentification: "SCHEMA_FAIL"
    };
  }

  const {
    title,
    descriptionTextContent,
    isPublicSovereignty,
    coverImageUniformResourceLocator,
    podcastIdentificationsCollection
  } = validationResultSnapshot.data;

  try {
    // 3. FASE I: INSERCIÓN DE CABECERA (Entity Creation)
    const { data: collectionDatabaseRecordSnapshot, error: collectionDatabaseHardwareException } = await supabaseSovereignClient
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

    if (collectionDatabaseHardwareException || !collectionDatabaseRecordSnapshot) {
      throw new Error(`DB_HEADER_FAIL: ${collectionDatabaseHardwareException?.message || 'Error desconocido'}`);
    }

    const newCollectionIdentification = collectionDatabaseRecordSnapshot.id;

    // 4. FASE II: VINCULACIÓN MASIVA (Bulk Insert)
    const itemsToInsertCollection = podcastIdentificationsCollection.map((podcastIdentification) => ({
      collection_id: newCollectionIdentification,
      pod_id: podcastIdentification,
    }));

    const { error: itemsDatabaseHardwareException } = await supabaseSovereignClient
      .from("collection_items")
      .insert(itemsToInsertCollection);

    // 5. PROTOCOLO DE CONTENCIÓN (Manual Rollback)
    if (itemsDatabaseHardwareException) {
      nicepodLog(`⚠️ [Curation-Engine] Fallo en vinculación. Purgando cabecera huérfana: ${newCollectionIdentification}`);
      await supabaseSovereignClient.from("collections").delete().eq("id", newCollectionIdentification);
      throw new Error(`DB_ITEMS_FAIL: ${itemsDatabaseHardwareException.message}`);
    }

    // 6. REVALIDACIÓN DE CACHÉ DE ALTA DENSIDAD
    const { data: profileDatabaseRecordSnapshot } = await supabaseSovereignClient
      .from("profiles")
      .select("username")
      .eq("id", authenticatedUserIdentification)
      .single();

    if (profileDatabaseRecordSnapshot?.username) {
      revalidatePath(`/u/${profileDatabaseRecordSnapshot.username}`);
    }
    revalidatePath("/profile");
    revalidatePath("/podcasts");

    return {
      isOperationSuccessful: true,
      responseStatusMessage: "ÉXITO: Hilo de conocimiento materializado con éxito en la Bóveda.",
      payloadData: { collectionIdentification: newCollectionIdentification },
      traceIdentification: "CREATE_SUCCESS"
    };

  } catch (exceptionMessageInformation: unknown) {
    const exceptionMessageText = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
    nicepodLog("🔥 [Curation-Engine-Fatal][Create]:", exceptionMessageText, 'error');
    return {
      isOperationSuccessful: false,
      responseStatusMessage: "ERROR_CRÍTICO: El sistema no pudo procesar la creación de la colección.",
      traceIdentification: "FATAL_FAIL"
    };
  }
}

/**
 * getMyCollections:
 * Recuperar el inventario de hilos curados por el Voyager activo.
 */
export async function getMyCollections() {
  const supabaseSovereignClient = createClient();
  const { data: { user: authenticatedUserSnapshot } } = await supabaseSovereignClient.auth.getUser();

  if (!authenticatedUserSnapshot) {
    console.warn("🛑 [Curation-Engine] Intento de acceso a colecciones sin sesión.");
    return [];
  }

  const authenticatedUserIdentification = authenticatedUserSnapshot.id;

  try {
    const { data: collectionDatabaseResultsCollection, error: queryDatabaseHardwareException } = await supabaseSovereignClient
      .from("collections")
      .select(`
        id, 
        owner_id,
        title, 
        description,
        is_public, 
        cover_image_url,
        total_listened_count,
        likes_count,
        updated_at,
        collection_items (count)
      `)
      .eq("owner_id", authenticatedUserIdentification)
      .order("updated_at", { ascending: false });

    if (queryDatabaseHardwareException) throw queryDatabaseHardwareException;

    const typedCollectionDatabaseResultsCollection = collectionDatabaseResultsCollection as unknown as (Collection & { id: string, owner_id: string, description: string, is_public: boolean, cover_image_url: string, total_listened_count: number, likes_count: number, updated_at: string, collection_items: { count: number }[] })[];

    return (typedCollectionDatabaseResultsCollection || []).map((collectionItemSnapshot) => ({
      identification: collectionItemSnapshot.id,
      ownerUserIdentification: collectionItemSnapshot.owner_id,
      title: collectionItemSnapshot.title,
      descriptionTextContent: collectionItemSnapshot.description,
      isPublicSovereignty: collectionItemSnapshot.is_public ?? true,
      coverImageUniformResourceLocator: collectionItemSnapshot.cover_image_url,
      totalListenedCount: collectionItemSnapshot.total_listened_count ?? 0,
      likesCountTotal: collectionItemSnapshot.likes_count ?? 0,
      updateTimestamp: collectionItemSnapshot.updated_at,
      collectionItems: collectionItemSnapshot.collection_items
    }));
  } catch (exceptionMessageInformation: unknown) {
    const exceptionMessageText = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
    nicepodLog("🔥 [Curation-Engine-Fatal][GetMy]:", exceptionMessageText, 'error');
    return [];
  }
}
