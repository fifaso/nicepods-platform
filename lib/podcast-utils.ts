// lib/podcast-utils.ts
// VERSIÓN: 2.1 (Intelligence Engine Utils - Strict Type Safety & Pulse Sync)

import { PodcastWithProfile } from "@/types/podcast";

/**
 * 🧬 PodcastWithGenealogy
 * Interfaz extendida para soportar la arquitectura social de hilos (Threads).
 * [FIX]: No re-declaramos propiedades existentes (parent_id, root_id) para evitar
 * conflictos de opcionalidad con la interfaz base PodcastWithProfile.
 */
export interface PodcastWithGenealogy extends PodcastWithProfile {
    replies: PodcastWithProfile[]; // Las respuestas son obligatorias en este contexto
    authority_score?: number;      // Metadato opcional para el motor Pulse
}

/**
 * groupPodcastsByThread
 * Organiza una lista plana de podcasts en una estructura de "Mazos" (Stacks).
 * [ESTRATEGIA]: Las píldoras 'pulse' se mantienen siempre en la raíz para 
 * garantizar su visibilidad en el Dossier de Inteligencia.
 */
export function groupPodcastsByThread(flatList: PodcastWithProfile[]): PodcastWithGenealogy[] {
    if (!flatList || flatList.length === 0) return [];

    // 1. Clonación profunda para evitar mutar el estado original (Higiene de React)
    // Usamos 'as any' temporalmente durante la transformación y luego casteamos al final.
    const list = JSON.parse(JSON.stringify(flatList)) as (PodcastWithProfile & { replies: PodcastWithProfile[] })[];

    const parentMap = new Map<number, typeof list[0]>();

    // 2. Preparación de recipientes para respuestas
    list.forEach(pod => {
        pod.replies = [];
        parentMap.set(pod.id, pod);
    });

    const rootPodcasts: typeof list = [];

    // 3. Distribución jerárquica (Lógica de anidamiento)
    list.forEach(pod => {
        // Un podcast se anida si:
        // - Tiene un padre (parent_id)
        // - El padre está presente en la lista actual
        // - NO es una píldora Pulse (las píldoras no se anidan, son soberanas)
        if (pod.parent_id && parentMap.has(pod.parent_id) && pod.creation_mode !== 'pulse') {
            const parent = parentMap.get(pod.parent_id)!;
            parent.replies.push(pod);
        } else {
            // Es un Podcast Raíz o una Píldora Pulse
            rootPodcasts.push(pod);
        }
    });

    // 4. Ordenamiento cronológico y cast final a la interfaz extendida
    return rootPodcasts
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) as PodcastWithGenealogy[];
}

/**
 * segmentPodcastsByType
 * Utilidad estratégica para la Biblioteca. Divide el inventario en dos canales de valor.
 */
export function segmentPodcastsByType(list: PodcastWithProfile[]) {
    return {
        // Podcasts narrativos, de aprendizaje o legado
        narrative: list.filter(p => p.creation_mode !== 'pulse'),
        // Píldoras de inteligencia estratégica
        pills: list.filter(p => p.creation_mode === 'pulse')
    };
}

/**
 * sortPodcastsByStrategicValue
 * Ordena las píldoras Pulse priorizando el Score de Autoridad (Papers > Noticias)
 * y luego la frescura del dato.
 */
export function sortPodcastsByStrategicValue(pills: PodcastWithGenealogy[]): PodcastWithGenealogy[] {
    return pills.sort((a, b) => {
        const scoreA = a.authority_score || 0;
        const scoreB = b.authority_score || 0;

        if (scoreA !== scoreB) {
            return scoreB - scoreA; // Mayor autoridad primero
        }

        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
}

/**
 * getPodcastLevelLabel
 * Traduce el expertise_level del ADN en una etiqueta legible para la UI.
 */
export function getPodcastLevelLabel(level: number): string {
    if (level >= 9) return "Experto / Científico";
    if (level >= 7) return "Avanzado / Técnico";
    if (level >= 4) return "Intermedio / Profesional";
    return "Iniciación / Divulgativo";
}