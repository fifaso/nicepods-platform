/**
 * ARCHIVO: lib/mappers/vault-sovereign-mapper.ts
 * VERSIÓN: 8.3 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: METAL-TO-CRYSTAL DATA PURIFICATION
 * MISIÓN: Capa de Aislamiento de Soberanía para la Bóveda de Conocimiento (NicePodKnowledgeVault).
 * NIVEL DE INTEGRIDAD: 100% (Strategist Verified)
 */

import { Tables } from "@/types/database.types";
import { VaultKnowledgeSource, VaultKnowledgeChunk } from "@/actions/vault-actions";

/**
 * transformDatabaseVaultSourceToSovereignEntity
 *
 * @description
 * Transmuta un registro crudo de 'knowledge_sources' hacia una entidad soberana.
 * Aplica ZAP 2.0 y garantiza el sello de nulos.
 */
export function transformDatabaseVaultSourceToSovereignEntity(
    rawDatabaseRecord: Tables<"knowledge_sources"> & { knowledge_chunks?: { count: number }[] }
): VaultKnowledgeSource {
    return {
        identification: rawDatabaseRecord.id,
        title: rawDatabaseRecord.title || "Fuente de Sabiduría Sin Título",
        sourceTypeDescriptor: rawDatabaseRecord.source_type || "unknown",
        uniformResourceLocator: rawDatabaseRecord.url || null,
        creationTimestamp: rawDatabaseRecord.created_at || null,
        isPublicSovereignty: rawDatabaseRecord.is_public ?? false,
        contentHashIdentification: rawDatabaseRecord.content_hash || "NO_HASH",
        reputationScore: rawDatabaseRecord.reputation_score ?? 1.0,
        knowledgeChunksInventory: rawDatabaseRecord.knowledge_chunks || []
    };
}

/**
 * transformDatabaseVaultChunkToSovereignEntity
 *
 * @description
 * Transmuta un registro crudo de 'knowledge_chunks' hacia una entidad soberana.
 */
export function transformDatabaseVaultChunkToSovereignEntity(
    rawDatabaseRecord: Tables<"knowledge_chunks">
): VaultKnowledgeChunk {
    return {
        identification: rawDatabaseRecord.id,
        content: rawDatabaseRecord.content || "",
        creationTimestamp: rawDatabaseRecord.created_at || null,
        importanceScore: rawDatabaseRecord.importance_score ?? 1.0,
        sourceIdentification: rawDatabaseRecord.source_id,
        tokenCount: rawDatabaseRecord.token_count ?? 0
    };
}
