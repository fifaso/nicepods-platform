// components/ui/unified-search-bar.tsx
// VERSIÓN: 2.5

"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";

// --- INFRAESTRUCTURA DE ICONOGRAFÍA (LUCIDE-REACT) ---
import {
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Clock,
  Command,
  History,
  Loader2,
  MapPin,
  Mic2,
  Navigation,
  PlayCircle,
  Search,
  User as UserIcon,
  X,
  Zap
} from "lucide-react";

// --- INFRAESTRUCTURA UI (NicePod Design System) ---
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// --- LÓGICA DE RADAR Y CONTRATOS ---
import { SearchResult, useSearchRadar } from "@/hooks/use-search-radar";

/**
 * INTERFAZ: UnifiedSearchBarProps
 * Define el contrato de integración para el Portal de Inteligencia.
 */
export interface UnifiedSearchBarProps {
  placeholder?: string;
  onResults?: (results: SearchResult[]) => void;
  onLoading?: (isLoading: boolean) => void;
  onClear?: () => void;
  latitude?: number;
  longitude?: number;
  /**
   * variant: 
   * - 'default': Barra de activación integrada (Dashboard/Library).
   * - 'console': Icono minimalista para el HUD del Mapa.
   */
  variant?: 'default' | 'console';
  className?: string;
}

/**
 * COMPONENTE: UnifiedSearchBar
 * La Terminal de Inteligencia de NicePod V2.5.
 */
export function UnifiedSearchBar({
  placeholder = "¿Qué conocimiento buscas hoy?",
  onResults,
  onLoading,
  onClear,
  latitude,
  longitude,
  variant = 'default',
  className
}: UnifiedSearchBarProps) {

  // --- ESTADOS DE GESTIÓN DE PORTAL ---
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const portalRef = useRef<HTMLDivElement>(null);

  // --- INICIALIZACIÓN DEL RADAR (MODO COMANDO V2.5) ---
  const {
    query,
    setQuery,
    results,
    isLoading,
    history,
    clearRadar,
    performSearch
  } = useSearchRadar({ latitude, longitude, limit: 30 });

  /**
   * SINCRONIZACIÓN CON EL ORQUESTADOR:
   * Mantenemos informados a los componentes padre del flujo de datos.
   */
  useEffect(() => {
    if (onResults) onResults(results);
  }, [results, onResults]);

  useEffect(() => {
    if (onLoading) onLoading(isLoading);
  }, [isLoading, onLoading]);

  /**
   * handleToggle:
   * Protocolo de apertura/cierre de la consola.
   */
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

  /**
   * handleTriggerSearch:
   * El Único Gatillo: Ejecuta la vectorización y búsqueda.
   */
  const handleTriggerSearch = () => {
    if (query.trim().length >= 3) {
      performSearch(query);
    }
  };

  /**
   * handleKeyDown:
   * Gestión de teclado profesional.
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Esc: Cerrar Portal
    if (e.key === "Escape") {
      handleToggle();
    }

    // Enter: Disparar Radar (Protocolo V2.5)
    if (e.key === "Enter") {
      e.preventDefault();
      handleTriggerSearch();
    }
  };

  /**
   * ATALOS DE TECLADO GLOBALES:
   * Implementación de CMD+K para agilidad de usuario experto.
   */
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", handleGlobalKeys);
    return () => window.removeEventListener("keydown", handleGlobalKeys);
  }, []);

  return (
    <div className={cn("relative z-[60]", className)}>

      {/* 
          I. EL DISPARADOR (THE TRIGGER) 
          Preserva el minimalismo visual del Dashboard.
      */}
      {!isOpen && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          {variant === 'console' ? (
            <Button
              onClick={() => setIsOpen(true)}
              variant="outline"
              className="h-12 w-12 rounded-2xl bg-black/40 border-white/10 hover:bg-primary/20 hover:border-primary/40 transition-all shadow-xl group"
            >
              <Search className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
            </Button>
          ) : (
            <div
              onClick={() => setIsOpen(true)}
              className="relative flex items-center bg-white/[0.03] border border-white/10 rounded-2xl h-12 px-5 cursor-text group hover:border-primary/30 transition-all shadow-inner"
            >
              <Search className="h-4 w-4 text-zinc-500 mr-3 group-hover:text-primary transition-colors" />
              <span className="text-sm text-zinc-600 font-medium tracking-tight">Buscar conocimiento...</span>
              <div className="ml-auto hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[8px] font-black text-zinc-700 uppercase tracking-widest">
                <Command size={8} /> K
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* 
          II. PORTAL DE INTELIGENCIA (OVERLAY PANTALLA COMPLETA) 
          Aislamiento total con Glassmorphism V2.
      */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={portalRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-3xl flex flex-col p-6 md:p-12 selection:bg-primary/30"
          >

            {/* CABECERA: INPUT DE COMANDO */}
            <div className="w-full max-w-5xl mx-auto flex items-center gap-6 mb-12 animate-in slide-in-from-top-4 duration-700">
              <div className="relative flex-1">
                {/* Lupa interactiva (Click para buscar) */}
                <button
                  onClick={handleTriggerSearch}
                  className="absolute left-6 top-1/2 -translate-y-1/2 z-20 outline-none"
                >
                  <Search className={cn(
                    "h-7 w-7 transition-all duration-300",
                    isLoading ? "text-primary animate-spin" : "text-primary/40 hover:text-primary"
                  )} />
                </button>

                <Input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  className="w-full h-20 md:h-28 pl-16 pr-24 bg-white/[0.03] border-white/10 rounded-[2.5rem] text-3xl md:text-5xl font-black uppercase tracking-tighter text-white placeholder:text-white/5 focus-visible:ring-primary/20 shadow-inner transition-all"
                />

                <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-4">
                  {isLoading && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
                  <kbd className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white/20 uppercase">
                    ESC
                  </kbd>
                </div>
              </div>

              <Button
                variant="ghost"
                onClick={handleToggle}
                className="h-20 w-20 md:h-28 md:w-28 rounded-[2.5rem] bg-white/5 border border-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-500 transition-all flex items-center justify-center"
              >
                <X size={40} />
              </Button>
            </div>

            {/* CUERPO: MEMORIA Y HALLAZGOS */}
            <div className="flex-1 w-full max-w-5xl mx-auto overflow-hidden flex flex-col">

              <AnimatePresence mode="wait">
                {query.length === 0 ? (
                  /* --- ESCENARIO A: HISTORIAL DE ECOS --- */
                  <motion.div
                    key="search-history"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-10"
                  >
                    <div className="flex items-center gap-4 px-4 opacity-30">
                      <History size={16} className="text-primary" />
                      <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-white">Exploraciones Recientes</h3>
                    </div>

                    {history.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
                        {history.map((term) => (
                          <button
                            key={term}
                            onClick={() => {
                              setQuery(term);
                              performSearch(term);
                            }}
                            className="flex items-center justify-between p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-primary/10 hover:border-primary/20 transition-all group shadow-xl"
                          >
                            <span className="text-2xl font-black text-zinc-500 group-hover:text-white uppercase tracking-tight transition-colors italic">
                              {term}
                            </span>
                            <ArrowUpRight size={28} className="text-zinc-800 group-hover:text-primary transition-all" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-10 py-16 border-l border-white/5 ml-4">
                        <p className="text-base text-zinc-600 font-medium italic">Sincronice una frecuencia de búsqueda para activar la memoria persistente.</p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* --- ESCENARIO B: MALLA DE INTELIGENCIA UNIFICADA --- */
                  <motion.div
                    key="search-results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col space-y-12 overflow-y-auto custom-scrollbar pr-6 pb-40"
                  >
                    {results.length > 0 ? (
                      <div className="grid grid-cols-1 gap-6">
                        {results.map((hit) => (
                          <SearchResultItem key={hit.id} result={hit} onClick={handleToggle} />
                        ))}
                      </div>
                    ) : !isLoading && (
                      <div className="flex flex-col items-center justify-center py-40 opacity-10">
                        <Zap size={100} className="mb-10 animate-pulse" />
                        <p className="text-3xl font-black uppercase tracking-[0.5em] italic">Sin Resonancia</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* FOOTER: TELEMETRÍA DEL VECTOR CORE */}
            <div className="w-full max-w-5xl mx-auto pt-10 border-t border-white/5 flex items-center justify-between mt-auto">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-500/5 border border-emerald-500/10 shadow-inner">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                  <span className="text-[10px] font-black text-emerald-500/80 uppercase tracking-[0.2em]">Vector Core Active</span>
                </div>
                <div className="hidden md:flex items-center gap-3 text-zinc-600">
                  <Clock size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Latencia de Resonancia: Sub-20ms</span>
                </div>
              </div>
              <p className="text-[10px] font-black text-white/5 uppercase tracking-[0.8em] italic">NicePod Industrial Terminal</p>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * SUB-COMPONENTE: SearchResultItem
 * Misión: Proyectar hallazgos multimodales con diseño de alta densidad.
 */
function SearchResultItem({ result, onClick }: { result: SearchResult, onClick: () => void }) {
  const href =
    result.result_type === 'podcast' ? `/podcast/${result.id}` :
      result.result_type === 'user' ? `/profile/${result.subtitle.replace('@', '')}` :
        result.result_type === 'place' ? `/map?lat=${result.metadata?.lat}&lng=${result.metadata?.lng}` :
          '#';

  return (
    <Link href={href} onClick={onClick} className="group outline-none">
      <div className="p-6 md:p-8 rounded-[3rem] bg-white/[0.02] border border-white/5 hover:border-primary/40 hover:bg-white/[0.04] transition-all flex items-center gap-8 shadow-2xl">

        {/* ACTIVO VISUAL (DISEÑO ESCALADO) */}
        <div className="h-24 w-24 md:h-32 md:w-32 rounded-[2.5rem] bg-zinc-900 overflow-hidden flex-shrink-0 relative border border-white/5 shadow-inner">
          {result.image_url ? (
            <Image
              src={result.image_url}
              alt=""
              fill
              sizes="128px"
              className="object-cover group-hover:scale-110 transition-transform duration-1000"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-primary/5">
              {result.result_type === 'place' ? (
                <MapPin className="text-primary h-12 w-12 opacity-80" />
              ) : (
                <BookOpen className="text-primary h-12 w-12 opacity-80" />
              )}
            </div>
          )}
          {result.result_type === 'podcast' && (
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
              <PlayCircle className="text-white h-14 w-14" />
            </div>
          )}
        </div>

        {/* NARRATIVA Y STATUS DE RESONANCIA */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-6 mb-3">
            <div className="flex items-center gap-4">
              {result.result_type === 'podcast' && <Mic2 size={18} className="text-zinc-600" />}
              {result.result_type === 'user' && <UserIcon size={18} className="text-zinc-600" />}
              {result.result_type === 'place' && <Navigation size={18} className="text-zinc-600" />}
              {result.result_type === 'vault_chunk' && <History size={18} className="text-zinc-600" />}
              <h4 className="font-black text-xl md:text-3xl uppercase tracking-tighter truncate text-white group-hover:text-primary transition-colors leading-none italic">
                {result.title}
              </h4>
            </div>
            <Badge variant="outline" className="text-[10px] font-black uppercase border-primary/20 text-primary/70 rounded-full px-4 py-1.5 shadow-lg">
              {Math.round(result.similarity * 100)}% Resonancia
            </Badge>
          </div>

          <div className="flex items-center gap-5">
            <p className="text-xs md:text-base text-zinc-500 truncate font-medium italic opacity-80">
              {result.subtitle}
            </p>
            <span className="h-1.5 w-1.5 rounded-full bg-white/10 shrink-0" />
            <span className="text-[11px] font-black text-zinc-700 uppercase tracking-widest">{result.result_type.replace('_', ' ')}</span>
          </div>
        </div>

        {/* ACCIÓN DE NAVEGACIÓN */}
        <div className="hidden sm:flex items-center justify-center p-4 rounded-full bg-white/5 border border-white/5 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all mr-4">
          <ChevronRight className="h-8 w-8 text-primary" />
        </div>
      </div>
    </Link>
  );
}