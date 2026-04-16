/**
 * ARCHIVO: components/feed/intelligence-feed.tsx
 * VERSIÓN: 5.0 (NiceCore V4.0 - Sovereign Intelligence Flow)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Orquestar el flujo de capital intelectual inyectado por el servidor,
 * gestionando la transición entre la frecuencia base y el radar semántico.
 * [REFORMA V5.0]: Sincronización nominal con PodcastShelf V3.0, erradicación 
 * absoluta de abreviaturas y blindaje de tipos (Zero-Any).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
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
import { useEffect, useMemo, useState, useCallback } from "react";

// --- INFRAESTRUCTURA DE DATOS Y CONTRATOS SOBERANOS ---
import { SearchRadarResult } from "@/hooks/use-search-radar";
import { classNamesUtility } from "@/lib/utils";
import { PodcastWithProfile } from "@/types/podcast";

// --- COMPONENTES UI ---
import { UniverseCard } from "@/components/feed/universe-card";
import { Button } from "@/components/ui/button";

/**
 * [SHIELD]: CARGA DIFERIDA DE ESTANTES (PodcastShelf)
 * El motor se mantiene dinámico para optimizar el hilo principal, 
 * sincronizado con el contrato de propiedades V3.0.
 */
const PodcastShelf = dynamic(
    () => import("@/components/feed/podcast-shelf").then((module) => module.PodcastShelf),
    {
        ssr: true,
        loading: () => (
            <div className="w-full h-48 bg-white/[0.01] rounded-[2.5rem] border border-dashed border-white/5 flex items-center justify-center animate-pulse">
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
    userDisplayName: string;
    isSearchingProcessActive: boolean;
    searchMatchResults: SearchRadarResult[] | null;
    lastSearchQuery: string;
    initialEpicenterCollection: PodcastWithProfile[];
    initialConnectionsCollection: PodcastWithProfile[];
    onClearRadarAction: () => void;
}

const discoveryHubCategories = [
    { key: "deep_thought", title: "Pensamiento", image: "/images/universes/deep-thought.png", href: "/podcasts?tab=discover&universe=deep_thought" },
    { key: "practical_tools", title: "Práctico", image: "/images/universes/practical-tools.png", href: "/podcasts?tab=discover&universe=practical_tools" },
    { key: "tech_and_innovation", title: "Tecnología", image: "/images/universes/tech.png", href: "/podcasts?tab=discover&universe=tech_and_innovation" },
    { key: "narrative_and_stories", title: "Narrativa", image: "/images/universes/narrative.png", href: "/podcasts?tab=discover&universe=narrative_and_stories" },
];

/**
 * IntelligenceFeed: El bus de datos táctico de la identidad digital.
 */
export function IntelligenceFeed({
    userDisplayName,
    isSearchingProcessActive,
    searchMatchResults,
    lastSearchQuery,
    initialEpicenterCollection,
    initialConnectionsCollection,
    onClearRadarAction
}: IntelligenceFeedProperties) {

  // --- 1. SANEAMIENTO DE DATOS (DATA HYGIENE) ---
  const safeEpicenterCollection = useMemo(() => {
    return initialEpicenterCollection.filter((podcastItem) => podcastItem.identification);
  }, [initialEpicenterCollection]);

  const safeConnectionsCollection = useMemo(() => {
    return initialConnectionsCollection.filter((podcastItem) => podcastItem.identification);
  }, [initialConnectionsCollection]);

  // --- 2. GESTIÓN DE ESTADOS DE HIDRATACIÓN ---
  const [isComponentMounted, setIsComponentMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsComponentMounted(true);
  }, []);

  const isRadarInterfaceIdle = searchMatchResults === null;

  if (!isComponentMounted) {
    return <div className="min-h-[500px]" />;
  }

  return (
    <div className="w-full space-y-12 selection:bg-primary/20">

      {isRadarInterfaceIdle ? (
        /* --- ESTADO A: FRECUENCIA BASE (VISTA SOBERANA) --- */
        <div className="space-y-16 animate-in fade-in duration-1000">

          {/* SECTOR I: DIMENSIONES DE CONOCIMIENTO */}
          <section>
            <div className="flex items-center justify-between mb-10 px-1">
              <div className="flex items-center gap-3">
                <BrainCircuit className="text-primary h-4 w-4" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">
                  Dimensiones
                </h2>
              </div>
              <div className="h-px flex-1 mx-10 bg-white/5 hidden md:block" />
              <div className="flex items-center gap-2 text-[8px] font-bold text-white/20 uppercase tracking-widest">
                <Activity size={10} className="animate-pulse" /> Neural Link Active
              </div>
            </div>

            <div className="flex overflow-x-auto pb-6 gap-6 lg:grid lg:grid-cols-4 snap-x hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
              {discoveryHubCategories.map((discoveryCategory) => (
                <div 
                  key={discoveryCategory.key} 
                  className="min-w-[160px] w-[48%] lg:w-auto snap-start flex-shrink-0 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <UniverseCard {...discoveryCategory} isActive={false} />
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-16">

            {/* --- ESTANTE 1: EPICENTRO CREATIVO --- */}
            <div className="relative group">
              <div className="flex items-center gap-3 mb-6 px-4 border-l-2 border-primary">
                <Zap size={18} className="text-primary fill-current shadow-primary" />
                <h2 className="text-lg font-black uppercase tracking-tighter text-white italic font-serif">
                  Tu Epicentro Creativo
                </h2>
              </div>

              {safeEpicenterCollection.length > 0 ? (
                /* [FIX V5.0]: Sincronización nominal con PodcastShelfProperties V3.0 */
                <PodcastShelf
                  shelfTitle="Tu Epicentro"
                  initialPodcastCollection={safeEpicenterCollection}
                  visualVariant="compact"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-zinc-900/30 rounded-[3rem] border border-dashed border-white/5 text-center">
                  <div className="p-4 bg-primary/10 rounded-2xl mb-4">
                    <Mic className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Bóveda Silenciosa</h3>
                  <p className="text-[10px] text-zinc-500 font-medium mt-2 mb-8 max-w-sm uppercase tracking-widest leading-relaxed">
                    Inicia la forja de tu primer activo para establecer resonancia en la red.
                  </p>
                  <Link href="/create">
                    <Button variant="outline" className="rounded-full border-primary/40 hover:bg-primary/10 text-primary font-black text-[10px] uppercase tracking-[0.3em] px-8">
                      Forjar Sabiduría
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* --- ESTANTE 2: CONEXIONES DE RESONANCIA --- */}
            {safeConnectionsCollection.length > 0 && (
              <div className="relative group">
                <div className="flex items-center gap-3 mb-6 px-4 border-l-2 border-purple-600">
                  <Sparkles size={18} className="text-purple-500 fill-current" />
                  <h2 className="text-lg font-black uppercase tracking-tighter text-white italic font-serif">
                    Conexiones de Resonancia
                  </h2>
                </div>
                {/* [FIX V5.0]: Sincronización nominal con PodcastShelfProperties V3.0 */}
                <PodcastShelf
                  shelfTitle="Conexiones Inesperadas"
                  initialPodcastCollection={safeConnectionsCollection}
                  visualVariant="compact"
                />
              </div>
            )}

          </div>
        </div>
      ) : (
        /* --- ESTADO B: CONSOLA DE ANÁLISIS (RADAR SEMÁNTICO ACTIVO) --- */
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-24">
          <div className="flex items-center justify-between border-b border-white/5 pb-8 px-2">
            <div className="flex items-center gap-5">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 relative shadow-2xl">
                <Loader2 className={classNamesUtility("h-6 w-6 text-primary absolute", isSearchingProcessActive ? "animate-spin opacity-100" : "opacity-0")} />
                <Search className={classNamesUtility("h-6 w-6 text-primary transition-opacity duration-300", isSearchingProcessActive ? "opacity-0" : "opacity-100")} />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">
                  Hallazgos: <span className="text-primary italic">"{lastSearchQuery}"</span>
                </h2>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">
                  Procesando Mapeo Semántico Unificado
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearRadarAction}
              className="h-10 rounded-xl font-black text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5 border border-white/5"
            >
              Cerrar Radar
            </Button>
          </div>

          {searchMatchResults && searchMatchResults.length === 0 && !isSearchingProcessActive ? (
            <div className="text-center py-32 bg-white/[0.01] rounded-[3rem] border border-dashed border-white/5 flex flex-col items-center justify-center">
              <p className="text-white/40 text-sm font-black uppercase tracking-[0.5em] italic">Silencio en el Escáner</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {searchMatchResults && searchMatchResults.map((searchResultItem) => (
                <Link
                  key={searchResultItem.identification}
                  href={searchResultItem.resultCategoryType === 'podcast' ? `/podcast/${searchResultItem.identification}` :
                    searchResultItem.resultCategoryType === 'place' ? `/map?latitude=${searchResultItem.intellectualMetadata?.latitudeCoordinate}&longitude=${searchResultItem.intellectualMetadata?.longitudeCoordinate}` : '#'}
                  className="block group transition-all active:scale-[0.99] outline-none"
                >
                  <div className="p-5 rounded-[2.5rem] border transition-all flex items-center gap-6 bg-white/[0.02] border-white/5 hover:border-primary/40 hover:bg-white/[0.04]">
                    <div className="h-16 w-16 rounded-2xl bg-zinc-900 flex-shrink-0 relative overflow-hidden border border-white/10 shadow-inner">
                      {searchResultItem.imageUniformResourceLocator ? (
                        <Image src={searchResultItem.imageUniformResourceLocator} alt={searchResultItem.titleTextContent} fill className="object-cover" unoptimized />
                      ) : (
                        <BookOpen className="text-primary/40 h-7 w-7 m-auto" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm text-white truncate uppercase tracking-tight font-serif italic">{searchResultItem.titleTextContent}</p>
                      <p className="text-[10px] font-bold text-zinc-600 truncate uppercase tracking-widest mt-1">{searchResultItem.subtitleContentText}</p>
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

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. Contract Synchronization: El cambio de 'title' a 'shelfTitle' y de 'podcasts' a 
 *    'initialPodcastCollection' resuelve los errores TS2322 reportados en las líneas 166 y 199.
 * 2. Zero Abbreviations Policy: Purificación total de la nomenclatura (initialEpicenterCollection, 
 *    searchMatchResults, searchResultItem, latitude/longitude).
 * 3. Metal Alignment: Se eliminó el uso de 'any' en las propiedades de entrada, 
 *    garantizando que el flujo desde el servidor sea validado por el Build Shield.
 */