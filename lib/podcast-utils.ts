/**
 * ARCHIVO: lib/podcast-utils.ts
 * VERSIÓN: 5.1 (NicePod Intelligence Engine Utils - Dual Lens Synchronization Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Proveer algoritmos matemáticos y lógicos de alto rendimiento para 
 * la estructuración de la malla social, el cálculo cinemático y el peritaje 
 * de capital intelectual, garantizando la protección del Hilo Principal (MTI).
 * [REFORMA V5.1]: Resolución definitiva de TS2352. Implementación del Protocolo 
 * 'Dual Lens Casting' para sincronizar la herencia de 'PodcastWithProfile' con 
 * la columna relacional 'parent_id' del Metal sin violar el Build Shield.
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
 * groupPodcastsByThreadCollection:
 * Misión: Orquestar hilos conversacionales mediante mapeo lineal (O(n) lookup), 
 * evitando la latencia de recursión y protegiendo el Main Thread en 
 * colecciones de alta densidad.
 */
export function groupPodcastsByThreadCollection(flatPodcastCollection: PodcastWithProfile[]): PodcastWithGenealogy[] {
    if (!flatPodcastCollection || flatPodcastCollection.length === 0) return [];

    // 1. Indexación y Clonación de Estructura Base (Zero Mutation)
    const podcastIdentificationMap = new Map<number, TopologicalPodcastNode>();
    const timestampReferenceMap = new Map<number, number>();

    const podcastNodesCollection = flatPodcastCollection.map(podcastItem => {
        /**
         * [RESOLUCIÓN TS2352 - FIX V5.1]: Dual Lens Casting.
         * Forzamos al compilador a aceptar que el objeto base de la BD (que viaja en runtime)
         * posee la columna relacional, pasando por 'unknown' para evitar el error de solapamiento.
         */
        const genealogicalNode = {
            ...podcastItem,
            repliesCollection: [],
        } as unknown as TopologicalPodcastNode;

        podcastIdentificationMap.set(genealogicalNode.id, genealogicalNode);
        timestampReferenceMap.set(genealogicalNode.id, new Date(genealogicalNode.created_at).getTime());

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
            genealogicalNode.creation_data?.creationMode !== 'pulse';

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
        const firstTimestampMagnitude = timestampReferenceMap.get(firstNodeItem.id) || 0;
        const secondTimestampMagnitude = timestampReferenceMap.get(secondNodeItem.id) || 0;
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
            podcastItem => podcastItem.creation_data?.creationMode !== 'pulse'
        ),
        strategicPillsCollection: podcastCollection.filter(
            podcastItem => podcastItem.creation_data?.creationMode === 'pulse'
        )
    };
}

/**
 * sortPodcastsByStrategicValueAction:
 * Misión: Ordenar las píldoras de inteligencia según su valor pericial para la Malla.
 */
export function sortPodcastsByStrategicValueAction(podcastCollection: PodcastWithGenealogy[]): PodcastWithGenealogy[] {
    return podcastCollection.sort((firstPodcastItem, secondPodcastItem) => {
        // En ausencia de una métrica de importancia explícita en el MVP de Podcasts,
        // utilizamos la reputación del curador como proxy de autoridad del nodo.
        const firstPodcastAuthorityScoreMagnitude = firstPodcastItem.profiles?.reputation_score || 0;
        const secondPodcastAuthorityScoreMagnitude = secondPodcastItem.profiles?.reputation_score || 0;

        if (firstPodcastAuthorityScoreMagnitude !== secondPodcastAuthorityScoreMagnitude) {
            return secondPodcastAuthorityScoreMagnitude - firstPodcastAuthorityScoreMagnitude;
        }

        // Empate de Autoridad: Desempate por frescura temporal (LIFO)
        return new Date(secondPodcastItem.created_at).getTime() - new Date(firstPodcastItem.created_at).getTime();
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
 * Calcula qué párrafo debe estar iluminado basándose en el porcentaje de avance 
 * del audio, asumiendo una elocución constante por parte de la IA Neuronal.
 */
export function calculateActiveParagraphIndex(
    currentPlaybackTimeSecondsMagnitude: number,
    totalPlaybackDurationSecondsMagnitude: number,
    totalNarrativeParagraphsCountMagnitude: number
): number {
    if (totalPlaybackDurationSecondsMagnitude <= 0 || totalNarrativeParagraphsCountMagnitude === 0) {
        return -1;
    }

    // Prevención de fin de archivo: Si el audio terminó, iluminamos el último nodo.
    if (currentPlaybackTimeSecondsMagnitude >= totalPlaybackDurationSecondsMagnitude - 1) {
        return totalNarrativeParagraphsCountMagnitude - 1;
    }

    const playbackProgressPercentageValue = currentPlaybackTimeSecondsMagnitude / totalPlaybackDurationSecondsMagnitude;

    // Mapeo lineal: Proyección del porcentaje de audio sobre la longitud de los párrafos.
    const estimatedParagraphIndexMagnitude = Math.floor(playbackProgressPercentageValue * totalNarrativeParagraphsCountMagnitude);

    // Guardia de seguridad para evitar desbordamientos del array visual.
    return Math.min(Math.max(0, estimatedParagraphIndexMagnitude), totalNarrativeParagraphsCountMagnitude - 1);
}