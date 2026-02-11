// components/IntelligenceFeed.tsx
// VERSIÓN: 1.0 (Content Layer - Structural Stability)
// Misión: Gestionar el flujo de contenido estático y dinámico (Resultados) en el Dashboard.
// [ARQUITECTURA]: Componente de flujo normal (estático) que garantiza el peso físico del contenido.

"use client";

import { SearchResult } from "@/components/geo/search-station";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UniverseCard } from "@/components/universe-card";
import { cn } from "@/lib/utils";
import { PodcastWithProfile } from "@/types/podcast";
import {
    Activity,
    BrainCircuit,
    ChevronRight,
    Loader2,
    PlayCircle,
    Search,
    Sparkles,
    TrendingUp,
    Zap
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

/**
 * [SHIELD]: CARGA DIFERIDA DE ESTANTES
 * El componente PodcastShelf es el activo más pesado del Dashboard. 
 * Lo cargamos solo en el cliente para asegurar una navegación fluida (60 FPS).
 */
const PodcastShelf = dynamic(
    () => import("@/components/podcast-shelf").then((mod) => mod.PodcastShelf),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-48 bg-white/[0.01] rounded-[2.5rem] border border-dashed border-white/5 flex items-center justify-center animate-pulse">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/10">Sincronizando Frecuencia</span>
            </div>
        )
    }
);

interface IntelligenceFeedProps {
    userName: string;
    isSearching: boolean;
    results: SearchResult[];
    lastQuery: string;
    epicenterPodcasts: PodcastWithProfile[];
    connectionsPodcasts: PodcastWithProfile[];
    onClear: () => void;
}

/**
 * Universos de Conocimiento (Configuración de acceso rápido)
 */
const discoveryHubCategories = [
    { key: "deep_thought", title: "Pensamiento", image: "/images/universes/deep-thought.png", href: "/podcasts?tab=discover&universe=deep_thought" },
    { key: "practical_tools", title: "Práctico", image: "/images/universes/practical-tools.png", href: "/podcasts?tab=discover&universe=practical_tools" },
    { key: "tech_and_innovation", title: "Tecnología", image: "/images/universes/tech.png", href: "/podcasts?tab=discover&universe=tech_and_innovation" },
    { key: "narrative_and_stories", title: "Narrativa", image: "/images/universes/narrative.png", href: "/podcasts?tab=discover&universe=narrative_and_stories" },
];

export function IntelligenceFeed({
    userName,
    isSearching,
    results,
    lastQuery,
    epicenterPodcasts,
    connectionsPodcasts,
    onClear
}: IntelligenceFeedProps) {

    /**
     * [LÓGICA DE VISUALIZACIÓN DINÁMICA]
     * Determinamos si el usuario está explorando la base o analizando resultados.
     */
    const hasActiveResults = results.length > 0 || isSearching || lastQuery.length > 0;

    return (
        <div className="w-full space-y-12">

            {!hasActiveResults ? (
                /* --- ESTADO A: FRECUENCIA BASE (Estructura Original) --- */
                <div className="space-y-16 animate-in fade-in duration-1000">

                    {/* Sección 1: Dimensiones Semánticas */}
                    <section>
                        <div className="flex items-center justify-between mb-8 px-1">
                            <div className="flex items-center gap-3">
                                <BrainCircuit className="text-primary/40 h-4 w-4" />
                                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">
                                    Dimensiones
                                </h2>
                            </div>
                            <div className="h-px flex-1 mx-8 bg-white/5 hidden md:block" />
                            <div className="flex items-center gap-2 text-[8px] font-bold text-white/20 uppercase tracking-widest">
                                <Activity size={10} /> Neural Loop Active
                            </div>
                        </div>

                        <div className="flex overflow-x-auto pb-6 gap-4 lg:grid lg:grid-cols-4 snap-x scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
                            {discoveryHubCategories.map((category) => (
                                <div key={category.key} className="min-w-[150px] w-[45%] lg:w-auto snap-start flex-shrink-0 transition-transform active:scale-95">
                                    <UniverseCard {...category} isActive={false} />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Sección 2: Estantes Operativos */}
                    <div className="space-y-14">
                        {/* Estante: Tu Epicentro */}
                        <div className="relative group">
                            <div className="flex items-center gap-3 mb-5 px-2 border-l-2 border-primary/40">
                                <Zap size={16} className="text-primary fill-current opacity-40 group-hover:opacity-100 transition-opacity" />
                                <h2 className="text-sm font-black uppercase tracking-tighter text-foreground/90">
                                    Tu Epicentro Creativo
                                </h2>
                            </div>
                            <PodcastShelf
                                title="Tu Epicentro"
                                podcasts={epicenterPodcasts}
                                variant="compact"
                            />
                        </div>

                        {/* Estante: Conexiones */}
                        <div className="relative group">
                            <div className="flex items-center gap-3 mb-5 px-2 border-l-2 border-purple-500/40">
                                <Sparkles size={16} className="text-purple-500 fill-current opacity-40 group-hover:opacity-100 transition-opacity" />
                                <h2 className="text-sm font-black uppercase tracking-tighter text-foreground/90">
                                    Conexiones Inesperadas
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
                /* --- ESTADO B: CONSOLA DE RESULTADOS (IA Analysis) --- */
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">

                    {/* Cabecera de Resultados */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-6 px-1">
                        <div className="flex items-center gap-4">
                            <div className="relative flex items-center justify-center">
                                <Loader2 className={cn("h-5 w-5 text-primary", isSearching ? "animate-spin" : "opacity-0")} />
                                <Search className={cn("h-5 w-5 text-primary absolute", isSearching ? "opacity-0" : "opacity-100")} />
                            </div>
                            <div className="space-y-0.5">
                                <h2 className="text-lg font-black uppercase tracking-tighter text-white leading-none">
                                    Impactos para: <span className="text-primary italic">"{lastQuery}"</span>
                                </h2>
                                <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                                    Mapeo semántico en tiempo real
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClear}
                            className="h-9 rounded-xl font-black text-[9px] uppercase tracking-widest text-muted-foreground hover:bg-white/5 border border-white/5"
                        >
                            Cerrar Radar
                        </Button>
                    </div>

                    {/* Renderizado de Datos */}
                    {results.length === 0 && !isSearching ? (
                        /* Caso: Frecuencia Vacía */
                        <div className="text-center py-28 bg-white/[0.01] rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center justify-center">
                            <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <Search size={32} className="text-primary/10" />
                            </div>
                            <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">
                                Sin señales detectadas
                            </p>
                            <p className="text-[10px] text-zinc-600 mt-2 uppercase tracking-tighter max-w-[220px] mx-auto leading-relaxed">
                                No hay activos que resuenen con tu consulta actual.
                            </p>
                        </div>
                    ) : (
                        /* Caso: Grilla de Resultados de Alta Fidelidad */
                        <div className="grid grid-cols-1 gap-3">
                            {results.map((result) => (
                                <Link
                                    key={result.id}
                                    href={result.type === 'podcast' ? `/podcast/${result.id}` : `/profile/${result.subtitle.replace('@', '')}`}
                                    className="block group transition-all active:scale-[0.98]"
                                >
                                    <div className="p-5 rounded-[2rem] bg-card/60 border border-white/5 hover:border-primary/40 hover:bg-card/80 transition-all flex items-center gap-6 shadow-2xl backdrop-blur-md">

                                        {/* Activo Visual (Imagen 3 / Avatar) */}
                                        <div className="h-16 w-16 rounded-[1.25rem] bg-zinc-900 overflow-hidden flex-shrink-0 relative shadow-inner">
                                            <Image
                                                src={result.image_url || '/images/placeholder.png'}
                                                alt={result.title}
                                                fill
                                                sizes="64px"
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                                <PlayCircle className="text-white h-8 w-8" />
                                            </div>
                                        </div>

                                        {/* Información Cognitiva */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1.5">
                                                <p className="font-black text-sm md:text-base uppercase tracking-tight truncate text-foreground leading-tight">
                                                    {result.title}
                                                </p>
                                                {result.similarity > 0.8 && (
                                                    <div className="flex items-center gap-1 text-emerald-500 animate-pulse">
                                                        <TrendingUp size={14} />
                                                        <span className="text-[8px] font-black uppercase hidden sm:inline">Match Alto</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <p className="text-[10px] text-muted-foreground truncate font-medium uppercase tracking-widest opacity-60">
                                                    {result.subtitle}
                                                </p>
                                                <span className="h-1 w-1 rounded-full bg-white/10" />
                                                <Badge variant="outline" className="text-[8px] font-black uppercase border-primary/20 text-primary/70 px-2 py-0">
                                                    {Math.round(result.similarity * 100)}% Resonancia
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Categorización de Nodo */}
                                        <div className="hidden sm:flex items-center gap-4">
                                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-white/5 border-white/10">
                                                {result.type}
                                            </Badge>
                                            <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-primary transition-colors" />
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