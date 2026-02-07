// components/discovery-hub.tsx
// VERSIÓN: 8.0 (Command Bridge Standard - Seamless Integration)
// Misión: Orquestar la búsqueda semántica y los universos de conocimiento con soporte para expansión táctica.

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UnifiedSearchBar, SearchResult } from "@/components/ui/unified-search-bar";
import { UniverseCard } from "@/components/universe-card";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, PlayCircle, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Categorías de Universos Semánticos (Configuración Estática)
 */
const discoveryHubCategories = [
    { key: "deep_thought", title: "Pensamiento Profundo", image: "/images/universes/deep-thought.png", href: "/podcasts?tab=discover&universe=deep_thought" },
    { key: "practical_tools", title: "Herramientas Prácticas", image: "/images/universes/practical-tools.png", href: "/podcasts?tab=discover&universe=practical_tools" },
    { key: "tech_and_innovation", title: "Innovación y Tec.", image: "/images/universes/tech.png", href: "/podcasts?tab=discover&universe=tech_and_innovation" },
    { key: "narrative_and_stories", title: "Narrativa e Historias", image: "/images/universes/narrative.png", href: "/podcasts?tab=discover&universe=narrative_and_stories" },
];

interface DiscoveryHubProps {
    showOnlySearch?: boolean;
    showOnlyCategories?: boolean;
    userName?: string;
}

/**
 * DiscoveryHub: El centro de mando para el descubrimiento de conocimiento.
 */
export function DiscoveryHub({
    showOnlySearch = false,
    showOnlyCategories = false,
    userName = "Creador"
}: DiscoveryHubProps) {
    const { supabase } = useAuth();
    
    // ESTADOS DE RESULTADOS
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [hasActiveSearch, setHasActiveSearch] = useState<boolean>(false);

    /**
     * handleSemanticSearch
     * Procesa la consulta del usuario mediante vectorización y búsqueda omnicanal.
     */
    const handleSemanticSearch = useCallback(async (searchTerm: string) => {
        if (!supabase || searchTerm.trim().length < 3) return;

        setIsSearching(true);
        setHasActiveSearch(true);

        try {
            // 1. Vectorización de la consulta vía Edge Function
            const { data: vectorData, error: vectorError } = await supabase.functions.invoke('vectorize-query', {
                body: { query: searchTerm }
            });
            if (vectorError) throw vectorError;

            // 2. Búsqueda Omnicanal en la base de datos
            const { data: searchResults, error: searchError } = await supabase.rpc('search_omni', {
                query_text: searchTerm,
                query_embedding: vectorData.embedding,
                match_threshold: 0.15,
                match_count: 10
            });
            if (searchError) throw searchError;

            setResults(searchResults || []);
        } catch (error: any) {
            console.error("🔥 [DiscoveryHub-Search-Error]:", error.message);
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [supabase]);

    /**
     * handleClearSearch
     * Restablece el estado de descubrimiento.
     */
    const handleClearSearch = useCallback(() => {
        setResults([]);
        setHasActiveSearch(false);
        setIsSearching(false);
    }, []);

    // --- RENDERIZADOR 1: SOLO BUSCADOR (Dashboard Integration) ---
    // [ESTRATEGIA]: Delegamos la expansión al UnifiedSearchBar para cubrir el saludo.
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

    // --- RENDERIZADOR 2: CATEGORÍAS Y RESULTADOS (Discovery Grid) ---
    return (
        <div className="w-full space-y-10">
            
            {/* Mostrar categorías solo si no hay una búsqueda activa o si se solicita explícitamente */}
            {(!hasActiveSearch || showOnlyCategories) ? (
                <div className="flex overflow-x-auto pb-6 gap-4 lg:grid lg:grid-cols-4 snap-x scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
                    {discoveryHubCategories.map((category) => (
                        <div key={category.key} className="min-w-[160px] w-[45%] lg:w-auto snap-start flex-shrink-0">
                            <UniverseCard {...category} isActive={false} />
                        </div>
                    ))}
                </div>
            ) : (
                /* PANEL DE RESULTADOS DE BÚSQUEDA ACTIVOS */
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* Estado: Sin Resultados */}
                    {results.length === 0 && !isSearching ? (
                        <div className="text-center py-20 bg-white/[0.02] rounded-[2.5rem] border border-dashed border-white/10">
                            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search size={20} className="text-primary/40" />
                            </div>
                            <p className="text-muted-foreground font-medium text-sm">
                                No se detectó resonancia para esta consulta.
                            </p>
                            <Button 
                                variant="link" 
                                onClick={handleClearSearch} 
                                className="text-primary font-black uppercase text-[10px] mt-2 tracking-widest"
                            >
                                Reiniciar Radar
                            </Button>
                        </div>
                    ) : (
                        /* LISTADO DE IMPACTOS SEMÁNTICOS */
                        <div className="grid grid-cols-1 gap-3">
                            {results.map((result) => (
                                <Link 
                                    key={result.id} 
                                    href={result.type === 'podcast' ? `/podcast/${result.id}` : `/profile/${result.subtitle.replace('@', '')}`}
                                >
                                    <div className="p-4 rounded-[2rem] bg-card/40 border border-white/5 hover:border-primary/30 hover:bg-card/60 transition-all flex items-center gap-5 group shadow-xl">
                                        
                                        {/* Avatar / Cover del Resultado */}
                                        <div className="h-14 w-14 rounded-2xl bg-zinc-800 overflow-hidden flex-shrink-0 relative shadow-inner">
                                            <Image
                                                src={result.image_url || '/images/placeholder.png'}
                                                alt={result.title}
                                                fill
                                                sizes="56px"
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            {isSearching && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Información de Identidad */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <p className="font-black text-xs uppercase tracking-tight truncate">
                                                    {result.title}
                                                </p>
                                                {result.similarity > 0.8 && (
                                                    <TrendingUp size={10} className="text-emerald-500 shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-[10px] text-muted-foreground truncate font-medium uppercase tracking-tighter">
                                                {result.subtitle}
                                            </p>
                                        </div>

                                        {/* Badge de Categoría */}
                                        <Badge variant="outline" className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 bg-white/5 border-white/10 hidden sm:block">
                                            {result.type}
                                        </Badge>
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