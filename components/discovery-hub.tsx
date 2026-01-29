// components/discovery-hub.tsx
// VERSIÓN: 5.0 (Madrid Resonance Sync - Segmented Rendering & Mobile Hub)

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UnifiedSearchBar } from "@/components/ui/unified-search-bar"; // [NUEVO]
import { UniverseCard } from "@/components/universe-card";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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

    const performSearch = async (searchTerm: string) => {
        if (!supabase || searchTerm.length < 3) return;
        setIsSearching(true);
        setHasSearched(true);
        try {
            const { data: vData } = await supabase.functions.invoke('vectorize-query', { body: { query: searchTerm } });
            const { data: sRes } = await supabase.rpc('search_omni', {
                query_text: searchTerm,
                query_embedding: vData.embedding,
                match_threshold: 0.15,
                match_count: 10
            });
            setResults(sRes || []);
        } catch (e) {
            console.error("Search failed:", e);
        } finally {
            setIsSearching(false);
        }
    };

    const clearSearch = () => {
        setQuery("");
        setResults([]);
        setHasSearched(false);
    };

    // --- RENDER 1: SOLO BUSCADOR (Header / Mobile Action Hub) ---
    if (showOnlySearch) {
        if (mobileVariant) {
            return (
                <div className="w-full">
                    <UnifiedSearchBar
                        userName={userName}
                        onSearch={performSearch}
                        onClear={clearSearch}
                    />
                </div>
            );
        }

        return (
            <div className="relative w-full group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative flex items-center bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-full px-4 h-12 shadow-sm">
                    <Search className="h-4 w-4 text-muted-foreground mr-3" />
                    <Input
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            if (e.target.value.length > 2) performSearch(e.target.value);
                        }}
                        placeholder="Buscar por idea, persona o tema..."
                        className="border-0 bg-transparent focus-visible:ring-0 text-sm h-full p-0"
                    />
                    {isSearching && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                </div>
            </div>
        );
    }

    // --- RENDER 2: SOLO CATEGORÍAS O RESULTADOS (Cuerpo de la Home) ---
    return (
        <div className="w-full">
            {!hasSearched || showOnlyCategories ? (
                /* CARRUSEL DE UNIVERSOS */
                <div className="flex overflow-x-auto pb-6 gap-4 lg:grid lg:grid-cols-4 snap-x scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
                    {discoveryHubCategories.map((category) => (
                        <div key={category.key} className="min-w-[160px] w-[45%] lg:w-auto snap-start flex-shrink-0">
                            <UniverseCard {...category} isActive={false} />
                        </div>
                    ))}
                </div>
            ) : (
                /* LISTADO DE RESULTADOS */
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {results.length === 0 && !isSearching ? (
                        <div className="text-center py-10 text-muted-foreground">
                            <p className="text-sm">No encontramos resonancia para "{query}".</p>
                            <Button variant="link" onClick={clearSearch} className="text-primary font-bold">Ver categorías</Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {results.map(result => (
                                <Link key={result.id} href={result.type === 'podcast' ? `/podcast/${result.id}` : `/profile/${result.subtitle.replace('@', '')}`}>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                                            <img src={result.image_url} alt="" className="object-cover w-full h-full" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm truncate">{result.title}</p>
                                            <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] uppercase font-black tracking-tighter">
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