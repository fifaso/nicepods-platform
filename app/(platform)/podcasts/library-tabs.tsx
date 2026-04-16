/**
 * ARCHIVO: app/(platform)/podcasts/library-tabs.tsx
 * VERSIÓN: 22.0 (NicePod Intelligence Station - Industrial Realtime & ZAP Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Orquestar la intersección entre la red global de conocimiento y la 
 * soberanía privada del Voyager, gestionando la Bóveda y los procesos de forja.
 * [REFORMA V22.0]: Resolución definitiva de TS2305 (SearchRadarResult sync). 
 * Sincronización absoluta de canales Realtime mediante descriptores industriales. 
 * Aplicación integral de la Zero Abbreviations Policy (ZAP).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { User } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

// --- INFRAESTRUCTURA DE DATOS SOBERANOS (METAL) ---
import { organizePodcastsByConversationThreadTopology } from "@/lib/podcast-utils";
import { 
  createClient, 
  ephemeralRealtimeSessionIdentification 
} from "@/lib/supabase/client";
import { Tables } from "@/types/database.types";
import { PodcastWithProfile } from "@/types/podcast";

// --- COMPONENTE DE NAVEGACIÓN SEMÁNTICA ---
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { SearchRadarResult } from "@/hooks/use-search-radar";

// --- COMPONENTES DE INTERFAZ DE ALTA DENSIDAD ---
import { LibraryViewSwitcher } from "@/components/feed/library-view-switcher";
import { UniverseCard } from "@/components/feed/universe-card";
import { CompactPodcastCard } from "@/components/podcast/compact-podcast-card";
import { SmartJobCard } from "@/components/podcast/smart-job-card";
import { StackedPodcastCard } from "@/components/podcast/stacked-podcast-card";

// --- UI ATÓMICA INDUSTRIAL ---
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- UTILIDADES E ICONOGRAFÍA ---
import { classNamesUtility } from "@/lib/utils";
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
 * INTERFAZ: CuratedIntelligenceShelvesDossier
 */
export interface CuratedIntelligenceShelvesDossier {
  most_resonant: PodcastWithProfile[] | null;
  deep_thought: PodcastWithProfile[] | null;
  practical_tools: PodcastWithProfile[] | null;
  tech_and_innovation: PodcastWithProfile[] | null;
  wellness_and_mind: PodcastWithProfile[] | null;
  narrative_and_stories: PodcastWithProfile[] | null;
}

/**
 * INTERFAZ: PodcastThreadStructure
 */
interface PodcastThreadStructure extends PodcastWithProfile {
  repliesCollection: PodcastWithProfile[];
}

type UserCreationJobEntry = Tables<'podcast_creation_jobs'>;
type LibraryViewModeType = 'grid' | 'list' | 'compass';

/**
 * INTERFAZ: LibraryTabsComponentProperties
 */
interface LibraryTabsComponentProperties {
  initialDefaultTabIdentification: 'discover' | 'library';
  authenticatedUser: User | null;
  userCreationJobsCollection: UserCreationJobEntry[];
  userCreatedPodcastsCollection: PodcastWithProfile[];
  allPodcastsCollection: PodcastWithProfile[];
  curatedShelvesMetadataDossier: CuratedIntelligenceShelvesDossier;
}

/**
 * UNIVERSE_CATEGORIES_CATALOG: Definición de áreas de interés semántico.
 */
const UNIVERSE_CATEGORIES_CATALOG = [
  { key: 'most_resonant', title: 'Lo más resonante', image: '/images/universes/resonant.png' },
  { key: 'deep_thought', title: 'Pensamiento Profundo', image: '/images/universes/deep-thought.png' },
  { key: 'practical_tools', title: 'Herramientas Útiles', image: '/images/universes/practical-tools.png' },
  { key: 'tech_and_innovation', title: 'Tecnología', image: '/images/universes/tech.png' },
  { key: 'wellness_and_mind', title: 'Bienestar', image: '/images/universes/wellness.png' },
  { key: 'narrative_and_stories', title: 'Narrativa Crónica', image: '/images/universes/narrative.png' },
];

/**
 * LibraryTabs: El director soberano de la Estación de Podcasts.
 */
export function LibraryTabs({
  initialDefaultTabIdentification,
  authenticatedUser,
  userCreationJobsCollection: initialCreationJobsCollection,
  userCreatedPodcastsCollection: initialCreatedPodcastsCollection,
  allPodcastsCollection,
  curatedShelvesMetadataDossier,
}: LibraryTabsComponentProperties) {
  
  const supabaseSovereignClient = createClient();
  const navigationRouter = useRouter();
  const urlSearchParameters = useSearchParams();
  const currentUrlPathname = usePathname();

  // --- I. ESTADOS DE GESTIÓN DE INTERFAZ (ZAP COMPLIANT) ---
  const [isComponentMountedStatus, setIsComponentMountedStatus] = useState<boolean>(false);
  const [activeCreationJobsCollection, setActiveCreationJobsCollection] = useState<UserCreationJobEntry[]>(initialCreationJobsCollection);
  const [activeCreatedPodcastsCollection, setActiveCreatedPodcastsCollection] = useState<PodcastWithProfile[]>(initialCreatedPodcastsCollection);
  const [searchRadarMatchResultsCollection, setSearchRadarMatchResultsCollection] = useState<SearchRadarResult[] | null>(null);
  const [isSearchProcessActiveStatus, setIsSearchProcessActiveStatus] = useState<boolean>(false);

  /**
   * [BUILD SHIELD]: SOBERANÍA DE NULIDAD
   * Blindaje mediante fallbacks para asegurar la integridad de la navegación.
   */
  const activeNavigationTabIdentification = urlSearchParameters?.get("tab") || initialDefaultTabIdentification;
  const currentLibraryViewMode = (urlSearchParameters?.get("view") as LibraryViewModeType) || "grid";
  const activeUniverseCategoryKey = urlSearchParameters?.get("universe") || "most_resonant";

  useEffect(() => {
    setIsComponentMountedStatus(true);
  }, []);

  /**
   * EFECTO: RealtimeSincronizationSentinel (Pilar 3 & 4)
   * Misión: Suscripción atómica a las Tablas Base para evitar el error de Vistas.
   */
  useEffect(() => {
    if (!authenticatedUser || !isComponentMountedStatus) return;

    const authenticatedUserIdentification = authenticatedUser.id;

    // CANAL A: Monitoreo de procesos de forja (Creation Jobs)
    const creationJobsRealtimeChannel = supabaseSovereignClient.channel(
      `jobs:${authenticatedUserIdentification}:${ephemeralRealtimeSessionIdentification}:tabs`
    )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'podcast_creation_jobs', filter: `user_id=eq.${authenticatedUserIdentification}` },
        (databaseChangeEventPayload) => {
          if (databaseChangeEventPayload.eventType === 'INSERT') {
            setActiveCreationJobsCollection(previousJobs => [databaseChangeEventPayload.new as UserCreationJobEntry, ...previousJobs]);
          }
          if (databaseChangeEventPayload.eventType === 'UPDATE') {
            const updatedJobEntry = databaseChangeEventPayload.new as UserCreationJobEntry;
            if (updatedJobEntry.status === 'completed') {
              // Delay táctico para permitir la propagación del podcast antes de remover el Job.
              setTimeout(() => setActiveCreationJobsCollection(previousJobs => previousJobs.filter(jobItem => jobItem.id !== updatedJobEntry.id)), 2500);
            } else {
              setActiveCreationJobsCollection(previousJobs => previousJobs.map(jobItem => jobItem.id === updatedJobEntry.id ? updatedJobEntry : jobItem));
            }
          }
        }
      ).subscribe();

    // CANAL B: Sincronización de la Bóveda de Podcasts
    const podcastsRealtimeChannel = supabaseSovereignClient.channel(
      `pods:${authenticatedUserIdentification}:${ephemeralRealtimeSessionIdentification}:tabs`
    )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'micro_pods', filter: `user_id=eq.${authenticatedUserIdentification}` },
        async (databaseChangeEventPayload) => {
          if (databaseChangeEventPayload.eventType === 'INSERT' || databaseChangeEventPayload.eventType === 'UPDATE') {
            const { data: refreshedPodcastDataSnapshot } = await supabaseSovereignClient
              .from('micro_pods')
              .select('*, profiles(*)')
              .eq('id', databaseChangeEventPayload.new.id)
              .single();

            if (refreshedPodcastDataSnapshot) {
              setActiveCreatedPodcastsCollection(previousPodcastsCollection => {
                const filteredPodcastsCollection = previousPodcastsCollection.filter(podcastItem => podcastItem.id !== refreshedPodcastDataSnapshot.id);
                return [refreshedPodcastDataSnapshot as PodcastWithProfile, ...filteredPodcastsCollection];
              });
            }
            navigationRouter.refresh();
          }
        }
      ).subscribe();

    return () => {
      supabaseSovereignClient.removeChannel(creationJobsRealtimeChannel);
      supabaseSovereignClient.removeChannel(podcastsRealtimeChannel);
    };
  }, [authenticatedUser, supabaseSovereignClient, isComponentMountedStatus, navigationRouter]);

  const isSearchInterfaceVisibleStatus = useMemo(() => {
    return isComponentMountedStatus && searchRadarMatchResultsCollection !== null;
  }, [searchRadarMatchResultsCollection, isComponentMountedStatus]);

  /**
   * handleNavigationTabChangeAction:
   * Misión: Modificar la pestaña activa preservando el estado de la URL.
   */
  const handleNavigationTabChangeAction = (targetTabIdentification: string) => {
    const searchParametersString = urlSearchParameters?.toString() || "";
    const updatedUrlSearchParameters = new URLSearchParams(searchParametersString);
    updatedUrlSearchParameters.set("tab", targetTabIdentification);

    navigationRouter.push(`${currentUrlPathname}?${updatedUrlSearchParameters.toString()}`, { scroll: false });
  };

  /**
   * renderSearchRadarResultsInterface:
   * Misión: Proyectar los resultados del motor de inteligencia V5.0.
   */
  const renderSearchRadarResultsInterface = () => {
    if (!searchRadarMatchResultsCollection) return null;

    if (searchRadarMatchResultsCollection.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-32 bg-black/40 rounded-[3rem] border border-dashed border-white/5 isolate">
          <Search size={48} className="text-zinc-800 mb-6" />
          <h3 className="text-xl font-black uppercase tracking-[0.3em] text-zinc-600">Sin impacto semántico</h3>
          <Button variant="link" onClick={() => setSearchRadarMatchResultsCollection(null)} className="mt-4 text-primary font-black uppercase text-xs tracking-widest">
            Reiniciar Escáner
          </Button>
        </div>
      );
    }

    const podcastSearchMatchesCollection = searchRadarMatchResultsCollection.filter(resultItem => resultItem.resultCategoryType === 'podcast');
    const curatorSearchMatchesCollection = searchRadarMatchResultsCollection.filter(resultItem => resultItem.resultCategoryType === 'user');

    return (
      <div className="space-y-20 animate-in slide-in-from-bottom-4 duration-1000 isolate">
        {curatorSearchMatchesCollection.length > 0 && (
          <section className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/40 flex items-center gap-3">
              <UserIcon size={12} /> Curadores de la Bóveda
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {curatorSearchMatchesCollection.map(searchMatchEntry => (
                <Link key={searchMatchEntry.identification} href={`/profile/${searchMatchEntry.subtitleContentText.replace('@', '')}`}>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/40 transition-all group isolate">
                    <Avatar className="h-12 w-12 border border-white/10 group-hover:border-primary transition-colors">
                      <AvatarImage src={searchMatchEntry.imageUniformResourceLocator} />
                      <AvatarFallback className="bg-zinc-900 text-primary font-black uppercase">
                          {searchMatchEntry.titleTextContent[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-black text-sm text-white truncate uppercase tracking-tight group-hover:text-primary transition-colors">
                          {searchMatchEntry.titleTextContent}
                      </p>
                      <p className="text-[9px] font-bold text-zinc-500 tracking-widest uppercase">
                          {searchMatchEntry.subtitleContentText}
                      </p>
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
                <Link key={searchMatchEntry.identification} href={`/podcast/${searchMatchEntry.identification}`}>
                  <div className="group flex gap-6 p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-primary/50 transition-all h-full shadow-2xl isolate">
                    <div className="relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden border border-white/5 bg-black/40">
                      <Image 
                        src={searchMatchEntry.imageUniformResourceLocator || '/placeholder.jpg'} 
                        alt={searchMatchEntry.titleTextContent} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-1000" 
                      />
                    </div>
                    <div className="flex flex-col justify-center min-w-0 flex-1">
                      <h5 className="font-black text-sm text-white line-clamp-2 uppercase tracking-tight leading-tight group-hover:text-primary transition-colors italic">
                          {searchMatchEntry.titleTextContent}
                      </h5>
                      <div className="mt-4">
                        <Badge className="bg-primary/10 text-primary text-[8px] font-black px-2 py-0.5 rounded-md border-none uppercase tracking-widest">
                          {Math.round(searchMatchEntry.semanticSimilarityMagnitude * 100)}% Resonancia
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
   * renderPodcastGridCollection:
   * Misión: Proyectar la malla de crónicas bajo los estándares visuales de Madrid Resonance.
   */
  const renderPodcastGridCollection = (podcastCollection: PodcastWithProfile[]) => {
    if (podcastCollection.length === 0) {
      return (
        <div className="py-24 md:py-32 text-center border border-dashed border-white/5 rounded-[3rem] bg-white/[0.01] isolate grayscale">
          <Archive className="mx-auto h-12 w-12 text-zinc-800 mb-6" />
          <h3 className="text-sm font-black uppercase tracking-[0.4em] text-zinc-600 italic">Silencio Semántico</h3>
          <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest mt-2">La Bóveda privada espera su primer nodo.</p>
        </div>
      );
    }

    if (currentLibraryViewMode === 'list') {
      return (
        <div className="space-y-4 isolate">
          {podcastCollection.map(podcastItem => (
            <CompactPodcastCard
              key={podcastItem.id}
              initialPodcastData={podcastItem}
            />
          ))}
        </div>
      );
    }

    const groupedPodcastThreadsCollection = organizePodcastsByConversationThreadTopology(podcastCollection) as PodcastThreadStructure[];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10 isolate">
        {groupedPodcastThreadsCollection.map((podcastThreadItem) => (
          <StackedPodcastCard
            key={podcastThreadItem.id}
            initialPodcastData={podcastThreadItem}
            narrativeReplyCollection={podcastThreadItem.repliesCollection}
          />
        ))}
      </div>
    );
  };

  if (!isComponentMountedStatus) {
    return (
      <div className="w-full flex items-center justify-center py-40">
        <Loader2 className="h-10 w-10 animate-spin text-primary/10" />
      </div>
    );
  }

  return (
    <div className="w-full pt-28 md:pt-10 pb-20 space-y-12 md:space-y-16 animate-in fade-in duration-1000 isolate">

      <Tabs value={isSearchInterfaceVisibleStatus ? 'search_results' : activeNavigationTabIdentification} className="w-full">

        <section className="flex flex-wrap items-center justify-between gap-4 md:gap-10 mb-8 md:mb-16">
          <div className="w-full md:flex-1 md:max-w-3xl">
            <UnifiedSearchBar
              onLoadingStatusChange={setIsSearchProcessActiveStatus}
              onSearchIdentificationResults={setSearchRadarMatchResultsCollection}
              onClearAction={() => setSearchRadarMatchResultsCollection(null)}
              placeholderText="Radar de Inteligencia Madrid..."
            />
          </div>

          <div className={classNamesUtility(
            "flex flex-wrap md:flex-nowrap items-center gap-2 p-2 bg-zinc-950/40 rounded-[2rem] border border-white/5 backdrop-blur-3xl shadow-2xl transition-all duration-500 w-full md:w-auto",
            isSearchInterfaceVisibleStatus ? "opacity-0 pointer-events-none absolute" : "opacity-100 relative"
          )}>
            <TabsList className="bg-transparent border-none p-0 h-auto gap-1 w-full md:w-auto overflow-x-auto hide-scrollbar">
              <TabsTrigger
                value="discover"
                onClick={() => handleNavigationTabChangeAction('discover')}
                className="rounded-xl px-4 md:px-10 font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] h-10 md:h-12 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex-1 md:flex-none"
              >
                <Zap className="h-3 w-3 mr-2" /> Descubrir
              </TabsTrigger>
              <TabsTrigger
                value="library"
                disabled={!authenticatedUser}
                onClick={() => handleNavigationTabChangeAction('library')}
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

        <TabsContent value="search_results" className="mt-0 outline-none isolate">
          {renderSearchRadarResultsInterface()}
        </TabsContent>

        <TabsContent value="discover" className="mt-0 space-y-16 md:space-y-24 outline-none animate-in fade-in duration-1000 isolate">

          {/* Carrusel de Universos Cognitivos */}
          <div className="flex overflow-x-auto md:grid md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 pb-6 md:pb-0 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {UNIVERSE_CATEGORIES_CATALOG.map(universeCategoryItem => (
              <UniverseCard
                key={universeCategoryItem.key}
                title={universeCategoryItem.title}
                image={universeCategoryItem.image}
                isActive={activeUniverseCategoryKey === universeCategoryItem.key}
                href={`${currentUrlPathname}?tab=discover&universe=${universeCategoryItem.key}`}
                className="w-[160px] sm:w-[190px] shrink-0 snap-start md:w-auto shadow-2xl"
              />
            ))}
          </div>

          <section className="space-y-8 md:space-y-12">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6 md:pb-10">
              <div className="p-3 bg-primary/10 rounded-2xl shrink-0 shadow-inner">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic text-white truncate font-serif">
                {UNIVERSE_CATEGORIES_CATALOG.find(categoryItem => categoryItem.key === activeUniverseCategoryKey)?.title || "Resonancias Urbanas"}
              </h2>
            </div>

            {renderPodcastGridCollection(curatedShelvesMetadataDossier[activeUniverseCategoryKey as keyof CuratedIntelligenceShelvesDossier] || allPodcastsCollection)}
          </section>
        </TabsContent>

        <TabsContent value="library" className="mt-0 space-y-16 md:space-y-20 outline-none animate-in slide-in-from-bottom-6 duration-1000 isolate">
          {/* Panel de Procesos de Forja Activos */}
          {activeCreationJobsCollection.length > 0 && (
            <section className="space-y-8 md:space-y-12 p-8 md:p-14 rounded-[3rem] md:rounded-[4rem] bg-primary/[0.02] border border-primary/10 shadow-2xl isolate">
              <div className="flex items-center gap-5">
                <div className="relative shrink-0 isolate">
                  <Loader2 className="h-10 w-10 md:h-12 md:w-12 text-primary animate-spin" />
                  <Zap className="h-4 w-4 md:h-5 md:w-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 fill-current animate-pulse" />
                </div>
                <div className="flex flex-col min-w-0">
                  <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-white italic truncate font-serif">Forjando Sabiduría</h2>
                  <p className="text-[9px] md:text-[11px] font-black text-primary/50 uppercase tracking-[0.3em] truncate">Sincronía neuronal con Madrid Resonance...</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
                {activeCreationJobsCollection.map(jobItem => <SmartJobCard key={jobItem.id} job={jobItem} />)}
              </div>
            </section>
          )}

          {/* Mi Bóveda de Podcasts Privada */}
          <section className="space-y-8 md:space-y-12">
            <div className="flex items-center justify-between px-2 isolate">
              <div className="flex items-center gap-4 min-w-0">
                <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/10 shrink-0 shadow-inner">
                  <Zap className="h-6 w-6 text-primary fill-primary animate-pulse" />
                </div>
                <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter text-white italic truncate font-serif">Mi Estación</h2>
              </div>
              <div className="flex flex-col items-end shrink-0 pl-4 isolate">
                <Badge variant="outline" className="border-white/5 text-primary font-black text-[9px] md:text-[11px] uppercase tracking-[0.4em] px-5 md:px-8 py-2 md:py-3 rounded-full bg-white/[0.02] backdrop-blur-3xl shadow-xl">
                  {activeCreatedPodcastsCollection.length} NODOS ACTIVOS
                </Badge>
              </div>
            </div>

            {renderPodcastGridCollection(activeCreatedPodcastsCollection)}
          </section>
        </TabsContent>

      </Tabs>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V22.0):
 * 1. Build Shield Absolute: Resolución definitiva de TS2305 mediante la sincronización 
 *    con 'SearchRadarResult' V5.0 y eliminación de importaciones fantasma.
 * 2. Realtime Sovereign Sync: Se mantiene el protocolo de escucha sobre tablas físicas 
 *    (Pilar 3) utilizando nombres de canal unívocos para prevenir colisiones de bus.
 * 3. Zero Abbreviations Policy (ZAP): Purificación nominal exhaustiva en interfaces, 
 *    estados e iteradores de DOM.
 * 4. MTI & UX Kinematics: El uso de 'AnimatePresence' y diferimiento táctico de remoción 
 *    de Jobs garantiza que el Hilo Principal no sufra tirones visuales (jank) tras el 
 *    completado de una crónica.
 */