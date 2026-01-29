// components/ui/unified-search-bar.tsx
// VERSIÓN: 1.0 (UX Mobile Hub - Navigation & Search Integration)

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { Library, Search, User, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface UnifiedSearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
}

export function UnifiedSearchBar({ onSearch, onClear }: UnifiedSearchBarProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleToggleSearch = () => {
    setIsSearching(!isSearching);
    if (isSearching) {
      setInputValue("");
      onClear();
    }
  };

  return (
    <div className="w-full relative h-12 flex items-center">
      <AnimatePresence mode="wait">
        {!isSearching ? (
          <motion.div
            key="nav-buttons"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full grid grid-cols-3 gap-2"
          >
            <Link href="/podcasts?tab=discover">
              <Button variant="secondary" className="w-full h-12 rounded-2xl bg-secondary/30 border-white/5 text-[10px] font-black uppercase tracking-widest">
                <Library className="mr-2 h-4 w-4 text-primary" /> Explorar
              </Button>
            </Link>
            <Link href="/podcasts?tab=library">
              <Button variant="secondary" className="w-full h-12 rounded-2xl bg-secondary/30 border-white/5 text-[10px] font-black uppercase tracking-widest">
                <User className="mr-2 h-4 w-4 text-primary" /> Creaciones
              </Button>
            </Link>
            <Button
              onClick={handleToggleSearch}
              className="w-full h-12 rounded-2xl bg-primary text-white border-none shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest"
            >
              <Search className="h-4 w-4 mr-2" /> Buscar
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="search-input"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full flex items-center bg-zinc-900 border border-primary/30 rounded-2xl px-4 h-12 gap-3"
          >
            <Search className="h-4 w-4 text-primary" />
            <Input
              autoFocus
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                onSearch(e.target.value);
              }}
              placeholder="Buscar idea, persona o tema..."
              className="border-none bg-transparent focus-visible:ring-0 text-white placeholder:text-white/20 h-full p-0 text-sm"
            />
            <button onClick={handleToggleSearch} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <X className="h-4 w-4 text-white/40" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}