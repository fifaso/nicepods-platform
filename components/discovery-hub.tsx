// components/discovery-hub.tsx
// VERSIÓN: 9.0 (The Intelligence Command Bridge - Unified State Edition)
// Misión: Orquestar el flujo de descubrimiento. Gestiona la transición entre la biblioteca base y los resultados de búsqueda.

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { UniverseCard } from "@/components/universe-card";
import { useAuth } from "@/hooks/use-auth";
import { 
    Loader2, 
    PlayCircle, 
    TrendingUp, 
    Search,
    Zap,
    Sparkles,
    BrainCircuit,
    Activity
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { PodcastWithProfile } from "@/types/podcast";

/**
 * [SHIELD]: PODCAST SHELF DINÁMICO
 * Importamos el estante de forma dinámica para mantener el bundle ligero 
 * y asegurar que solo se hidrate en el cliente.
 */
const PodcastShelf = dynamic(
  () => import("@/components/podcast-shelf").then((mod) => mod.PodcastShelf),
  { ssr: false }
);

/**
 * [TYPE DEFINITION]: SearchResult
 * Define el contrato de datos para los impactos semánticos del RPC 'search_omni'.
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

interface DiscoveryHubProps {
    userName: string;
    showShelvesOnNoSearch?: boolean; // Nueva bandera para controlar el Dashboard
    epicenterPodcasts?: PodcastWithProfile[];
    connectionsPodcasts?: PodcastWithProfile[];
    showOnlySearch?: boolean;
}

/**
 * DiscoveryHub: El núcleo de inteligencia y navegación de NicePod V2.5.
 */
export function DiscoveryHub({
    userName = "Curador",
    showShelvesOnNoSearch = false,
    epicenterPodcasts = [],
    connectionsPodcasts = [],
    showOnlySearch = false
}: DiscoveryHubProps) {
    const { supabase } = useAuth();
    
    // --- ESTADOS DE INTELIGENCIA OPERATIVA ---
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [hasActiveSearch, setHasActiveSearch] = useState<boolean>(false);
    const [lastQuery, setLastQuery] = useState<string>("");

    /**
     * handleSemanticSearch
     * Ejecuta el pipeline de búsqueda: Vectorización (Edge) -> Matchmaking (SQL).
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
            // 1. Vectorizar la consulta del usuario
            const { data: vectorData, error: vectorError } = await supabase.functions.invoke('vectorize-query', {
                body: { query: searchTerm }
            });
            if (vectorError) throw vectorError;

            // 2. Buscar en la base de datos de NicePod
            const { data: searchResults, error: searchError } = await supabase.rpc('search_omni', {
                query_text: searchTerm,
                query_embedding: vectorData.embedding,
                match_threshold: 0.15,
                match_count: 12
            });
            if (searchError) throw searchError;

            setResults((searchResults as SearchResult[]) ?? []);
        } catch (error: any) {
            console.error("🔥 [DiscoveryHub-Fatal]:", error.message);
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [supabase]);

    /**
     * handleClearSearch
     * Restablece el sistema a la frecuencia base (Universos y Estantes).
     */
    const handleClearSearch = useCallback(() => {
        setResults([]);
        setHasActiveSearch(false);
        setIsSearching(false);
        setLastQuery("");
    }, []);

    // --- RENDERIZADOR: SOLO BUSCADOR (Header Mode) ---
    if (showOnlySearch) {
        return (
            <div className="w-full h-full flex items-center justify-end">
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
            
            {/* LÓGICA DE VISUALIZACIÓN DINÁMICA */}
            {!hasActiveSearch ? (
                /* 
                   ESTADO A: FRECUENCIA BASE 
                   Mostramos las dimensiones de sabiduría y los estantes si se solicita.
                */
                <div className="space-y-16 animate-in fade-in duration-1000">
                    
                    {/* Universos de Conocimiento (Categorías) */}
                    <section>
                        <div className="flex items-center justify-between mb-8 px-1">
                            <div className="flex items-center gap-3">
                                <BrainCircuit className="text-primary/40 h-4 w-4" />
                                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">Dimensiones</h2>
                            </div>
                            <div className="flex items-center gap-2 text-[8px] font-bold text-white/20 uppercase tracking-widest">
                                <Activity size={10} /> Escaneo de Red
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

                    {/* Estantes de Podcasts (Inyectados desde el Dashboard) */}
                    {showShelvesOnNoSearch && (
                        <div className="space-y-16">
                            <div className="relative group">
                                <div className="flex items-center gap-2 mb-4 px-1">
                                    <Zap size={14} className="text-primary fill-current opacity-40 group-hover:opacity-100 transition-opacity" />
                                    <h2 className="text-xs font-black uppercase tracking-widest text-foreground">Tu Epicentro Creativo</h2>
                                </div>
                                <PodcastShelf podcasts={epicenterPodcasts} variant="compact" title="Epicentro" />
                            </div>

                            <div className="relative group">
                                <div className="flex items-center gap-2 mb-4 px-1">
                                    <Sparkles size={14} className="text-purple-500 fill-current opacity-40 group-hover:opacity-100 transition-opacity" />
                                    <h2 className="text-xs font-black uppercase tracking-widest text-foreground">Conexiones Inesperadas</h2>
                                </div>
                                <PodcastShelf podcasts={connectionsPodcasts} variant="compact" title="Conexiones" />
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* 
                   ESTADO B: FRECUENCIA DE BÚSQUEDA ACTIVADA
                   Sustituimos el contenido base por los impactos semánticos de la IA.
                */
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                    
                    <div className="flex items-center justify-between border-b border-white/5 pb-4 px-1">
                        <div className="flex items-center gap-3">
                            <Loader2 className={cn("h-4 w-4 text-primary", isSearching && "animate-spin")} />
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
                            Cerrar Radar
                        </Button>
                    </div>

                    {results.length === 0 && !isSearching ? (
                        /* Estado: Sin Impactos */
                        <div className="text-center py-24 bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center justify-center">
                            <Search size={32} className="text-primary/20 mb-4" />
                            <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">Frecuencia Silenciosa</p>
                            <p className="text-[10px] text-zinc-600 mt-1 uppercase tracking-tighter">Prueba a investigar un concepto diferente</p>
                        </div>
                    ) : (
                        /* Estado: Resultados del Matchmaking */
                        <div className="grid grid-cols-1 gap-3">
                            {results.map((result) => (
                                <Link 
                                    key={result.id} 
                                    href={result.type === 'podcast' ? `/podcast/${result.id}` : `/profile/${result.subtitle.replace('@', '')}`}
                                    className="block group transition-all active:scale-[0.98]"
                                >
                                    <div className="p-4 rounded-[2rem] bg-card/60 border border-white/5 hover:border-primary/40 hover:bg-card/80 transition-all flex items-center gap-5 shadow-2xl backdrop-blur-md">
                                        
                                        {/* Activo Visual (Imagen 3 / Avatar) */}
                                        <div className="h-16 w-16 rounded-[1.25rem] bg-zinc-900 overflow-hidden flex-shrink-0 relative shadow-inner">
                                            <Image
                                                src={result.image_url || '/images/placeholder.png'}
                                                alt={result.title}
                                                fill
                                                sizes="64px"
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            {isSearching && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                                                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                                </div>
                                            )}
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
                                                    {Math.round(result.similarity * 100)}% Resonancia
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