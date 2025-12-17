// components/discovery-hub.tsx
// VERSIÓN: 3.0 (Mobile Carousel / Desktop Grid)

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UniverseCard } from "@/components/universe-card";
import { Search, X, Loader2, User, Mic, PlayCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const discoveryHubCategories = [
    { key: "deep_thought", title: "Pensamiento", image: "/images/universes/deep-thought.png", href: "/podcasts?tab=discover&universe=deep_thought" },
    { key: "practical_tools", title: "Herramientas", image: "/images/universes/practical-tools.png", href: "/podcasts?tab=discover&universe=practical_tools" },
    { key: "tech_and_innovation", title: "Innovación", image: "/images/universes/tech.png", href: "/podcasts?tab=discover&universe=tech_and_innovation" },
    { key: "narrative_and_stories", title: "Historias", image: "/images/universes/narrative.png", href: "/podcasts?tab=discover&universe=narrative_and_stories" },
];

type SearchResult = {
    type: 'podcast' | 'user';
    id: string;
    title: string;
    subtitle: string;
    image_url: string;
    similarity: number;
};

export function DiscoveryHub() {
    const { supabase } = useAuth();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim().length > 2) {
                performSearch(query);
            } else if (query.trim().length === 0) {
                setResults([]);
                setHasSearched(false);
            }
        }, 600);
        return () => clearTimeout(timer);
    }, [query]);

    const performSearch = async (searchTerm: string) => {
        if (!supabase) return;
        setIsSearching(true);
        setHasSearched(true);

        try {
            const { data: vectorData, error: vectorError } = await supabase.functions.invoke('vectorize-query', { body: { query: searchTerm } });
            if (vectorError || !vectorData.embedding) throw new Error("Error vectorizando");

            const { data: searchResults, error: searchError } = await supabase.rpc('search_omni', {
                query_text: searchTerm, query_embedding: vectorData.embedding, match_threshold: 0.15, match_count: 10
            });
            if (searchError) throw searchError;
            setResults(searchResults || []);
        } catch (error) { console.error("Search failed:", error); } 
        finally { setIsSearching(false); }
    };

    const clearSearch = () => { setQuery(""); setResults([]); setHasSearched(false); };
    const podcastResults = results.filter(r => r.type === 'podcast');
    const userResults = results.filter(r => r.type === 'user');

    return (
        <section className="my-4 lg:my-8 px-0">
            
            {/* BUSCADOR COMPACTO */}
            <div className="mb-6 lg:mb-8">
                {/* Título solo visible en Desktop para ahorrar espacio móvil */}
                <div className="hidden lg:block text-center mb-6">
                    <h2 className="text-3xl font-bold text-white mb-2">Centro de Descubrimiento</h2>
                    <p className="text-muted-foreground">Descubre conocimiento en audio.</p>
                </div>
                
                <div className="relative max-w-xl mx-auto">
                    <div className="relative flex items-center bg-muted/40 rounded-full border border-border/40 p-0.5">
                        <Search className="h-4 w-4 text-muted-foreground ml-3 mr-2" />
                        <Input 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Buscar ideas, personas o temas..." 
                            className="border-0 bg-transparent focus-visible:ring-0 text-sm h-10 flex-grow placeholder:text-muted-foreground/60"
                        />
                        {isSearching ? (
                            <Loader2 className="h-4 w-4 text-purple-500 animate-spin mr-3" />
                        ) : query.length > 0 ? (
                            <Button variant="ghost" size="icon" onClick={clearSearch} className="mr-1 h-7 w-7 hover:bg-white/10 rounded-full">
                                <X className="h-3 w-3" />
                            </Button>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* CONTENIDO */}
            <div className="min-h-[140px]">
                {!hasSearched ? (
                    /* MODO PASIVO: CARRUSEL HORIZONTAL EN MÓVIL / GRID EN DESKTOP */
                    <div className="flex overflow-x-auto pb-4 gap-3 lg:grid lg:grid-cols-4 snap-x scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
                        {discoveryHubCategories.map((category) => (
                            <div key={category.key} className="min-w-[140px] w-[40%] lg:w-auto snap-start flex-shrink-0">
                                <UniverseCard
                                    title={category.title}
                                    image={category.image}
                                    href={category.href}
                                    isActive={false}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    /* MODO ACTIVO: RESULTADOS (Sin cambios) */
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                        {/* ... (Lógica de resultados igual a la anterior) ... */}
                        {results.length === 0 && !isSearching ? (
                            <div className="text-center py-8 text-sm text-muted-foreground">
                                <p>Sin resultados para "{query}".</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {userResults.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-bold text-muted-foreground uppercase mb-2">Personas</h3>
                                        <div className="grid grid-cols-1 gap-2">
                                            {userResults.map(user => (
                                                <Link key={user.id} href={`/profile/${user.subtitle.replace('@', '')}`}>
                                                    <div className="flex items-center gap-3 p-2 rounded-lg bg-card/40 border border-border/30">
                                                        <Avatar className="h-8 w-8"><AvatarImage src={user.image_url} /></Avatar>
                                                        <div><p className="font-semibold text-sm">{user.title}</p></div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {podcastResults.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-bold text-muted-foreground uppercase mb-2">Podcasts</h3>
                                        <div className="grid grid-cols-1 gap-2">
                                            {podcastResults.map(pod => (
                                                <Link key={pod.id} href={`/podcast/${pod.id}`}>
                                                    <div className="flex gap-3 p-3 rounded-lg bg-card/40 border border-border/30">
                                                        <div className="relative h-12 w-12 rounded bg-black/20 flex-shrink-0 overflow-hidden">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img src={pod.image_url} alt="" className="object-cover w-full h-full" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="font-bold text-sm truncate text-white">{pod.title}</h4>
                                                            <p className="text-xs text-muted-foreground truncate">{pod.subtitle}</p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}