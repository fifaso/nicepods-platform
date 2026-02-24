// components/intelligence-feed.tsx
// VERSIÓN: 2.0

"use client";

import {
    Activity,
    BookOpen,
    BrainCircuit,
    ChevronRight,
    History,
    Loader2,
    Mic2,
    PlayCircle,
    Search,
    Sparkles,
    TrendingUp,
    User as UserIcon,
    Zap
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

// --- INFRAESTRUCTURA DE DATOS Y CONTRATOS ---
import { SearchResult } from "@/hooks/use-search-radar"; // [FIX]: Importación desde el nodo de verdad
import { cn } from "@/lib/utils";
import { PodcastWithProfile } from "@/types/podcast";

// --- COMPONENTES UI ---
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UniverseCard } from "@/components/universe-card";

/**
 * [SHIELD]: CARGA DIFERIDA DE ESTANTES (PodcastShelf)
 * Componente pesado cargado bajo demanda para asegurar 60 FPS en el Dashboard.
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

/**
 * COMPONENTE: IntelligenceFeed
 * El orquestador de contenido dinámico del Dashboard.
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

    /**
     * LÓGICA DE VISUALIZACIÓN DINÁMICA:
     * Detectamos si la terminal de búsqueda ha sido activada.
     */
    const hasActiveResults = results.length > 0 || isSearching || (lastQuery && lastQuery.length > 0);

    return (
        <div className="w-full space-y-12 selection:bg-primary/20">

            {!hasActiveResults ? (
                /* 
                    --- ESTADO A: FRECUENCIA BASE (Exploración de Universos) --- 
                    Renderizado por defecto cuando no hay búsqueda activa.
                */
                <div className="space-y-16 animate-in fade-in duration-1000">

                    {/* Sección: Dimensiones Semánticas */}
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

                    {/* Sección: Estantes de Producción Personal */}
                    <div className="space-y-16">
                        {/* Tu Epicentro: Podcasts propios */}
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

                        {/* Conexiones: Sugerencias de la Red */}
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
                /* 
                    --- ESTADO B: CONSOLA DE ANÁLISIS (Resultados del Radar) --- 
                    Muestra los impactos semánticos localizados por la Edge Function.
                */
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-24">

                    {/* Cabecera Técnica de Resultados */}
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

                    {/* LÓGICA DE RENDERIZADO DE RESULTADOS */}
                    {results.length === 0 && !isSearching ? (
                        /* Caso: Frecuencia Vacía */
                        <div className="text-center py-32 bg-white/[0.01] rounded-[3rem] border border-dashed border-white/5 flex flex-col items-center justify-center shadow-inner">
                            <div className="bg-primary/5 w-20 h-20 rounded-full flex items-center justify-center mb-8 relative">
                                <div className="absolute inset-0 bg-primary/10 blur-2xl animate-pulse" />
                                <Search size={40} className="text-primary/20 relative z-10" />
                            </div>
                            <p className="text-white/60 text-base font-black uppercase tracking-[0.3em]">
                                Silencio en el Escáner
                            </p>
                            <p className="text-[10px] text-zinc-600 mt-3 uppercase tracking-[0.2em] max-w-[280px] mx-auto leading-relaxed">
                                No se han localizado activos ni identidades que resuenen con esta frecuencia.
                            </p>
                        </div>
                    ) : (
                        /* Caso: Malla de Resultados Híbridos */
                        <div className="grid grid-cols-1 gap-4">
                            {results.map((result) => (
                                <Link
                                    key={result.id}
                                    href={
                                        result.result_type === 'podcast' ? `/podcast/${result.id}` :
                                            result.result_type === 'user' ? `/profile/${result.subtitle.replace('@', '')}` :
                                                '#' // Los vault_chunks podrían no tener link directo o ser modales
                                    }
                                    className={cn(
                                        "block group transition-all active:scale-[0.99] outline-none",
                                        result.result_type === 'vault_chunk' && "cursor-default"
                                    )}
                                >
                                    <div className={cn(
                                        "p-5 rounded-[2.5rem] border transition-all flex items-center gap-6 shadow-2xl backdrop-blur-3xl",
                                        "bg-white/[0.02] border-white/5 hover:border-primary/40 hover:bg-white/[0.04]"
                                    )}>

                                        {/* 1. INDICADOR DE TIPO DE IMPACTO */}
                                        <div className="h-16 w-16 rounded-2xl bg-zinc-900 overflow-hidden flex-shrink-0 relative shadow-inner border border-white/5">
                                            {result.result_type === 'vault_chunk' ? (
                                                <div className="h-full w-full flex items-center justify-center bg-primary/5">
                                                    <BookOpen className="text-primary h-7 w-7" />
                                                </div>
                                            ) : (
                                                <>
                                                    <Image
                                                        src={result.image_url || '/images/placeholder.png'}
                                                        alt={result.title}
                                                        fill
                                                        sizes="64px"
                                                        className="object-cover group-hover:scale-110 transition-transform duration-1000"
                                                    />
                                                    {result.result_type === 'podcast' && (
                                                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                                            <PlayCircle className="text-white h-8 w-8" />
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {/* 2. INFORMACIÓN SEMÁNTICA */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-4 mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    {result.result_type === 'podcast' && <Mic2 size={12} className="text-zinc-500" />}
                                                    {result.result_type === 'user' && <UserIcon size={12} className="text-zinc-500" />}
                                                    {result.result_type === 'vault_chunk' && <History size={12} className="text-zinc-500" />}
                                                    <p className="font-black text-sm md:text-base uppercase tracking-tighter truncate text-white leading-none group-hover:text-primary transition-colors">
                                                        {result.title}
                                                    </p>
                                                </div>

                                                {/* Puntuación de Resonancia */}
                                                {result.similarity > 0.7 && (
                                                    <div className="flex items-center gap-1.5 text-emerald-500">
                                                        <TrendingUp size={14} className="animate-pulse" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Impacto</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <p className="text-[11px] text-zinc-500 truncate font-medium italic leading-none max-w-[200px] md:max-w-md">
                                                    {result.subtitle}
                                                </p>
                                                <span className="h-1 w-1 rounded-full bg-white/10 shrink-0" />
                                                <Badge variant="outline" className="text-[9px] font-black uppercase border-primary/20 text-primary/80 px-2.5 py-0.5 rounded-full">
                                                    {Math.round(result.similarity * 100)}% Resonancia
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* 3. CLÚSTER DE ACCIÓN DERECHO */}
                                        <div className="hidden sm:flex items-center gap-6 pr-2">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Descriptor</span>
                                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-white/[0.03] border-white/10 text-zinc-400">
                                                    {result.result_type.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            {result.result_type !== 'vault_chunk' && (
                                                <ChevronRight className="h-5 w-5 text-white/10 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                            )}
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
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Resolución de Disonancia: Al integrar el 'result_type', el feed ahora es 
 *    consciente de qué está pintando, permitiendo usar iconos de Micrófono, 
 *    Usuario o Libro según corresponda.
 * 2. Estética de Hardware: Se han aumentado los radios de borde a 2.5rem 
 *    para coincidir con el nuevo estándar de la Workstation V2.5.
 * 3. Rendimiento Cognitivo: El uso de 'line-clamp' y truncado de texto asegura 
 *    que la lista de resultados sea escaneable visualmente sin saturación.
 */