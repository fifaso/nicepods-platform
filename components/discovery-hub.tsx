// components/discovery-hub.tsx
// VERSIÓN: 9.1 (The Intelligence Command Bridge - Layout Stability Edition)
// Misión: Gestionar el estado de búsqueda asegurando que el diseño sea fluido y no colapse visualmente.

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

// Importación dinámica del estante para optimizar el hilo principal
const PodcastShelf = dynamic(
  () => import("@/components/podcast-shelf").then((mod) => mod.PodcastShelf),
  { ssr: false }
);

export type SearchResult = {
    type: 'podcast' | 'user';
    id: string;
    title: string;
    subtitle: string;
    image_url: string;
    similarity: number;
};

const discoveryHubCategories = [
    { key: "deep_thought", title: "Pensamiento", image: "/images/universes/deep-thought.png", href: "/podcasts?tab=discover&universe=deep_thought" },
    { key: "practical_tools", title: "Práctico", image: "/images/universes/practical-tools.png", href: "/podcasts?tab=discover&universe=practical_tools" },
    { key: "tech_and_innovation", title: "Tecnología", image: "/images/universes/tech.png", href: "/podcasts?tab=discover&universe=tech_and_innovation" },
    { key: "narrative_and_stories", title: "Narrativa", image: "/images/universes/narrative.png", href: "/podcasts?tab=discover&universe=narrative_and_stories" },
];

interface DiscoveryHubProps {
    userName: string;
    showShelvesOnNoSearch?: boolean;
    epicenterPodcasts?: PodcastWithProfile[];
    connectionsPodcasts?: PodcastWithProfile[];
    showOnlySearch?: boolean;
}

export function DiscoveryHub({
    userName = "Curador",
    showShelvesOnNoSearch = false,
    epicenterPodcasts = [],
    connectionsPodcasts = [],
    showOnlySearch = false
}: DiscoveryHubProps) {
    const { supabase } = useAuth();
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [hasActiveSearch, setHasActiveSearch] = useState<boolean>(false);
    const [lastQuery, setLastQuery] = useState<string>("");

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
            const { data: vectorData, error: vectorError } = await supabase.functions.invoke('vectorize-query', {
                body: { query: searchTerm }
            });
            if (vectorError) throw vectorError;

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

    const handleClearSearch = useCallback(() => {
        setResults([]);
        setHasActiveSearch(false);
        setIsSearching(false);
        setLastQuery("");
    }, []);

    // --- RENDERIZADOR: BUSCADOR (Header Mode) ---
    if (showOnlySearch) {
        return (
            /* 
               [FIX]: Reservamos una altura mínima de 56px (h-14) 
               Esto evita que el contenido de abajo suba cuando el buscador es absoluto.
            */
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
            {!hasActiveSearch ? (
                <div className="space-y-16 animate-in fade-in duration-700">
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

                    {showShelvesOnNoSearch && (
                        <div className="space-y-16">
                            <div className="relative group">
                                <div className="flex items-center gap-2 mb-4 px-1">
                                    <Zap size={14} className="text-primary fill-current opacity-40" />
                                    <h2 className="text-xs font-black uppercase tracking-widest text-foreground">Tu Epicentro Creativo</h2>
                                </div>
                                <PodcastShelf podcasts={epicenterPodcasts} variant="compact" title="Epicentro" />
                            </div>

                            <div className="relative group">
                                <div className="flex items-center gap-2 mb-4 px-1">
                                    <Sparkles size={14} className="text-purple-500 fill-current opacity-40" />
                                    <h2 className="text-xs font-black uppercase tracking-widest text-foreground">Conexiones Inesperadas</h2>
                                </div>
                                <PodcastShelf podcasts={connectionsPodcasts} variant="compact" title="Conexiones" />
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4 px-1">
                        <div className="flex items-center gap-3">
                            <Loader2 className={cn("h-4 w-4 text-primary", isSearching && "animate-spin")} />
                            <h2 className="text-sm font-black uppercase tracking-tighter text-white">
                                Resultados: <span className="text-primary italic">"{lastQuery}"</span>
                            </h2>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleClearSearch} className="h-8 rounded-xl font-black text-[9px] uppercase tracking-widest text-muted-foreground hover:bg-white/5">
                            Cerrar
                        </Button>
                    </div>

                    {results.length === 0 && !isSearching ? (
                        <div className="text-center py-24 bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center justify-center">
                            <Search size={32} className="text-primary/20 mb-4" />
                            <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">Sin resonancia</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {results.map((result) => (
                                <Link 
                                    key={result.id} 
                                    href={result.type === 'podcast' ? `/podcast/${result.id}` : `/profile/${result.subtitle.replace('@', '')}`}
                                    className="block group transition-all active:scale-[0.98]"
                                >
                                    <div className="p-4 rounded-[2rem] bg-card/60 border border-white/5 hover:border-primary/40 transition-all flex items-center gap-5 shadow-2xl backdrop-blur-md">
                                        <div className="h-16 w-16 rounded-[1.25rem] bg-zinc-900 overflow-hidden flex-shrink-0 relative">
                                            <Image src={result.image_url || '/images/placeholder.png'} alt={result.title} fill sizes="64px" className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                            {isSearching && <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
                                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"><PlayCircle className="text-white h-7 w-7" /></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-sm uppercase tracking-tight truncate text-foreground leading-tight">{result.title}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] text-muted-foreground truncate font-medium uppercase tracking-widest opacity-60">{result.subtitle}</p>
                                                <Badge variant="outline" className="text-[8px] font-black uppercase border-primary/20 text-primary/70 px-2 py-0">
                                                    {Math.round(result.similarity * 100)}% Match
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="hidden sm:block">
                                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 bg-white/5 border-white/10">{result.type}</Badge>
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