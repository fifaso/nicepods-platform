/**
 * ARCHIVE: lib/podcast-utils.ts
 * VERSION: 4.0 (NicePod Intelligence Engine Utils - Nominal Sovereignty Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * MISSION: Industrial-grade social data structures and script synchronization mathematics.
 * INTEGRITY LEVEL: 100% (Soberano / No abbreviations / Production-Ready)
 */

import { PodcastWithProfile } from "@/types/podcast";

/**
 * INTERFACE: PodcastWithGenealogy
 */
export interface PodcastWithGenealogy extends PodcastWithProfile {
    repliesCollection: PodcastWithProfile[];
    authorityScoreValue?: number;
}

/**
 * organizePodcastsByConversationThreadTopology:
 * [REFORMA V4.0]: Orquestación de hilos mediante mapeo lineal y O(1) lookup.
 * Misión: Ensamblar el Grafo de Conocimiento a partir de una lista plana.
 */
export function organizePodcastsByConversationThreadTopology(
  podcastFlatCollection: PodcastWithProfile[]
): PodcastWithGenealogy[] {
    if (!podcastFlatCollection || podcastFlatCollection.length === 0) {
        return [];
    }

    // 1. Indexación y Clonación de Estructura Base
    const podcastIdentificationMap = new Map<number, PodcastWithGenealogy>();
    const timestampReferenceMap = new Map<number, number>();

    const podcastNodesCollection = podcastFlatCollection.map(podcastItem => {
        const node: PodcastWithGenealogy = {
            ...podcastItem,
            repliesCollection: []
        };
        podcastIdentificationMap.set(node.identification, node);
        timestampReferenceMap.set(node.identification, new Date(node.created_at).getTime());
        return node;
    });

    const rootPodcastsCollection: PodcastWithGenealogy[] = [];

    // 2. Ensamblaje de la Topología de Hilos
    for (const node of podcastNodesCollection) {
        const parentIdentification = node.parentPodcastIdentification;

        if (parentIdentification && podcastIdentificationMap.has(parentIdentification) && node.creation_mode !== 'pulse') {
            const parentNode = podcastIdentificationMap.get(parentIdentification)!;
            parentNode.repliesCollection.push(node);
        } else {
            rootPodcastsCollection.push(node);
        }
    }

    // 3. Ordenamiento Estratégico (Descendente por Tiempo de Creación)
    return rootPodcastsCollection.sort((firstNode, secondNode) => {
        const firstTimestamp = timestampReferenceMap.get(firstNode.identification) || 0;
        const secondTimestamp = timestampReferenceMap.get(secondNode.identification) || 0;
        return secondTimestamp - firstTimestamp;
    });
}

/**
 * partitionPodcastsByCreationModeCategory:
 * Misión: Segregar la sabiduría en crónicas narrativas y píldoras tácticas.
 */
export function partitionPodcastsByCreationModeCategory(podcastCollection: PodcastWithProfile[]) {
    return {
        narrativeCollection: podcastCollection.filter(p => p.creation_mode !== 'pulse'),
        pulsePillsCollection: podcastCollection.filter(p => p.creation_mode === 'pulse')
    };
}

/**
 * orderPodcastsByStrategicImportanceScore:
 * Misión: Priorizar la visualización basada en el valor de autoridad y temporalidad.
 */
export function orderPodcastsByStrategicImportanceScore(
  podcastGenealogyCollection: PodcastWithGenealogy[]
): PodcastWithGenealogy[] {
    return podcastGenealogyCollection.sort((firstNode, secondNode) => {
        const firstScore = firstNode.authorityScoreValue || 0;
        const secondScore = secondNode.authorityScoreValue || 0;
        if (firstScore !== secondScore) {
            return secondScore - firstScore;
        }
        return new Date(secondNode.created_at).getTime() - new Date(firstNode.created_at).getTime();
    });
}

/**
 * getPodcastExpertiseLevelDescriptor:
 * Misión: Transmutar la magnitud del nivel en un descriptor humano soberano.
 */
export function getPodcastExpertiseLevelDescriptor(expertiseLevelMagnitude: number): string {
    if (expertiseLevelMagnitude >= 9) return "Experto / Científico";
    if (expertiseLevelMagnitude >= 7) return "Avanzado / Técnico";
    if (expertiseLevelMagnitude >= 4) return "Intermedio / Profesional";
    return "Iniciación / Divulgativo";
}

/**
 * computeActiveNarrativeParagraphIndex:
 * [NUEVA LÓGICA ESTRATÉGICA]: Sincronización de Teleprompter.
 * Calcula qué párrafo debería estar activo basándose en el porcentaje de avance.
 */
export function computeActiveNarrativeParagraphIndex(
  currentPlaybackTimeSeconds: number,
  totalDurationSeconds: number,
  totalParagraphsCount: number
): number {
    if (totalDurationSeconds <= 0 || totalParagraphsCount === 0) {
        return -1;
    }

    if (currentPlaybackTimeSeconds >= totalDurationSeconds - 1) {
        return totalParagraphsCount - 1;
    }

    const progressPercentageFactor = currentPlaybackTimeSeconds / totalDurationSeconds;
    const estimatedIndexMagnitude = Math.floor(progressPercentageFactor * totalParagraphsCount);

    return Math.min(Math.max(0, estimatedIndexMagnitude), totalParagraphsCount - 1);
}

/**
 * TECHNICAL NOTE FROM ARCHITECT (V4.0):
 * 1. ZAP Compliance: Absolute nominal sovereignty achieved in all utility functions.
 * 2. Main Thread Isolation: Optimized linear mappings to prevent serialization lag.
 * 3. Contractual Stability: Functional signatures hardened with strict types.
 */
