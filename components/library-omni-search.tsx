// components/library-omni-search.tsx
// VERSIÓN: 1.2 (Omni-Search Engine - Stable & Strict Logic)
// Misión: Ejecutar búsquedas vectoriales y de texto con protección contra ráfagas (Debounce).

"use client";

import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

/**
 * SearchResult: Estructura de datos devuelta por el RPC search_omni.
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
 * LibraryOmniSearchProps: Contrato de comunicación con el componente padre (LibraryTabs).
 */
interface LibraryOmniSearchProps {
    onSearchStart: () => void;
    onResults: (results: SearchResult[]) => void;
    onClear: () => void;
}

/**
 * LibraryOmniSearch: Terminal de búsqueda inteligente para la biblioteca NicePod.
 */
export function LibraryOmniSearch({
    onSearchStart,
    onResults,
    onClear
}: LibraryOmniSearchProps) {
    // Hooks de estado e identidad
    const { supabase } = useAuth();
    const [query, setQuery] = useState<string>("");
    const [isSearching, setIsSearching] = useState<boolean>(false);

    /**
     * performSearch
     * Orquestador de la búsqueda híbrida (Vectores + Texto).
     * Invocado tras el periodo de reposo del usuario (Debounce).
     */
    const performSearch = useCallback(async (searchTerm: string) => {
        if (!supabase || searchTerm.trim().length === 0) return;

        setIsSearching(true);
        // Notificamos al padre que la UI debe entrar en estado de carga
        onSearchStart();

        try {
            console.log(`🔍 [OmniSearch] Iniciando búsqueda semántica para: "${searchTerm}"`);

            // ESTACIÓN 1: Vectorización (Edge Function)
            // Convertimos el lenguaje natural del usuario en un vector de 768 dimensiones.
            const { data: vectorData, error: vectorError } = await supabase.functions.invoke('vectorize-query', {
                body: { query: searchTerm }
            });

            if (vectorError) throw vectorError;

            // ESTACIÓN 2: Intersección SQL (PostgreSQL RPC)
            // Cruzamos el vector con la tabla podcast_embeddings y realizamos búsqueda de texto en títulos.
            const { data: searchResults, error: searchError } = await supabase.rpc('search_omni', {
                query_text: searchTerm,
                query_embedding: vectorData.embedding,
                match_threshold: 0.15, // Umbral optimizado para diversidad en biblioteca
                match_count: 20
            });

            if (searchError) throw searchError;

            // Éxito: Transferimos los resultados al componente padre
            onResults(searchResults ?? []);

        } catch (error: any) {
            console.error("🔥 [OmniSearch-Fatal]:", error.message);
            onResults([]); // Fallback seguro a lista vacía para no romper la UI
        } finally {
            setIsSearching(false);
        }
    }, [supabase, onSearchStart, onResults]);

    /**
     * handleClear
     * Limpia la terminal y restablece el estado original de la biblioteca.
     */
    const handleClear = useCallback(() => {
        console.log("🧹 [OmniSearch] Limpiando criterios de búsqueda.");
        setQuery("");
        onClear();
    }, [onClear]);

    /**
     * [LÓGICA DE DEBOUNCE]
     * Este efecto vigila la entrada de texto. Solo dispara la búsqueda 
     * si el usuario deja de escribir durante 600ms.
     */
    useEffect(() => {
        // Ignoramos consultas irrelevantes (menos de 3 caracteres)
        if (query.trim().length > 2) {
            const timer = setTimeout(() => {
                performSearch(query);
            }, 600);

            return () => {
                clearTimeout(timer);
            };
        }

        // Si el usuario borra todo, limpiamos la pantalla instantáneamente
        if (query.trim().length === 0) {
            handleClear();
        }
    }, [query, performSearch, handleClear]);

    return (
        <div className="relative w-full max-w-md animate-in fade-in duration-500">
            <div className="relative flex items-center">
                {/* Icono de búsqueda visual */}
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground/60" />

                <Input
                    value={query}
                    onChange={(event) => {
                        setQuery(event.target.value);
                    }}
                    placeholder="Buscar por concepto, título o creador..."
                    className="pl-9 pr-10 bg-secondary/40 border-border/40 focus-visible:ring-primary/20 transition-all h-10 rounded-xl"
                    disabled={isSearching && query.length === 0}
                />

                {/* Control de estado a la derecha (Loader o Botón X) */}
                <div className="absolute right-3 flex items-center">
                    {isSearching ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                        query.length > 0 && (
                            <button
                                onClick={handleClear}
                                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                                title="Limpiar búsqueda"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )
                    )}
                </div>
            </div>

            {/* Indicador de ayuda contextual */}
            {query.length > 0 && query.length < 3 && !isSearching && (
                <p className="absolute -bottom-5 left-1 text-[9px] font-bold text-primary/60 uppercase tracking-tighter animate-pulse">
                    Escribe al menos 3 letras para activar el escáner
                </p>
            )}
        </div>
    );
}