/**
 * ARCHIVO: actions/collection-actions.ts
 * VERSIÓN: 8.3 (NicePod Curation Engine - Madrid Resonance V8.3)
 * PROTOCOLO: MADRID RESONANCE V8.3
 * MISIÓN: Orquestar la creación de una Bóveda Temática con integridad axial y doctrina DIS.
 * NIVEL DE INTEGRIDAD: 100% (Soberano / ZAP 2.0 / Build Shield Green)
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { CollectionSchema } from "@/lib/validation/social-schema";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ProfileActionResponse, Collection } from "@/types/profile";
import { nicepodLog } from "@/lib/utils";
import { transformDatabaseCollectionToSovereignEntity } from "@/lib/mappers/collection-sovereign-mapper";

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
    nicepodLog("🛑 [Curation-Engine] Intento de creación sin sesión.", "AUTH_REQUIRED", 'exceptionInformation');
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
      nicepodLog(`⚠️ [Curation-Engine] Fallo en vinculación. Purgando cabecera huérfana: ${newCollectionIdentification}`, { exception: itemsDatabaseHardwareException.message }, 'warning');
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

    nicepodLog("💎 [Curation-Engine] Hilo de sabiduría materializado.", { collectionIdentification: newCollectionIdentification });

    return {
      isOperationSuccessful: true,
      responseStatusMessage: "ÉXITO: Hilo de conocimiento materializado con éxito en la Bóveda.",
      payloadData: { collectionIdentification: newCollectionIdentification },
      traceIdentification: "CREATE_SUCCESS"
    };

  } catch (exceptionMessageInformation: unknown) {
    const exceptionMessageText = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
    nicepodLog("🔥 [Curation-Engine-Fatal][Create]:", exceptionMessageText, 'exceptionInformation');
    return {
      isOperationSuccessful: false,
      responseStatusMessage: "ERROR_CRÍTICO: El sistema no pudo procesar la creación de la colección.",
      traceIdentification: "FATAL_FAIL"
    };
  }
}

/**
 * getMyCollections:
 * Recuperar el inventario de hilos curados por el Voyager activo con transmutación soberana.
 */
export async function getMyCollections(): Promise<Collection[]> {
  const supabaseSovereignClient = createClient();
  const { data: { user: authenticatedUserSnapshot } } = await supabaseSovereignClient.auth.getUser();

  if (!authenticatedUserSnapshot) {
    nicepodLog("🛑 [Curation-Engine] Intento de acceso a colecciones sin sesión.", null, 'warning');
    return [];
  }

  const authenticatedUserIdentification = authenticatedUserSnapshot.id;

  try {
    const { data: collectionDatabaseResultsCollection, error: queryDatabaseHardwareException } = await supabaseSovereignClient
      .from("collections")
      .select(`
        *,
        collection_items (count)
      `)
      .eq("owner_id", authenticatedUserIdentification)
      .order("updated_at", { ascending: false });

    if (queryDatabaseHardwareException) throw queryDatabaseHardwareException;

    // Auditoría de Transmutación
    nicepodLog(
      "🔄 [Curation-Engine][GetMy]: Transmutando inventario de colecciones.",
      { collectionCountMagnitude: (collectionDatabaseResultsCollection || []).length }
    );

    return (collectionDatabaseResultsCollection || []).map(transformDatabaseCollectionToSovereignEntity);

  } catch (exceptionMessageInformation: unknown) {
    const exceptionMessageText = exceptionMessageInformation instanceof Error ? exceptionMessageInformation.message : "Error desconocido";
    nicepodLog("🔥 [Curation-Engine-Fatal][GetMy]:", exceptionMessageText, 'exceptionInformation');
    return [];
  }
}
