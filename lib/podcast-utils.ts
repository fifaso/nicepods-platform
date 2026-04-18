/**
 * ARCHIVO: lib/podcast-utils.ts
 * VERSIÓN: 8.1 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V8.0
 *
 * Misión: Proveer algoritmos de alto rendimiento para la estructuración de la
 * malla social y la transformación de datos entre el Metal y el Crystal.
 * [REFORMA V8.1]: Erradicación total de 'any' y alineación con ZAP 2.0.
 * 
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import {
    PodcastWithGenealogy,
    PodcastWithProfile,
    PodcastRow,
    GeoLocation,
    ProfileRow,
    CreationMetadataPayload,
    ResearchSource,
    PodcastScript
} from "@/types/podcast";

/**
 * mapDatabasePodcastToSovereignPodcast:
 * Misión: Actuar como el único puente legal entre el Metal (Base de Datos) y
 * el Crystal (UI), purificando la nomenclatura mediante la Doctrina ZAP.
 */
export function mapDatabasePodcastToSovereignPodcast(
    databaseRowInstance: PodcastRow & { profiles?: ProfileRow | null }
): PodcastWithProfile {
    // Si la fila incluye el objeto relacional de perfiles, lo mapeamos también.
    const rawProfileDataSnapshot = databaseRowInstance.profiles || null;

    const sovereignObject: PodcastWithProfile = {
        // --- IDENTIDAD SOBERANA ---
        identification: databaseRowInstance.id,
        authorUserIdentification: databaseRowInstance.user_id,
        parentPodcastIdentification: databaseRowInstance.parent_id,
        rootPodcastIdentification: databaseRowInstance.root_id,
        creationTimestamp: databaseRowInstance.created_at,
        updateTimestamp: databaseRowInstance.updated_at,
        publicationTimestamp: databaseRowInstance.published_at,

        // --- METADATA Y CONTENIDO ---
        titleTextContent: databaseRowInstance.title || "Crónica Sin Título",
        descriptionTextContent: databaseRowInstance.description,
        contentCategory: databaseRowInstance.category,
        publicationStatus: databaseRowInstance.status,
        intelligenceProcessingStatus: databaseRowInstance.processing_status,

        // --- ACTIVOS MULTIMEDIA ---
        audioUniformResourceLocator: databaseRowInstance.audio_url,
        coverImageUniformResourceLocator: databaseRowInstance.cover_image_url,
        playbackDurationSecondsTotal: databaseRowInstance.duration_seconds,

        // --- ESTADO DE INTEGRIDAD ---
        isAudioReady: databaseRowInstance.audio_ready ?? false,
        isImageReady: databaseRowInstance.image_ready ?? false,
        isEmbeddingReady: databaseRowInstance.embedding_ready ?? false,
        isFeaturedContentStatus: databaseRowInstance.is_featured,
        audioAssemblyStatus: databaseRowInstance.audio_assembly_status,
        totalAudioSegmentsCount: databaseRowInstance.total_audio_segments,
        currentAudioSegmentsCount: databaseRowInstance.current_audio_segments,

        // --- ANALÍTICA Y RENDIMIENTO ---
        playCountTotal: Number(databaseRowInstance.play_count) ?? 0,
        likeCountTotal: Number(databaseRowInstance.like_count) ?? 0,

        // --- DOSSIERS DE INTELIGENCIA ---
        creationMetadataDossier: databaseRowInstance.creation_data as unknown as CreationMetadataPayload,
        intelligenceSourcesCollection: databaseRowInstance.sources as unknown as ResearchSource[],
        podcastScriptDossier: databaseRowInstance.script_text as unknown as PodcastScript,
        artificialIntelligenceTagsCollection: databaseRowInstance.ai_tags,
        userDefinedTagsCollection: databaseRowInstance.user_tags,
        artificialIntelligenceSummaryContent: databaseRowInstance.ai_summary,
        narrativeLensPerspective: databaseRowInstance.narrative_lens,
        artificialIntelligenceAgentVersion: databaseRowInstance.agent_version,

        // --- EXTENSIONES GEODÉSICAS ---
        placeNameReference: databaseRowInstance.place_name,
        geographicLocationPoint: databaseRowInstance.geo_location as unknown as GeoLocation,
        quoteContextReference: databaseRowInstance.quote_context,
        quoteTimestampMagnitude: databaseRowInstance.quote_timestamp ? Number(databaseRowInstance.quote_timestamp) : null,

        // --- NOTAS ADMINISTRATIVAS ---
        administrativeNotesContent: databaseRowInstance.admin_notes,
        isReviewedByUserStatus: databaseRowInstance.reviewed_by_user,

        // --- PERFIL DE AUTORIDAD ---
        profiles: rawProfileDataSnapshot ? {
            fullName: rawProfileDataSnapshot.full_name,
            avatarUniformResourceLocator: rawProfileDataSnapshot.avatar_url,
            username: rawProfileDataSnapshot.username,
            reputationScoreValue: rawProfileDataSnapshot.reputation_score,
            isVerifiedAccountStatus: rawProfileDataSnapshot.is_verified,
            authorityRole: rawProfileDataSnapshot.role
        } : null
    };

    return sovereignObject;
}

/**
 * groupPodcastsByThread:
 * Misión: Orquestar hilos conversacionales mediante mapeo lineal.
 */
export function groupPodcastsByThread(flatPodcastCollection: PodcastWithProfile[]): PodcastWithGenealogy[] {
    if (!flatPodcastCollection || flatPodcastCollection.length === 0) return [];

    const podcastIdentificationMap = new Map<number, PodcastWithGenealogy>();
    const timestampReferenceMap = new Map<number, number>();

    const rootPodcastsCollection: PodcastWithGenealogy[] = [];

    // 1. Inicialización de Nodos
    flatPodcastCollection.forEach(podcastSnapshotInstance => {
        const nodeInstance: PodcastWithGenealogy = {
            ...podcastSnapshotInstance,
            repliesCollection: []
        };
        podcastIdentificationMap.set(nodeInstance.identification, nodeInstance);
        timestampReferenceMap.set(nodeInstance.identification, new Date(nodeInstance.creationTimestamp).getTime());
    });

    // 2. Ensamblaje de la Topología
    for (const podcastInstance of podcastIdentificationMap.values()) {
        const parentIdentification = podcastInstance.parentPodcastIdentification;

        if (parentIdentification && podcastIdentificationMap.has(parentIdentification)) {
            const parentNode = podcastIdentificationMap.get(parentIdentification)!;
            parentNode.repliesCollection = parentNode.repliesCollection || [];
            parentNode.repliesCollection.push(podcastInstance);
        } else {
            rootPodcastsCollection.push(podcastInstance);
        }
    }

    // 3. Ordenamiento (Descendente)
    return rootPodcastsCollection.sort((firstNode, secondNode) => {
        const firstTimestamp = timestampReferenceMap.get(firstNode.identification) || 0;
        const secondTimestamp = timestampReferenceMap.get(secondNode.identification) || 0;
        return secondTimestamp - firstTimestamp;
    });
}

/**
 * segmentPodcastsByTaxonomyCollection:
 * Misión: Separar las píldoras de actualidad (Pulse) de las crónicas profundas.
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
 * Misión: Ordenar las píldoras de inteligencia según su valor pericial para la Malla.
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
 * Misión: Transmutar la magnitud del nivel de conocimiento en un descriptor industrial.
 */
export function getPodcastExpertiseLevelLabel(expertiseLevelMagnitude: number): string {
    if (expertiseLevelMagnitude >= 9) return "Experto / Científico";
    if (expertiseLevelMagnitude >= 7) return "Avanzado / Técnico";
    if (expertiseLevelMagnitude >= 4) return "Intermedio / Profesional";
    return "Iniciación / Divulgativo";
}

/**
 * calculateActiveParagraphIndex:
 * Misión: Sincronización de Teleprompter Cinematográfico.
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
