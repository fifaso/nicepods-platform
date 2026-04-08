/**
 * ARCHIVO: components/ui/unified-search-bar.tsx
 * VERSIÓN: 6.1 (NicePod Void Search - Ergonomic Fix Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Terminal de inmersión total optimizada para visibilidad extrema (Void Search).
 * [REFORMA V6.1]: Corrección quirúrgica de contrastes CSS y proporciones de iconos 
 * en dispositivos móviles, manteniendo la integridad nominal estricta.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

// --- INFRAESTRUCTURA DE ICONOGRAFÍA (LUCIDE-REACT) ---
import { 
  Search, 
  X, 
  History, 
  Zap, 
  Mic2,
  User as UserIcon, 
  BookOpen, 
  ChevronRight 
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSearchRadar, SearchResult } from "@/hooks/use-search-radar";

/**
 * INTERFAZ: UnifiedSearchBarProperties
 */
export interface UnifiedSearchBarProperties {
  placeholder?: string;
  onSearchIdentificationResults?: (results: SearchResult[] | null) => void;
  onLoadingStatusChange?: (isLoading: boolean) => void;
  onClearAction?: () => void;
  latitude?: number;
  longitude?: number;
  variant?: 'default' | 'console';
  className?: string;
}

export function UnifiedSearchBar({
  placeholder = "¿Qué ecos buscamos?",
  onSearchIdentificationResults,
  onLoadingStatusChange,
  onClearAction,
  latitude,
  longitude,
  variant = 'default',
  className
}: UnifiedSearchBarProperties) {
  
  // --- ESTADOS DE INTERFAZ Y CICLO DE VIDA ---
  const [isSearchInterfaceOpen, setIsSearchInterfaceOpen] = useState<boolean>(false);
  const [isComponentMounted, setIsComponentMounted] = useState<boolean>(false);
  const inputReference = useRef<HTMLInputElement>(null);

  /**
   * HOOK: useSearchRadar
   * Misión: Consultar el radar semántico de la Bóveda NKV.
   */
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

  // 1. Handshake de Hidratación
  useEffect(() => {
    setIsComponentMounted(true);
  }, []);

  // 2. Sincronía de Resultados con el Orquestador Superior
  useEffect(() => {
    if (isComponentMounted && onSearchIdentificationResults) {
      onSearchIdentificationResults(results);
    }
  }, [results, onSearchIdentificationResults, isComponentMounted]);

  // 3. Comunicación del Estado de Carga
  useEffect(() => {
    if (isComponentMounted && onLoadingStatusChange) {
      onLoadingStatusChange(isLoading);
    }
  }, [isLoading, onLoadingStatusChange, isComponentMounted]);

  // 4. Gobernanza del Scroll de Fondo
  useEffect(() => {
    if (isSearchInterfaceOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSearchInterfaceOpen]);

  /**
   * handleInterfaceToggle:
   * Misión: Gestionar la apertura y el cierre de la terminal de búsqueda.
   */
  const handleInterfaceToggle = useCallback(() => {
    setIsSearchInterfaceOpen((previousState) => {
      const nextState = !previousState;
      if (!nextState) {
        clearRadar();
        if (onClearAction) onClearAction();
      }
      return nextState;
    });
  }, [clearRadar, onClearAction]);

  /**
   * handleSearchTrigger:
   * Misión: Ejecutar la consulta al radar si se cumple el umbral de densidad de caracteres.
   */
  const handleSearchTrigger = () => {
    if (query.trim().length >= 3) {
      performSearch(query);
    }
  };

  /**
   * handleKeyboardNavigation:
   * Misión: Procesar comandos de teclado dentro de la terminal.
   */
  const handleKeyboardNavigation = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      handleInterfaceToggle();
    }
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearchTrigger();
    }
  };

  /**
   * EFECTO: CommandKeySentinel
   * Misión: Escuchar el atajo global de búsqueda (Cmd+K / Ctrl+K).
   */
  useEffect(() => {
    const handleGlobalKeyboardShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsSearchInterfaceOpen(true);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyboardShortcut);
    return () => window.removeEventListener("keydown", handleGlobalKeyboardShortcut);
  }, []);

  /**
   * searchPortalInterface:
   * Misión: Renderizar la terminal de búsqueda en el nivel superior del DOM.
   */
  const searchPortalInterface = isComponentMounted && isSearchInterfaceOpen ? createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-3xl flex flex-col selection:bg-primary/30"
      >
        {/* BARRA DE ENTRADA SUPERIOR */}
        <div className="w-full flex items-center justify-between gap-3 p-4 md:p-8 bg-[#050505]/80 border-b border-white/5">
          <div className="relative flex-1 max-w-4xl mx-auto flex items-center">
            <Search className={cn(
              "absolute left-4 md:left-5 h-5 w-5 transition-all z-10", 
              isLoading ? "text-primary animate-spin" : "text-zinc-400"
            )} />
            <Input
              autoFocus
              ref={inputReference}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleKeyboardNavigation}
              placeholder={placeholder}
              // [FIX V6.1]: padding-right ajustado para que el texto no pise la X
              className="w-full h-14 md:h-16 pl-12 md:pl-14 pr-4 bg-zinc-900/50 border border-white/5 rounded-2xl text-base md:text-2xl font-black text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-primary/40 transition-all"
            />
          </div>
          {/* [FIX V6.1]: Botón de cierre más grande y ergonómico para móviles */}
          <Button 
            variant="ghost" 
            onClick={handleInterfaceToggle} 
            className="p-3 md:p-4 h-auto w-auto rounded-2xl bg-white/5 border border-white/10 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 shrink-0 transition-colors"
            aria-label="Cerrar Radar"
          >
            <X size={28} strokeWidth={2.5} />
          </Button>
        </div>

        {/* CONTENEDOR DE RESULTADOS Y MEMORIA */}
        <div className="flex-1 w-full max-w-4xl mx-auto overflow-y-auto px-4 py-6 custom-scrollbar">
          <AnimatePresence mode="wait">
            {query.length === 0 ? (
              <motion.div key="history_section" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center gap-2 mb-6 opacity-60">
                  <History size={14} className="text-primary" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Frecuencias Recientes</h3>
                </div>
                {history.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {history.map((historySearchTerm) => (
                      <div key={historySearchTerm} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all group">
                        <button 
                          onClick={() => { setQuery(historySearchTerm); performSearch(historySearchTerm); }} 
                          className="flex-1 text-left font-bold text-sm text-zinc-400 group-hover:text-white transition-colors"
                        >
                          {historySearchTerm}
                        </button>
                        <button 
                          onClick={() => removeTermFromHistory(historySearchTerm)} 
                          className="p-2 text-zinc-600 hover:text-red-500 rounded-lg transition-colors"
                          title="Eliminar del registro"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest p-4 italic">
                    Sector de memoria vacío.
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div key="results_section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-32">
                {results && results.length > 0 ? (
                  results.map((searchMatchItem) => (
                    <SearchResultItem 
                      key={searchMatchItem.id} 
                      searchMatchResult={searchMatchItem} 
                      onSelectionAction={handleInterfaceToggle} 
                    />
                  ))
                ) : results !== null && !isLoading && (
                  <div className="flex flex-col items-center justify-center py-24 opacity-30 text-white">
                    <Zap size={48} className="mb-4 animate-pulse text-primary" />
                    <p className="text-sm font-black uppercase tracking-[0.5em]">Sin Resonancia</p>
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

  return (
    <div className={cn("relative z-20", className)}>
      {!isSearchInterfaceOpen && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          {variant === 'console' ? (
            /* [FIX V6.1]: Ajuste de contraste para el botón en modo 'console' */
            <Button
              onClick={() => setIsSearchInterfaceOpen(true)}
              variant="outline"
              className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-[#080808]/80 backdrop-blur-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] group active:scale-95 transition-all hover:bg-white/10 hover:border-primary/50"
              aria-label="Abrir radar semántico"
            >
              <Search className="h-5 w-5 md:h-6 md:w-6 text-primary group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.8)]" />
            </Button>
          ) : (
            <div
              onClick={() => setIsSearchInterfaceOpen(true)}
              className="flex items-center bg-white/5 border border-white/10 rounded-xl h-12 px-4 cursor-pointer hover:border-primary/30 transition-all backdrop-blur-md"
            >
              <Search className="h-4 w-4 text-zinc-500 mr-3" />
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Activar Radar...</span>
            </div>
          )}
        </motion.div>
      )}
      {searchPortalInterface}
    </div>
  );
}

/**
 * COMPONENTE INTERNO: SearchResultItem
 */
function SearchResultItem({ 
  searchMatchResult, 
  onSelectionAction 
}: { 
  searchMatchResult: SearchResult, 
  onSelectionAction: () => void 
}) {
  
  const navigationTarget =
    searchMatchResult.result_type === 'podcast' ? `/podcast/${searchMatchResult.id}` : 
    searchMatchResult.result_type === 'user' ? `/profile/${searchMatchResult.subtitle.replace('@', '')}` :
    searchMatchResult.result_type === 'place' ? `/map?latitude=${searchMatchResult.metadata?.lat}&longitude=${searchMatchResult.metadata?.lng}` : '#';

  return (
    <Link href={navigationTarget} onClick={onSelectionAction} className="block group">
      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/5 hover:border-primary/40 transition-all flex items-center gap-4">
        <div className="h-12 w-12 rounded-lg bg-zinc-900 overflow-hidden relative shrink-0 border border-white/10 shadow-lg">
          {searchMatchResult.image_url ? (
            <Image 
              src={searchMatchResult.image_url} 
              alt={searchMatchResult.title} 
              fill 
              sizes="48px" 
              className="object-cover" 
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-primary/5">
              <BookOpen className="text-primary/40 h-5 w-5" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {searchMatchResult.result_type === 'podcast' && <Mic2 size={10} className="text-primary" />}
            {searchMatchResult.result_type === 'user' && <UserIcon size={10} className="text-primary" />}
            <h4 className="font-black text-xs md:text-sm text-white truncate group-hover:text-primary transition-colors uppercase tracking-tight">
              {searchMatchResult.title}
            </h4>
          </div>
          <p className="text-[10px] font-bold text-zinc-500 truncate uppercase tracking-widest">{searchMatchResult.subtitle}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-zinc-800 group-hover:text-white transition-colors" />
      </div>
    </Link>
  );
}