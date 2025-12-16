// components/discovery-hub.tsx
// VERSIÓN: 2.0 (Omni-Search Enabled: Vector + Keyword)

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UniverseCard } from "@/components/universe-card";
import { Search, X, Loader2, User, Mic, PlayCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Categorías estáticas (Modo Pasivo)
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

    // DEBOUNCE: Esperar a que el usuario termine de escribir
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim().length > 2) {
                performSearch(query);
            } else if (query.trim().length === 0) {
                setResults([]);
                setHasSearched(false);
            }
        }, 600); // 600ms de espera

        return () => clearTimeout(timer);
    }, [query]);

    const performSearch = async (searchTerm: string) => {
        if (!supabase) return;
        setIsSearching(true);
        setHasSearched(true);

        try {
            // PASO 1: VECTORIZAR (Edge Function)
            // Convertimos el texto del usuario en matemáticas
            const { data: vectorData, error: vectorError } = await supabase.functions.invoke('vectorize-query', {
                body: { query: searchTerm }
            });

            if (vectorError || !vectorData.embedding) throw new Error("Error vectorizando");

            // PASO 2: BÚSQUEDA HÍBRIDA (Database RPC)
            // Enviamos el vector + texto para buscar en todo
            const { data: searchResults, error: searchError } = await supabase.rpc('search_omni', {
                query_text: searchTerm,
                query_embedding: vectorData.embedding,
                match_threshold: 0.5, // Umbral de similitud (ajustable)
                match_count: 10
            });

            if (searchError) throw searchError;
            setResults(searchResults || []);

        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const clearSearch = () => {
        setQuery("");
        setResults([]);
        setHasSearched(false);
    };

    // Agrupación de resultados para UI limpia
    const podcastResults = results.filter(r => r.type === 'podcast');
    const userResults = results.filter(r => r.type === 'user');

    return (
        <section className="my-8 md:my-12 px-2 md:px-0">
            
            {/* CABECERA Y BUSCADOR */}
            <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Centro de Descubrimiento</h2>
                <p className="text-muted-foreground mb-6">Descubre conocimiento en experiencias de audio concisas.</p>
                
                <div className="relative max-w-2xl mx-auto group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt blur"></div>
                    <div className="relative flex items-center bg-black rounded-full border border-white/10 p-1">
                        <Search className="h-5 w-5 text-muted-foreground ml-3 mr-2" />
                        <Input 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Buscar por idea, persona o tema..." 
                            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base h-12 flex-grow placeholder:text-muted-foreground/50"
                        />
                        {isSearching ? (
                            <Loader2 className="h-5 w-5 text-purple-500 animate-spin mr-4" />
                        ) : query.length > 0 ? (
                            <Button variant="ghost" size="icon" onClick={clearSearch} className="mr-1 h-8 w-8 hover:bg-white/10 rounded-full">
                                <X className="h-4 w-4" />
                            </Button>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* CONTENIDO DINÁMICO */}
            <div className="min-h-[300px]">
                {!hasSearched ? (
                    /* MODO PASIVO: CATEGORÍAS */
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {discoveryHubCategories.map((category) => (
                            <UniverseCard
                                key={category.key}
                                title={category.title}
                                image={category.image}
                                href={category.href}
                                isActive={false}
                            />
                        ))}
                    </div>
                ) : (
                    /* MODO ACTIVO: RESULTADOS */
                    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                        {results.length === 0 && !isSearching ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>No encontramos nada que resuene con "{query}".</p>
                                <Button variant="link" onClick={clearSearch}>Volver a categorías</Button>
                            </div>
                        ) : (
                            <>
                                {/* RESULTADOS: USUARIOS */}
                                {userResults.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider pl-1">Creadores</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {userResults.map(user => (
                                                <Link key={user.id} href={`/profile/${user.subtitle.replace('@', '')}`}>
                                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer">
                                                        <Avatar>
                                                            <AvatarImage src={user.image_url} />
                                                            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                                        </Avatar>
                                                        <div className="overflow-hidden">
                                                            <p className="font-semibold text-sm truncate">{user.title}</p>
                                                            <p className="text-xs text-muted-foreground truncate">{user.subtitle}</p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* RESULTADOS: PODCASTS */}
                                {podcastResults.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider pl-1">Podcasts Relacionados</h3>
                                        <div className="grid grid-cols-1 gap-3">
                                            {podcastResults.map(pod => (
                                                <Link key={pod.id} href={`/podcast/${pod.id}`}>
                                                    <div className="group flex gap-4 p-4 rounded-xl bg-slate-900/40 border border-white/5 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all">
                                                        <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-black/20">
                                                            {pod.image_url ? (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img src={pod.image_url} alt={pod.title} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center"><Mic className="h-6 w-6 text-muted-foreground" /></div>
                                                            )}
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <PlayCircle className="h-8 w-8 text-white drop-shadow-md" />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start">
                                                                <h4 className="font-bold text-base truncate pr-4 text-white group-hover:text-purple-300 transition-colors">{pod.title}</h4>
                                                                <Badge variant="outline" className="text-[10px] bg-purple-900/20 text-purple-200 border-purple-800 hidden sm:inline-flex">
                                                                    {Math.round(pod.similarity * 100)}% Match
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{pod.subtitle || "Sin descripción disponible."}</p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}