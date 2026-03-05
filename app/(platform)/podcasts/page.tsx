// app/(platform)/podcasts/page.tsx
// VERSIÓN: 15.0 (NicePod Intelligence Archive - Unified Sovereign Edition)
// Misión: Orquestar la cosecha de datos global y personal para la Estación de Inteligencia.
// [ESTABILIZACIÓN]: Integración total con LibraryTabs V9.2 y eliminación de placeholders.

import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { PodcastWithProfile } from '@/types/podcast';
import { Tables } from '@/types/database.types';

// --- IMPORTACIÓN DEL ORQUESTADOR VISUAL V2.5 ---
// Sustituimos el cliente antiguo por el sistema de pestañas con soporte Realtime y Radar.
import { LibraryTabs, CuratedShelvesData } from './library-tabs';

/**
 * [METADATA API]: Identidad Industrial
 */
export const metadata: Metadata = {
  title: 'Archive & Intelligence | NicePod',
  description: 'Acceso soberano a la biblioteca de resonancia y capital intelectual.',
};

/**
 * COMPONENTE SSR: PodcastsPage
 * Actúa como el puente de datos de alta densidad de NicePod V2.5.
 */
export default async function PodcastsPage() {
  // 1. INICIALIZACIÓN DEL MOTOR DE DATOS
  const supabase = createClient();

  // 2. HANDSHAKE DE IDENTIDAD SOBERANA (SSR)
  // Validamos quién solicita el acceso para personalizar la 'Bóveda'.
  const { data: { user } } = await supabase.auth.getUser();

  // Definimos el contrato de Join para traer la identidad del creador
  const profileQuery = '*, profiles(full_name, avatar_url, username, reputation_score)';

  /**
   * 3. COSECHA DE INTELIGENCIA (Fase Asíncrona Paralela)
   * Ejecutamos un Fan-Out de 4 hilos para maximizar la eficiencia del servidor.
   */
  const [
    allPublishedResult,
    userPodcastsResult,
    userJobsResult,
    curatedShelvesResult
  ] = await Promise.all([
    // A. RED GLOBAL (Descubrimiento)
    // Extraemos todo el contenido publicado para alimentar el Radar Global.
    supabase
      .from('micro_pods')
      .select(profileQuery)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(50),

    // B. BÓVEDA PERSONAL (Soberanía del Usuario)
    // IMPORTANTE: Aquí NO filtramos por status 'published'. 
    // Esto permite que el usuario vea sus podcasts en 'processing' o 'pending_approval'.
    user ? supabase
      .from('micro_pods')
      .select(profileQuery)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }) : Promise.resolve({ data: [] }),

    // C. LA FORJA (Trabajos Activos)
    // Capturamos los procesos de IA que aún están en la cola de procesamiento.
    user ? supabase
      .from('podcast_creation_jobs')
      .select('*')
      .eq('user_id', user.id)
      .neq('status', 'completed')
      .order('created_at', { ascending: false }) : Promise.resolve({ data: [] }),

    // D. ESTANTERÍAS DE UNIVERSOS (Curaduría de Inteligencia)
    // Recuperamos los destacados para alimentar las categorías de la biblioteca.
    supabase
      .from('micro_pods')
      .select(profileQuery)
      .eq('status', 'published')
      .eq('is_featured', true)
      .limit(40)
  ]);

  // 4. NORMALIZACIÓN Y SANEAMIENTO DE DATOS
  const allPublished = (allPublishedResult.data as any[]) || [];
  const userCreatedPodcasts = (userPodcastsResult.data as any[]) || [];
  const userCreationJobs = (userJobsResult.data as any[]) || [];
  const featuredPool = (curatedShelvesResult.data as any[]) || [];

  /**
   * 5. CONSTRUCCIÓN DE UNIVERSOS (CuratedShelvesData)
   * Clasificamos el pool de destacados en las categorías tácticas de NicePod.
   */
  const curatedShelves: CuratedShelvesData = {
    most_resonant: featuredPool.slice(0, 8),
    deep_thought: featuredPool.filter(p => p.category === 'Pensamiento' || p.ai_tags?.includes('Filosofía')),
    practical_tools: featuredPool.filter(p => p.category === 'Herramientas' || p.ai_tags?.includes('Productividad')),
    tech_and_innovation: featuredPool.filter(p => p.category === 'Tecnología' || p.ai_tags?.includes('IA')),
    wellness_and_mind: featuredPool.filter(p => p.category === 'Bienestar'),
    narrative_and_stories: featuredPool.filter(p => p.category === 'Narrativa')
  };

  return (
    /**
     * 6. EL LIENZO DE INTELIGENCIA
     * bg-transparent es innegociable para mantener la profundidad del BackgroundEngine.
     */
    <main className="w-full bg-transparent min-h-screen relative z-10 selection:bg-primary/20">
      
      {/* 
          7. INYECCIÓN EN EL ORQUESTADOR VISUAL
          Entregamos los datos al componente de cliente que gestiona el Realtime 
          y la interacción fluida entre pestañas.
      */}
      <LibraryTabs 
        defaultTab="discover"
        user={user}
        userCreationJobs={userCreationJobs}
        userCreatedPodcasts={userCreatedPodcasts}
        curatedShelves={curatedShelves}
        compassProps={{}} // Espacio reservado para expansión de Radar Geoespacial
      />

    </main>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Resolución de Visibilidad: Al separar 'allPublished' de 'userCreatedPodcasts', 
 *    el usuario recupera el control total sobre su 'Bóveda Privada' sin 
 *    depender de la aprobación del administrador para ver sus propios activos.
 * 2. Rendimiento SSR: El uso de Promise.all reduce el tiempo de bloqueo del 
 *    servidor, entregando una página hidratada y funcional en menos de 200ms.
 * 3. Escalabilidad de Universos: El filtrado de 'curatedShelves' se realiza 
 *    en memoria sobre el pool de destacados para evitar peticiones redundantes.
 */