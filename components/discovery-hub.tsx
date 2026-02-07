// components/discovery-hub.tsx
// VERSIÓN: 8.2 (Command Bridge - Production Integrity Edition)
// Misión: Centralizar la búsqueda semántica y la exploración de universos de NicePod.
// [FIX]: Definición local de SearchResult para garantizar éxito en el build de Vercel.

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
    Search 
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * [TYPE DEFINITION]: SearchResult
 * Definido localmente para evitar errores de importación circular o miembros no exportados.
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
 * DiscoveryHub: El cerebro de descubrimiento de NicePod V2.5.
 */
export function DiscoveryHub({
    showOnlySearch = false,
    showOnlyCategories = false,
    userName = "Creador"
}: DiscoveryHubProps) {
    const { supabase } = useAuth();
    
    // --- ESTADOS DE INTELIGENCIA ---
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [hasActiveSearch, setHasActiveSearch] = useState<boolean>(false);
    const [lastQuery, setLastQuery] = useState<string>("");

    /**
     * handleSemanticSearch
     * Orquesta la búsqueda vectorial cruzando el Edge con PostgreSQL.
     */
    const handleSemanticSearch = useCallback(async (searchTerm: string) => {
        if (!supabase || searchTerm.trim().length < 3) return;

        setIsSearching(true);
        setHasActiveSearch(true);
        setLastQuery(searchTerm);

        try {
            // 1. Vectorización de la consulta (Gecko-004)
            const { data: vectorData, error: vectorError } = await supabase.functions.invoke('vectorize-query', {
                body: { query: searchTerm }
            });

            if (vectorError) throw vectorError;

            // 2. Ejecución del RPC de búsqueda omnicanal
            const { data: searchResults, error: searchError } = await supabase.rpc('search_omni', {
                query_text: searchTerm,
                query_embedding: vectorData.embedding,
                match_threshold: 0.15,
                match_count: 10
            });

            if (searchError) throw searchError;

            setResults((searchResults as SearchResult[]) ?? []);

        } catch (error: any) {
            console.error("🔥 [DiscoveryHub-Search-Fail]:", error.message);
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [supabase]);

    /**
     * handleClearSearch
     * Limpia el estado y restablece la vista de universos.
     */
    const handleClearSearch = useCallback(() => {
        setResults([]);
        setHasActiveSearch(false);
        setIsSearching(false);
        setLastQuery("");
    }, []);

    // --- RENDERIZADOR 1: INTEGRACIÓN CON DASHBOARD (Solo Buscador) ---
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

    // --- RENDERIZADOR 2: GRILLA DE EXPLORACIÓN (Categorías o Resultados) ---
    return (
        <div className="w-full">
            
            {(!hasActiveSearch || showOnlyCategories) ? (
                /* ESTADO: EXPLORACIÓN DE UNIVERSOS */
                <div className="flex overflow-x-auto pb-6 gap-4 lg:grid lg:grid-cols-4 snap-x scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
                    {discoveryHubCategories.map((category) => (
                        <div key={category.key} className="min-w-[160px] w-[45%] lg:w-auto snap-start flex-shrink-0">
                            <UniverseCard {...category} isActive={false} />
                        </div>
                    ))}
                </div>
            ) : (
                /* ESTADO: VISUALIZACIÓN DE RESULTADOS */
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* UI: Sin Hallazgos Semánticos */}
                    {results.length === 0 && !isSearching ? (
                        <div className="text-center py-20 bg-white/[0.02] rounded-[2.5rem] border border-dashed border-white/10 flex flex-col items-center justify-center">
                            <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                                <Search size={24} className="text-primary/40" />
                            </div>
                            <div className="space-y-1 mb-6">
                                <p className="text-white font-black uppercase tracking-widest text-xs">Frecuencia Vacía</p>
                                <p className="text-muted-foreground text-xs font-medium max-w-[220px] mx-auto leading-relaxed">
                                    No hay resonancia para "{lastQuery}". Prueba con términos más amplios.
                                </p>
                            </div>
                            <Button 
                                variant="outline" 
                                onClick={handleClearSearch} 
                                className="border-white/10 rounded-xl font-black uppercase text-[9px] tracking-[0.2em] hover:bg-white/5 h-10 px-8"
                            >
                                REINICIAR RADAR
                            </Button>
                        </div>
                    ) : (
                        /* UI: Listado de Impactos */
                        <div className="grid grid-cols-1 gap-3 pb-10">
                            {results.map((result) => (
                                <Link 
                                    key={result.id} 
                                    href={result.type === 'podcast' ? `/podcast/${result.id}` : `/profile/${result.subtitle.replace('@', '')}`}
                                    className="block transition-transform active:scale-[0.98]"
                                >
                                    <div className="p-4 rounded-[2rem] bg-card/40 border border-white/5 hover:border-primary/30 hover:bg-card/60 transition-all flex items-center gap-5 group shadow-xl backdrop-blur-md">
                                        
                                        {/* Portada / Avatar del Nodo */}
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

                                        {/* Metadatos y Puntuación de Match */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-black text-sm uppercase tracking-tight truncate text-foreground leading-tight">
                                                    {result.title}
                                                </p>
                                                {result.similarity > 0.8 && (
                                                    <TrendingUp size={12} className="text-emerald-500 shrink-0 animate-pulse" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] text-muted-foreground truncate font-medium uppercase tracking-widest opacity-60">
                                                    {result.subtitle}
                                                </p>
                                                <span className="h-1 w-1 rounded-full bg-white/10" />
                                                <span className="text-[8px] font-black text-primary/60 uppercase tracking-widest">
                                                    {Math.round(result.similarity * 100)}% Match
                                                </span>
                                            </div>
                                        </div>

                                        {/* Badge de Clasificación */}
                                        <div className="hidden sm:block">
                                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 bg-white/5 border-white/10 text-muted-foreground/60">
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