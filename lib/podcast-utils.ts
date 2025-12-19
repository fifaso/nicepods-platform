import { PodcastWithProfile } from "@/types/podcast";

// Definimos la interfaz extendida aquí para usarla globalmente
export interface PodcastWithGenealogy extends PodcastWithProfile {
    parent_id?: number | null;
    root_id?: number | null;
    replies?: PodcastWithProfile[];
}

export function groupPodcastsByThread(flatList: PodcastWithProfile[]) {
    // 1. Clonar para no mutar el array original y cast
    const list = JSON.parse(JSON.stringify(flatList)) as PodcastWithGenealogy[];
    const parentMap = new Map<number, PodcastWithGenealogy>();
    
    // 2. Primera pasada: Identificar todos los podcasts y prepararlos como potenciales padres
    list.forEach(pod => {
        // Inicializamos el array de replies si no existe
        pod.replies = [];
        parentMap.set(pod.id, pod);
    });

    // 3. Segunda pasada: Mover hijos dentro de padres
    const rootPodcasts: PodcastWithGenealogy[] = [];

    list.forEach(pod => {
        if (pod.parent_id && parentMap.has(pod.parent_id)) {
            // Es un hijo y su padre está en la lista -> Lo movemos al padre
            const parent = parentMap.get(pod.parent_id)!;
            parent.replies?.push(pod);
        } else {
            // Es un padre, o un hijo huérfano (su padre no está en esta lista) -> Se queda en la raíz
            rootPodcasts.push(pod);
        }
    });

    // 4. Ordenar: Lo más nuevo primero
    return rootPodcasts.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
}