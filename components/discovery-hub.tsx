// components/discovery-hub.tsx
// VERSIÓN: 8.3 (Command Bridge - Results Sync & Layout Fix)
// Misión: Orquestar el descubrimiento y asegurar la visibilidad de los impactos semánticos.

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
    Search as SearchIcon 
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";

export type SearchResult = {
    type: 'podcast' | 'user';
    id: string;
    title: string;
    subtitle: string;
    image_url: string;
    similarity: number;
};

interface DiscoveryHubProps {
    showOnlySearch?: boolean;
    showOnlyCategories?: boolean;
    userName?: string;
}

const discoveryHubCategories = [
    { key: "deep_thought", title: "Pensamiento", image: "/images/universes/deep-thought.png", href: "/podcasts?tab=discover&universe=deep_thought" },
    { key: "practical_tools", title: "Práctico", image: "/images/universes/practical-tools.png", href: "/podcasts?tab=discover&universe=practical_tools" },
    { key: "tech_and_innovation", title: "Tecnología", image: "/images/universes/tech.png", href: "/podcasts?tab=discover&universe=tech_and_innovation" },
    { key: "narrative_and_stories", title: "Narrativa", image: "/images/universes/narrative.png", href: "/podcasts?tab=discover&universe=narrative_and_stories" },
];

export function DiscoveryHub({
    showOnlySearch = false,
    showOnlyCategories = false,
    userName = "Creador"
}: DiscoveryHubProps) {
    const { supabase } = useAuth();
    
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [hasActiveSearch, setHasActiveSearch] = useState<boolean>(false);
    const [lastQuery, setLastQuery] = useState<string>("");

    const handleSearch = useCallback(async (searchTerm: string) => {
        if (!supabase || searchTerm.trim().length < 3) {
            setResults([]);
            setHasActiveSearch(false);
            return;
        }

        setIsSearching(true);
        setHasActiveSearch(true);
        setLastQuery(searchTerm);

        try {
            const { data: vectorData, error: vError } = await supabase.functions.invoke('vectorize-query', {
                body: { query: searchTerm }
            });

            if (vError) throw vError;

            const { data: sRes, error: sError } = await supabase.rpc('search_omni', {
                query_text: searchTerm,
                query_embedding: vectorData.embedding,
                match_threshold: 0.15,
                match_count: 10
            });

            if (sError) throw sError;
            setResults((sRes as SearchResult[]) ?? []);

        } catch (error: any) {
            console.error("🔥 [Search-Sync-Fail]:", error.message);
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [supabase]);

    const handleClear = useCallback(() => {
        setResults([]);
        setHasActiveSearch(false);
        setIsSearching(false);
    }, []);

    if (showOnlySearch) {
        return (
            <div className="w-full h-full">
                <UnifiedSearchBar
                    userName={userName}
                    onSearch={handleSearch}
                    onClear={handleClear}
                />
            </div>
        );
    }

    return (
        <div className="w-full">
            {(!hasActiveSearch || showOnlyCategories) ? (
                <div className="flex overflow-x-auto pb-6 gap-4 lg:grid lg:grid-cols-4 snap-x scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
                    {discoveryHubCategories.map((category) => (
                        <div key={category.key} className="min-w-[150px] w-[45%] lg:w-auto snap-start flex-shrink-0">
                            <UniverseCard {...category} isActive={false} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
                    {results.length === 0 && !isSearching ? (
                        <div className="text-center py-16 bg-white/[0.02] rounded-[2.5rem] border border-dashed border-white/10">
                            <SearchIcon size={24} className="mx-auto text-primary/20 mb-3" />
                            <p className="text-muted-foreground text-xs uppercase font-black tracking-widest">Sin resonancia para "{lastQuery}"</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {results.map((result) => (
                                <Link key={result.id} href={result.type === 'podcast' ? `/podcast/${result.id}` : `/profile/${result.subtitle.replace('@', '')}`}>
                                    <div className="p-4 rounded-[2rem] bg-card/60 border border-white/5 hover:border-primary/40 transition-all flex items-center gap-4 group shadow-xl">
                                        <div className="h-14 w-14 rounded-2xl overflow-hidden flex-shrink-0 relative shadow-inner">
                                            <Image src={result.image_url || '/images/placeholder.png'} alt={result.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                            {isSearching && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>}
                                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><PlayCircle className="text-white h-6 w-6" /></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-xs uppercase tracking-tight truncate">{result.title}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-[10px] text-muted-foreground font-medium uppercase truncate tracking-tighter opacity-60">{result.subtitle}</p>
                                                {result.similarity > 0.8 && <TrendingUp size={10} className="text-emerald-500" />}
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-white/5 border-white/10 hidden sm:block">{result.type}</Badge>
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