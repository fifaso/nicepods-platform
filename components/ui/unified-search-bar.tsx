// components/ui/unified-search-bar.tsx
// VERSIÓN: 3.2

"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

// --- INFRAESTRUCTURA DE ICONOGRAFÍA (LUCIDE-REACT) ---
import { 
  Search, 
  X, 
  Command, 
  History, 
  ArrowUpRight, 
  Zap, 
  Loader2,
  Mic2,
  User as UserIcon,
  MapPin,
  TrendingUp,
  PlayCircle,
  Clock,
  Navigation,
  BookOpen,
  ChevronRight
} from "lucide-react";

// --- INFRAESTRUCTURA UI (NicePod Design System) ---
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// --- LÓGICA DE RADAR Y CONTRATOS ---
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

/**
 * COMPONENTE: UnifiedSearchBar
 * La Estación de Inteligencia en Pantalla Completa de NicePod V2.5.
 */
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
  
  // --- ESTADOS DE GESTIÓN DEL PORTAL ---
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const portalRef = useRef<HTMLDivElement>(null);

  // --- INICIALIZACIÓN DEL CEREBRO SEMÁNTICO ---
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

  // --- SINCRONIZACIÓN DE ESTADOS ---
  useEffect(() => {
    if (onResults) {
      onResults(results);
    }
  },[results, onResults]);

  useEffect(() => {
    if (onLoading) {
      onLoading(isLoading);
    }
  }, [isLoading, onLoading]);

  // --- SCROLL LOCK GLOBAL ---
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

  // --- GESTIÓN DE CIERRE ---
  const handleToggle = useCallback(() => {
    setIsOpen((prev) => {
      const nextState = !prev;
      if (!nextState) {
        clearRadar();
        if (onClear) onClear();
      }
      return nextState;
    });
  },[clearRadar, onClear]);

  // --- GATILLO DE BÚSQUEDA MANUAL ---
  const handleTriggerSearch = useCallback(() => {
    if (query.trim().length >= 3) {
      performSearch(query);
    }
  }, [query, performSearch]);

  // --- GESTIÓN DE TECLADO INTERNO ---
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      handleToggle();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      handleTriggerSearch();
    }
  }, [handleToggle, handleTriggerSearch]);

  // --- GESTIÓN DE TECLADO GLOBAL (Atajos) ---
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape" && isOpen) {
        handleToggle();
      }
    };
    
    window.addEventListener("keydown", handleGlobalKeys);
    return () => window.removeEventListener("keydown", handleGlobalKeys);
  },[isOpen, handleToggle]);

  return (
    <div className={cn("relative z-[60]", className)}>
      
      {/* I. TRIGGER (Estado Inactivo) */}
      {!isOpen && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          {variant === 'console' ? (
            <Button
              onClick={() => setIsOpen(true)}
              variant="outline"
              className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-black/40 border-white/10 hover:bg-primary/20 hover:border-primary/40 transition-all shadow-xl group"
              aria-label="Abrir terminal de búsqueda"
            >
              <Search className="h-4 w-4 md:h-5 md:w-5 text-primary group-hover:scale-110 transition-transform" />
            </Button>
          ) : (
            <div 
              onClick={() => setIsOpen(true)}
              className="relative flex items-center bg-white/[0.03] border border-white/10 rounded-2xl h-12 px-5 cursor-pointer group hover:border-primary/30 transition-all shadow-inner"
            >
              <Search className="h-4 w-4 text-zinc-500 mr-3 group-hover:text-primary transition-colors" />
              <span className="text-sm text-zinc-600 font-medium tracking-tight group-hover:text-zinc-400 transition-colors">Buscar conocimiento...</span>
              <div className="ml-auto hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[8px] font-black text-zinc-700 uppercase tracking-widest">
                <Command size={8} /> K
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* II. PORTAL DE DESCUBRIMIENTO (Estado Activo Pantalla Completa) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={portalRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#020202]/98 backdrop-blur-xl flex flex-col p-4 md:p-12 selection:bg-primary/30"
          >
            
            {/* CABECERA: INPUT MAESTRO */}
            <div className="w-full max-w-4xl mx-auto flex items-center gap-4 mb-8 mt-2 md:mt-0">
              <div className="relative flex-1">
                <button 
                  onClick={handleTriggerSearch}
                  className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 outline-none"
                  aria-label="Ejecutar búsqueda"
                >
                  <Search className={cn(
                    "h-5 w-5 md:h-6 md:w-6 transition-all",
                    isLoading ? "text-primary animate-spin" : "text-primary/60 hover:text-primary"
                  )} />
                </button>
                
                <Input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  className={cn(
                    "w-full h-14 md:h-20 pl-12 md:pl-16 pr-16 md:pr-24 bg-white/5 border-white/10 rounded-2xl md:rounded-[2.5rem]",
                    "text-lg md:text-3xl font-black uppercase tracking-tight text-white placeholder:text-white/10",
                    "focus-visible:ring-primary/20 shadow-2xl transition-all"
                  )}
                />

                <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-4">
                  {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                  <kbd className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black text-white/30 uppercase tracking-widest">
                    <Command size={10} /> ESC
                  </kbd>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                onClick={handleToggle}
                className="h-14 w-14 md:h-20 md:w-20 rounded-2xl md:rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/10 text-white/40 hover:text-red-500 transition-all flex items-center justify-center shrink-0"
                aria-label="Cerrar terminal"
              >
                <X className="h-6 w-6 md:h-8 md:w-8" />
              </Button>
            </div>

            {/* CUERPO DEL PORTAL: HISTORIAL Y RESULTADOS */}
            <div className="flex-1 w-full max-w-4xl mx-auto overflow-hidden flex flex-col px-1 md:px-0">
              
              <AnimatePresence mode="wait">
                {query.length === 0 ? (
                  /* --- ESCENARIO A: HISTORIAL --- */
                  <motion.div
                    key="history"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 pt-2 md:pt-4"
                  >
                    <div className="flex items-center gap-3 px-2 opacity-40">
                      <History size={14} className="text-primary" />
                      <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-white">
                        Recientes
                      </h3>
                    </div>
                    
                    {history.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 px-1">
                        {history.map((term) => (
                          <div 
                            key={term}
                            className="flex items-center justify-between p-4 md:p-5 rounded-2xl md:rounded-[1.5rem] bg-white/[0.03] border border-white/5 hover:border-primary/30 transition-all group shadow-sm"
                          >
                            <button
                              onClick={() => {
                                setQuery(term);
                                performSearch(term);
                              }}
                              className="flex-1 flex items-center justify-between text-left outline-none"
                            >
                              <span className="text-sm md:text-lg font-bold text-zinc-400 group-hover:text-white uppercase tracking-tight italic transition-colors">
                                {term}
                              </span>
                              <ArrowUpRight size={18} className="text-zinc-700 group-hover:text-primary transition-all" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                removeTermFromHistory(term);
                              }}
                              className="ml-4 p-2 text-zinc-700 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="Borrar del historial"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-12 md:py-16 border-l border-white/5 ml-2 md:ml-4">
                        <p className="text-xs md:text-sm text-zinc-600 font-medium italic">Sincronice una frecuencia de búsqueda para activar la memoria.</p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* --- ESCENARIO B: RESULTADOS DE ALTA DENSIDAD --- */
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col space-y-6 overflow-y-auto custom-scrollbar pr-2 md:pr-4 pb-24 md:pb-32 pt-2"
                  >
                    {results.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3 md:gap-4">
                        {results.map((hit) => (
                          <SearchResultItem key={hit.id} result={hit} onClick={handleToggle} />
                        ))}
                      </div>
                    ) : !isLoading && (
                      <div className="flex flex-col items-center justify-center py-20 opacity-10">
                        <Zap size={60} className="mb-6 animate-pulse" />
                        <p className="text-lg md:text-2xl font-black uppercase tracking-widest">Sin Resonancia</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* FOOTER: TELEMETRÍA (Oculto en móviles pequeños para ganar espacio) */}
            <div className="hidden sm:flex w-full max-w-4xl mx-auto pt-6 border-t border-white/5 items-center justify-between mt-auto">
              <div className="flex items-center gap-4 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest">Radar Nominal</span>
              </div>
              <p className="text-[8px] font-black text-white/5 uppercase tracking-[0.4em] italic">NicePod V2.5 Terminal</p>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * SUB-COMPONENTE: SearchResultItem
 */
function SearchResultItem({ result, onClick }: { result: SearchResult, onClick: () => void }) {
  const href = 
    result.result_type === 'podcast' ? `/podcast/${result.id}` : 
    result.result_type === 'user' ? `/profile/${result.subtitle.replace('@', '')}` :
    result.result_type === 'place' ? `/map?lat=${result.metadata?.lat}&lng=${result.metadata?.lng}` : '#';

  return (
    <Link href={href} onClick={onClick} className="group outline-none block">
      <div className="p-4 md:p-5 rounded-2xl md:rounded-[1.5rem] bg-white/[0.02] border border-white/5 hover:border-primary/40 hover:bg-white/[0.04] transition-all flex items-center gap-4 md:gap-5 shadow-xl">
        
        <div className="h-14 w-14 md:h-16 md:w-16 rounded-xl bg-zinc-900 overflow-hidden flex-shrink-0 relative border border-white/5">
          {result.image_url ? (
            <Image src={result.image_url} alt="" fill sizes="64px" className="object-cover group-hover:scale-110 transition-transform duration-1000" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-primary/5">
              {result.result_type === 'place' ? <MapPin className="text-primary h-6 w-6 opacity-80" /> : <BookOpen className="text-primary h-6 w-6 opacity-80" />}
            </div>
          )}
          {result.result_type === 'podcast' && (
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
              <PlayCircle className="text-white h-8 w-8" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1.5">
            <div className="flex items-center gap-2">
              {result.result_type === 'podcast' && <Mic2 size={12} className="text-zinc-500" />}
              {result.result_type === 'user' && <UserIcon size={12} className="text-zinc-500" />}
              {result.result_type === 'place' && <Navigation size={12} className="text-zinc-500" />}
              {result.result_type === 'vault_chunk' && <History size={12} className="text-zinc-500" />}
              <h4 className="font-black text-sm md:text-lg uppercase tracking-tight truncate text-white group-hover:text-primary transition-colors leading-none italic">
                {result.title}
              </h4>
            </div>
            <Badge variant="outline" className="text-[7px] font-black uppercase border-primary/20 text-primary/70 rounded-full px-2 py-0">
              {Math.round(result.similarity * 100)}%
            </Badge>
          </div>
          
          <p className="text-[10px] md:text-xs text-zinc-500 truncate font-medium uppercase tracking-tighter opacity-80">
            {result.subtitle}
          </p>
        </div>

        <ChevronRight className="h-5 w-5 text-white/5 group-hover:text-primary group-hover:translate-x-1 transition-all mr-1" />
      </div>
    </Link>
  );
}