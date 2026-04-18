/**
 * ARCHIVO: lib/mappers/podcast-mapper.ts
 * VERSIÓN: 8.3 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: METAL-TO-CRYSTAL DATA PURIFICATION
 * MISIÓN: Transmutación de registros crudos (Supabase) hacia entidades soberanas (Crystal).
 * [REFORMA V8.3]: Erradicación total de 'any' y alineación con BSS.
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
 * transformPodcastMetalToCrystal:
 *
 * @description
 * Esta función constituye el puente de soberanía entre el Metal (Base de Datos)
 * y el Crystal (Interfaz de Usuario).
 *
 * @param rawDatabaseRecord Registro crudo proveniente de la tabla 'micro_pods'.
 * @returns Entidad Podcast purificada lista para el consumo en la plataforma.
 */
export function transformPodcastMetalToCrystal(
  rawDatabaseRecord: PodcastRow & { profiles?: ProfileRow | null }
): PodcastWithProfile {

  // 1. Auditoría de Identidad (Traceability)
  if (!rawDatabaseRecord.id) {
    nicepodLog(
      "⚠️ [Mapper-Warning][Podcast]: Detección de registro sin Identificación Primaria.",
      { recordIdentification: rawDatabaseRecord.id },
      'warn'
    );
  }

  // 2. Transmutación Soberana (ZAP Alignment)
  const sovereignPodcastInstance: PodcastWithProfile = {
    // --- IDENTIDAD SOBERANA (ZAP) ---
    identification: rawDatabaseRecord.id,
    authorUserIdentification: rawDatabaseRecord.user_id,
    parentPodcastIdentification: rawDatabaseRecord.parent_id,
    rootPodcastIdentification: rawDatabaseRecord.root_id,
    creationTimestamp: rawDatabaseRecord.created_at,
    updateTimestamp: rawDatabaseRecord.updated_at,
    publicationTimestamp: rawDatabaseRecord.published_at,

    // --- METADATA Y CONTENIDO (ZAP) ---
    titleTextContent: rawDatabaseRecord.title || "Crónica Sin Título",
    descriptionTextContent: rawDatabaseRecord.description || null,
    contentCategory: rawDatabaseRecord.category || null,
    publicationStatus: rawDatabaseRecord.status,
    intelligenceProcessingStatus: rawDatabaseRecord.processing_status,

    // --- ACTIVOS MULTIMEDIA (ZAP) ---
    audioUniformResourceLocator: rawDatabaseRecord.audio_url,
    coverImageUniformResourceLocator: rawDatabaseRecord.cover_image_url,
    playbackDurationSecondsTotal: rawDatabaseRecord.duration_seconds,

    // --- ESTADO DE INTEGRIDAD ---
    isAudioReady: rawDatabaseRecord.audio_ready ?? false,
    isImageReady: rawDatabaseRecord.image_ready ?? false,
    isEmbeddingReady: rawDatabaseRecord.embedding_ready ?? false,
    isFeaturedContentStatus: rawDatabaseRecord.is_featured,
    audioAssemblyStatus: rawDatabaseRecord.audio_assembly_status,
    totalAudioSegmentsCount: rawDatabaseRecord.total_audio_segments,
    currentAudioSegmentsCount: rawDatabaseRecord.current_audio_segments,

    // --- ANALÍTICA Y RENDIMIENTO ---
    playCountTotal: Number(rawDatabaseRecord.play_count),
    likeCountTotal: Number(rawDatabaseRecord.like_count),

    // --- DOSSIERS DE INTELIGENCIA (CRISTAL) ---
    creationMetadataDossier: rawDatabaseRecord.creation_data as unknown as CreationMetadataPayload,
    intelligenceSourcesCollection: rawDatabaseRecord.sources as unknown as ResearchSource[],
    podcastScriptDossier: rawDatabaseRecord.script_text as unknown as PodcastScript,
    artificialIntelligenceTagsCollection: rawDatabaseRecord.ai_tags,
    userDefinedTagsCollection: rawDatabaseRecord.user_tags,
    artificialIntelligenceSummaryContent: rawDatabaseRecord.ai_summary,
    narrativeLensPerspective: rawDatabaseRecord.narrative_lens,
    artificialIntelligenceAgentVersion: rawDatabaseRecord.agent_version,

    // --- EXTENSIONES GEODÉSICAS ---
    placeNameReference: rawDatabaseRecord.place_name,
    geographicLocationPoint: rawDatabaseRecord.geo_location as unknown as GeoLocation,
    quoteContextReference: rawDatabaseRecord.quote_context,
    quoteTimestampMagnitude: rawDatabaseRecord.quote_timestamp ? Number(rawDatabaseRecord.quote_timestamp) : null,

    // --- NOTAS ADMINISTRATIVAS ---
    administrativeNotesContent: rawDatabaseRecord.admin_notes,
    isReviewedByUserStatus: rawDatabaseRecord.reviewed_by_user,

    // --- PERFIL DE AUTORIDAD ---
    profiles: rawDatabaseRecord.profiles ? {
        fullName: rawDatabaseRecord.profiles.full_name,
        avatarUniformResourceLocator: rawDatabaseRecord.profiles.avatar_url,
        username: rawDatabaseRecord.profiles.username,
        reputationScoreValue: rawDatabaseRecord.profiles.reputation_score,
        isVerifiedAccountStatus: rawDatabaseRecord.profiles.is_verified,
        authorityRole: rawDatabaseRecord.profiles.role
    } : null
  };

  return sovereignPodcastInstance;
}
