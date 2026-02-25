// components/ui/unified-search-bar.tsx
// VERSIÓN: 4.0

"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom"; // <--- INYECCIÓN CRÍTICA
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

// --- INFRAESTRUCTURA DE ICONOGRAFÍA ---
import { 
  Search, X, Command, History, ArrowUpRight, Zap, Loader2, Mic2,
  User as UserIcon, MapPin, TrendingUp, PlayCircle, Clock, Navigation,
  BookOpen, ChevronRight
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSearchRadar, SearchResult } from "@/hooks/use-search-radar";

export interface UnifiedSearchBarProps {
  placeholder?: string;
  onResults?: (results: SearchResult[]) => void;
  onLoading?: (isLoading: boolean) => void;
  onClear?: () => void;
  latitude?: number;
  longitude?: number;
  variant?: 'default' | 'console';
  className?: string;
}

export function UnifiedSearchBar({
  placeholder = "¿Qué buscas?",
  onResults,
  onLoading,
  onClear,
  latitude,
  longitude,
  variant = 'default',
  className
}: UnifiedSearchBarProps) {
  
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false); // <--- Control de Hidratación para Portales
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    query,
    setQuery,
    results,
    isLoading,
    history,
    clearRadar,
    performSearch,
    removeTermFromHistory
  } = useSearchRadar({ latitude, longitude, limit: 30 });

  // Aseguramos que createPortal solo corra en el cliente
  useEffect(() => {
    setMounted(true);
  },[]);

  useEffect(() => {
    if (onResults) onResults(results);
  }, [results, onResults]);

  useEffect(() => {
    if (onLoading) onLoading(isLoading);
  }, [isLoading, onLoading]);

  // SCROLL LOCK: Previene que el mapa se mueva de fondo
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => {
      const nextState = !prev;
      if (!nextState) {
        clearRadar();
        if (onClear) onClear();
      }
      return nextState;
    });
  }, [clearRadar, onClear]);

  const handleTriggerSearch = () => {
    if (query.trim().length >= 3) performSearch(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") handleToggle();
    if (e.key === "Enter") {
      e.preventDefault();
      handleTriggerSearch();
    }
  };

  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape" && isOpen) handleToggle();
    };
    window.addEventListener("keydown", handleGlobalKeys);
    return () => window.removeEventListener("keydown", handleGlobalKeys);
  },[isOpen, handleToggle]);

  // ---------------------------------------------------------------------------
  // NÚCLEO DE RENDERIZADO: EL PORTAL DE REACT (The Void Search)
  // Este bloque renderiza la consola en el <body>, no dentro del Dashboard.
  // ---------------------------------------------------------------------------
  const searchPortal = mounted && isOpen ? createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        //[FIX ABSOLUTO]: Fondo negro opaco al 100% (bg-black) para aniquilar el sangrado visual.
        className="fixed inset-0 z-[9999] bg-black backdrop-blur-3xl flex flex-col selection:bg-primary/30"
      >
        {/* CABECERA MAESTRA (Alineada al tope para evitar colisión con el teclado) */}
        <div className="w-full flex items-center justify-between gap-4 p-4 md:p-8 bg-zinc-950/50 border-b border-white/5">
          <div className="relative flex-1 max-w-4xl mx-auto flex items-center">
            <Search className={cn(
              "absolute left-4 h-5 w-5 transition-all z-10",
              isLoading ? "text-primary animate-spin" : "text-zinc-500"
            )} />
            
            <Input
              autoFocus
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              // [REFINAMIENTO UX]: Fondo oscuro sólido, sin bordes raros, texto claro.
              className="w-full h-14 pl-12 pr-12 bg-zinc-900 border-none rounded-xl text-lg md:text-2xl font-black text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-primary/50"
            />
          </div>
          
          <Button 
            variant="ghost" 
            onClick={handleToggle}
            className="h-14 w-14 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-white transition-all shrink-0"
          >
            <X size={24} />
          </Button>
        </div>

        {/* CUERPO DEL PORTAL */}
        <div className="flex-1 w-full max-w-4xl mx-auto overflow-y-auto px-4 py-6">
          <AnimatePresence mode="wait">
            {query.length === 0 ? (
              /* --- HISTORIAL --- */
              <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center gap-2 mb-6 opacity-50">
                  <History size={14} className="text-primary" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Exploraciones Recientes</h3>
                </div>
                {history.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {history.map((term) => (
                      <div key={term} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all group">
                        <button
                          onClick={() => { setQuery(term); performSearch(term); }}
                          className="flex-1 text-left font-bold text-sm text-zinc-300 group-hover:text-white transition-colors"
                        >
                          {term}
                        </button>
                        <button 
                          onClick={() => removeTermFromHistory(term)}
                          className="p-2 text-zinc-600 hover:text-red-500 rounded-lg"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-600 font-medium italic p-4">Sin registros locales.</p>
                )}
              </motion.div>
            ) : (
              /* --- RESULTADOS --- */
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-32">
                {results.length > 0 ? (
                  results.map((hit) => <SearchResultItem key={hit.id} result={hit} onClick={handleToggle} />)
                ) : !isLoading && (
                  <div className="flex flex-col items-center justify-center py-20 opacity-20">
                    <Zap size={48} className="mb-4 animate-pulse" />
                    <p className="text-sm font-black uppercase tracking-widest">Sin Resonancia</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  ) : null;

  // ---------------------------------------------------------------------------
  // RENDERIZADO DEL DISPARADOR (Lo que se ve en el Dashboard)
  // ---------------------------------------------------------------------------
  return (
    <div className={className}>
      {!isOpen && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          {variant === 'console' ? (
            <Button
              onClick={() => setIsOpen(true)}
              variant="outline"
              className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-black/40 border-white/10 hover:bg-primary/20 shadow-xl group"
            >
              <Search className="h-4 w-4 md:h-5 md:w-5 text-primary group-hover:scale-110 transition-transform" />
            </Button>
          ) : (
            <div 
              onClick={() => setIsOpen(true)}
              className="flex items-center bg-white/5 border border-white/10 rounded-xl h-10 px-4 cursor-pointer hover:border-primary/30 transition-all"
            >
              <Search className="h-4 w-4 text-zinc-500 mr-2" />
              <span className="text-xs text-zinc-500 font-medium">Buscar...</span>
            </div>
          )}
        </motion.div>
      )}
      
      {/* Inyectamos el portal al DOM global */}
      {searchPortal}
    </div>
  );
}

function SearchResultItem({ result, onClick }: { result: SearchResult, onClick: () => void }) {
  const href = 
    result.result_type === 'podcast' ? `/podcast/${result.id}` : 
    result.result_type === 'user' ? `/profile/${result.subtitle.replace('@', '')}` :
    result.result_type === 'place' ? `/map?lat=${result.metadata?.lat}&lng=${result.metadata?.lng}` : '#';

  return (
    <Link href={href} onClick={onClick} className="block group">
      <div className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/40 transition-all flex items-center gap-4">
        
        {/* Miniatura Compacta */}
        <div className="h-12 w-12 rounded-lg bg-zinc-900 overflow-hidden relative shrink-0 border border-white/10">
          {result.image_url ? (
            <Image src={result.image_url} alt="" fill sizes="48px" className="object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-primary/10">
              <BookOpen className="text-primary h-5 w-5 opacity-80" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {result.result_type === 'podcast' && <Mic2 size={10} className="text-primary" />}
            {result.result_type === 'user' && <UserIcon size={10} className="text-primary" />}
            <h4 className="font-bold text-sm text-white truncate group-hover:text-primary transition-colors">
              {result.title}
            </h4>
          </div>
          <p className="text-[10px] text-zinc-500 truncate">{result.subtitle}</p>
        </div>

        <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-white transition-colors" />
      </div>
    </Link>
  );
}