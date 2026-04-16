/**
 * ARCHIVO: lib/podcast-utils.ts
 * VERSIÓN: 3.1 (Intelligence Engine Utils - Teleprompter Math Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * MISIÓN: Estructuras de datos sociales y matemática de sincronización de guiones.
 * NIVEL DE INTEGRIDAD: 100% (Soberano / ZAP Compliant / Build Shield Green)
 */

import { PodcastWithProfile } from "@/types/podcast";

export interface PodcastWithGenealogy extends PodcastWithProfile {
    repliesCollection: PodcastWithProfile[];
    replies: PodcastWithProfile[]; // Legacy descriptor for backward compatibility
    authority_score?: number;
}

export function groupPodcastsByThread(flatList: PodcastWithProfile[]): PodcastWithGenealogy[] {
    if (!flatList || flatList.length === 0) return [];

    /**
     * [OPTIMIZACIÓN V4.0]: Orquestación de hilos mediante mapeo lineal y O(1) lookup.
     * Se elimina el uso de JSON.parse(JSON.stringify) para erradicar la latencia de
     * serialización, protegiendo el Main Thread en colecciones de alta densidad.
     */

    // 1. Indexación y Clonación de Estructura Base
    // Utilizamos un mapa para vinculación instantánea y evitamos mutar la entrada original.
    const podcastIdentificationMap = new Map<number, PodcastWithGenealogy>();
    const timestampReferenceMap = new Map<number, number>();

    const podcastNodesCollection = flatList.map(podcastItem => {
        const node: PodcastWithGenealogy = {
            ...podcastItem,
            repliesCollection: [],
            replies: []
        };
        podcastIdentificationMap.set(node.id, node);
        timestampReferenceMap.set(node.id, new Date(node.created_at).getTime());
        return node;
    });

    const rootPodcastsCollection: PodcastWithGenealogy[] = [];

    // 2. Ensamblaje de la Topología de Hilos (Grafo de Conocimiento)
    for (const node of podcastNodesCollection) {
        const parentIdentification = node.parent_id;

        if (parentIdentification && podcastIdentificationMap.has(parentIdentification) && node.creation_mode !== 'pulse') {
            const parentNode = podcastIdentificationMap.get(parentIdentification)!;
            // Inyectamos la respuesta en la colección de su progenitor semántico.
            parentNode.repliesCollection.push(node);
            parentNode.replies.push(node);
        } else {
            rootPodcastsCollection.push(node);
        }
    }

    // 3. Ordenamiento Estratégico (Descendente por Tiempo de Creación)
    // Utilizamos el mapa de referencias temporales para evitar re-parseo de strings en el sort.
    return rootPodcastsCollection.sort((firstNode, secondNode) => {
        const firstTimestamp = timestampReferenceMap.get(firstNode.id) || 0;
        const secondTimestamp = timestampReferenceMap.get(secondNode.id) || 0;
        return secondTimestamp - firstTimestamp;
    });
}

export function segmentPodcastsByType(list: PodcastWithProfile[]) {
    return {
        narrative: list.filter(p => p.creation_mode !== 'pulse'),
        pills: list.filter(p => p.creation_mode === 'pulse')
    };
}

export function sortPodcastsByStrategicValue(pills: PodcastWithGenealogy[]): PodcastWithGenealogy[] {
    return pills.sort((a, b) => {
        const scoreA = a.authority_score || 0;
        const scoreB = b.authority_score || 0;
        if (scoreA !== scoreB) return scoreB - scoreA;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
}

export function getPodcastLevelLabel(level: number): string {
    if (level >= 9) return "Experto / Científico";
    if (level >= 7) return "Avanzado / Técnico";
    if (level >= 4) return "Intermedio / Profesional";
    return "Iniciación / Divulgativo";
}

/**
 * [NUEVA LÓGICA ESTRATÉGICA]: Sincronización de Teleprompter
 * Calcula qué párrafo o frase debería estar activa basándose en el porcentaje
 * de avance del audio. Asume un ritmo de lectura constante por ahora.
 */
export function calculateActiveParagraphIndex(currentTime: number, duration: number, totalParagraphs: number): number {
    if (duration <= 0 || totalParagraphs === 0) return -1;

    // Si el audio terminó, iluminamos el último párrafo
    if (currentTime >= duration - 1) return totalParagraphs - 1;

    const progressPercentage = currentTime / duration;
    // Mapeo lineal: Si voy al 50% del audio, asumo que voy por el 50% de los párrafos.
    const estimatedIndex = Math.floor(progressPercentage * totalParagraphs);

    // Guardia de seguridad de límites
    return Math.min(Math.max(0, estimatedIndex), totalParagraphs - 1);
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Teleprompter Math: Se añadió 'calculateActiveParagraphIndex' para permitir 
 *    que el reproductor en pantalla completa ilumine el texto de forma orgánica, 
 *    devolviendo la experiencia cinemática sin necesidad de timestamps duros en el JSONB.
 */