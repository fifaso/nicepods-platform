// app/(platform)/podcasts/page.tsx
// VERSIÓN: 17.0 (NicePod Intelligence Archive - Zero-Error Production Edition)
// Misión: Orquestación síncrona de datos con validación estricta de tipos.
// [FIX]: Eliminación de compassProps y alineación total con LibraryTabsProps V11.0.

import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';

// --- ORQUESTADOR VISUAL SOBERANO ---
import { CuratedShelvesData, LibraryTabs } from './library-tabs';

/**
 * [METADATA API]: Identidad Industrial
 */
export const metadata: Metadata = {
  title: 'Archive & Intelligence | NicePod',
  description: 'Repositorio de capital intelectual y resonancias urbanas de Madrid.',
};

/**
 * COMPONENTE SSR: PodcastsPage
 * Actúa como el puente de datos de alta densidad.
 */
export default async function PodcastsPage() {
  // 1. INICIALIZACIÓN DEL CLIENTE (Handshake T0)
  const supabase = createClient();

  // 2. CAPTURA DE IDENTIDAD SOBERANA
  const { data: { user } } = await supabase.auth.getUser();

  // Definimos el contrato de Join para traer la identidad del autor
  const profileQuery = '*, profiles(full_name, avatar_url, username, reputation_score)';

  /**
   * 3. COSECHA DE INTELIGENCIA (Fase Asíncrona Paralela)
   * Fan-Out optimizado para minimizar el bloqueo del servidor.
   */
  const [
    allPublishedResult,
    userPodcastsResult,
    userJobsResult
  ] = await Promise.all([
    // HILO A: RED GLOBAL (Descubrimiento)
    supabase
      .from('micro_pods')
      .select(profileQuery)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(60),

    // HILO B: BÓVEDA PRIVADA (Soberanía del Usuario)
    user ? supabase
      .from('micro_pods')
      .select(profileQuery)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }) : Promise.resolve({ data: [] }),

    // HILO C: LA FORJA (Trabajos en Curso)
    user ? supabase
      .from('podcast_creation_jobs')
      .select('*')
      .eq('user_id', user.id)
      .neq('status', 'completed')
      .order('created_at', { ascending: false }) : Promise.resolve({ data: [] })
  ]);

  // 4. NORMALIZACIÓN DE RESULTADOS
  const allPublished = (allPublishedResult.data as any[]) || [];
  const userCreatedPodcasts = (userPodcastsResult.data as any[]) || [];
  const userCreationJobs = (userJobsResult.data as any[]) || [];

  /**
   * 5. CONSTRUCCIÓN DE UNIVERSOS (CuratedShelvesData)
   * Clasificamos el pool global en estanterías temáticas.
   */
  const curatedShelves: CuratedShelvesData = {
    most_resonant: allPublished.slice(0, 12),
    deep_thought: allPublished.filter(p =>
      p.category === 'Pensamiento' ||
      p.ai_tags?.some((t: string) => ['Filosofía', 'Análisis'].includes(t))
    ).slice(0, 8),
    practical_tools: allPublished.filter(p =>
      p.category === 'Herramientas' ||
      p.ai_tags?.some((t: string) => ['Productividad'].includes(t))
    ).slice(0, 8),
    tech_and_innovation: allPublished.filter(p =>
      p.category === 'Tecnología' ||
      p.ai_tags?.some((t: string) => ['IA', 'Digital'].includes(t))
    ).slice(0, 8),
    wellness_and_mind: allPublished.filter(p =>
      p.category === 'Bienestar'
    ).slice(0, 8),
    narrative_and_stories: allPublished.filter(p =>
      p.category === 'Narrativa' ||
      p.ai_tags?.some((t: string) => ['Madrid', 'Crónica'].includes(t))
    ).slice(0, 8)
  };

  /**
   * 6. LÓGICA DE FALLBACK
   */
  Object.keys(curatedShelves).forEach((key) => {
    const k = key as keyof CuratedShelvesData;
    if (!curatedShelves[k] || curatedShelves[k]!.length === 0) {
      curatedShelves[k] = allPublished.slice(0, 8);
    }
  });

  return (
    <main className="w-full bg-transparent min-h-screen relative z-10 selection:bg-primary/20">

      {/* 
          7. DELEGACIÓN AL ORQUESTADOR CLIENTE
          [FIX]: Se elimina 'compassProps' ya que no existe en el contrato LibraryTabsProps.
      */}
      <LibraryTabs
        defaultTab="discover"
        user={user}
        userCreationJobs={userCreationJobs}
        userCreatedPodcasts={userCreatedPodcasts}
        allPodcasts={allPublished}
        curatedShelves={curatedShelves}
      />

    </main>
  );
}