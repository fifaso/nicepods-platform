"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Loader2 } from "lucide-react";

export type SearchResult = {
    type: 'podcast' | 'user';
    id: string;
    title: string;
    subtitle: string;
    image_url: string;
    similarity: number;
};

interface LibraryOmniSearchProps {
    onSearchStart: () => void;
    onResults: (results: SearchResult[]) => void;
    onClear: () => void;
}

export function LibraryOmniSearch({ onSearchStart, onResults, onClear }: LibraryOmniSearchProps) {
    const { supabase } = useAuth();
    const [query, setQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    // DEBOUNCE: Espera 600ms antes de disparar la IA
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim().length > 2) {
                performSearch(query);
            } else if (query.trim().length === 0) {
                handleClear();
            }
        }, 600);

        return () => clearTimeout(timer);
    }, [query]);

    const performSearch = async (searchTerm: string) => {
        if (!supabase) return;
        setIsSearching(true);
        onSearchStart(); // Avisamos al padre que estamos pensando

        try {
            // 1. Vectorizar
            const { data: vectorData, error: vectorError } = await supabase.functions.invoke('vectorize-query', {
                body: { query: searchTerm }
            });
            if (vectorError) throw vectorError;

            // 2. Buscar (Omni Search)
            const { data: searchResults, error: searchError } = await supabase.rpc('search_omni', {
                query_text: searchTerm,
                query_embedding: vectorData.embedding,
                match_threshold: 0.15, // Umbral permisivo para biblioteca
                match_count: 20
            });

            if (searchError) throw searchError;
            
            // Devolvemos resultados al padre
            onResults(searchResults || []);

        } catch (error) {
            console.error("Library search failed:", error);
            onResults([]); // Devolvemos vacío en error para no romper UI
        } finally {
            setIsSearching(false);
        }
    };

    const handleClear = () => {
        setQuery("");
        onClear();
    };

    return (
        <div className="relative w-full max-w-md">
            <div className="relative flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar por concepto, título o creador..."
                    className="pl-9 pr-10 bg-secondary/50 border-border/50 focus-visible:ring-primary/20 transition-all h-10"
                />
                <div className="absolute right-3 flex items-center">
                    {isSearching ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : query.length > 0 ? (
                        <button onClick={handleClear} className="text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" />
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}