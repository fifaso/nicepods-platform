// components/ui/unified-search-bar.tsx
// VERSIÓN: 3.2 (Command Engine - Final Precision)
// Misión: Gestionar la expansión visual sobre el saludo y la persistencia del historial.

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { 
    Search, 
    X, 
    Clock, 
    ArrowUpRight, 
    Command 
} from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

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
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Carga inicial del historial desde almacenamiento local
  useEffect(() => {
    const saved = localStorage.getItem("nicepod_search_history_v2");
    if (saved) {
      try {
        setHistory(JSON.parse(saved).slice(0, 5));
      } catch (error) {
        console.error("🔥 [History-Load-Error]:", error);
      }
    }
  }, []);

  /**
   * executeSearch
   * Solo guarda en el historial cuando la búsqueda se confirma.
   */
  const executeSearch = useCallback((term: string) => {
    const trimmedTerm = term.trim();
    if (trimmedTerm.length < 3) return;

    // Persistencia del historial (términos únicos)
    setHistory((prev) => {
      const filtered = prev.filter((item) => item !== trimmedTerm);
      const updated = [trimmedTerm, ...filtered].slice(0, 5);
      localStorage.setItem("nicepod_search_history_v2", JSON.stringify(updated));
      return updated;
    });

    onSearch(trimmedTerm);
  }, [onSearch]);

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => {
      const nextState = !prev;
      if (!nextState) {
        setInputValue("");
        onClear();
      }
      return nextState;
    });
  }, [onClear]);

  // Manejador de tecla Enter
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      executeSearch(inputValue);
    }
    if (event.key === "Escape") {
      handleToggle();
    }
  };

  return (
    <div className="w-full relative flex items-center justify-end h-14">
      <AnimatePresence mode="wait">
        
        {!isExpanded ? (
          <motion.div
            key="search-trigger"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: 20 }}
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
          <motion.div
            key="search-expanded"
            initial={{ width: "48px", opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            exit={{ width: "48px", opacity: 0 }}
            className="absolute top-0 right-0 flex flex-col bg-zinc-950 border border-primary/30 rounded-[1.5rem] shadow-[0_0_60px_rgba(0,0,0,0.8)] z-[60] overflow-hidden"
          >
            {/* Input de Control */}
            <div className="flex items-center px-5 h-14 gap-4">
                <Search className="h-5 w-5 text-primary animate-pulse shrink-0" />
                <Input
                    autoFocus
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        // Búsqueda en tiempo real desactivada para el historial según instrucción
                        onSearch(e.target.value); 
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={`Buscando resonancia para ${userName}...`}
                    className="border-none bg-transparent focus-visible:ring-0 text-white placeholder:text-white/20 h-full p-0 text-base font-black uppercase tracking-tight"
                />
                <button
                    onClick={handleToggle}
                    className="p-2 hover:bg-white/10 rounded-xl transition-all"
                >
                    <X className="h-5 w-5 text-white/40" />
                </button>
            </div>

            {/* Panel de Historial (Solo si el input está vacío) */}
            {history.length > 0 && !inputValue && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="p-5 bg-black/40 border-t border-white/5"
                >
                    <div className="flex items-center gap-2 mb-4 px-1">
                        <Clock size={12} className="text-primary/50" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Últimas Búsquedas</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        {history.map((term) => (
                            <button
                                key={term}
                                onClick={() => {
                                    setInputValue(term);
                                    executeSearch(term);
                                }}
                                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-primary/10 hover:border-primary/30 border border-white/5 transition-all group"
                            >
                                <span className="text-xs font-bold text-white/70 group-hover:text-white uppercase tracking-tight">{term}</span>
                                <ArrowUpRight size={14} className="text-white/20 group-hover:text-primary transition-colors" />
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}