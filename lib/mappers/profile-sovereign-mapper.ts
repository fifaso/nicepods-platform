/**
 * ARCHIVO: lib/mappers/profile-sovereign-mapper.ts
 * VERSIÓN: 8.3 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: METAL-TO-CRYSTAL DATA PURIFICATION
 * MISIÓN: Capa de Aislamiento de Soberanía para la Entidad Perfil.
 * NIVEL DE INTEGRIDAD: 100% (Strategist Verified)
 */

import { Tables } from "@/types/database.types";
import { ProfileData } from "@/types/profile";

/**
 * transformDatabaseProfileToSovereignEntity
 *
 * @description
 * Transmuta un registro crudo de 'profiles' hacia una entidad soberana purificada.
 * Garantiza Null-Safety y cumplimiento absoluto de ZAP 2.0.
 */
export function transformDatabaseProfileToSovereignEntity(
    rawDatabaseRecord: Tables<"profiles">
): ProfileData {
    return {
        identification: rawDatabaseRecord.id,
        username: rawDatabaseRecord.username || "voyager_anonimo",
        fullName: rawDatabaseRecord.full_name || null,
        avatarUniformResourceLocator: rawDatabaseRecord.avatar_url || null,
        biographyTextContent: rawDatabaseRecord.bio || null,
        biographyShortSummary: rawDatabaseRecord.bio_short || null,
        websiteUniformResourceLocator: rawDatabaseRecord.website_url || null,
        reputationScoreValue: rawDatabaseRecord.reputation_score ?? 0,
        isVerifiedAccountStatus: rawDatabaseRecord.is_verified ?? false,
        authorityRole: rawDatabaseRecord.role || "user",
        followersCountInventory: rawDatabaseRecord.followers_count ?? 0,
        followingCountInventory: rawDatabaseRecord.following_count ?? 0,
        activeCreationJobsCount: rawDatabaseRecord.active_creation_jobs ?? 0,
        creationTimestamp: rawDatabaseRecord.created_at || new Date().toISOString(),
        updateTimestamp: rawDatabaseRecord.updated_at || new Date().toISOString()
    };
}
