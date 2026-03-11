// lib/podcast-utils.ts
// VERSIÓN: 3.0 (Intelligence Engine Utils - Teleprompter Math Edition)
// Misión: Estructuras de datos sociales y matemática de sincronización de guiones.

import { PodcastWithProfile } from "@/types/podcast";

export interface PodcastWithGenealogy extends PodcastWithProfile {
    replies: PodcastWithProfile[];
    authority_score?: number;
}

export function groupPodcastsByThread(flatList: PodcastWithProfile[]): PodcastWithGenealogy[] {
    if (!flatList || flatList.length === 0) return [];

    const list = JSON.parse(JSON.stringify(flatList)) as (PodcastWithProfile & { replies: PodcastWithProfile[] })[];
    const parentMap = new Map<number, typeof list[0]>();

    list.forEach(pod => {
        pod.replies = [];
        parentMap.set(pod.id, pod);
    });

    const rootPodcasts: typeof list = [];

    list.forEach(pod => {
        if (pod.parent_id && parentMap.has(pod.parent_id) && pod.creation_mode !== 'pulse') {
            const parent = parentMap.get(pod.parent_id)!;
            parent.replies.push(pod);
        } else {
            rootPodcasts.push(pod);
        }
    });

    return rootPodcasts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) as PodcastWithGenealogy[];
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