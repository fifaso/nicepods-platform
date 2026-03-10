// components/intelligence-feed.tsx
// VERSIÓN: 3.0 (NicePod Intelligence Feed - Hydration Shield Edition)
// Misión: Orquestar el contenido dinámico del Dashboard con resiliencia de estado.
// [ESTABILIZACIÓN]: Implementación de verificadores de estado para eliminar errores de renderizado.

"use client";

import {
    Activity,
    BookOpen,
    BrainCircuit,
    Loader2,
    Search,
    Sparkles,
    Zap
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

// --- INFRAESTRUCTURA DE DATOS Y CONTRATOS ---
import { SearchResult } from "@/hooks/use-search-radar";
import { cn } from "@/lib/utils";
import { PodcastWithProfile } from "@/types/podcast";

// --- COMPONENTES UI ---
import { Button } from "@/components/ui/button";
import { UniverseCard } from "@/components/universe-card";

/**
 * [SHIELD]: CARGA DIFERIDA DE ESTANTES (PodcastShelf)
 */
const PodcastShelf = dynamic(
    () => import("@/components/podcast-shelf").then((mod) => mod.PodcastShelf),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-48 bg-white/[0.01] rounded-[2.5rem] border border-dashed border-white/5 flex items-center justify-center animate-pulse">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/10 italic">
                    Sincronizando Frecuencia...
                </span>
            </div>
        )
    }
);

interface IntelligenceFeedProps {
    userName: string;
    isSearching: boolean;
    results: SearchResult[] | null; // [FIX]: Soporte para estado nulo
    lastQuery: string;
    epicenterPodcasts: PodcastWithProfile[];
    connectionsPodcasts: PodcastWithProfile[];
    onClear: () => void;
}

const discoveryHubCategories = [
    { key: "deep_thought", title: "Pensamiento", image: "/images/universes/deep-thought.png", href: "/podcasts?tab=discover&universe=deep_thought" },
    { key: "practical_tools", title: "Práctico", image: "/images/universes/practical-tools.png", href: "/podcasts?tab=discover&universe=practical_tools" },
    { key: "tech_and_innovation", title: "Tecnología", image: "/images/universes/tech.png", href: "/podcasts?tab=discover&universe=tech_and_innovation" },
    { key: "narrative_and_stories", title: "Narrativa", image: "/images/universes/narrative.png", href: "/podcasts?tab=discover&universe=narrative_and_stories" },
];

/**
 * COMPONENTE: IntelligenceFeed
 */
export function IntelligenceFeed({
    userName,
    isSearching,
    results,
    lastQuery,
    epicenterPodcasts,
    connectionsPodcasts,
    onClear
}: IntelligenceFeedProps) {

    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Determinación lógica de estados para evitar el "Error de Nodo"
    const hasActiveResults = results !== null && (results.length > 0 || isSearching);
    const isIdle = results === null;

    if (!isClient) return null;

    return (
        <div className="w-full space-y-12 selection:bg-primary/20">

            {isIdle ? (
                /* ESTADO A: FRECUENCIA BASE */
                <div className="space-y-16 animate-in fade-in duration-1000">
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

                        <div className="flex overflow-x-auto pb-6 gap-6 lg:grid lg:grid-cols-4 snap-x scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
                            {discoveryHubCategories.map((category) => (
                                <div key={category.key} className="min-w-[160px] w-[48%] lg:w-auto snap-start flex-shrink-0 transition-all hover:scale-[1.02] active:scale-95">
                                    <UniverseCard {...category} isActive={false} />
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="space-y-16">
                        <div className="relative group">
                            <div className="flex items-center gap-3 mb-6 px-4 border-l-2 border-primary">
                                <Zap size={18} className="text-primary fill-current shadow-primary" />
                                <h2 className="text-lg font-black uppercase tracking-tighter text-white italic">
                                    Tu Epicentro Creativo
                                </h2>
                            </div>
                            <PodcastShelf
                                title="Tu Epicentro"
                                podcasts={epicenterPodcasts}
                                variant="compact"
                            />
                        </div>

                        <div className="relative group">
                            <div className="flex items-center gap-3 mb-6 px-4 border-l-2 border-purple-600">
                                <Sparkles size={18} className="text-purple-500 fill-current" />
                                <h2 className="text-lg font-black uppercase tracking-tighter text-white italic">
                                    Conexiones de Resonancia
                                </h2>
                            </div>
                            <PodcastShelf
                                title="Conexiones Inesperadas"
                                podcasts={connectionsPodcasts}
                                variant="compact"
                            />
                        </div>
                    </div>
                </div>
            ) : (
                /* ESTADO B: CONSOLA DE ANÁLISIS */
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-24">
                    <div className="flex items-center justify-between border-b border-white/5 pb-8 px-2">
                        <div className="flex items-center gap-5">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 relative">
                                <Loader2 className={cn("h-6 w-6 text-primary absolute", isSearching ? "animate-spin opacity-100" : "opacity-0")} />
                                <Search className={cn("h-6 w-6 text-primary transition-opacity duration-300", isSearching ? "opacity-0" : "opacity-100")} />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">
                                    Hallazgos: <span className="text-primary italic">"{lastQuery}"</span>
                                </h2>
                                <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">
                                    Procesando Mapeo Semántico Unificado
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClear}
                            className="h-10 rounded-xl font-black text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5 border border-white/5"
                        >
                            Cerrar Radar
                        </Button>
                    </div>

                    {results && results.length === 0 && !isSearching ? (
                        <div className="text-center py-32 bg-white/[0.01] rounded-[3rem] border border-dashed border-white/5 flex flex-col items-center justify-center shadow-inner">
                            <p className="text-white/60 text-base font-black uppercase tracking-[0.3em]">Silencio en el Escáner</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {results && results.map((result) => (
                                <Link
                                    key={result.id}
                                    href={result.result_type === 'podcast' ? `/podcast/${result.id}` : '#'}
                                    className="block group transition-all active:scale-[0.99] outline-none"
                                >
                                    <div className="p-5 rounded-[2.5rem] border transition-all flex items-center gap-6 bg-white/[0.02] border-white/5 hover:border-primary/40 hover:bg-white/[0.04]">
                                        <div className="h-16 w-16 rounded-2xl bg-zinc-900 flex-shrink-0 relative overflow-hidden border border-white/5">
                                            {result.image_url ? (
                                                <Image src={result.image_url} alt={result.title} fill className="object-cover" />
                                            ) : (
                                                <BookOpen className="text-primary/40 h-7 w-7 m-auto mt-4" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-sm text-white truncate uppercase tracking-tight">{result.title}</p>
                                            <p className="text-[10px] font-bold text-zinc-500 truncate uppercase tracking-widest">{result.subtitle}</p>
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