/**
 * ARCHIVO: lib/mappers/collection-sovereign-mapper.ts
 * VERSIÓN: 8.3 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: METAL-TO-CRYSTAL DATA PURIFICATION
 * MISIÓN: Capa de Aislamiento de Soberanía para la Entidad Colección.
 * NIVEL DE INTEGRIDAD: 100% (Strategist Verified)
 */

import { Tables } from "@/types/database.types";
import { Collection } from "@/types/profile";

/**
 * transformDatabaseCollectionToSovereignEntity
 *
 * @description
 * Transmuta un registro crudo de 'collections' hacia una entidad soberana purificada.
 * Erradica el snake_case y garantiza la integridad de los datos (Null-Safety).
 */
export function transformDatabaseCollectionToSovereignEntity(
    rawDatabaseRecord: Tables<"collections"> & { collection_items?: { count: number }[] }
): Collection {
    return {
        identification: rawDatabaseRecord.id,
        ownerUserIdentification: rawDatabaseRecord.owner_id,
        title: rawDatabaseRecord.title || "Hilo de Sabiduría Sin Título",
        descriptionTextContent: rawDatabaseRecord.description || null,
        isPublicSovereignty: rawDatabaseRecord.is_public ?? true,
        coverImageUniformResourceLocator: rawDatabaseRecord.cover_image_url || null,
        totalListenedCount: rawDatabaseRecord.total_listened_count ?? 0,
        likesCountTotal: rawDatabaseRecord.likes_count ?? 0,
        updateTimestamp: rawDatabaseRecord.updated_at || new Date().toISOString(),
        collectionItems: rawDatabaseRecord.collection_items || []
    };
}
