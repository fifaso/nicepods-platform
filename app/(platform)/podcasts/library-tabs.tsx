/**
 * ARCHIVO: app/(platform)/podcasts/library-tabs.tsx
 * VERSIÓN: 15.0 (NicePod Intelligence Station - Pure Integrity & Nominal Sovereignty)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Orquestar la intersección entre la red global y la soberanía privada.
 * [REFORMA V15.0]: Sincronización nominal con UnifiedSearchBar V6.0 y 
 * cumplimiento absoluto de la Zero Abbreviations Policy.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { User } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

// --- INFRAESTRUCTURA DE DATOS ---
import { groupPodcastsByThread } from "@/lib/podcast-utils";
import { createClient } from "@/lib/supabase/client";
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

type UserCreationJob = Tables<'podcast_creation_jobs'>;
type LibraryViewMode = 'grid' | 'list' | 'compass';

interface LibraryTabsProperties {
  defaultTab: 'discover' | 'library';
  authenticatedUser: User | null;
  userCreationJobs: UserCreationJob[];
  userCreatedPodcasts: PodcastWithProfile[];
  allPodcasts: PodcastWithProfile[];
  curatedShelves: CuratedShelvesData;
}

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
  authenticatedUser,
  userCreationJobs: initialCreationJobs,
  userCreatedPodcasts: initialCreatedPodcasts,
  allPodcasts,
  curatedShelves,
}: LibraryTabsProperties) {
  const supabaseClient = createClient();
  const navigationRouter = useRouter();
  const urlSearchParameters = useSearchParams();
  const currentPathname = usePathname();

  const [isComponentMounted, setIsComponentMounted] = useState(false);
  const [creationJobs, setCreationJobs] = useState<UserCreationJob[]>(initialCreationJobs);
  const [createdPodcasts, setCreatedPodcasts] = useState<PodcastWithProfile[]>(initialCreatedPodcasts);
  const [searchMatchResults, setSearchMatchResults] = useState<SearchResult[] | null>(null);
  const [isSearchProcessActive, setIsSearchProcessActive] = useState<boolean>(false);

  const activeNavigationTab = urlSearchParameters.get("tab") || defaultTab;
  const currentLibraryViewMode = (urlSearchParameters.get("view") as LibraryViewMode) || "grid";
  const activeUniverseCategoryKey = urlSearchParameters.get("universe") || "most_resonant";

  useEffect(() => {
    setIsComponentMounted(true);
  }, []);

  /**
   * EFECTO: RealtimeSynchronizationSentinel
   * Misión: Mantener la integridad de la Bóveda sincronizada con el Metal.
   */
  useEffect(() => {
    if (!authenticatedUser || !isComponentMounted) return;

    const userIdentification = authenticatedUser.id;

    const creationJobsChannel = supabaseClient.channel(`library_jobs_${userIdentification}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'podcast_creation_jobs', filter: `user_id=eq.${userIdentification}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCreationJobs(previousJobs => [payload.new as UserCreationJob, ...previousJobs]);
          }
          if (payload.eventType === 'UPDATE') {
            const updatedJob = payload.new as UserCreationJob;
            if (updatedJob.status === 'completed') {
              setTimeout(() => setCreationJobs(previousJobs => previousJobs.filter(jobItem => jobItem.id !== updatedJob.id)), 2000);
            } else {
              setCreationJobs(previousJobs => previousJobs.map(jobItem => jobItem.id === updatedJob.id ? updatedJob : jobItem));
            }
          }
        }
      ).subscribe();

    const podcastsChannel = supabaseClient.channel(`library_pods_${userIdentification}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'micro_pods', filter: `user_id=eq.${userIdentification}` },
        async (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const { data: refreshedPodcast } = await supabaseClient
              .from('micro_pods')
              .select('*, profiles(*)')
              .eq('id', payload.new.id)
              .single();

            if (refreshedPodcast) {
              setCreatedPodcasts(previousPodcasts => {
                const filteredPodcasts = previousPodcasts.filter(podcastItem => podcastItem.id !== refreshedPodcast.id);
                return [refreshedPodcast as PodcastWithProfile, ...filteredPodcasts];
              });
            }
          }
        }
      ).subscribe();

    return () => {
      supabaseClient.removeChannel(creationJobsChannel);
      supabaseClient.removeChannel(podcastsChannel);
    };
  }, [authenticatedUser, supabaseClient, isComponentMounted]);

  const isSearchInterfaceVisible = useMemo(() => {
    return isComponentMounted && searchMatchResults !== null;
  }, [searchMatchResults, isComponentMounted]);

  const handleNavigationTabChange = (targetValue: string) => {
    const updatedParameters = new URLSearchParams(urlSearchParameters.toString());
    updatedParameters.set("tab", targetValue);
    navigationRouter.push(`${currentPathname}?${updatedParameters.toString()}`, { scroll: false });
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

    const podcastSearchMatches = searchMatchResults.filter(resultItem => resultItem.result_type === 'podcast');
    const curatorSearchMatches = searchMatchResults.filter(resultItem => resultItem.result_type === 'user');

    return (
      <div className="space-y-20 animate-in slide-in-from-bottom-4 duration-1000">
        {curatorSearchMatches.length > 0 && (
          <section className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/40 flex items-center gap-3">
              <UserIcon size={12} /> Curadores de la Bóveda
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {curatorSearchMatches.map(searchMatch => (
                <Link key={searchMatch.id} href={`/profile/${searchMatch.subtitle.replace('@', '')}`}>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/40 transition-all group">
                    <Avatar className="h-12 w-12 border border-white/10 group-hover:border-primary transition-colors">
                      <AvatarImage src={searchMatch.image_url} />
                      <AvatarFallback className="bg-zinc-900 text-primary font-black uppercase">{searchMatch.title[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-black text-sm text-white truncate uppercase tracking-tight group-hover:text-primary transition-colors">{searchMatch.title}</p>
                      <p className="text-[9px] font-bold text-zinc-500 tracking-widest uppercase">{searchMatch.subtitle}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {podcastSearchMatches.length > 0 && (
          <section className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/40 flex items-center gap-3">
              <Mic2 size={12} /> Resonancias Detectadas
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {podcastSearchMatches.map(searchMatch => (
                <Link key={searchMatch.id} href={`/podcast/${searchMatch.id}`}>
                  <div className="group flex gap-6 p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-primary/50 transition-all h-full shadow-2xl">
                    <div className="relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden border border-white/5 bg-black/40">
                      <Image src={searchMatch.image_url || '/placeholder.jpg'} alt={searchMatch.title} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                    </div>
                    <div className="flex flex-col justify-center min-w-0 flex-1">
                      <h5 className="font-black text-sm text-white line-clamp-2 uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">{searchMatch.title}</h5>
                      <div className="mt-4">
                        <Badge className="bg-primary/10 text-primary text-[8px] font-black px-2 py-0.5 rounded-md border-none uppercase tracking-widest">
                          {Math.round(searchMatch.similarity * 100)}% Match
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
   * Misión: Visualizar el set de crónicas según el modo de vista activo.
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
          {podcastCollection.map(podcastItem => <CompactPodcastCard key={podcastItem.id} podcast={podcastItem} />)}
        </div>
      );
    }

    const groupedPodcastThreads = groupPodcastsByThread(podcastCollection);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10">
        {groupedPodcastThreads.map((podcastThread: any) => (
          <StackedPodcastCard key={podcastThread.id} podcast={podcastThread} replies={podcastThread.replies} />
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

      <Tabs value={isSearchInterfaceVisible ? 'search_results' : activeNavigationTab} className="w-full">

        {/* ÁREA DE COMANDO AXIAL (Búsqueda y Pestañas) */}
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
            {universeCategories.map(universeCategory => (
              <UniverseCard
                key={universeCategory.key}
                title={universeCategory.title}
                image={universeCategory.image}
                isActive={activeUniverseCategoryKey === universeCategory.key}
                href={`${currentPathname}?tab=discover&universe=${universeCategory.key}`}
                className="w-[150px] sm:w-[180px] shrink-0 snap-start md:w-auto"
              />
            ))}
          </div>

          <section className="space-y-8 md:space-y-12">
            <div className="flex items-center gap-3 md:gap-4 border-b border-white/5 pb-4 md:pb-8">
              <div className="p-2 md:p-3 bg-primary/10 rounded-xl md:rounded-2xl shrink-0">
                <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic text-white truncate pr-4">
                {universeCategories.find(universeCategory => universeCategory.key === activeUniverseCategoryKey)?.title || "Resonancias"}
              </h2>
            </div>

            {renderPodcastCollection(curatedShelves[activeUniverseCategoryKey as keyof CuratedShelvesData] || allPodcasts)}
          </section>
        </TabsContent>

        <TabsContent value="library" className="mt-0 space-y-16 md:space-y-20 outline-none animate-in slide-in-from-bottom-6 duration-1000">
          {creationJobs.length > 0 && (
            <section className="space-y-6 md:space-y-10 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] bg-primary/[0.03] border border-primary/10 shadow-2xl">
              <div className="flex items-center gap-4 md:gap-5">
                <div className="relative shrink-0">
                  <Loader2 className="h-8 w-8 md:h-10 md:w-10 text-primary animate-spin" />
                  <Zap className="h-3 w-3 md:h-4 md:w-4 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="flex flex-col min-w-0">
                  <h2 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-white italic truncate">Forjando Sabiduría</h2>
                  <p className="text-[8px] md:text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] md:tracking-[0.3em] truncate">Sincronía neuronal en curso...</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                {creationJobs.map(jobItem => <SmartJobCard key={jobItem.id} job={jobItem} />)}
              </div>
            </section>
          )}

          <section className="space-y-8 md:space-y-12">
            <div className="flex items-center justify-between px-1 md:px-2">
              <div className="flex items-center gap-3 md:gap-4 min-w-0">
                <div className="p-2 md:p-3 bg-white/5 rounded-xl md:rounded-2xl border border-white/10 shrink-0">
                  <Zap className="h-5 w-5 md:h-6 md:w-6 text-primary fill-primary" />
                </div>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white italic truncate">Mi Bóveda</h2>
              </div>
              <div className="flex flex-col items-end shrink-0 pl-2">
                <Badge variant="outline" className="border-white/10 text-zinc-500 font-black text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] px-3 md:px-5 py-1.5 md:py-2 rounded-full backdrop-blur-xl">
                  {createdPodcasts.length} NODOS
                </Badge>
              </div>
            </div>

            {renderPodcastCollection(createdPodcasts)}
          </section>
        </TabsContent>

      </Tabs>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V15.0):
 * 1. Zero Abbreviations Policy: Se han erradicado más de 30 abreviaturas legacy 
 *    sustituyéndolas por sus descriptores técnicos completos (jobItem, searchMatch, etc.).
 * 2. Contract Alignment: Las propiedades del UnifiedSearchBar han sido actualizadas 
 *    para cumplir con la firma: onLoadingStatusChange, onSearchIdentificationResults.
 * 3. Real-time Integrity: Se utiliza 'refreshedPodcast' y 'userIdentification' 
 *    para garantizar que las suscripciones a la base de datos no posean ambigüedad nominal.
 */