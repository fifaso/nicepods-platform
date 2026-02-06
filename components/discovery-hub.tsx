// components/discovery-hub.tsx
// VERSIÓN: 7.0 (High Performance Discovery - Next Image Optimized & Search UX)

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar";
import { UniverseCard } from "@/components/universe-card";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, PlayCircle, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";

const discoveryHubCategories = [
    { key: "deep_thought", title: "Pensamiento Profundo", image: "/images/universes/deep-thought.png", href: "/podcasts?tab=discover&universe=deep_thought" },
    { key: "practical_tools", title: "Herramientas Prácticas", image: "/images/universes/practical-tools.png", href: "/podcasts?tab=discover&universe=practical_tools" },
    { key: "tech_and_innovation", title: "Innovación y Tec.", image: "/images/universes/tech.png", href: "/podcasts?tab=discover&universe=tech_and_innovation" },
    { key: "narrative_and_stories", title: "Narrativa e Historias", image: "/images/universes/narrative.png", href: "/podcasts?tab=discover&universe=narrative_and_stories" },
];

interface DiscoveryHubProps {
    showOnlySearch?: boolean;
    showOnlyCategories?: boolean;
    mobileVariant?: boolean;
    userName?: string;
}

export function DiscoveryHub({
    showOnlySearch = false,
    showOnlyCategories = false,
    mobileVariant = false,
    userName = "Creador"
}: DiscoveryHubProps) {
    const { supabase } = useAuth();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    /**
     * performSearch
     * Ejecuta la búsqueda omnicanal cruzando vectorización y texto.
     */
    const performSearch = useCallback(async (searchTerm: string) => {
        if (!supabase || searchTerm.trim().length < 3) return;
        setIsSearching(true);
        setHasSearched(true);
        try {
            const { data: vData, error: vError } = await supabase.functions.invoke('vectorize-query', {
                body: { query: searchTerm }
            });
            if (vError) throw vError;

            const { data: sRes, error: sError } = await supabase.rpc('search_omni', {
                query_text: searchTerm,
                query_embedding: vData.embedding,
                match_threshold: 0.15,
                match_count: 10
            });
            if (sError) throw sError;

            setResults(sRes || []);
        } catch (e) {
            console.error("[NicePod-Search] Error crítico:", e);
        } finally {
            setIsSearching(false);
        }
    }, [supabase]);

    const clearSearch = useCallback(() => {
        setQuery("");
        setResults([]);
        setHasSearched(false);
    }, []);

    // --- RENDER 1: SOLO BUSCADOR (Dashboard Integration) ---
    if (showOnlySearch) {
        return (
            <div className="w-full">
                {mobileVariant ? (
                    <UnifiedSearchBar
                        userName={userName}
                        onSearch={performSearch}
                        onClear={clearSearch}
                    />
                ) : (
                    <div className="relative w-full group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-700"></div>
                        <div className="relative flex items-center bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-full px-5 h-14 shadow-sm">
                            <Search className="h-5 w-5 text-muted-foreground mr-3" />
                            <Input
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    if (e.target.value.length > 2) performSearch(e.target.value);
                                }}
                                placeholder="Buscar idea, persona o tema..."
                                className="border-0 bg-transparent focus-visible:ring-0 text-base h-full p-0"
                            />
                            {isSearching && <Loader2 className="h-5 w-5 animate-spin text-primary ml-2" />}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- RENDER 2: CATEGORÍAS Y RESULTADOS (Discovery View) ---
    return (
        <div className="w-full">
            {!hasSearched || showOnlyCategories ? (
                <div className="flex overflow-x-auto pb-8 gap-4 lg:grid lg:grid-cols-4 snap-x scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
                    {discoveryHubCategories.map((category) => (
                        <div key={category.key} className="min-w-[170px] w-[48%] lg:w-auto snap-start flex-shrink-0">
                            <UniverseCard {...category} isActive={false} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {results.length === 0 && !isSearching ? (
                        <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
                            <p className="text-muted-foreground font-medium">No hay resonancia para "{query}".</p>
                            <Button variant="link" onClick={clearSearch} className="text-primary font-black uppercase text-xs mt-2 tracking-widest">
                                Volver a explorar
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {results.map(result => (
                                <Link key={result.id} href={result.type === 'podcast' ? `/podcast/${result.id}` : `/profile/${result.subtitle.replace('@', '')}`}>
                                    <div className="p-5 rounded-3xl bg-card/40 border border-white/5 hover:border-primary/40 hover:bg-card/60 transition-all flex items-center gap-5 group shadow-xl">

                                        {/* CONTENEDOR DE IMAGEN OPTIMIZADA */}
                                        <div className="h-14 w-14 rounded-2xl bg-zinc-800 overflow-hidden flex-shrink-0 relative">
                                            <Image
                                                src={result.image_url || '/images/placeholder.png'}
                                                alt={result.title}
                                                fill
                                                sizes="56px"
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                                <PlayCircle className="text-white h-6 w-6" />
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-sm uppercase tracking-tight truncate">{result.title}</p>
                                            <p className="text-xs text-muted-foreground truncate font-medium mt-0.5">{result.subtitle}</p>
                                        </div>

                                        <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest px-2 py-1 bg-white/5 border-white/10">
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