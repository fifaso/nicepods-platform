/**
 * ARCHIVO: lib/podcast-utils.ts
 * VERSIÓN: 7.1 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V7.0
 *
 * Misión: Proveer algoritmos de alto rendimiento para la estructuración de la
 * malla social y la transformación de datos entre el Metal y el Crystal.
 * [REFORMA V7.1]: Mantenimiento de alias de compatibilidad (@deprecated) para
 * evitar rupturas en el Build Shield del workspace.
 * 
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import { PodcastWithGenealogy, PodcastWithProfile, PodcastRow, GeoLocation } from "@/types/podcast";

/**
 * mapDatabasePodcastToSovereignPodcast:
 * Misión: Actuar como el único puente legal entre el Metal (Base de Datos) y
 * el Crystal (UI), purificando la nomenclatura mediante la Doctrina ZAP.
 */
export function mapDatabasePodcastToSovereignPodcast(databaseRowInstance: any): PodcastWithProfile {
    // Si la fila incluye el objeto relacional de perfiles, lo mapeamos también.
    const rawProfileSnapshot = databaseRowInstance.profiles || null;

    const sovereignObject = {
        // --- IDENTIDAD SOBERANA ---
        identification: databaseRowInstance.id,
        authorUserIdentification: databaseRowInstance.user_id,
        parentPodcastIdentification: databaseRowInstance.parent_id,
        rootPodcastIdentification: databaseRowInstance.root_id,
        creationTimestamp: databaseRowInstance.created_at,
        updateTimestamp: databaseRowInstance.updated_at,
        publicationTimestamp: databaseRowInstance.published_at,

        // --- METADATA Y CONTENIDO ---
        titleTextContent: databaseRowInstance.title,
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
        playCountTotal: databaseRowInstance.play_count ?? 0,
        likeCountTotal: databaseRowInstance.like_count ?? 0,

        // --- DOSSIERS DE INTELIGENCIA ---
        creationMetadataDossier: databaseRowInstance.creation_data,
        intelligenceSourcesCollection: databaseRowInstance.sources,
        podcastScriptDossier: databaseRowInstance.script_text,
        artificialIntelligenceTagsCollection: databaseRowInstance.ai_tags,
        userDefinedTagsCollection: databaseRowInstance.user_tags,
        artificialIntelligenceSummaryContent: databaseRowInstance.ai_summary,
        narrativeLensPerspective: databaseRowInstance.narrative_lens,
        artificialIntelligenceAgentVersion: databaseRowInstance.agent_version,

        // --- EXTENSIONES GEODÉSICAS ---
        placeNameReference: databaseRowInstance.place_name,
        geographicLocationPoint: databaseRowInstance.geo_location as GeoLocation | null,
        quoteContextReference: databaseRowInstance.quote_context,
        quoteTimestampMagnitude: databaseRowInstance.quote_timestamp,

        // --- NOTAS ADMINISTRATIVAS ---
        administrativeNotesContent: databaseRowInstance.admin_notes,
        isReviewedByUserStatus: databaseRowInstance.reviewed_by_user,

        // --- PERFIL DE AUTORIDAD ---
        profiles: rawProfileSnapshot ? {
            fullName: rawProfileSnapshot.full_name,
            avatarUniformResourceLocator: rawProfileSnapshot.avatar_url,
            username: rawProfileSnapshot.username,
            reputationScoreValue: rawProfileSnapshot.reputation_score,
            isVerifiedAccountStatus: rawProfileSnapshot.is_verified,
            authorityRole: rawProfileSnapshot.role,
            // Fallbacks SSR
            full_name: rawProfileSnapshot.full_name,
            avatar_url: rawProfileSnapshot.avatar_url,
            reputation_score: rawProfileSnapshot.reputation_score,
            is_verified: rawProfileSnapshot.is_verified,
            role: rawProfileSnapshot.role
        } : null,

        // --- ALIAS DE COMPATIBILIDAD (@deprecated) ---
        id: databaseRowInstance.id,
        user_id: databaseRowInstance.user_id,
        parent_id: databaseRowInstance.parent_id,
        title: databaseRowInstance.title,
        description: databaseRowInstance.description,
        status: databaseRowInstance.status,
        processing_status: databaseRowInstance.processing_status,
        audio_url: databaseRowInstance.audio_url,
        cover_image_url: databaseRowInstance.cover_image_url,
        duration_seconds: databaseRowInstance.duration_seconds,
        created_at: databaseRowInstance.created_at,
        like_count: databaseRowInstance.like_count ?? 0,
        play_count: databaseRowInstance.play_count ?? 0,
        creation_data: databaseRowInstance.creation_data,
        sources: databaseRowInstance.sources,
        script_text: databaseRowInstance.script_text,
        ai_tags: databaseRowInstance.ai_tags,
        geo_location: databaseRowInstance.geo_location,
        audio_ready: databaseRowInstance.audio_ready ?? false,
        image_ready: databaseRowInstance.image_ready ?? false,
        user_tags: databaseRowInstance.user_tags,
        place_name: databaseRowInstance.place_name,
        is_featured: databaseRowInstance.is_featured,
        reviewed_by_user: databaseRowInstance.reviewed_by_user,
        creation_mode: databaseRowInstance.creation_data?.creation_mode || databaseRowInstance.creation_mode
    };

    return sovereignObject as PodcastWithProfile;
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
