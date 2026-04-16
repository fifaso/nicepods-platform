/**
 * ARCHIVO: lib/podcast-utils.ts
 * VERSIÓN: 6.0 (NicePod Intelligence Engine Utils - Legacy Bridge & Industrial Sync)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Proveer algoritmos matemáticos y lógicos de alto rendimiento para 
 * la estructuración de la malla social, el cálculo cinemático y el peritaje 
 * de capital intelectual, garantizando la protección del Hilo Principal (MTI).
 * [REFORMA V6.0]: Resolución definitiva del fallo de compilación 'ELIFECYCLE'. 
 * Implementación de la Capa de Compatibilidad para exportaciones de legado.
 * Sincronización absoluta con el Metal y el Cristal bajo el Dogma ZAP.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import { PodcastWithGenealogy, PodcastWithProfile } from "@/types/podcast";

/**
 * INTERFAZ TÁCTICA: TopologicalPodcastNode (Type Lens)
 * Misión: Garantizar que el compilador TS reconozca la columna física 'parent_id', 
 * superando la amnesia de inferencia generada por las interfaces Omit de Supabase.
 */
type TopologicalPodcastNode = PodcastWithGenealogy & {
    parent_id: number | null;
};

/**
 * groupPodcastsByThread:
 * Misión: Orquestar hilos conversacionales mediante mapeo lineal (O(n) lookup), 
 * evitando la latencia de recursión y protegiendo el Main Thread en 
 * colecciones de alta densidad.
 */
export function groupPodcastsByThread(flatPodcastCollection: PodcastWithProfile[]): PodcastWithGenealogy[] {
    if (!flatPodcastCollection || flatPodcastCollection.length === 0) return [];

    // 1. Indexación y Clonación de Estructura Base (Zero Mutation)
    const podcastIdentificationMap = new Map<number, TopologicalPodcastNode>();
    const timestampReferenceMap = new Map<number, number>();

    const podcastNodesCollection = flatPodcastCollection.map(podcastItem => {
        /**
         * [BSS]: Dual Lens Casting.
         * Forzamos al compilador a aceptar que el objeto posee la columna relacional, 
         * pasando por 'unknown' para evitar el error de solapamiento TS2352.
         */
        const genealogicalNode = {
            ...podcastItem,
            repliesCollection: [],
        } as unknown as TopologicalPodcastNode;

        podcastIdentificationMap.set(genealogicalNode.identification, genealogicalNode);
        timestampReferenceMap.set(genealogicalNode.identification, new Date(genealogicalNode.creationTimestamp).getTime());

        return genealogicalNode;
    });

    const rootPodcastsCollection: PodcastWithGenealogy[] = [];

    // 2. Ensamblaje de la Topología de Hilos (Grafo de Conocimiento)
    for (const genealogicalNode of podcastNodesCollection) {

        // Accedemos al descriptor físico validado por el Lente Topológico.
        const parentPodcastIdentification = genealogicalNode.parent_id;

        const isResponseToExistingPodcastStatus =
            parentPodcastIdentification !== null &&
            parentPodcastIdentification !== undefined &&
            podcastIdentificationMap.has(parentPodcastIdentification) &&
            genealogicalNode.creationMetadataDossier?.creationMode !== 'pulse';

        if (isResponseToExistingPodcastStatus) {
            const parentNodeReference = podcastIdentificationMap.get(parentPodcastIdentification)!;

            // Inyectamos la respuesta en la colección de su progenitor semántico.
            if (!parentNodeReference.repliesCollection) {
                parentNodeReference.repliesCollection = [];
            }
            parentNodeReference.repliesCollection.push(genealogicalNode);

        } else {
            rootPodcastsCollection.push(genealogicalNode);
        }
    }

    // 3. Ordenamiento Estratégico (Descendente por Tiempo de Creación)
    return rootPodcastsCollection.sort((firstNodeItem, secondNodeItem) => {
        const firstTimestampMagnitude = timestampReferenceMap.get(firstNodeItem.identification) || 0;
        const secondTimestampMagnitude = timestampReferenceMap.get(secondNodeItem.identification) || 0;
        return secondTimestampMagnitude - firstTimestampMagnitude; // LIFO (Last In, First Out)
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
        // Utilizamos la reputación del curador como proxy de autoridad del nodo.
        const firstPodcastAuthorityScoreMagnitude = firstPodcastItem.profiles?.reputation_score || 0;
        const secondPodcastAuthorityScoreMagnitude = secondPodcastItem.profiles?.reputation_score || 0;

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
 * ---------------------------------------------------------------------------
 * VI. CAPA DE ALIAS SOBERANOS (LEGACY COMPATIBILITY BRIDGE)
 * ---------------------------------------------------------------------------
 * Misión: Resolver los errores de importación TS2305 en la plataforma mientras 
 * se completa la transición nominal hacia descriptores industriales.
 */
export {
    getPodcastExpertiseLevelLabel as getPodcastLevelLabel,
    segmentPodcastsByTaxonomyCollection as segmentPodcastsByType,
    sortPodcastsByStrategicValueAction as sortPodcastsByStrategicValue
};
