// components/ui/unified-search-bar.tsx
// VERSIÓN: 3.0 (Dynamic Command Engine - Search History & Layout Expansion)
// Misión: Disparador de búsqueda expansivo con persistencia de historial reciente.

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { 
    Search, 
    X, 
    History, 
    ArrowUpRight, 
    Command, 
    Clock 
} from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * UnifiedSearchBarProps
 * onSearch: Callback para ejecutar la búsqueda semántica.
 * onClear: Restablece el estado al cerrar.
 * userName: Para personalizar el placeholder dinámico.
 */
interface UnifiedSearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  userName?: string;
}

export function UnifiedSearchBar({ 
    onSearch, 
    onClear, 
    userName = "Creador" 
}: UnifiedSearchBarProps) {
  // --- ESTADOS OPERATIVOS ---
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * [PERSISTENCIA]: Carga del historial desde el almacenamiento local.
   */
  useEffect(() => {
    const saved = localStorage.getItem("nicepod_search_history");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      } catch (error) {
        console.error("🔥 [Search-History-Load-Error]:", error);
      }
    }
  }, []);

  /**
   * saveToHistory
   * Almacena términos de búsqueda únicos para futuras sugerencias.
   */
  const saveToHistory = useCallback((term: string) => {
    if (!term || term.trim().length < 3) return;
    
    setRecentSearches((previous) => {
      const filtered = previous.filter((item) => item !== term);
      const updated = [term, ...filtered].slice(0, 5);
      localStorage.setItem("nicepod_search_history", JSON.stringify(updated));
      return updated;
    });
  }, []);

  /**
   * handleToggle
   * Orquestador de la transición entre el botón minimalista y la barra completa.
   */
  const handleToggle = useCallback(() => {
    setIsExpanded((previous) => {
      const nextState = !previous;
      if (!nextState) {
        setInputValue("");
        onClear();
      }
      return nextState;
    });
  }, [onClear]);

  /**
   * executeSearch
   * Lógica de disparo de búsqueda.
   */
  const executeSearch = (term: string) => {
      if (term.trim().length > 2) {
          saveToHistory(term);
          onSearch(term);
      }
  };

  return (
    <div className="w-full relative flex items-center justify-end h-12">
      <AnimatePresence mode="wait">
        
        {/* --- ESTADO A: BOTÓN DE DISPARO (Minimalista) --- */}
        {!isExpanded ? (
          <motion.div
            key="trigger-button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center gap-3"
          >
            <Button
              onClick={handleToggle}
              variant="outline"
              className="h-12 w-12 rounded-2xl bg-white/5 border-white/10 hover:bg-primary/20 hover:border-primary/40 transition-all shadow-xl group"
            >
              <Search className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
            </Button>
          </motion.div>
        ) : (
          
          /* --- ESTADO B: CONSOLA EXPANDIDA --- */
          <motion.div
            key="expanded-bar"
            initial={{ width: "48px", opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            exit={{ width: "48px", opacity: 0 }}
            className="absolute right-0 flex flex-col bg-zinc-900/95 backdrop-blur-3xl border border-primary/30 rounded-[1.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
          >
            {/* Input Principal */}
            <div className="flex items-center px-4 h-14 gap-3 border-b border-white/5">
                <Search className="h-4 w-4 text-primary animate-pulse" />
                <Input
                    autoFocus
                    ref={inputRef}
                    value={inputValue}
                    onChange={(event) => {
                        setInputValue(event.target.value);
                        executeSearch(event.target.value);
                    }}
                    placeholder={`¿Qué quieres encontrar, ${userName}?`}
                    className="border-none bg-transparent focus-visible:ring-0 text-white placeholder:text-white/20 h-full p-0 text-sm font-bold uppercase tracking-tight"
                />
                <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-white/5 text-[8px] font-black text-white/30 border border-white/10 uppercase">
                    <Command size={10} /> Esc
                </kbd>
                <button
                    onClick={handleToggle}
                    className="p-2 hover:bg-white/10 rounded-xl transition-all"
                >
                    <X className="h-4 w-4 text-white/40" />
                </button>
            </div>

            {/* Panel de Historial Reciente */}
            {recentSearches.length > 0 && !inputValue && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-black/20"
                >
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <Clock size={10} className="text-primary/50" />
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">Búsquedas Recientes</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {recentSearches.map((term) => (
                            <button
                                key={term}
                                onClick={() => {
                                    setInputValue(term);
                                    executeSearch(term);
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                            >
                                <span className="text-[10px] font-bold text-white/60 group-hover:text-primary transition-colors">{term}</span>
                                <ArrowUpRight size={10} className="text-white/20 group-hover:text-primary transition-colors" />
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Footer Informativo */}
            <div className="px-5 py-2 bg-primary/5 flex items-center justify-between">
                <span className="text-[8px] font-black text-primary/40 uppercase tracking-widest">Global Intelligence Search</span>
                <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary animate-ping" />
                    <span className="text-[8px] font-bold text-white/20 uppercase">V2.5 Protocol</span>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}