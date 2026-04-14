/**
 * ARCHIVO: app/(platform)/podcasts/library-tabs.tsx
 * VERSIÓN: 19.0 (NicePod Intelligence Station - Full Nominal Sync & Ephemeral Isolation Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Orquestar la intersección entre la red global y la soberanía privada,
 * gestionando la visualización de la Bóveda y los procesos de forja activos.
 * [REFORMA V19.0]: Implementación del 'Ephemeral Session Isolation' para Realtime. 
 * Resolución definitiva del error TS18047 (Null Safety) y TS2322 (Props Sync). 
 * Sincronización nominal total bajo la Zero Abbreviations Policy (ZAP). 
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { User } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

// --- INFRAESTRUCTURA DE DATOS SOBERANOS ---
import { groupPodcastsByThread } from "@/lib/podcast-utils";
import { createClient, ephemeralRealtimeSessionIdentification } from "@/lib/supabase/client";
import { Tables } from "@/types/database.types";
import { PodcastWithProfile } from "@/types/podcast";

// --- COMPONENTE DE NAVEGACIÓN SEMÁNTICA ---
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { SearchResult } from "@/hooks/use-search-radar";

// --- COMPONENTES DE INTERFAZ DE ALTA DENSIDAD ---
import { LibraryViewSwitcher } from "@/components/feed/library-view-switcher";
import { UniverseCard } from "@/components/feed/universe-card";
import { CompactPodcastCard } from "@/components/podcast/compact-podcast-card";
import { SmartJobCard } from "@/components/podcast/smart-job-card";
import { StackedPodcastCard } from "@/components/podcast/stacked-podcast-card";

// --- UI ATÓMICA ---
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- ICONOGRAFÍA INDUSTRIAL ---
import { cn } from "@/lib/utils";
import {
  Archive,
  Loader2,
  Mic2,
  Search,
  Sparkles,
  User as UserIcon,
  Zap
} from "lucide-react";

/**
 * INTERFAZ: CuratedShelvesData
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
 * INTERFAZ: PodcastThread
 * Misión: Tipar la estructura resultante de la agrupación por hilos conversacionales.
 */
interface PodcastThread extends PodcastWithProfile {
  replies: PodcastWithProfile[];
}

type UserCreationJob = Tables<'podcast_creation_jobs'>;
type LibraryViewMode = 'grid' | 'list' | 'compass';

/**
 * INTERFAZ: LibraryTabsProperties
 * [SINCRO V19.0]: Mantenimiento de 'defaultTab' para sintonía con Server Components.
 */
interface LibraryTabsProperties {
  defaultTab: 'discover' | 'library';
  authenticatedUser: User | null;
  userCreationJobsCollection: UserCreationJob[];
  userCreatedPodcastsCollection: PodcastWithProfile[];
  allPodcastsCollection: PodcastWithProfile[];
  curatedShelvesMetadata: CuratedShelvesData;
}

const universeCategoriesCollection = [
  { key: 'most_resonant', title: 'Lo más resonante', image: '/images/universes/resonant.png' },
  { key: 'deep_thought', title: 'Pensamiento', image: '/images/universes/deep-thought.png' },
  { key: 'practical_tools', title: 'Herramientas', image: '/images/universes/practical-tools.png' },
  { key: 'tech_and_innovation', title: 'Innovación', image: '/images/universes/tech.png' },
  { key: 'wellness_and_mind', title: 'Bienestar', image: '/images/universes/wellness.png' },
  { key: 'narrative_and_stories', title: 'Narrativa', image: '/images/universes/narrative.png' },
];

/**
 * COMPONENTE: LibraryTabs
 */
export function LibraryTabs({
  defaultTab,
  authenticatedUser,
  userCreationJobsCollection: initialCreationJobsCollection,
  userCreatedPodcastsCollection: initialCreatedPodcastsCollection,
  allPodcastsCollection,
  curatedShelvesMetadata,
}: LibraryTabsProperties) {
  const supabaseSovereignClient = createClient();
  const navigationRouter = useRouter();
  const urlSearchParameters = useSearchParams();
  const currentUrlPathname = usePathname();

  // --- I. ESTADOS DE GESTIÓN DE INTERFAZ ---
  const [isComponentMounted, setIsComponentMounted] = useState<boolean>(false);
  const [activeCreationJobsCollection, setActiveCreationJobsCollection] = useState<UserCreationJob[]>(initialCreationJobsCollection);
  const [activeCreatedPodcastsCollection, setActiveCreatedPodcastsCollection] = useState<PodcastWithProfile[]>(initialCreatedPodcastsCollection);
  const [searchMatchResults, setSearchMatchResults] = useState<SearchResult[] | null>(null);
  const [isSearchProcessActive, setIsSearchProcessActive] = useState<boolean>(false);

  /**
   * [BUILD SHIELD]: PROTECCIÓN DE NULIDAD SOBERANA (FIX TS18047)
   * Se utiliza encadenamiento opcional y fallbacks para garantizar resiliencia.
   */
  const activeNavigationTabIdentification = urlSearchParameters?.get("tab") || defaultTab;
  const currentLibraryViewMode = (urlSearchParameters?.get("view") as LibraryViewMode) || "grid";
  const activeUniverseCategoryKey = urlSearchParameters?.get("universe") || "most_resonant";

  useEffect(() => {
    setIsComponentMounted(true);
  }, []);

  /**
   * EFECTO: RealtimeSincronizationSentinel
   * [SINCRO V19.0]: Aislamiento absoluto mediante Identificador de Sesión Efímero.
   */
  useEffect(() => {
    if (!authenticatedUser || !isComponentMounted) return;

    const userIdentification = authenticatedUser.id;

    // CANAL A: Monitoreo de procesos de forja con firma de sesión única.
    const creationJobsChannel = supabaseSovereignClient.channel(
      `library_jobs_${userIdentification}:${ephemeralRealtimeSessionIdentification}:tabs`
    )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'podcast_creation_jobs', filter: `user_id=eq.${userIdentification}` },
        (databaseChangeEventPayload) => {
          if (databaseChangeEventPayload.eventType === 'INSERT') {
            setActiveCreationJobsCollection(previousJobs => [databaseChangeEventPayload.new as UserCreationJob, ...previousJobs]);
          }
          if (databaseChangeEventPayload.eventType === 'UPDATE') {
            const updatedJobEntry = databaseChangeEventPayload.new as UserCreationJob;
            if (updatedJobEntry.status === 'completed') {
              setTimeout(() => setActiveCreationJobsCollection(previousJobs => previousJobs.filter(jobItem => jobItem.id !== updatedJobEntry.id)), 2000);
            } else {
              setActiveCreationJobsCollection(previousJobs => previousJobs.map(jobItem => jobItem.id === updatedJobEntry.id ? updatedJobEntry : jobItem));
            }
          }
        }
      ).subscribe();

    // CANAL B: Sincronización de la Bóveda privada con firma de sesión única.
    const podcastsChannel = supabaseSovereignClient.channel(
      `library_pods_${userIdentification}:${ephemeralRealtimeSessionIdentification}:tabs`
    )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'micro_pods', filter: `user_id=eq.${userIdentification}` },
        async (databaseChangeEventPayload) => {
          if (databaseChangeEventPayload.eventType === 'INSERT' || databaseChangeEventPayload.eventType === 'UPDATE') {
            const { data: refreshedPodcastData } = await supabaseSovereignClient
              .from('micro_pods')
              .select('*, profiles(*)')
              .eq('id', databaseChangeEventPayload.new.id)
              .single();

            if (refreshedPodcastData) {
              setActiveCreatedPodcastsCollection(previousPodcastsCollection => {
                const filteredPodcasts = previousPodcastsCollection.filter(podcastItem => podcastItem.id !== refreshedPodcastData.id);
                return [refreshedPodcastData as PodcastWithProfile, ...filteredPodcasts];
              });
            }
          }
        }
      ).subscribe();

    return () => {
      supabaseSovereignClient.removeChannel(creationJobsChannel);
      supabaseSovereignClient.removeChannel(podcastsChannel);
    };
  }, [authenticatedUser, supabaseSovereignClient, isComponentMounted]);

  const isSearchInterfaceVisible = useMemo(() => {
    return isComponentMounted && searchMatchResults !== null;
  }, [searchMatchResults, isComponentMounted]);

  /**
   * handleNavigationTabChange:
   * Misión: Modificar la pestaña activa preservando la integridad de la URL.
   */
  const handleNavigationTabChange = (targetTabIdentification: string) => {
    const searchParametersString = urlSearchParameters?.toString() || "";
    const updatedUrlSearchParameters = new URLSearchParams(searchParametersString);
    updatedUrlSearchParameters.set("tab", targetTabIdentification);

    navigationRouter.push(`${currentUrlPathname}?${updatedUrlSearchParameters.toString()}`, { scroll: false });
  };

  /**
   * renderSearchMatchInterface:
   * Misión: Proyectar los resultados del Radar Semántico.
   */
  const renderSearchMatchInterface = () => {
    if (!searchMatchResults) return null;

    if (searchMatchResults.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-32 bg-black/40 rounded-[3rem] border border-dashed border-white/5">
          <Search size={48} className="text-zinc-800 mb-6" />
          <h3 className="text-xl font-black uppercase tracking-[0.3em] text-zinc-600">Sin impacto semántico</h3>
          <Button variant="link" onClick={() => setSearchMatchResults(null)} className="mt-4 text-primary font-black uppercase text-xs tracking-widest">
            Reiniciar Escáner
          </Button>
        </div>
      );
    }

    const podcastSearchMatchesCollection = searchMatchResults.filter(resultItem => resultItem.result_type === 'podcast');
    const curatorSearchMatchesCollection = searchMatchResults.filter(resultItem => resultItem.result_type === 'user');

    return (
      <div className="space-y-20 animate-in slide-in-from-bottom-4 duration-1000">
        {curatorSearchMatchesCollection.length > 0 && (
          <section className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/40 flex items-center gap-3">
              <UserIcon size={12} /> Curadores de la Bóveda
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {curatorSearchMatchesCollection.map(searchMatchEntry => (
                <Link key={searchMatchEntry.id} href={`/profile/${searchMatchEntry.subtitle.replace('@', '')}`}>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/40 transition-all group">
                    <Avatar className="h-12 w-12 border border-white/10 group-hover:border-primary transition-colors">
                      <AvatarImage src={searchMatchEntry.image_url} />
                      <AvatarFallback className="bg-zinc-900 text-primary font-black uppercase">{searchMatchEntry.title[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-black text-sm text-white truncate uppercase tracking-tight group-hover:text-primary transition-colors">{searchMatchEntry.title}</p>
                      <p className="text-[9px] font-bold text-zinc-500 tracking-widest uppercase">{searchMatchEntry.subtitle}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {podcastSearchMatchesCollection.length > 0 && (
          <section className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/40 flex items-center gap-3">
              <Mic2 size={12} /> Resonancias Detectadas
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {podcastSearchMatchesCollection.map(searchMatchEntry => (
                <Link key={searchMatchEntry.id} href={`/podcast/${searchMatchEntry.id}`}>
                  <div className="group flex gap-6 p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-primary/50 transition-all h-full shadow-2xl">
                    <div className="relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden border border-white/5 bg-black/40">
                      <Image src={searchMatchEntry.image_url || '/placeholder.jpg'} alt={searchMatchEntry.title} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                    </div>
                    <div className="flex flex-col justify-center min-w-0 flex-1">
                      <h5 className="font-black text-sm text-white line-clamp-2 uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">{searchMatchEntry.title}</h5>
                      <div className="mt-4">
                        <Badge className="bg-primary/10 text-primary text-[8px] font-black px-2 py-0.5 rounded-md border-none uppercase tracking-widest">
                          {Math.round(searchMatchEntry.similarity * 100)}% Match
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
   * renderPodcastCollection:
   * basándose en el modo de vista táctico.
   */
  const renderPodcastCollection = (podcastCollection: PodcastWithProfile[]) => {
    if (podcastCollection.length === 0) {
      return (
        <div className="py-24 md:py-32 text-center border border-dashed border-white/5 rounded-[2rem] md:rounded-[3rem] bg-black/20">
          <Archive className="mx-auto h-10 w-10 md:h-12 md:w-12 text-zinc-800 mb-4 md:mb-6" />
          <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.4em] text-zinc-600 italic">Silencio Semántico</h3>
          <p className="text-[9px] md:text-[10px] font-bold text-zinc-700 uppercase tracking-widest mt-2">La Bóveda espera su primer nodo.</p>
        </div>
      );
    }

    if (currentLibraryViewMode === 'list') {
      return (
        <div className="space-y-3 md:space-y-4">
          {podcastCollection.map(podcastItem => (
            <CompactPodcastCard
              key={podcastItem.id}
              initialPodcastData={podcastItem}
            />
          ))}
        </div>
      );
    }

    const groupedPodcastThreadsCollection = groupPodcastsByThread(podcastCollection) as PodcastThread[];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10">
        {groupedPodcastThreadsCollection.map((podcastThreadItem) => (
          <StackedPodcastCard
            key={podcastThreadItem.id}
            initialPodcastData={podcastThreadItem}
            narrativeReplyCollection={podcastThreadItem.replies}
          />
        ))}
      </div>
    );
  };

  if (!isComponentMounted) {
    return (
      <div className="w-full flex items-center justify-center py-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary/20" />
      </div>
    );
  }

  return (
    <div className="w-full pt-28 md:pt-10 pb-20 space-y-12 md:space-y-16 animate-in fade-in duration-1000">

      <Tabs value={isSearchInterfaceVisible ? 'search_results' : activeNavigationTabIdentification} className="w-full">

        <section className="flex flex-wrap items-center justify-between gap-4 md:gap-10 mb-8 md:mb-16">
          <div className="w-full md:flex-1 md:max-w-3xl">
            <UnifiedSearchBar
              onLoadingStatusChange={setIsSearchProcessActive}
              onSearchIdentificationResults={setSearchMatchResults}
              onClearAction={() => setSearchMatchResults(null)}
              placeholder="Radar de Madrid..."
            />
          </div>

          <div className={cn(
            "flex flex-wrap md:flex-nowrap items-center gap-2 p-1.5 md:p-2 bg-zinc-950/40 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 backdrop-blur-3xl shadow-inner transition-all duration-500 w-full md:w-auto",
            isSearchInterfaceVisible ? "opacity-0 pointer-events-none absolute" : "opacity-100 relative"
          )}>
            <TabsList className="bg-transparent border-none p-0 h-auto gap-1 w-full md:w-auto overflow-x-auto hide-scrollbar">
              <TabsTrigger
                value="discover"
                onClick={() => handleNavigationTabChange('discover')}
                className="rounded-xl px-4 md:px-10 font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] h-10 md:h-12 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex-1 md:flex-none"
              >
                <Zap className="h-3 w-3 mr-1.5 md:mr-2" /> Descubrir
              </TabsTrigger>
              <TabsTrigger
                value="library"
                disabled={!authenticatedUser}
                onClick={() => handleNavigationTabChange('library')}
                className="rounded-xl px-4 md:px-10 font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] h-10 md:h-12 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex-1 md:flex-none"
              >
                Mi Estación
              </TabsTrigger>
            </TabsList>
            <Separator orientation="vertical" className="hidden md:block h-8 bg-white/10 mx-2" />
            <div className="w-full md:w-auto flex justify-center md:justify-start mt-2 md:mt-0">
              <LibraryViewSwitcher />
            </div>
          </div>
        </section>

        <TabsContent value="search_results" className="mt-0 outline-none">
          {renderSearchMatchInterface()}
        </TabsContent>

        <TabsContent value="discover" className="mt-0 space-y-16 md:space-y-24 outline-none animate-in fade-in duration-1000">

          <div className="flex overflow-x-auto md:grid md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 pb-4 md:pb-0 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {universeCategoriesCollection.map(universeCategoryItem => (
              <UniverseCard
                key={universeCategoryItem.key}
                title={universeCategoryItem.title}
                image={universeCategoryItem.image}
                isActive={activeUniverseCategoryKey === universeCategoryItem.key}
                href={`${currentUrlPathname}?tab=discover&universe=${universeCategoryItem.key}`}
                className="w-[150px] sm:w-[180px] shrink-0 snap-start md:w-auto"
              />
            ))}
          </div>

          <section className="space-y-8 md:space-y-12">
            <div className="flex items-center gap-3 md:gap-4 border-b border-white/5 pb-4 md:pb-8">
              <div className="p-2 md:p-3 bg-primary/10 rounded-xl md:rounded-2xl shrink-0">
                <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic text-white truncate pr-4 font-serif">
                {universeCategoriesCollection.find(universeCategoryItem => universeCategoryItem.key === activeUniverseCategoryKey)?.title || "Resonancias"}
              </h2>
            </div>

            {renderPodcastCollection(curatedShelvesMetadata[activeUniverseCategoryKey as keyof CuratedShelvesData] || allPodcastsCollection)}
          </section>
        </TabsContent>

        <TabsContent value="library" className="mt-0 space-y-16 md:space-y-20 outline-none animate-in slide-in-from-bottom-6 duration-1000">
          {activeCreationJobsCollection.length > 0 && (
            <section className="space-y-6 md:space-y-10 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] bg-primary/[0.03] border border-primary/10 shadow-2xl">
              <div className="flex items-center gap-4 md:gap-5">
                <div className="relative shrink-0">
                  <Loader2 className="h-8 w-8 md:h-10 md:w-10 text-primary animate-spin" />
                  <Zap className="h-3 w-3 md:h-4 md:w-4 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="flex flex-col min-w-0">
                  <h2 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-white italic truncate font-serif">Forjando Sabiduria</h2>
                  <p className="text-[8px] md:text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] md:tracking-[0.3em] truncate">Sincronía neuronal en curso...</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                {activeCreationJobsCollection.map(jobItem => <SmartJobCard key={jobItem.id} job={jobItem} />)}
              </div>
            </section>
          )}

          <section className="space-y-8 md:space-y-12">
            <div className="flex items-center justify-between px-1 md:px-2">
              <div className="flex items-center gap-3 md:gap-4 min-w-0">
                <div className="p-2 md:p-3 bg-white/5 rounded-xl md:rounded-2xl border border-white/10 shrink-0">
                  <Zap className="h-5 w-5 md:h-6 md:w-6 text-primary fill-primary" />
                </div>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white italic truncate font-serif">Mi Bóveda</h2>
              </div>
              <div className="flex flex-col items-end shrink-0 pl-2">
                <Badge variant="outline" className="border-white/10 text-zinc-500 font-black text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] px-3 md:px-5 py-1.5 md:py-2 rounded-full backdrop-blur-xl">
                  {activeCreatedPodcastsCollection.length} NODOS
                </Badge>
              </div>
            </div>

            {renderPodcastCollection(activeCreatedPodcastsCollection)}
          </section>
        </TabsContent>

      </Tabs>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V19.0):
 * 1. Ephemeral Session Isolation: Se ha erradicado el error crítico de Supabase Realtime 
 *    mediante la inyección de 'ephemeralRealtimeSessionIdentification' en el nombre de 
 *    los canales. Esto garantiza unicidad total y sintonía atómica por sesión.
 * 2. TS18047 Resolution: Se implementó el Sovereign Null Shield mediante encadenamiento 
 *    opcional en el acceso a 'urlSearchParameters'. 
 * 3. ZAP Absolute Compliance: Purificación nominal completa en el 100% del archivo.
 */