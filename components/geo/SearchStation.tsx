// components/geo/SearchStation.tsx
// VERSIÓN: 1.0 (Command Layer - Final Integrity)
// Misión: Disparador de búsqueda expansivo con gestión de historial y soberanía de capa (Z-Index).
// [ARQUITECTURA]: Capa volátil que cubre el saludo sin desplazar el flujo del documento.

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { 
    Search, 
    X, 
    Clock, 
    ArrowUpRight, 
    Loader2, 
    Command,
    History
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * SearchResult: Estructura de datos para los impactos semánticos del Knowledge Vault.
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
 * SearchStationProps: Interfaz de comunicación con el Orquestador (Dashboard).
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
    
    // --- ESTADOS DE INTERFACE ---
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [query, setQuery] = useState<string>("");
    const [history, setHistory] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    /**
     * [LIFECYCLE]: Carga de memoria persistente.
     * Recuperamos las últimas 5 búsquedas exitosas del usuario desde el almacenamiento local.
     */
    useEffect(() => {
        const savedHistory = localStorage.getItem("nicepod_confirmed_searches");
        if (savedHistory) {
            try {
                const parsed = JSON.parse(savedHistory);
                setHistory(Array.isArray(parsed) ? parsed.slice(0, 5) : []);
            } catch (error) {
                console.error("🔥 [SearchStation] Error al cargar historial:", error);
            }
        }
    }, []);

    /**
     * saveSearchToHistory
     * Almacena el término de búsqueda solo si es único y tiene valor semántico.
     */
    const saveSearchToHistory = useCallback((term: string) => {
        const cleanTerm = term.trim();
        if (cleanTerm.length < 3) return;

        setHistory((prevHistory) => {
            const filtered = prevHistory.filter((item) => item.toLowerCase() !== cleanTerm.toLowerCase());
            const newHistory = [cleanTerm, ...filtered].slice(0, 5);
            localStorage.setItem("nicepod_confirmed_searches", JSON.stringify(newHistory));
            return newHistory;
        });
    }, []);

    /**
     * performSearch
     * Ejecuta el pipeline de inteligencia: Vectorización -> RPC de búsqueda omnicanal.
     */
    const performSearch = useCallback(async (searchTerm: string) => {
        const target = searchTerm.trim();
        if (!supabase || target.length < 3) return;

        onLoading(true);
        saveSearchToHistory(target);

        try {
            // Estación 1: Generación de Vector de Consulta (Gecko-004)
            const { data: vectorData, error: vectorError } = await supabase.functions.invoke('vectorize-query', {
                body: { query: target }
            });

            if (vectorError) throw vectorError;

            // Estación 2: Búsqueda de Proximidad en NKV
            const { data: searchResults, error: searchError } = await supabase.rpc('search_omni', {
                query_text: target,
                query_embedding: vectorData.embedding,
                match_threshold: 0.15,
                match_count: 12
            });

            if (searchError) throw searchError;

            // Emitimos los resultados al Dashboard
            onResults((searchResults as SearchResult[]) ?? []);

        } catch (error: any) {
            console.error("🔥 [SearchStation-Error]:", error.message);
            onResults([]);
        } finally {
            onLoading(false);
        }
    }, [supabase, onLoading, onResults, saveSearchToHistory]);

    /**
     * handleToggle
     * Orquesta la apertura y el cierre de la consola de comando.
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
     * handleKeyDown
     * Provee atajos de teclado para una experiencia de workstation profesional.
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
                
                {/* ESTADO A: DISPARADOR MINIMALISTA */}
                {!isExpanded ? (
                    <motion.div
                        key="search_trigger"
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
                    
                    /* ESTADO B: CONSOLA DE COMANDO EXPANDIDA (Overlay) */
                    <motion.div
                        key="search_console"
                        initial={{ width: "48px", opacity: 0 }}
                        animate={{ width: "100%", opacity: 1 }}
                        exit={{ width: "48px", opacity: 0 }}
                        className="absolute right-0 flex flex-col bg-zinc-950/95 backdrop-blur-3xl border border-primary/30 rounded-[1.5rem] shadow-[0_0_60px_rgba(0,0,0,0.8)] z-[60] overflow-hidden"
                    >
                        {/* Fila de Entrada */}
                        <div className="flex items-center px-5 h-16 gap-4">
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
                            <div className="flex items-center gap-2">
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

                        {/* Panel de Historial de Sabiduría (Solo si no hay texto escrito) */}
                        {history.length > 0 && !query && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                className="p-6 bg-black/40 border-t border-white/5"
                            >
                                <div className="flex items-center gap-3 mb-4 px-1">
                                    <History size={12} className="text-primary/50" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                                        Ecos Recientes
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

                        {/* Footer Técnico de Consola */}
                        <div className="px-6 py-2.5 bg-primary/5 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Zap size={10} className="text-primary" />
                                <span className="text-[8px] font-black text-primary/60 uppercase tracking-widest">
                                    Vector Engine Active
                                </span>
                            </div>
                            <span className="text-[8px] font-bold text-white/20 uppercase">
                                NicePod V2.5.18 Shell
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}