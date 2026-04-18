/**
 * ARCHIVO: lib/mappers/podcast-sovereign-mapper.ts
 * VERSIÓN: 8.2 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: METAL-TO-CRYSTAL DATA PURIFICATION
 * MISIÓN: Capa de Aislamiento de Soberanía para la Entidad Podcast.
 * [REFORMA V8.2]: Implementación de transmutación pura y validaciones de respaldo.
 * NIVEL DE INTEGRIDAD: 100% (Strategist Verified)
 */

import {
    PodcastWithProfile,
    PodcastRow,
    ProfileRow,
    CreationMetadataPayload,
    ResearchSource,
    PodcastScript,
    GeoLocation
} from "@/types/podcast";
import { nicepodLog } from "@/lib/utils";

/**
 * transformDatabasePodcastRecordToSovereignEntity
 *
 * @description
 * Realiza la transmutación de un registro crudo del Metal (Base de Datos)
 * hacia una entidad soberana purificada para el Crystal (UI).
 * Aplica la Doctrina de Soberanía Nominal (ZAP 2.0) y garantiza integridad
 * mediante validaciones de respaldo (fallbacks).
 *
 * @param rawDatabaseRecord Registro crudo proveniente de la tabla 'micro_pods'.
 * @returns Entidad Podcast purificada y soberana lista para el consumo.
 */
export function transformDatabasePodcastRecordToSovereignEntity(
    rawDatabaseRecord: PodcastRow & { profiles?: ProfileRow | null }
): PodcastWithProfile {

    // 1. Auditoría de Identidad y Trazabilidad (Traceability Protocol)
    if (!rawDatabaseRecord.id) {
        nicepodLog(
            "⚠️ [Sovereign-Mapper] Detección de registro sin Identificación Primaria.",
            { rawRecordDataSnapshot: rawDatabaseRecord },
            'warning'
        );
    }

    // 2. Transmutación Soberana (ZAP 2.0 Alignment) con Fallbacks de Integridad
    // Misión: Erradicar abreviaciones y purificar la verdad de la base de datos.
    return {
        // --- IDENTIDAD SOBERANA (ZAP 2.0) ---
        identification: rawDatabaseRecord.id,
        authorUserIdentification: rawDatabaseRecord.user_id || "SYSTEM_ORPHAN",
        parentPodcastIdentification: rawDatabaseRecord.parent_id ?? null,
        rootPodcastIdentification: rawDatabaseRecord.root_id ?? null,
        creationTimestamp: rawDatabaseRecord.created_at || new Date().toISOString(),
        updateTimestamp: rawDatabaseRecord.updated_at || new Date().toISOString(),
        publicationTimestamp: rawDatabaseRecord.published_at ?? null,

        // --- METADATA Y CONTENIDO (ZAP 2.0) ---
        titleTextContent: rawDatabaseRecord.title || "Crónica Sin Título",
        descriptionTextContent: rawDatabaseRecord.description || null,
        contentCategory: rawDatabaseRecord.category || null,
        publicationStatus: rawDatabaseRecord.status || 'draft',
        intelligenceProcessingStatus: rawDatabaseRecord.processing_status || 'pending',

        // --- ACTIVOS MULTIMEDIA (ZAP 2.0) ---
        audioUniformResourceLocator: rawDatabaseRecord.audio_url || null,
        coverImageUniformResourceLocator: rawDatabaseRecord.cover_image_url || null,
        playbackDurationSecondsTotal: rawDatabaseRecord.duration_seconds ?? 0,

        // --- ESTADO DE INTEGRIDAD ---
        isAudioReady: rawDatabaseRecord.audio_ready ?? false,
        isImageReady: rawDatabaseRecord.image_ready ?? false,
        isEmbeddingReady: rawDatabaseRecord.embedding_ready ?? false,
        isFeaturedContentStatus: rawDatabaseRecord.is_featured ?? false,
        audioAssemblyStatus: rawDatabaseRecord.audio_assembly_status || 'idle',
        totalAudioSegmentsCount: rawDatabaseRecord.total_audio_segments ?? 0,
        currentAudioSegmentsCount: rawDatabaseRecord.current_audio_segments ?? 0,

        // --- ANALÍTICA Y RENDIMIENTO ---
        playCountTotal: Number(rawDatabaseRecord.play_count || 0),
        likeCountTotal: Number(rawDatabaseRecord.like_count || 0),

        // --- DOSSIERS DE INTELIGENCIA (CRISTAL - BSS) ---
        creationMetadataDossier: rawDatabaseRecord.creation_data as unknown as CreationMetadataPayload,
        intelligenceSourcesCollection: rawDatabaseRecord.sources as unknown as ResearchSource[],
        podcastScriptDossier: rawDatabaseRecord.script_text as unknown as PodcastScript,
        artificialIntelligenceTagsCollection: rawDatabaseRecord.ai_tags || [],
        userDefinedTagsCollection: rawDatabaseRecord.user_tags || [],
        artificialIntelligenceSummaryContent: rawDatabaseRecord.ai_summary || null,
        narrativeLensPerspective: rawDatabaseRecord.narrative_lens || null,
        artificialIntelligenceAgentVersion: rawDatabaseRecord.agent_version || "1.0.0",

        // --- EXTENSIONES GEODÉSICAS ---
        placeNameReference: rawDatabaseRecord.place_name || null,
        geographicLocationPoint: rawDatabaseRecord.geo_location as unknown as GeoLocation,
        quoteContextReference: rawDatabaseRecord.quote_context || null,
        quoteTimestampMagnitude: rawDatabaseRecord.quote_timestamp ? Number(rawDatabaseRecord.quote_timestamp) : null,

        // --- NOTAS ADMINISTRATIVAS ---
        administrativeNotesContent: rawDatabaseRecord.admin_notes || null,
        isReviewedByUserStatus: rawDatabaseRecord.reviewed_by_user ?? false,

        // --- PERFIL DE AUTORIDAD ---
        profiles: rawDatabaseRecord.profiles ? {
            fullName: rawDatabaseRecord.profiles.full_name || "Usuario NicePod",
            avatarUniformResourceLocator: rawDatabaseRecord.profiles.avatar_url || null,
            username: rawDatabaseRecord.profiles.username || "anonimo",
            reputationScoreValue: rawDatabaseRecord.profiles.reputation_score ?? 0,
            isVerifiedAccountStatus: rawDatabaseRecord.profiles.is_verified ?? false,
            authorityRole: rawDatabaseRecord.profiles.role || "user",
            // SSR Fallbacks para compatibilidad axial mientras Purifier sincroniza el Crystal
            full_name: rawDatabaseRecord.profiles.full_name,
            avatar_url: rawDatabaseRecord.profiles.avatar_url,
            reputation_score: rawDatabaseRecord.profiles.reputation_score,
            is_verified: rawDatabaseRecord.profiles.is_verified,
            role: rawDatabaseRecord.profiles.role
        } : null,

        // --- ALIAS DE COMPATIBILIDAD AXIAL (DEPRECATED - BUILD SHIELD) ---
        /** @deprecated Use identification */
        id: rawDatabaseRecord.id,
        /** @deprecated Use authorUserIdentification */
        user_id: rawDatabaseRecord.user_id,
        /** @deprecated Use parentPodcastIdentification */
        parent_id: rawDatabaseRecord.parent_id,
        /** @deprecated Use titleTextContent */
        title: rawDatabaseRecord.title,
        /** @deprecated Use descriptionTextContent */
        description: rawDatabaseRecord.description,
        /** @deprecated Use publicationStatus */
        status: rawDatabaseRecord.status,
        /** @deprecated Use intelligenceProcessingStatus */
        processing_status: rawDatabaseRecord.processing_status,
        /** @deprecated Use audioUniformResourceLocator */
        audio_url: rawDatabaseRecord.audio_url,
        /** @deprecated Use coverImageUniformResourceLocator */
        cover_image_url: rawDatabaseRecord.cover_image_url,
        /** @deprecated Use playbackDurationSecondsTotal */
        duration_seconds: rawDatabaseRecord.duration_seconds,
        /** @deprecated Use creationTimestamp */
        created_at: rawDatabaseRecord.created_at,
        /** @deprecated Use likeCountTotal */
        like_count: Number(rawDatabaseRecord.like_count || 0),
        /** @deprecated Use playCountTotal */
        play_count: Number(rawDatabaseRecord.play_count || 0),
        /** @deprecated Use creationMetadataDossier */
        creation_data: rawDatabaseRecord.creation_data,
        /** @deprecated Use intelligenceSourcesCollection */
        sources: rawDatabaseRecord.sources,
        /** @deprecated Use podcastScriptDossier */
        script_text: rawDatabaseRecord.script_text,
        /** @deprecated Use artificialIntelligenceTagsCollection */
        ai_tags: rawDatabaseRecord.ai_tags,
        /** @deprecated Use geographicLocationPoint */
        geo_location: rawDatabaseRecord.geo_location,
        /** @deprecated Use isAudioReady */
        audio_ready: rawDatabaseRecord.audio_ready ?? false,
        /** @deprecated Use isImageReady */
        image_ready: rawDatabaseRecord.image_ready ?? false,
        /** @deprecated Use userDefinedTagsCollection */
        user_tags: rawDatabaseRecord.user_tags,
        /** @deprecated Use placeNameReference */
        place_name: rawDatabaseRecord.place_name,
        /** @deprecated Use isFeaturedContentStatus */
        is_featured: rawDatabaseRecord.is_featured,
        /** @deprecated Use isReviewedByUserStatus */
        reviewed_by_user: rawDatabaseRecord.reviewed_by_user,
        /** @deprecated Use creationMetadataDossier?.creationMode */
        creation_mode: rawDatabaseRecord.creation_mode as any
    };
}
