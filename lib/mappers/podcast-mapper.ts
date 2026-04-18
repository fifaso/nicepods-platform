/**
 * ARCHIVO: lib/mappers/podcast-mapper.ts
 * VERSIÓN: 8.2 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: METAL-TO-CRYSTAL DATA PURIFICATION
 * MISIÓN: Transmutación de registros crudos (Supabase) hacia entidades soberanas (Crystal).
 * [CORRECCIÓN V8.2]: Alineación absoluta con la interfaz PodcastWithProfile V16.0 (ZAP/BSS).
 * NIVEL DE INTEGRIDAD: 100% (Scribe Documented)
 */

import { PodcastWithProfile } from "@/types/podcast";
import { nicepodLog } from "@/lib/utils";

/**
 * transformPodcastMetalToCrystal:
 *
 * @description
 * Esta función constituye el puente de soberanía entre el Metal (Base de Datos)
 * y el Crystal (Interfaz de Usuario). Su complejidad radica en la reconciliación
 * de la nomenclatura técnica industrial (ZAP) con el esquema físico de Supabase.
 *
 * @param rawDatabaseRecord Registro crudo proveniente de la tabla 'micro_pods'.
 * @returns Entidad Podcast purificada lista para el consumo en la plataforma.
 */
export function transformPodcastMetalToCrystal(
  rawDatabaseRecord: any // Usamos any temporalmente para el casting desde la respuesta de Supabase select(*)
): PodcastWithProfile {

  // 1. Auditoría de Identidad (Traceability)
  if (!rawDatabaseRecord.id) {
    nicepodLog(
      "⚠️ [Mapper-Warning][Podcast]: Detección de registro sin Identificación Primaria.",
      { recordIdentification: rawDatabaseRecord.id },
      'warn'
    );
  }

  if (!rawDatabaseRecord.user_id) {
    nicepodLog(
      "⚠️ [Mapper-Warning][Podcast]: Detección de registro huérfano (Missing authorUserIdentification).",
      { recordIdentification: rawDatabaseRecord.id },
      'warn'
    );
  }

  // 2. Transmutación Soberana (ZAP Alignment)
  // El casting final garantiza que el objeto cumpla con la interfaz PodcastWithProfile.
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
    descriptionTextContent: rawDatabaseRecord.description,
    contentCategory: rawDatabaseRecord.category,
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
    playCountTotal: rawDatabaseRecord.play_count || 0,
    likeCountTotal: rawDatabaseRecord.like_count || 0,

    // --- DOSSIERS DE INTELIGENCIA (CRISTAL) ---
    creationMetadataDossier: rawDatabaseRecord.creation_data,
    intelligenceSourcesCollection: rawDatabaseRecord.sources,
    podcastScriptDossier: rawDatabaseRecord.script_text,
    artificialIntelligenceTagsCollection: rawDatabaseRecord.ai_tags,
    userDefinedTagsCollection: rawDatabaseRecord.user_tags,
    artificialIntelligenceSummaryContent: rawDatabaseRecord.ai_summary,
    narrativeLensPerspective: rawDatabaseRecord.narrative_lens,
    artificialIntelligenceAgentVersion: rawDatabaseRecord.agent_version,

    // --- EXTENSIONES GEODÉSICAS ---
    placeNameReference: rawDatabaseRecord.place_name,
    geographicLocationPoint: rawDatabaseRecord.geo_location,
    quoteContextReference: rawDatabaseRecord.quote_context,
    quoteTimestampMagnitude: rawDatabaseRecord.quote_timestamp,

    // --- NOTAS ADMINISTRATIVAS ---
    administrativeNotesContent: rawDatabaseRecord.admin_notes,
    isReviewedByUserStatus: rawDatabaseRecord.reviewed_by_user,

    // --- PERFIL DE AUTORIDAD ---
    profiles: rawDatabaseRecord.profiles || null,

    // --- COMPATIBILIDAD AXIAL (LEGACY FALLBACKS / DEPRECATED) ---
    id: rawDatabaseRecord.id,
    user_id: rawDatabaseRecord.user_id,
    parent_id: rawDatabaseRecord.parent_id,
    title: rawDatabaseRecord.title || "Crónica Sin Título",
    description: rawDatabaseRecord.description,
    status: rawDatabaseRecord.status,
    processing_status: rawDatabaseRecord.processing_status,
    audio_url: rawDatabaseRecord.audio_url,
    cover_image_url: rawDatabaseRecord.cover_image_url,
    duration_seconds: rawDatabaseRecord.duration_seconds,
    created_at: rawDatabaseRecord.created_at,
    like_count: rawDatabaseRecord.like_count || 0,
    play_count: rawDatabaseRecord.play_count || 0,
    creation_data: rawDatabaseRecord.creation_data,
    sources: rawDatabaseRecord.sources,
    script_text: rawDatabaseRecord.script_text,
    ai_tags: rawDatabaseRecord.ai_tags,
    geo_location: rawDatabaseRecord.geo_location,
    audio_ready: rawDatabaseRecord.audio_ready ?? false,
    image_ready: rawDatabaseRecord.image_ready ?? false,
    user_tags: rawDatabaseRecord.user_tags,
    place_name: rawDatabaseRecord.place_name,
    is_featured: rawDatabaseRecord.is_featured,
    reviewed_by_user: rawDatabaseRecord.reviewed_by_user,
    creation_mode: rawDatabaseRecord.creation_mode,
  };

  return sovereignPodcastInstance;
}
