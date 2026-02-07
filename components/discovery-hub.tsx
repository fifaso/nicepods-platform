// components/discovery-hub.tsx
// VERSIÓN: 8.1 (Command Bridge Standard - Fixed Icons & Semantic Mapping)
// Misión: Centralizar la búsqueda semántica y la exploración de universos de NicePod.

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    UnifiedSearchBar, 
    type SearchResult 
} from "@/components/ui/unified-search-bar";
import { UniverseCard } from "@/components/universe-card";
import { useAuth } from "@/hooks/use-auth";
import { 
    Loader2, 
    PlayCircle, 
    TrendingUp, 
    Search // [FIX]: Importación restaurada para evitar error react/jsx-no-undef
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * CONFIGURACIÓN: Universos Semánticos
 * Define los puntos de entrada temáticos a la biblioteca global.
 */
const discoveryHubCategories = [
    { 
        key: "deep_thought", 
        title: "Pensamiento Profundo", 
        image: "/images/universes/deep-thought.png", 
        href: "/podcasts?tab=discover&universe=deep_thought" 
    },
    { 
        key: "practical_tools", 
        title: "Herramientas Prácticas", 
        image: "/images/universes/practical-tools.png", 
        href: "/podcasts?tab=discover&universe=practical_tools" 
    },
    { 
        key: "tech_and_innovation", 
        title: "Innovación y Tec.", 
        image: "/images/universes/tech.png", 
        href: "/podcasts?tab=discover&universe=tech_and_innovation" 
    },
    { 
        key: "narrative_and_stories", 
        title: "Narrativa e Historias", 
        image: "/images/universes/narrative.png", 
        href: "/podcasts?tab=discover&universe=narrative_and_stories" 
    },
];

interface DiscoveryHubProps {
    showOnlySearch?: boolean;
    showOnlyCategories?: boolean;
    userName?: string;
}

/**
 * DiscoveryHub: El cerebro de descubrimiento de NicePod.
 */
export function DiscoveryHub({
    showOnlySearch = false,
    showOnlyCategories = false,
    userName = "Creador"
}: DiscoveryHubProps) {
    const { supabase } = useAuth();
    
    // --- ESTADOS DE INTELIGENCIA DE BÚSQUEDA ---
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [hasActiveSearch, setHasActiveSearch] = useState<boolean>(false);
    const [lastQuery, setLastQuery] = useState<string>("");

    /**
     * handleSemanticSearch
     * Orquesta el flujo de búsqueda vectorial (Gecko-004) y omnicanal.
     */
    const handleSemanticSearch = useCallback(async (searchTerm: string) => {
        if (!supabase || searchTerm.trim().length < 3) return;

        setIsSearching(true);
        setHasActiveSearch(true);
        setLastQuery(searchTerm);

        try {
            // FASE 1: Generación de ADN Semántico de la consulta
            const { data: vectorData, error: vectorError } = await supabase.functions.invoke('vectorize-query', {
                body: { query: searchTerm }
            });

            if (vectorError) throw vectorError;

            // FASE 2: Matchmaking Omnicanal en PostgreSQL
            const { data: searchResults, error: searchError } = await supabase.rpc('search_omni', {
                query_text: searchTerm,
                query_embedding: vectorData.embedding,
                match_threshold: 0.15,
                match_count: 10
            });

            if (searchError) throw searchError;

            setResults(searchResults ?? []);

        } catch (error: any) {
            console.error("🔥 [DiscoveryHub-Fatal]:", error.message);
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [supabase]);

    /**
     * handleClearSearch
     * Restablece la terminal de descubrimiento al estado de reposo.
     */
    const handleClearSearch = useCallback(() => {
        setResults([]);
        setHasActiveSearch(false);
        setIsSearching(false);
        setLastQuery("");
    }, []);

    // --- RENDERIZADOR 1: ESTRATEGIA DE BÚSQUEDA (Command Bar Integration) ---
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

    // --- RENDERIZADOR 2: GRILLA DE CONOCIMIENTO (Categorías y Resultados) ---
    return (
        <div className="w-full">
            
            {(!hasActiveSearch || showOnlyCategories) ? (
                /* VISTA A: Carrusel de Universos */
                <div className="flex overflow-x-auto pb-6 gap-4 lg:grid lg:grid-cols-4 snap-x scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
                    {discoveryHubCategories.map((category) => (
                        <div key={category.key} className="min-w-[160px] w-[45%] lg:w-auto snap-start flex-shrink-0 transition-transform active:scale-95">
                            <UniverseCard {...category} isActive={false} />
                        </div>
                    ))}
                </div>
            ) : (
                /* VISTA B: Resultados de Resonancia Activa */
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* Caso: Sin Resultados Detectados */}
                    {results.length === 0 && !isSearching ? (
                        <div className="text-center py-20 bg-white/[0.02] rounded-[2.5rem] border border-dashed border-white/10 flex flex-col items-center justify-center">
                            <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                <Search size={24} className="text-primary/40" />
                            </div>
                            <div className="space-y-1 mb-6">
                                <p className="text-white font-bold text-base">Frecuencia No Detectada</p>
                                <p className="text-muted-foreground text-xs font-medium max-w-[240px] mx-auto">
                                    No hay registros que resuenen con "{lastQuery}". Prueba con un concepto más amplio.
                                </p>
                            </div>
                            <Button 
                                variant="outline" 
                                onClick={handleClearSearch} 
                                className="border-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white/5 h-10 px-6"
                            >
                                Reiniciar Escaneo
                            </Button>
                        </div>
                    ) : (
                        /* Caso: Muestra de Impactos Semánticos */
                        <div className="grid grid-cols-1 gap-3 pb-10">
                            {results.map((result) => (
                                <Link 
                                    key={result.id} 
                                    href={result.type === 'podcast' ? `/podcast/${result.id}` : `/profile/${result.subtitle.replace('@', '')}`}
                                    className="block"
                                >
                                    <div className="p-4 rounded-[2rem] bg-card/40 border border-white/5 hover:border-primary/30 hover:bg-card/60 transition-all flex items-center gap-5 group shadow-xl backdrop-blur-md">
                                        
                                        {/* Representación Visual del Activo */}
                                        <div className="h-16 w-16 rounded-[1.25rem] bg-zinc-800 overflow-hidden flex-shrink-0 relative shadow-inner">
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

                                        {/* Metadatos de Identidad y Match */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-black text-sm uppercase tracking-tight truncate text-foreground leading-tight">
                                                    {result.title}
                                                </p>
                                                {result.similarity > 0.8 && (
                                                    <div className="flex items-center gap-1 text-emerald-500 animate-pulse">
                                                        <TrendingUp size={12} />
                                                        <span className="text-[8px] font-black uppercase">Alta</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] text-muted-foreground truncate font-medium uppercase tracking-widest opacity-60">
                                                    {result.subtitle}
                                                </p>
                                                <span className="h-1 w-1 rounded-full bg-white/10" />
                                                <span className="text-[8px] font-black text-primary/60 uppercase tracking-tighter">
                                                    {Math.round(result.similarity * 100)}% Match
                                                </span>
                                            </div>
                                        </div>

                                        {/* Sello de Tipo de Nodo */}
                                        <div className="hidden sm:block">
                                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 bg-white/5 border-white/10 text-muted-foreground">
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