// app/podcasts/page.tsx
// VERSIÓN: 11.0

import { createClient } from '@/lib/supabase/server';
import { PodcastWithProfile } from '@/types/podcast';
import type { Tables } from '@/types/supabase';
import { Metadata } from 'next';
import { Suspense } from 'react';

// --- INFRAESTRUCTURA DE COMPONENTES ---
import { Sparkles } from 'lucide-react';
import { LibraryTabs } from './library-tabs';

/**
 * [TYPES]: Definiciones de integridad para el ecosistema de la biblioteca.
 */
type ResonanceProfile = Tables<'user_resonance_profiles'>;
type LibraryViewMode = 'grid' | 'list' | 'compass';

/**
 * INTERFAZ: CuratedShelvesData
 * Define el contrato para los 6 universos de conocimiento de NicePod V2.5.
 */
export interface CuratedShelvesData {
  most_resonant: PodcastWithProfile[] | null;
  deep_thought: PodcastWithProfile[] | null;
  practical_tools: PodcastWithProfile[] | null;
  tech_and_innovation: PodcastWithProfile[] | null;
  wellness_and_mind: PodcastWithProfile[] | null;
  narrative_and_stories: PodcastWithProfile[] | null;
}

/**
 * [METADATA]: Motor de Autoridad y SEO
 * Proyecta la identidad del archivo hacia la red global.
 */
export const metadata: Metadata = {
  title: 'Intelligence Archive | NicePod Discovery Center',
  description: 'Explora la bóveda de sabiduría colectiva de Madrid. Crónicas de voz neuronales en alta densidad.',
  openGraph: {
    title: 'NicePod Discovery Center',
    description: 'Navega por la resonancia semántica de la ciudad.',
    type: 'website',
  }
};

/**
 * INTERFAZ: PodcastsPageProps
 * Parámetros de ruta y búsqueda sincronizados con la URL.
 */
interface PodcastsPageProps {
  searchParams: {
    tab?: string;
    view?: LibraryViewMode;
    limit?: string;
    universe?: string;
  };
}

/**
 * COMPONENTE: PodcastsPage (Server Component)
 * El orquestador soberano del Centro de Descubrimiento.
 */
export default async function PodcastsPage({ searchParams }: PodcastsPageProps) {
  const supabase = createClient();

  // 1. HANDSHAKE DE IDENTIDAD (T0)
  // Identificamos al curador para personalizar su frecuencia de descubrimiento.
  const { data: { user } } = await supabase.auth.getUser();

  // 2. NORMALIZACIÓN DE PARÁMETROS TÁCTICOS
  const currentTab = (searchParams.tab === 'library' || searchParams.tab === 'discover')
    ? searchParams.tab
    : 'discover';
  const currentView = searchParams.view || 'grid';
  const limit = parseInt(searchParams.limit || '12', 10);

  // Query de enriquecimiento para perfiles vinculados
  const profileQuery = '*, profiles(full_name, avatar_url, username, reputation_score, is_verified)';

  /**
   * 3. COSECHA DE INTELIGENCIA CONCURRENTE
   * Ejecutamos todas las consultas en paralelo para minimizar el Time To First Byte (TTFB).
   */
  const [
    userPodcastsResult,
    userCreationJobsResult,
    curatedShelvesResult
  ] = await Promise.all([
    // A. Podcasts Propios: La voz del curador activo.
    user
      ? supabase.from('micro_pods')
        .select(profileQuery)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      : Promise.resolve({ data: [], error: null }),

    // B. Forja en curso: Tareas asíncronas de IA.
    user
      ? supabase.from('podcast_creation_jobs')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'processing'])
        .eq('archived', false)
        .order('created_at', { ascending: false })
      : Promise.resolve({ data: [], error: null }),

    // C. Estanterías Curadas (NKV): Inteligencia colectiva por universos.
    user
      ? supabase.rpc('get_curated_library_shelves', { p_user_id: user.id })
      : supabase.rpc('get_generic_library_shelves')
  ]);

  // 4. NORMALIZACIÓN DE RESULTADOS
  const userCreatedPodcasts: PodcastWithProfile[] = (userPodcastsResult.data as any[]) || [];
  const userCreationJobs = (userCreationJobsResult.data as any[]) || [];
  const curatedShelves: CuratedShelvesData | null = curatedShelvesResult.data;

  // Lógica de auditoría en caso de fallo de Bóveda
  if (curatedShelvesResult.error) {
    console.error("🔥 [PodcastsPage] Error en Bóveda NKV:", curatedShelvesResult.error.message);
  }

  /**
   * 5. LÓGICA DEL COMPÁS DE RESONANCIA
   * Si la vista es 'compass', pre-calculamos los nodos semánticos para el cliente.
   */
  let compassProps = null;
  if (currentView === 'compass') {
    let userCenterPoint = '(0,0)';

    if (user) {
      const { data: resonanceData } = await supabase
        .from('user_resonance_profiles')
        .select('current_center')
        .eq('user_id', user.id)
        .maybeSingle();

      if (resonanceData?.current_center) {
        userCenterPoint = resonanceData.current_center as any;
      }
    }

    // Obtenemos los podcasts más cercanos al centro de gravedad del usuario.
    const { data: resonantPodcasts } = await supabase.rpc('get_resonant_podcasts', {
      center_point: userCenterPoint,
      count_limit: limit
    });

    const podcastIds = resonantPodcasts?.map((p: any) => p.id) || [];
    let podcastsWithProfiles: PodcastWithProfile[] = [];

    if (podcastIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('micro_pods')
        .select(profileQuery)
        .in('id', podcastIds);
      podcastsWithProfiles = (profilesData as any[]) || [];
    }

    compassProps = {
      podcasts: podcastsWithProfiles,
      userCenter: userCenterPoint
    };
  }

  return (
    <main className="container mx-auto max-w-screen-xl min-h-screen py-10 md:py-20 px-4 md:px-8 selection:bg-primary/20">

      {/* 
          I. CABECERA INSTITUCIONAL 
          Renderizada instantáneamente para un LCP perfecto.
      */}
      <header className="mb-16 space-y-4 animate-in fade-in duration-700">
        <div className="flex items-center justify-center gap-3 text-primary/40">
          <Sparkles size={16} />
          <span className="text-[10px] font-black uppercase tracking-[0.5em]">Archivo Central</span>
          <Sparkles size={16} />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase italic leading-none">
            Centro de <span className="text-primary not-italic">Descubrimiento</span>
          </h1>
          <p className="text-sm md:text-base text-zinc-500 font-medium max-w-2xl mx-auto tracking-tight">
            Accede a la sabiduría colectiva de Madrid mediante experiencias de audio neuronales de alta densidad.
          </p>
        </div>
      </header>

      {/* 
          II. ÁREA DE NAVEGACIÓN Y CONTENIDO (DYNAMICO)
          Utilizamos Suspense para permitir que el 'Shell' cargue mientras la data pesada fluye.
      */}
      <Suspense fallback={<LibrarySkeleton />}>
        <LibraryTabs
          defaultTab={currentTab as 'discover' | 'library'}
          user={user}
          userCreatedPodcasts={userCreatedPodcasts}
          userCreationJobs={userCreationJobs}
          compassProps={compassProps}
          curatedShelves={curatedShelves}
        />
      </Suspense>

    </main>
  );
}

/**
 * COMPONENTE: LibrarySkeleton
 * El estado de espera de alta fidelidad.
 */
function LibrarySkeleton() {
  return (
    <div className="w-full space-y-12 animate-pulse">
      <div className="h-16 w-full bg-white/[0.02] border border-white/5 rounded-2xl" />
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-40 bg-white/[0.01] rounded-3xl" />
        ))}
      </div>
      <div className="space-y-6">
        <div className="h-8 w-48 bg-white/[0.03] rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-white/[0.01] rounded-[2.5rem]" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Arquitectura de Streaming: El uso de Suspense rodeando a 'LibraryTabs' es 
 *    el estándar de oro para aplicaciones de alta densidad. El usuario nunca 
 *    ve una página en blanco; ve la jerarquía de NicePod inmediatamente.
 * 2. Rendimiento (ttfb): Al centralizar los 'Promise.all' en el servidor, 
 *    reducimos la latencia de red del cliente, entregando un objeto de datos 
 *    completo y tipado.
 * 3. Escalabilidad: La interfaz 'CuratedShelvesData' está preparada para 
 *    crecer. Si mañana añadimos un universo de 'Historia Local', solo hay 
 *    que añadir la propiedad y el RPC lo servirá automáticamente.
 */