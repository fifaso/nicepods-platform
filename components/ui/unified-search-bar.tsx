// components/ui/unified-search-bar.tsx
// VERSIÓN: 2.0 (UX Mobile Hub - Full Prop Integration)

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { Library, Search, User, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

/**
 * INTERFAZ: UnifiedSearchBarProps
 * [FIX]: Se añade 'userName' para personalización y consistencia con DiscoveryHub.
 */
interface UnifiedSearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  userName?: string;
}

export function UnifiedSearchBar({ onSearch, onClear, userName = "Creador" }: UnifiedSearchBarProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleToggleSearch = useCallback(() => {
    const nextState = !isSearching;
    setIsSearching(nextState);
    if (!nextState) {
      setInputValue("");
      onClear();
    }
  }, [isSearching, onClear]);

  return (
    <div className="w-full relative h-12 flex items-center gap-2">
      <AnimatePresence mode="wait">
        {!isSearching ? (
          <motion.div
            key="nav-buttons"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="w-full grid grid-cols-3 gap-2"
          >
            <Link href="/podcasts?tab=discover" className="w-full">
              <Button variant="secondary" className="w-full h-12 rounded-2xl bg-white/5 dark:bg-secondary/20 border-white/5 text-[10px] font-black uppercase tracking-tighter hover:bg-white/10 transition-all">
                <Library className="mr-2 h-4 w-4 text-primary" /> Explorar
              </Button>
            </Link>
            <Link href="/podcasts?tab=library" className="w-full">
              <Button variant="secondary" className="w-full h-12 rounded-2xl bg-white/5 dark:bg-secondary/20 border-white/5 text-[10px] font-black uppercase tracking-tighter hover:bg-white/10 transition-all">
                <User className="mr-2 h-4 w-4 text-primary" /> Mi Bóveda
              </Button>
            </Link>
            <Button
              onClick={handleToggleSearch}
              className="w-full h-12 rounded-2xl bg-primary text-white border-none shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest hover:brightness-110 active:scale-95 transition-all"
            >
              <Search className="h-4 w-4 mr-2" /> Buscar
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="search-input"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="w-full flex items-center bg-zinc-900/90 backdrop-blur-xl border border-primary/30 rounded-2xl px-4 h-12 gap-3 shadow-2xl"
          >
            <Search className="h-4 w-4 text-primary animate-pulse" />
            <Input
              autoFocus
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                onSearch(e.target.value);
              }}
              placeholder={`¿Qué buscas hoy, ${userName}?`}
              className="border-none bg-transparent focus-visible:ring-0 text-white placeholder:text-white/20 h-full p-0 text-sm font-medium"
            />
            <button
              onClick={handleToggleSearch}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors group"
              aria-label="Cerrar búsqueda"
            >
              <X className="h-4 w-4 text-white/40 group-hover:text-white transition-colors" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}