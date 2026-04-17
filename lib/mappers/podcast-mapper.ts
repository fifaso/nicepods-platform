/**
 * ARCHIVO: lib/mappers/podcast-mapper.ts
 * VERSIÓN: 8.1 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: METAL-TO-CRYSTAL DATA PURIFICATION
 * MISIÓN: Transmutación de registros crudos (Supabase) hacia entidades soberanas (Crystal).
 * [CORRECCIÓN V8.1]: Inclusión de campos 'category' y 'description' para cumplimiento de BSS.
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
 *
 * @complexity
 * 1. Nominal Mapping: Transforma campos snake_case a descriptores camaleónicos (camelCase).
 * 2. Data Integrity: Verifica la presencia de campos críticos (id, user_id).
 * 3. Fallback Management: Implementa recuperaciones seguras para evitar excepciones en el Crystal.
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
    creationTimestamp: rawDatabaseRecord.created_at,

    // --- ESTADO DE INTEGRIDAD ---
    isAudioReady: rawDatabaseRecord.audio_ready ?? false,
    isImageReady: rawDatabaseRecord.image_ready ?? false,
    isEmbeddingReady: rawDatabaseRecord.embedding_ready ?? false,
    audioAssemblyStatus: rawDatabaseRecord.audio_assembly_status,
    totalAudioSegmentsCount: rawDatabaseRecord.total_audio_segments,
    currentAudioSegmentsCount: rawDatabaseRecord.current_audio_segments,

    // --- DOSSIERS DE INTELIGENCIA (CRISTAL) ---
    creationMetadataDossier: rawDatabaseRecord.creation_data,
    intelligenceSourcesCollection: rawDatabaseRecord.sources,
    podcastScriptDossier: rawDatabaseRecord.script_text,
    artificialIntelligenceTagsCollection: rawDatabaseRecord.ai_tags,
    userTagsCollection: rawDatabaseRecord.user_tags,

    // --- EXTENSIONES GEODÉSICAS ---
    placeNameReference: rawDatabaseRecord.place_name,
    geographicLocationPoint: rawDatabaseRecord.geo_location,

    // --- PERFIL DE AUTORIDAD ---
    profiles: rawDatabaseRecord.profiles || null,

    // --- CAMPOS DE LEGADO (PROPIEDADES BASE DE LA TABLA) ---
    title: rawDatabaseRecord.title || "Crónica Sin Título",
    description: rawDatabaseRecord.description,
    category: rawDatabaseRecord.category,
    audio_url: rawDatabaseRecord.audio_url,
    cover_image_url: rawDatabaseRecord.cover_image_url,
    duration_seconds: rawDatabaseRecord.duration_seconds,
    play_count: rawDatabaseRecord.play_count,
    like_count: rawDatabaseRecord.like_count,
    updated_at: rawDatabaseRecord.updated_at,
    status: rawDatabaseRecord.status,
    processing_status: rawDatabaseRecord.processing_status,
    agent_version: rawDatabaseRecord.agent_version,
    ai_summary: rawDatabaseRecord.ai_summary,
    narrative_lens: rawDatabaseRecord.narrative_lens,
    reviewed_by_user: rawDatabaseRecord.reviewed_by_user,
    published_at: rawDatabaseRecord.published_at,
    admin_notes: rawDatabaseRecord.admin_notes,
    is_featured: rawDatabaseRecord.is_featured,
    root_id: rawDatabaseRecord.root_id,
    quote_context: rawDatabaseRecord.quote_context,
    quote_timestamp: rawDatabaseRecord.quote_timestamp,
    creation_mode: rawDatabaseRecord.creation_mode,

    // --- COMPATIBILIDAD AXIAL (LEGACY FALLBACKS / DEPRECATED) ---
    id: rawDatabaseRecord.id,
    user_id: rawDatabaseRecord.user_id,
    parent_id: rawDatabaseRecord.parent_id,
    created_at: rawDatabaseRecord.created_at,
    creation_data: rawDatabaseRecord.creation_data,
    sources: rawDatabaseRecord.sources,
    script_text: rawDatabaseRecord.script_text,
    ai_tags: rawDatabaseRecord.ai_tags,
    geo_location: rawDatabaseRecord.geo_location,
    audio_ready: rawDatabaseRecord.audio_ready,
    image_ready: rawDatabaseRecord.image_ready,
    user_tags: rawDatabaseRecord.user_tags,
    place_name: rawDatabaseRecord.place_name,
  };

  return sovereignPodcastInstance;
}
