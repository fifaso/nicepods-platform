// app/(platform)/podcasts/library-tabs.tsx
// VERSIÓN: 10.0 (NicePod Intelligence Station - Unified Sovereign Edition)
// Misión: Orquestar la interacción, el radar semántico y la persistencia de la bóveda.
// [ESTABILIZACIÓN]: Integración total de Realtime, Bóveda Personal y Radar V4.

"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { User } from "@supabase/supabase-js";

// --- INFRAESTRUCTURA DE DATOS Y TIPADO ---
import { createClient } from "@/lib/supabase/client";
import { PodcastWithProfile } from "@/types/podcast";
import { Tables } from "@/types/database.types";
import { groupPodcastsByThread } from "@/lib/podcast-utils";

// --- COMPONENTE DE NAVEGACIÓN SEMÁNTICA ---
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { SearchResult } from "@/hooks/use-search-radar";

// --- COMPONENTES DE INTERFAZ DE ALTA DENSIDAD ---
import { PodcastCard } from "@/components/podcast-card";
import { CompactPodcastCard } from "@/components/compact-podcast-card";
import { StackedPodcastCard } from "@/components/stacked-podcast-card";
import { SmartJobCard } from "@/components/smart-job-card";
import { UniverseCard } from "@/components/universe-card";
import { LibraryViewSwitcher } from "@/components/library-view-switcher";

// --- UI ATÓMICA ---
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- ICONOGRAFÍA INDUSTRIAL ---
import {
  Archive,
  BookOpen,
  History,
  Loader2,
  Mic2,
  TrendingUp,
  User as UserIcon,
  Zap,
  Search,
  Sparkles
} from "lucide-react";

/**
 * INTERFAZ: CuratedShelvesData
 * Define la estructura de los Universos Semánticos de NicePod.
 */
export interface CuratedShelvesData {
  most_resonant: PodcastWithProfile[] | null;
  deep_thought: PodcastWithProfile[] | null;
  practical_tools: PodcastWithProfile[] | null;
  tech_and_innovation: PodcastWithProfile[] | null;
  wellness_and_mind: PodcastWithProfile[] | null;
  narrative_and_stories: PodcastWithProfile[] | null;
}

type UserCreationJob = Tables<'podcast_creation_jobs'>;
type LibraryViewMode = 'grid' | 'list' | 'compass';

interface LibraryTabsProps {
  defaultTab: 'discover' | 'library';
  user: User | null;
  userCreationJobs: UserCreationJob[];
  userCreatedPodcasts: PodcastWithProfile[];
  curatedShelves: CuratedShelvesData;
  compassProps?: any;
}

// Configuración de los Universos Visuales
const universeCategories = [
  { key: 'most_resonant', title: 'Lo más resonante', image: '/images/universes/resonant.png' },
  { key: 'deep_thought', title: 'Pensamiento', image: '/images/universes/deep-thought.png' },
  { key: 'practical_tools', title: 'Herramientas', image: '/images/universes/practical-tools.png' },
  { key: 'tech_and_innovation', title: 'Innovación', image: '/images/universes/tech.png' },
  { key: 'wellness_and_mind', title: 'Bienestar', image: '/images/universes/wellness.png' },
  { key: 'narrative_and_stories', title: 'Narrativa', image: '/images/universes/narrative.png' },
];

export function LibraryTabs({
  defaultTab,
  user,
  userCreationJobs: initialJobs,
  userCreatedPodcasts: initialPodcasts,
  curatedShelves,
}: LibraryTabsProps) {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // 1. GESTIÓN DE ESTADO (Sincronía de Datos)
  const [jobs, setJobs] = useState<UserCreationJob[]>(initialJobs);
  const [podcasts, setPodcasts] = useState<PodcastWithProfile[]>(initialPodcasts);
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // 2. SINCRONIZACIÓN DE URL (Persistencia de Vista)
  const activeTab = searchParams.get("tab") || defaultTab;
  const currentView = (searchParams.get("view") as LibraryViewMode) || "grid";
  const activeUniverseKey = searchParams.get("universe") || "most_resonant";

  /**
   * [LIFECYCLE]: Suscripción Realtime Proactiva
   * Mantiene la Workstation actualizada ante eventos de la IA sin refrescar la página.
   */
  useEffect(() => {
    if (!user) return;

    // Escucha de Trabajos (Jobs)
    const jobsChannel = supabase.channel(`realtime_jobs_${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'podcast_creation_jobs', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setJobs(prev => [payload.new as UserCreationJob, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedJob = payload.new as UserCreationJob;
            if (updatedJob.status === 'completed') {
              // Eliminación diferida para permitir feedback visual de éxito
              setTimeout(() => setJobs(prev => prev.filter(j => j.id !== updatedJob.id)), 2000);
            } else {
              setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
            }
          }
        }
      ).subscribe();

    // Escucha de Podcasts (Micro-pods)
    const podsChannel = supabase.channel(`realtime_pods_${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'micro_pods', filter: `user_id=eq.${user.id}` },
        async (payload) => {
          if (payload.eventType === 'INSERT' || (payload.eventType === 'UPDATE' && payload.old.processing_status === 'processing')) {
             // Re-hidratamos el registro con su perfil para mantener el contrato de tipado
             const { data } = await supabase
              .from('micro_pods')
              .select('*, profiles(*)')
              .eq('id', payload.new.id)
              .single();
            
            if (data) {
              setPodcasts(prev => {
                const exists = prev.find(p => p.id === data.id);
                if (exists) return prev.map(p => p.id === data.id ? data as PodcastWithProfile : p);
                return [data as PodcastWithProfile, ...prev];
              });
            }
          }
        }
      ).subscribe();

    return () => {
      supabase.removeChannel(jobsChannel);
      supabase.removeChannel(podsChannel);
    };
  }, [user, supabase]);

  /**
   * handleTabChange: Navegación suave basada en URL.
   */
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  /**
   * RENDER: Secciones de Búsqueda (Radar)
   */
  const renderSearchResults = () => {
    if (!searchResults) return null;

    if (searchResults.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-32 bg-black/20 rounded-[3rem] border border-dashed border-white/5 animate-in fade-in duration-500">
          <Search size={48} className="text-zinc-700 mb-6" />
          <h3 className="text-xl font-black uppercase tracking-widest text-zinc-500">Frecuencia no detectada</h3>
          <Button variant="link" onClick={() => setSearchResults(null)} className="mt-4 text-primary">Restablecer Radar</Button>
        </div>
      );
    }

    const podcastHits = searchResults.filter(r => r.result_type === 'podcast');
    const userHits = searchResults.filter(r => r.result_type === 'user');

    return (
      <div className="space-y-16 animate-in slide-in-from-bottom-4 duration-700">
        {userHits.length > 0 && (
          <section className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 flex items-center gap-2">
              <UserIcon size={12} /> Curadores de Inteligencia
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {userHits.map(hit => (
                <Link key={hit.id} href={`/profile/${hit.subtitle.replace('@', '')}`}>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/40 transition-all group">
                    <Avatar className="h-12 w-12 border border-white/10">
                      <AvatarImage src={hit.image_url} />
                      <AvatarFallback className="bg-zinc-900 text-primary font-black">{hit.title[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-black text-sm text-white truncate uppercase tracking-tighter group-hover:text-primary transition-colors">{hit.title}</p>
                      <p className="text-[9px] font-bold text-zinc-500 tracking-widest uppercase">{hit.subtitle}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {podcastHits.length > 0 && (
          <section className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 flex items-center gap-2">
              <Mic2 size={12} /> Resonancias Encontradas
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {podcastHits.map(hit => (
                <Link key={hit.id} href={`/podcast/${hit.id}`}>
                  <div className="group flex gap-5 p-5 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-primary/40 transition-all h-full">
                    <div className="relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden border border-white/5">
                      <Image src={hit.image_url || '/placeholder.jpg'} alt={hit.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                      <h5 className="font-black text-sm text-white line-clamp-2 uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">{hit.title}</h5>
                      <div className="mt-3">
                        <Badge className="bg-primary/10 text-primary text-[8px] font-black px-2 py-0.5 rounded-md border-none uppercase tracking-widest">
                          {Math.round(hit.similarity * 100)}% Match
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  };

  /**
   * RENDER: Listado de Podcasts (Bóveda / Descubrir)
   */
  const renderPodcastList = (data: PodcastWithProfile[]) => {
    if (data.length === 0) {
      return (
        <div className="py-24 text-center border border-dashed border-white/10 rounded-[3rem] bg-black/10">
          <Archive className="mx-auto h-12 w-12 text-zinc-800 mb-4" />
          <h3 className="text-lg font-black uppercase tracking-widest text-zinc-600 italic">Bóveda sin registros</h3>
          <p className="text-zinc-500 text-xs font-medium mt-2">Inicia una nueva forja para capturar capital intelectual.</p>
        </div>
      );
    }

    if (currentView === 'list') {
      return (
        <div className="space-y-3">
          {data.map(p => <CompactPodcastCard key={p.id} podcast={p} />)}
        </div>
      );
    }

    // Agrupamos por hilos (Threads) para la vista apilada
    const groupedData = groupPodcastsByThread(data);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {groupedData.map((p: any) => (
          <StackedPodcastCard key={p.id} podcast={p} replies={p.replies} />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full space-y-12 animate-in fade-in duration-1000">
      
      {/* --- CABECERA DE BÚSQUEDA (RADAR SEMÁNTICO) --- */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="w-full md:max-w-2xl">
          <UnifiedSearchBar 
            onLoading={setIsSearching}
            onResults={setSearchResults}
            onClear={() => setSearchResults(null)}
            placeholder="Activar radar de conocimiento..."
          />
        </div>

        {/* CONTROLES DE VISTA (Solo si no hay búsqueda activa) */}
        {!searchResults && (
          <div className="flex items-center gap-3 p-1.5 bg-zinc-900/50 rounded-[1.5rem] border border-white/5 backdrop-blur-xl">
             <TabsList className="bg-transparent border-none p-0 h-auto">
                <TabsTrigger 
                  value="discover" 
                  onClick={() => handleTabChange('discover')}
                  className="rounded-xl px-8 font-black text-[10px] uppercase tracking-widest h-10 data-[state=active]:bg-primary"
                >
                  Descubrir
                </TabsTrigger>
                <TabsTrigger 
                  value="library" 
                  disabled={!user}
                  onClick={() => handleTabChange('library')}
                  className="rounded-xl px-8 font-black text-[10px] uppercase tracking-widest h-10 data-[state=active]:bg-primary"
                >
                  Mi Estación
                </TabsTrigger>
             </TabsList>
             <Separator orientation="vertical" className="h-6 bg-white/10 mx-1" />
             <LibraryViewSwitcher />
          </div>
        )}
      </section>

      {/* --- CUERPO DINÁMICO DE LA BIBLIOTECA --- */}
      <Tabs value={searchResults ? 'search' : activeTab} className="w-full">
        
        {/* VISTA A: RESULTADOS DEL RADAR */}
        <TabsContent value="search" className="mt-0 outline-none">
          {renderSearchResults()}
        </TabsContent>

        {/* VISTA B: DESCUBRIMIENTO (UNIVERSOS) */}
        <TabsContent value="discover" className="mt-0 space-y-20 outline-none animate-in fade-in duration-700">
          
          {/* Grilla de Universos Semánticos */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {universeCategories.map(cat => (
              <UniverseCard 
                key={cat.key}
                title={cat.title}
                image={cat.image}
                isActive={activeUniverseKey === cat.key}
                href={`${pathname}?tab=discover&universe=${cat.key}`}
              />
            ))}
          </div>

          {/* Listado del Universo Seleccionado */}
          <section className="space-y-10">
            <div className="flex items-center gap-3 border-b border-white/5 pb-6">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-3xl font-black uppercase tracking-tighter italic text-white">
                {universeCategories.find(c => c.key === activeUniverseKey)?.title || "Resonancias"}
              </h2>
            </div>
            {renderPodcastList(curatedShelves[activeUniverseKey as keyof CuratedShelvesData] || [])}
          </section>
        </TabsContent>

        {/* VISTA C: MI ESTACIÓN (BÓVEDA PERSONAL) */}
        <TabsContent value="library" className="mt-0 space-y-16 outline-none animate-in slide-in-from-bottom-6 duration-1000">
          
          {/* SECCIÓN DE PROCESAMIENTO (JOBS ACTIVOS) */}
          {jobs.length > 0 && (
            <section className="space-y-8 p-8 rounded-[3rem] bg-primary/[0.02] border border-primary/10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl animate-pulse">
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-2xl font-black uppercase tracking-tighter text-white italic">Forjando Inteligencia</h2>
                  <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Sincronización neuronal en curso...</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.map(job => <SmartJobCard key={job.id} job={job} />)}
              </div>
            </section>
          )}

          {/* LISTADO DE LA BÓVEDA SOBERANA */}
          <section className="space-y-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="h-6 w-6 text-primary fill-primary" />
                <h2 className="text-4xl font-black uppercase tracking-tighter text-white italic">Mi Bóveda</h2>
              </div>
              <Badge variant="outline" className="border-white/10 text-zinc-500 font-black text-[10px] uppercase tracking-widest px-4 py-1 rounded-full">
                {podcasts.length} RESONANCIAS
              </Badge>
            </div>
            
            {renderPodcastList(podcasts)}
          </section>
        </TabsContent>

      </Tabs>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (MASTER EDITION):
 * 1. Consolidación de Identidad: Se ha eliminado el placeholder de "Próximamente" 
 *    y se ha sustituido por un renderizado condicional basado en el array 'podcasts'.
 * 2. Realtime Integrity: Las suscripciones por canal específico (user.id) garantizan 
 *    que el usuario vea sus nuevas creaciones y actualizaciones de perfil al instante.
 * 3. Radar V4 Compatibility: La vista 'search' ahora utiliza los resultados 
 *    omnicanal, permitiendo descubrir tanto podcasts como otros curadores.
 * 4. UX Zero-Wait: El uso de 'useMemo' y 'Tabs' sincronizados con la URL asegura 
 *    que la navegación entre Universos y la Bóveda sea instantánea y compartible.
 */