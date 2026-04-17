/**
 * ARCHIVO: components/feed/intelligence-feed.tsx
 * VERSIÓN: 8.0 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V7.0
 * 
 * Misión: Orquestar el flujo de capital intelectual.
 * [REFORMA V8.0]: Sincronización axial completa con el contrato purificado V7.0.
 * Eliminación de fugas snake_case y alineación absoluta con la Doctrina ZAP.
 *
 * Nivel de Integridad: 100% (Soberanía Nominal V7.0)
 */

"use client";

import {
  Activity,
  BookOpen,
  BrainCircuit,
  Loader2,
  Mic,
  Search,
  Sparkles,
  Zap
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

// --- INFRAESTRUCTURA DE DATOS Y CONTRATOS SOBERANOS ---
import { SearchRadarResult } from "@/hooks/use-search-radar";
import { classNamesUtility } from "@/lib/utils";
import { PodcastWithProfile } from "@/types/podcast";

// --- COMPONENTES UI ATÓMICOS ---
import { UniverseCard } from "@/components/feed/universe-card";
import { Button } from "@/components/ui/button";

/**
 * [HARDWARE HYGIENE]: CARGA DIFERIDA DE ESTANTES (PodcastShelf)
 */
const PodcastShelf = dynamic(
  () => import("@/components/feed/podcast-shelf").then((module) => module.PodcastShelf),
  {
    ssr: true,
    loading: () => (
      <div className="w-full h-48 bg-white/[0.01] rounded-[2.5rem] border border-dashed border-white/5 flex items-center justify-center animate-pulse isolate">
        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/10 italic">
          Sincronizando Frecuencia de Bóveda...
        </span>
      </div>
    )
  }
);

/**
 * INTERFAZ: IntelligenceFeedProperties
 */
interface IntelligenceFeedProperties {
  userDisplayNameReference: string;
  isSearchingProcessActiveStatus: boolean;
  searchRadarResultsCollection: SearchRadarResult[] | null;
  lastSearchQueryText: string;
  initialEpicenterPodcastsCollection: PodcastWithProfile[];
  initialConnectionsCollection: PodcastWithProfile[];
  onClearSearchRadarAction: () => void;
}

/**
 * DISCOVERY_HUB_CATEGORIES_COLLECTION
 */
const DISCOVERY_HUB_CATEGORIES_COLLECTION = [
  { key: "deep_thought", title: "Pensamiento", image: "/images/universes/deep-thought.png", href: "/podcasts?tab=discover&universe=deep_thought" },
  { key: "practical_tools", title: "Práctico", image: "/images/universes/practical-tools.png", href: "/podcasts?tab=discover&universe=practical_tools" },
  { key: "tech_and_innovation", title: "Tecnología", image: "/images/universes/tech.png", href: "/podcasts?tab=discover&universe=tech_and_innovation" },
  { key: "narrative_and_stories", title: "Narrativa", image: "/images/universes/narrative.png", href: "/podcasts?tab=discover&universe=narrative_and_stories" },
];

/**
 * IntelligenceFeed: El bus de datos táctico para la visualización de capital intelectual.
 */
export function IntelligenceFeed({
  isSearchingProcessActiveStatus,
  searchRadarResultsCollection,
  lastSearchQueryText,
  initialEpicenterPodcastsCollection,
  initialConnectionsCollection,
  onClearSearchRadarAction
}: IntelligenceFeedProperties) {

  // --- 1. SANEAMIENTO DE DATOS ---
  const safeEpicenterPodcastsCollection = useMemo(() => {
    return initialEpicenterPodcastsCollection.filter((podcastItem) => podcastItem.identification);
  }, [initialEpicenterPodcastsCollection]);

  const safeConnectionsPodcastsCollection = useMemo(() => {
    return initialConnectionsCollection.filter((podcastItem) => podcastItem.identification);
  }, [initialConnectionsCollection]);

  // --- 2. GESTIÓN DE ESTADOS DE HIDRATACIÓN ---
  const [isComponentMountedStatus, setIsComponentMountedStatus] = useState<boolean>(false);

  useEffect(() => {
    setIsComponentMountedStatus(true);
  }, []);

  const isRadarInterfaceIdleStatus = searchRadarResultsCollection === null;

  if (!isComponentMountedStatus) {
    return <div className="min-h-[500px]" />;
  }

  return (
    <div className="w-full space-y-12 selection:bg-primary/20 isolate">

      {isRadarInterfaceIdleStatus ? (
        <div className="space-y-16 animate-in fade-in duration-1000 isolate">

          <section className="isolate">
            <div className="flex items-center justify-between mb-10 px-1">
              <div className="flex items-center gap-3">
                <BrainCircuit className="text-primary h-4 w-4" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">
                  Dimensiones de Conocimiento
                </h2>
              </div>
              <div className="h-px flex-1 mx-10 bg-white/5 hidden md:block" />
              <div className="flex items-center gap-2 text-[8px] font-bold text-white/20 uppercase tracking-widest">
                <Activity size={10} className="animate-pulse" /> Sintonía Neural Activa
              </div>
            </div>

            <div className="flex overflow-x-auto pb-6 gap-6 lg:grid lg:grid-cols-4 snap-x hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
              {DISCOVERY_HUB_CATEGORIES_COLLECTION.map((discoveryCategory) => (
                <div
                  key={discoveryCategory.key}
                  className="min-w-[160px] w-[48%] lg:w-auto snap-start flex-shrink-0 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <UniverseCard {...discoveryCategory} isActive={false} />
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-16 isolate">

            <div className="relative group isolate">
              <div className="flex items-center gap-3 mb-6 px-4 border-l-2 border-primary">
                <Zap size={18} className="text-primary fill-current shadow-primary" />
                <h2 className="text-lg font-black uppercase tracking-tighter text-white italic font-serif">
                  Tu Epicentro Creativo
                </h2>
              </div>

              {safeEpicenterPodcastsCollection.length > 0 ? (
                <PodcastShelf
                  shelfTitleTextContent="Tu Epicentro"
                  initialPodcastCollection={safeEpicenterPodcastsCollection}
                  visualVariantType="compact"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-zinc-950/40 rounded-[3rem] border border-dashed border-white/5 text-center shadow-inner">
                  <div className="p-4 bg-primary/10 rounded-2xl mb-4">
                    <Mic className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Bóveda Silenciosa</h3>
                  <p className="text-[10px] text-zinc-500 font-medium mt-2 mb-8 max-w-sm uppercase tracking-widest leading-relaxed">
                    Inicie la forja de su primer activo para establecer resonancia en la red de Madrid.
                  </p>
                  <Link href="/create">
                    <Button variant="outline" className="rounded-full border-primary/40 hover:bg-primary/10 text-primary font-black text-[10px] uppercase tracking-[0.3em] px-8">
                      Iniciar Forja
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {safeConnectionsPodcastsCollection.length > 0 && (
              <div className="relative group isolate">
                <div className="flex items-center gap-3 mb-6 px-4 border-l-2 border-purple-600">
                  <Sparkles size={18} className="text-purple-500 fill-current" />
                  <h2 className="text-lg font-black uppercase tracking-tighter text-white italic font-serif">
                    Conexiones de Resonancia
                  </h2>
                </div>
                <PodcastShelf
                  shelfTitleTextContent="Resonancias Inesperadas"
                  initialPodcastCollection={safeConnectionsPodcastsCollection}
                  visualVariantType="compact"
                />
              </div>
            )}

          </div>
        </div>
      ) : (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-24 isolate">
          <div className="flex items-center justify-between border-b border-white/5 pb-8 px-2 isolate">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 relative shadow-2xl">
                <Loader2 className={classNamesUtility("h-6 w-6 text-primary absolute", isSearchingProcessActiveStatus ? "animate-spin opacity-100" : "opacity-0")} />
                <Search className={classNamesUtility("h-6 w-6 text-primary transition-opacity duration-500", isSearchingProcessActiveStatus ? "opacity-0" : "opacity-100")} />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white leading-none italic font-serif">
                  Hallazgos: <span className="text-primary not-italic">"{lastSearchQueryText}"</span>
                </h2>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">
                  Procesando Mapeo Semántico Unificado
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSearchRadarAction}
              className="h-12 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5 border border-white/5 transition-all"
            >
              Cerrar Radar
            </Button>
          </div>

          {searchRadarResultsCollection && searchRadarResultsCollection.length === 0 && !isSearchingProcessActiveStatus ? (
            <div className="text-center py-32 bg-white/[0.01] rounded-[3rem] border border-dashed border-white/5 flex flex-col items-center justify-center grayscale opacity-40">
              <p className="text-white text-sm font-black uppercase tracking-[0.5em] italic">Silencio en el Escáner</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 isolate">
              {searchRadarResultsCollection && searchRadarResultsCollection.map((searchResultItem) => (
                <Link
                  key={searchResultItem.identification}
                  href={searchResultItem.resultCategoryType === 'podcast' ? `/podcast/${searchResultItem.identification}` :
                    searchResultItem.resultCategoryType === 'place' ? `/map?latitude=${searchResultItem.intellectualMetadata?.latitudeCoordinate}&longitude=${searchResultItem.intellectualMetadata?.longitudeCoordinate}` : '#'}
                  className="block group transition-all active:scale-[0.99] outline-none"
                >
                  <div className="p-6 rounded-[2.5rem] border transition-all duration-500 flex items-center gap-6 bg-white/[0.02] border-white/5 hover:border-primary/40 hover:bg-white/[0.04] shadow-xl isolate">
                    <div className="h-16 w-16 rounded-2xl bg-zinc-950 flex-shrink-0 relative overflow-hidden border border-white/10 shadow-inner isolate">
                      {searchResultItem.imageUniformResourceLocator ? (
                        <Image
                          src={searchResultItem.imageUniformResourceLocator}
                          alt={searchResultItem.titleTextContent}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-1000"
                          unoptimized
                        />
                      ) : (
                        <BookOpen className="text-primary/30 h-7 w-7 m-auto" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm md:text-base text-white truncate uppercase tracking-tight font-serif italic group-hover:text-primary transition-colors">
                        {searchResultItem.titleTextContent}
                      </p>
                      <p className="text-[10px] font-bold text-zinc-600 truncate uppercase tracking-widest mt-1.5">
                        {searchResultItem.subtitleContentText}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
