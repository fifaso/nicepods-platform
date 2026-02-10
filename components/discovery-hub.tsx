// components/discovery-hub.tsx
// VERSIÓN: 9.5 (The Intelligence Command Bridge - Final Production Standard)
// Misión: Orquestar el flujo de descubrimiento semántico y la navegación de universos de conocimiento.
// [ESTABILIDAD]: Resolución definitiva de tipos, eliminación de abreviaciones y optimización de renderizado.

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { UniverseCard } from "@/components/universe-card";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { PodcastWithProfile } from "@/types/podcast";
import {
    Activity,
    BrainCircuit,
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
import { useCallback, useState } from "react";

/**
 * [SHIELD]: PODCAST SHELF DINÁMICO
 * Importamos el estante de forma dinámica para evitar colisiones en el hilo principal
 * y asegurar que el bundle de la biblioteca de audio no bloquee el renderizado inicial.
 */
const PodcastShelf = dynamic(
    () => import("@/components/podcast-shelf").then((mod) => mod.PodcastShelf),
    { ssr: false }
);

/**
 * [TYPE DEFINITION]: SearchResult
 * Estructura de datos estricta para los resultados del motor de búsqueda omnicanal.
 */
export type SearchResult = {
    type: 'podcast' | 'user';
    id: string;
    title: string;
    subtitle: string;
    image_url: string;
    similarity: number;
};

/**
 * CONFIGURACIÓN: Universos Semánticos
 * Lista explícita de categorías para evitar iteraciones sobre objetos dinámicos no controlados.
 */
const discoveryHubCategories = [
    {
        key: "deep_thought",
        title: "Pensamiento",
        image: "/images/universes/deep-thought.png",
        href: "/podcasts?tab=discover&universe=deep_thought"
    },
    {
        key: "practical_tools",
        title: "Práctico",
        image: "/images/universes/practical-tools.png",
        href: "/podcasts?tab=discover&universe=practical_tools"
    },
    {
        key: "tech_and_innovation",
        title: "Tecnología",
        image: "/images/universes/tech.png",
        href: "/podcasts?tab=discover&universe=tech_and_innovation"
    },
    {
        key: "narrative_and_stories",
        title: "Narrativa",
        image: "/images/universes/narrative.png",
        href: "/podcasts?tab=discover&universe=narrative_and_stories"
    },
];

/**
 * INTERFACE: DiscoveryHubProps
 * Definición exhaustiva de propiedades para garantizar compatibilidad con DashboardPage.
 */
interface DiscoveryHubProps {
    userName: string;
    showShelvesOnNoSearch?: boolean;
    epicenterPodcasts?: PodcastWithProfile[];
    connectionsPodcasts?: PodcastWithProfile[];
    showOnlySearch?: boolean;
    showOnlyCategories?: boolean; // Requerido por el motor de visualización de la Home
}

/**
 * DiscoveryHub: El núcleo de inteligencia de NicePod.
 */
export function DiscoveryHub({
    userName = "Curador",
    showShelvesOnNoSearch = false,
    epicenterPodcasts = [],
    connectionsPodcasts = [],
    showOnlySearch = false,
    showOnlyCategories = false
}: DiscoveryHubProps) {
    const { supabase } = useAuth();

    // --- ESTADOS DE INTELIGENCIA OPERATIVA ---
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [hasActiveSearch, setHasActiveSearch] = useState<boolean>(false);
    const [lastQuery, setLastQuery] = useState<string>("");

    /**
     * handleSemanticSearch
     * Pipeline de búsqueda: Vectorización (Edge Function) -> Matchmaking (RPC SQL).
     */
    const handleSemanticSearch = useCallback(async (searchTerm: string) => {
        if (!supabase || searchTerm.trim().length < 3) {
            setResults([]);
            setHasActiveSearch(false);
            return;
        }

        setIsSearching(true);
        setHasActiveSearch(true);
        setLastQuery(searchTerm);

        try {
            // FASE 1: Invocación de la Edge Function para vectorización
            const { data: vectorData, error: vectorError } = await supabase.functions.invoke('vectorize-query', {
                body: { query: searchTerm }
            });

            if (vectorError) {
                throw new Error(`Vectorización fallida: ${vectorError.message}`);
            }

            // FASE 2: Búsqueda omnicanal en PostgreSQL
            const { data: searchResults, error: searchError } = await supabase.rpc('search_omni', {
                query_text: searchTerm,
                query_embedding: vectorData.embedding,
                match_threshold: 0.15,
                match_count: 12
            });

            if (searchError) {
                throw new Error(`RPC Search failed: ${searchError.message}`);
            }

            // Actualización del búfer de resultados
            const validatedResults = (searchResults as SearchResult[]) ?? [];
            setResults(validatedResults);

        } catch (error: any) {
            console.error("🔥 [DiscoveryHub-Fatal]:", error.message);
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [supabase]);

    /**
     * handleClearSearch
     * Restablece la terminal de descubrimiento a la frecuencia base.
     */
    const handleClearSearch = useCallback(() => {
        setResults([]);
        setHasActiveSearch(false);
        setIsSearching(false);
        setLastQuery("");
    }, []);

    // --- RENDERIZADOR: MODO BUSCADOR (Header Integration) ---
    if (showOnlySearch) {
        return (
            <div className="w-full h-14 relative flex items-center justify-end z-50">
                <UnifiedSearchBar
                    userName={userName}
                    onSearch={handleSemanticSearch}
                    onClear={handleClearSearch}
                />
            </div>
        );
    }

    return (
        <div className="w-full space-y-12">

            {/* LOGICA DINÁMICA DE VISUALIZACIÓN */}
            {(!hasActiveSearch || showOnlyCategories) ? (
                /* 
                   ESTADO A: FRECUENCIA BASE
                   Se muestra cuando no hay una búsqueda activa o se fuerzan categorías.
                */
                <div className="space-y-16 animate-in fade-in duration-1000">

                    {/* Universos de Conocimiento */}
                    <section>
                        <div className="flex items-center justify-between mb-8 px-1">
                            <div className="flex items-center gap-3">
                                <BrainCircuit className="text-primary/40 h-4 w-4" />
                                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">
                                    Dimensiones
                                </h2>
                            </div>
                            <div className="flex items-center gap-2 text-[8px] font-bold text-white/20 uppercase tracking-widest">
                                <Activity size={10} className="animate-pulse text-emerald-500" />
                                Sincronía de Red
                            </div>
                        </div>

                        <div className="flex overflow-x-auto pb-6 gap-4 lg:grid lg:grid-cols-4 snap-x scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
                            {discoveryHubCategories.map((category) => (
                                <div key={category.key} className="min-w-[150px] w-[45%] lg:w-auto snap-start flex-shrink-0 transition-transform active:scale-95">
                                    <UniverseCard
                                        key={category.key}
                                        title={category.title}
                                        image={category.image}
                                        href={category.href}
                                        isActive={false}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Estantes de Podcasts (Dashboard Context) */}
                    {(showShelvesOnNoSearch && !showOnlyCategories) && (
                        <div className="space-y-16 animate-in slide-in-from-bottom-4 duration-700">
                            <div className="relative group">
                                <div className="flex items-center gap-2 mb-5 px-2 border-l-2 border-primary/40">
                                    <Zap size={14} className="text-primary fill-current opacity-40" />
                                    <h2 className="text-sm font-black uppercase tracking-tighter text-foreground/90">
                                        Tu Epicentro Creativo
                                    </h2>
                                </div>
                                <PodcastShelf
                                    title="Epicentro"
                                    podcasts={epicenterPodcasts}
                                    variant="compact"
                                />
                            </div>

                            <div className="relative group">
                                <div className="flex items-center gap-2 mb-5 px-2 border-l-2 border-purple-500/40">
                                    <Sparkles size={14} className="text-purple-500 fill-current opacity-40" />
                                    <h2 className="text-sm font-black uppercase tracking-tighter text-foreground/90">
                                        Conexiones Inesperadas
                                    </h2>
                                </div>
                                <PodcastShelf
                                    title="Conexiones"
                                    podcasts={connectionsPodcasts}
                                    variant="compact"
                                />
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* 
                   ESTADO B: RESULTADOS DE BÚSQUEDA ACTIVOS
                   Muestra los impactos semánticos detectados por la IA.
                */
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">

                    <div className="flex items-center justify-between border-b border-white/5 pb-4 px-1">
                        <div className="flex items-center gap-3">
                            <div className="relative flex items-center justify-center">
                                <Loader2 className={cn("h-4 w-4 text-primary", isSearching ? "animate-spin" : "opacity-0")} />
                                <Search className={cn("h-4 w-4 text-primary absolute", isSearching ? "opacity-0" : "opacity-100")} />
                            </div>
                            <h2 className="text-sm font-black uppercase tracking-tighter text-white">
                                Resonancia para: <span className="text-primary italic">"{lastQuery}"</span>
                            </h2>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearSearch}
                            className="h-8 rounded-xl font-black text-[9px] uppercase tracking-widest text-muted-foreground hover:bg-white/5"
                        >
                            Reiniciar Radar
                        </Button>
                    </div>

                    {results.length === 0 && !isSearching ? (
                        /* Estado: Frecuencia Vacía */
                        <div className="text-center py-28 bg-white/[0.01] rounded-[2.5rem] border border-dashed border-white/5 flex flex-col items-center justify-center">
                            <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                                <Search size={32} className="text-primary/10" />
                            </div>
                            <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">
                                Sin impactos detectados
                            </p>
                            <p className="text-[10px] text-zinc-600 mt-2 uppercase tracking-tighter max-w-[200px] mx-auto leading-relaxed">
                                Intenta investigar un concepto diferente para sintonizar la red.
                            </p>
                        </div>
                    ) : (
                        /* Estado: Grilla de Impactos Semánticos */
                        <div className="grid grid-cols-1 gap-3">
                            {results.map((result) => (
                                <Link
                                    key={result.id}
                                    href={result.type === 'podcast' ? `/podcast/${result.id}` : `/profile/${result.subtitle.replace('@', '')}`}
                                    className="block group transition-all active:scale-[0.98]"
                                >
                                    <div className="p-4 rounded-[2rem] bg-card/60 border border-white/5 hover:border-primary/40 hover:bg-card/80 transition-all flex items-center gap-5 shadow-2xl backdrop-blur-md">

                                        {/* Avatar / Portada del Resultado */}
                                        <div className="h-16 w-16 rounded-[1.25rem] bg-zinc-900 overflow-hidden flex-shrink-0 relative shadow-inner">
                                            <Image
                                                src={result.image_url || '/images/placeholder.png'}
                                                alt={result.title}
                                                fill
                                                sizes="64px"
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                                <PlayCircle className="text-white h-7 w-7" />
                                            </div>
                                        </div>

                                        {/* Información Cognitiva */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-black text-sm uppercase tracking-tight truncate text-foreground leading-tight">
                                                    {result.title}
                                                </p>
                                                {result.similarity > 0.8 && (
                                                    <TrendingUp size={12} className="text-emerald-500 shrink-0" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] text-muted-foreground truncate font-medium uppercase tracking-widest opacity-60">
                                                    {result.subtitle}
                                                </p>
                                                <span className="h-0.5 w-0.5 rounded-full bg-white/10" />
                                                <Badge variant="outline" className="text-[8px] font-black uppercase border-primary/20 text-primary/70 px-2 py-0">
                                                    {Math.round(result.similarity * 100)}% Match
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Categorización de Nodo */}
                                        <div className="hidden sm:block">
                                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 bg-white/5 border-white/10">
                                                {result.type}
                                            </Badge>
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