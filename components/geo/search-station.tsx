// components/geo/SearchStation.tsx
// VERSIÓN: 3.3 (Command Engine - Total Integrity & Icon Fix)
// Misión: Terminal de búsqueda expansiva con historial persistente y blindaje de tipos.
// [FIX]: Restauración de icono 'Zap' y optimización de profundidad visual (Z-Index).

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowUpRight,
    Command,
    History,
    Search,
    X,
    Zap // [FIX]: Importación de icono Zap restaurada
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * SearchResult: Contrato de datos para los impactos semánticos del NKV.
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
 * SearchStationProps: Interfaz de comunicación con el Orquestador del Dashboard.
 */
interface SearchStationProps {
    userName: string;
    onResults: (results: SearchResult[]) => void;
    onLoading: (isLoading: boolean) => void;
    onClear: () => void;
}

export function SearchStation({
    userName,
    onResults,
    onLoading,
    onClear
}: SearchStationProps) {
    const { supabase } = useAuth();

    // --- ESTADOS DE LA CONSOLA ---
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [query, setQuery] = useState<string>("");
    const [history, setHistory] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    /**
     * [PERSISTENCIA]: Recuperación del Historial
     * Extraemos los últimos 5 términos confirmados desde el almacenamiento local.
     */
    useEffect(() => {
        const savedHistory = localStorage.getItem("nicepod_confirmed_searches_v2");
        if (savedHistory) {
            try {
                const parsed = JSON.parse(savedHistory);
                setHistory(Array.isArray(parsed) ? parsed.slice(0, 5) : []);
            } catch (error) {
                console.error("🔥 [SearchStation] Error al cargar el historial persistente:", error);
            }
        }
    }, []);

    /**
     * saveSearchToHistory:
     * Almacena el término de búsqueda de forma atómica y única.
     */
    const saveSearchToHistory = useCallback((term: string) => {
        const cleanTerm = term.trim();
        if (cleanTerm.length < 3) return;

        setHistory((prevHistory) => {
            const filtered = prevHistory.filter((item) => item.toLowerCase() !== cleanTerm.toLowerCase());
            const newHistory = [cleanTerm, ...filtered].slice(0, 5);
            localStorage.setItem("nicepod_confirmed_searches_v2", JSON.stringify(newHistory));
            return newHistory;
        });
    }, []);

    /**
     * performSearch:
     * Orquesta el proceso de búsqueda: Vectorización -> Matchmaking Semántico.
     */
    const performSearch = useCallback(async (searchTerm: string) => {
        const target = searchTerm.trim();
        if (!supabase || target.length < 3) return;

        onLoading(true);
        saveSearchToHistory(target);

        try {
            console.log(`🔍 [SearchStation] Investigando resonancia para: "${target}"`);

            // 1. Vectorización de la consulta vía Edge Function
            const { data: vectorData, error: vectorError } = await supabase.functions.invoke('vectorize-query', {
                body: { query: target }
            });

            if (vectorError) throw vectorError;

            // 2. Ejecución del motor de búsqueda omnicanal en Postgres
            const { data: searchResults, error: searchError } = await supabase.rpc('search_omni', {
                query_text: target,
                query_embedding: vectorData.embedding,
                match_threshold: 0.15,
                match_count: 12
            });

            if (searchError) throw searchError;

            // Emitimos los resultados a la Estación de Inteligencia (Dashboard)
            onResults((searchResults as SearchResult[]) ?? []);

        } catch (error: any) {
            console.error("🔥 [SearchStation-Fatal]:", error.message);
            onResults([]);
        } finally {
            onLoading(false);
        }
    }, [supabase, onLoading, onResults, saveSearchToHistory]);

    /**
     * handleToggle:
     * Gestiona la expansión visual sobre el saludo.
     */
    const handleToggle = useCallback(() => {
        setIsExpanded((prev) => {
            const nextState = !prev;
            if (!nextState) {
                setQuery("");
                onClear();
            }
            return nextState;
        });
    }, [onClear]);

    /**
     * handleKeyDown:
     * Implementa atajos de teclado profesionales (Enter para buscar, Esc para cerrar).
     */
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            performSearch(query);
        }
        if (event.key === "Escape") {
            handleToggle();
        }
    };

    return (
        <div className="relative w-full flex items-center justify-end h-14">
            <AnimatePresence mode="wait">

                {/* ESTADO A: DISPARADOR MINIMALISTA (BOTÓN) */}
                {!isExpanded ? (
                    <motion.div
                        key="search_trigger_btn"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center"
                    >
                        <Button
                            onClick={handleToggle}
                            variant="outline"
                            className="h-12 w-12 rounded-2xl bg-card/40 border-white/10 hover:bg-primary/20 hover:border-primary/40 transition-all shadow-xl group"
                        >
                            <Search className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                        </Button>
                    </motion.div>
                ) : (

                    /* ESTADO B: CONSOLA DE COMANDO EXPANDIDA (OVERLAY) */
                    <motion.div
                        key="search_console_active"
                        initial={{ width: "48px", opacity: 0 }}
                        animate={{ width: "100%", opacity: 1 }}
                        exit={{ width: "48px", opacity: 0 }}
                        className="absolute top-0 right-0 flex flex-col bg-zinc-950 border border-primary/30 rounded-[1.5rem] shadow-[0_0_60px_rgba(0,0,0,0.8)] z-[60] overflow-hidden"
                    >
                        {/* Fila de Entrada Principal */}
                        <div className="flex items-center px-5 h-16 gap-4 border-b border-white/5">
                            <Search className="h-5 w-5 text-primary animate-pulse shrink-0" />
                            <Input
                                autoFocus
                                ref={inputRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={`¿Qué conocimiento buscas hoy, ${userName}?`}
                                className="border-none bg-transparent focus-visible:ring-0 text-white placeholder:text-white/20 h-full p-0 text-base font-black uppercase tracking-tight"
                            />
                            <div className="flex items-center gap-3">
                                <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-white/5 text-[8px] font-black text-white/30 border border-white/10 uppercase">
                                    <Command size={10} /> Esc
                                </kbd>
                                <button
                                    onClick={handleToggle}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-all"
                                >
                                    <X className="h-5 w-5 text-white/40" />
                                </button>
                            </div>
                        </div>

                        {/* Panel de Ecos Recientes (Historial Confirmado) */}
                        {history.length > 0 && !query && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                className="p-6 bg-black/40"
                            >
                                <div className="flex items-center gap-3 mb-4 px-1">
                                    <History size={12} className="text-primary/50" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                                        Exploraciones Recientes
                                    </span>
                                </div>
                                <div className="flex flex-col gap-2.5">
                                    {history.map((term) => (
                                        <button
                                            key={term}
                                            onClick={() => {
                                                setQuery(term);
                                                performSearch(term);
                                            }}
                                            className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] hover:bg-primary/10 hover:border-primary/30 border border-white/5 transition-all group"
                                        >
                                            <span className="text-xs font-black text-white/60 group-hover:text-white uppercase tracking-tight">
                                                {term}
                                            </span>
                                            <ArrowUpRight size={14} className="text-white/20 group-hover:text-primary transition-colors" />
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Footer Técnico (Branding & Status) */}
                        <div className="px-6 py-2.5 bg-primary/5 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Zap size={10} className="text-primary" />
                                <span className="text-[8px] font-black text-primary/60 uppercase tracking-widest">
                                    Vector Engine Active
                                </span>
                            </div>
                            <span className="text-[8px] font-bold text-white/20 uppercase">
                                NicePod V2.5.21 Terminal
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}