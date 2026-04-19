/**
 * ARCHIVO: lib/podcast-utils.ts
 * VERSIÓN: 8.0 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V7.0
 *
 * Misión: Proveer algoritmos de transformación de datos entre el Metal y el Crystal.
 * [REFORMA V8.0]: Purificación Constitucional absoluta. Eliminación de alias
 * de legado y sellado de nullabilidad mediante coalescencia (??).
 * 
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import { PodcastWithGenealogy, PodcastWithProfile, GeoLocation } from "@/types/podcast";

/**
 * mapDatabasePodcastToSovereignPodcast:
 * Misión: Actuar como el único puente legal entre el Metal (Base de Datos) y
 * el Crystal (UI), eliminando definitivamente 'null' de las propiedades críticas.
 */
export function mapDatabasePodcastToSovereignPodcast(databaseRowInstance: any): PodcastWithProfile {
    const rawProfileSnapshot = databaseRowInstance.profiles || null;

    return {
        // --- IDENTIDAD SOBERANA ---
        identification: databaseRowInstance.id,
        authorUserIdentification: databaseRowInstance.user_id || "",
        parentPodcastIdentification: databaseRowInstance.parent_id || null,
        rootPodcastIdentification: databaseRowInstance.root_id || null,
        creationTimestamp: databaseRowInstance.created_at || new Date().toISOString(),
        updateTimestamp: databaseRowInstance.updated_at || new Date().toISOString(),
        publicationTimestamp: databaseRowInstance.published_at || "",

        // --- METADATA Y CONTENIDO ---
        titleTextContent: databaseRowInstance.title || "Crónica sin título",
        descriptionTextContent: databaseRowInstance.description || "",
        contentCategory: databaseRowInstance.category || "General",
        publicationStatus: databaseRowInstance.status || "draft",
        intelligenceProcessingStatus: databaseRowInstance.processing_status || "pending",

        // --- ACTIVOS MULTIMEDIA ---
        audioUniformResourceLocator: databaseRowInstance.audio_url || "",
        coverImageUniformResourceLocator: databaseRowInstance.cover_image_url || "",
        playbackDurationSecondsTotal: databaseRowInstance.duration_seconds || 0,

        // --- ESTADO DE INTEGRIDAD ---
        isAudioReady: !!databaseRowInstance.audio_ready,
        isImageReady: !!databaseRowInstance.image_ready,
        isEmbeddingReady: !!databaseRowInstance.embedding_ready,
        isFeaturedContentStatus: !!databaseRowInstance.is_featured,
        audioAssemblyStatus: databaseRowInstance.audio_assembly_status || "idle",
        totalAudioSegmentsCount: databaseRowInstance.total_audio_segments || 0,
        currentAudioSegmentsCount: databaseRowInstance.current_audio_segments || 0,

        // --- ANALÍTICA Y RENDIMIENTO ---
        playCountTotal: databaseRowInstance.play_count || 0,
        likeCountTotal: databaseRowInstance.like_count || 0,

        // --- DOSSIERS DE INTELIGENCIA ---
        creationMetadataDossier: databaseRowInstance.creation_data || null,
        intelligenceSourcesCollection: databaseRowInstance.sources || [],
        podcastScriptDossier: databaseRowInstance.script_text || null,
        artificialIntelligenceTagsCollection: databaseRowInstance.ai_tags || [],
        userDefinedTagsCollection: databaseRowInstance.user_tags || [],
        artificialIntelligenceSummaryContent: databaseRowInstance.ai_summary || "",
        narrativeLensPerspective: databaseRowInstance.narrative_lens || "",
        artificialIntelligenceAgentVersion: databaseRowInstance.agent_version || "1.0",

        // --- EXTENSIONES GEODÉSICAS ---
        placeNameReference: databaseRowInstance.place_name || "",
        geographicLocationPoint: databaseRowInstance.geo_location as GeoLocation | null,
        quoteContextReference: databaseRowInstance.quote_context || "",
        quoteTimestampMagnitude: databaseRowInstance.quote_timestamp || 0,

        // --- NOTAS ADMINISTRATIVAS ---
        administrativeNotesContent: databaseRowInstance.admin_notes || "",
        isReviewedByUserStatus: !!databaseRowInstance.reviewed_by_user,

        // --- PERFIL DE AUTORIDAD ---
        profiles: rawProfileSnapshot ? {
            fullName: rawProfileSnapshot.full_name || "Voyager",
            avatarUniformResourceLocator: rawProfileSnapshot.avatar_url || "",
            username: rawProfileSnapshot.username || "anonymous",
            reputationScoreValue: rawProfileSnapshot.reputation_score || 0,
            isVerifiedAccountStatus: !!rawProfileSnapshot.is_verified,
            authorityRole: rawProfileSnapshot.role || "user"
        } : null
    };
}

/**
 * groupPodcastsByThread:
 */
export function groupPodcastsByThread(flatPodcastCollection: PodcastWithProfile[]): PodcastWithGenealogy[] {
    if (!flatPodcastCollection || flatPodcastCollection.length === 0) return [];

    const podcastIdentificationMap = new Map<number, PodcastWithGenealogy>();
    const timestampReferenceMap = new Map<number, number>();

    const rootPodcastsCollection: PodcastWithGenealogy[] = [];

    flatPodcastCollection.forEach(podcastSnapshotInstance => {
        const nodeInstance: PodcastWithGenealogy = {
            ...podcastSnapshotInstance,
            repliesCollection: []
        };
        podcastIdentificationMap.set(nodeInstance.identification, nodeInstance);
        timestampReferenceMap.set(nodeInstance.identification, new Date(nodeInstance.creationTimestamp).getTime());
    });

    for (const podcastInstance of podcastIdentificationMap.values()) {
        const parentIdentification = podcastInstance.parentPodcastIdentification;

        if (parentIdentification && podcastIdentificationMap.has(parentIdentification)) {
            const parentNode = podcastIdentificationMap.get(parentIdentification)!;
            parentNode.repliesCollection.push(podcastInstance);
        } else {
            rootPodcastsCollection.push(podcastInstance);
        }
    }

    return rootPodcastsCollection.sort((firstNode, secondNode) => {
        const firstTimestamp = timestampReferenceMap.get(firstNode.identification) || 0;
        const secondTimestamp = timestampReferenceMap.get(secondNode.identification) || 0;
        return secondTimestamp - firstTimestamp;
    });
}

/**
 * segmentPodcastsByTaxonomyCollection:
 */
export function segmentPodcastsByTaxonomyCollection(podcastCollection: PodcastWithProfile[]) {
    return {
        narrativeChroniclesCollection: podcastCollection.filter(
            podcastItem => podcastItem.creationMetadataDossier?.creationMode !== 'pulse'
        ),
        strategicPillsCollection: podcastCollection.filter(
            podcastItem => podcastItem.creationMetadataDossier?.creationMode === 'pulse'
        )
    };
}

/**
 * sortPodcastsByStrategicValueAction:
 */
export function sortPodcastsByStrategicValueAction(podcastCollection: PodcastWithGenealogy[]): PodcastWithGenealogy[] {
    return podcastCollection.sort((firstPodcastItem, secondPodcastItem) => {
        const firstPodcastAuthorityScoreMagnitude = firstPodcastItem.profiles?.reputationScoreValue || 0;
        const secondPodcastAuthorityScoreMagnitude = secondPodcastItem.profiles?.reputationScoreValue || 0;

        if (firstPodcastAuthorityScoreMagnitude !== secondPodcastAuthorityScoreMagnitude) {
            return secondPodcastAuthorityScoreMagnitude - firstPodcastAuthorityScoreMagnitude;
        }

        return new Date(secondPodcastItem.creationTimestamp).getTime() - new Date(firstPodcastItem.creationTimestamp).getTime();
    });
}

/**
 * getPodcastExpertiseLevelLabel:
 */
export function getPodcastExpertiseLevelLabel(expertiseLevelMagnitude: number): string {
    if (expertiseLevelMagnitude >= 9) return "Experto / Científico";
    if (expertiseLevelMagnitude >= 7) return "Avanzado / Técnico";
    if (expertiseLevelMagnitude >= 4) return "Intermedio / Profesional";
    return "Iniciación / Divulgativo";
}

/**
 * calculateActiveParagraphIndex:
 */
export function calculateActiveParagraphIndex(
    currentPlaybackTimeSecondsMagnitude: number,
    totalPlaybackDurationSecondsMagnitude: number,
    totalNarrativeParagraphsCountMagnitude: number
): number {
    if (totalPlaybackDurationSecondsMagnitude <= 0 || totalNarrativeParagraphsCountMagnitude === 0) {
        return -1;
    }

    if (currentPlaybackTimeSecondsMagnitude >= totalPlaybackDurationSecondsMagnitude - 1) {
        return totalNarrativeParagraphsCountMagnitude - 1;
    }

    const playbackProgressPercentageValue = currentPlaybackTimeSecondsMagnitude / totalPlaybackDurationSecondsMagnitude;
    const estimatedParagraphIndexMagnitude = Math.floor(playbackProgressPercentageValue * totalNarrativeParagraphsCountMagnitude);

    return Math.min(Math.max(0, estimatedParagraphIndexMagnitude), totalNarrativeParagraphsCountMagnitude - 1);
}

/**
 * ALIAS SOBERANOS (LEGACY BRIDGE)
 */
export {
    getPodcastExpertiseLevelLabel as getPodcastLevelLabel,
    segmentPodcastsByTaxonomyCollection as segmentPodcastsByType,
    sortPodcastsByStrategicValueAction as sortPodcastsByStrategicValue
};
