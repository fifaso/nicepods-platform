// components/ui/unified-search-bar.tsx
// VERSIÓN: 2.2

"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

// --- INFRAESTRUCTURA DE ICONOGRAFÍA (LUCIDE-REACT) ---
import {
  ArrowUpRight,
  BookOpen,
  ChevronRight,
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
 * [FIX]: Exportación explícita y adición de propiedad 'variant'.
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
   * variant: Define el estilo visual del disparador y la consola.
   * - 'default': Estética integrada para listas y dashboards.
   * - 'console': Estética HUD expansiva para el mapa geoespacial.
   */
  variant?: 'default' | 'console';
  className?: string;
}

/**
 * COMPONENTE: UnifiedSearchBar
 * El Portal de Descubrimiento de Pantalla Completa de NicePod V2.5.
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

  // --- INICIALIZACIÓN DEL RADAR SEMÁNTICO ---
  const {
    query,
    setQuery,
    results,
    isLoading,
    history,
    clearRadar,
    performSearch
  } = useSearchRadar({ latitude, longitude, limit: 25 });

  /**
   * SINCRONIZACIÓN TÁCTICA:
   * Notificamos a los orquestadores externos (Mapa/Biblioteca) sobre los cambios.
   */
  useEffect(() => {
    if (onResults) onResults(results);
  }, [results, onResults]);

  useEffect(() => {
    if (onLoading) onLoading(isLoading);
  }, [isLoading, onLoading]);

  /**
   * handleToggle:
   * Apertura/Cierre de la consola con limpieza de estados reactivos.
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
   * PROTOCOLO DE TECLADO:
   * Soporte para Cmd+K y Esc para una UX de grado industrial.
   */
  useEffect(() => {
    const handleKeyDownGlobal = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape" && isOpen) {
        handleToggle();
      }
    };
    window.addEventListener("keydown", handleKeyDownGlobal);
    return () => window.removeEventListener("keydown", handleKeyDownGlobal);
  }, [isOpen, handleToggle]);

  return (
    <div className={cn("relative z-[60]", className)}>

      {/* 
          I. DISPARADOR (TRIGGER) 
          Dependiendo de la 'variant', se muestra como barra o icono.
      */}
      {!isOpen && (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          {variant === 'console' ? (
            <Button
              onClick={() => setIsOpen(true)}
              variant="outline"
              className="h-12 w-12 rounded-2xl bg-black/40 border-white/10 hover:bg-primary/20 hover:border-primary/40 transition-all shadow-xl group"
              aria-label="Activar radar semántico"
            >
              <Search className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
            </Button>
          ) : (
            <div
              onClick={() => setIsOpen(true)}
              className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl h-12 px-4 cursor-text group hover:border-primary/40 transition-all"
            >
              <Search className="h-4 w-4 text-zinc-500 mr-3 group-hover:text-primary transition-colors" />
              <span className="text-sm text-zinc-500 font-medium">Buscar en la Bóveda...</span>
              <div className="ml-auto hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                <Command size={8} /> K
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* 
          II. PORTAL DE INTELIGENCIA (PANTALLA COMPLETA) 
          Inmersión total mediante Glassmorphism y AnimatePresence.
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

            {/* CABECERA: INPUT MAESTRO */}
            <div className="w-full max-w-5xl mx-auto flex items-center gap-6 mb-12">
              <div className="relative flex-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary h-6 w-6 animate-pulse" />
                <Input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={placeholder}
                  className="w-full h-20 md:h-24 pl-16 pr-24 bg-white/[0.03] border-white/10 rounded-[2.5rem] text-2xl md:text-4xl font-black uppercase tracking-tighter text-white placeholder:text-white/10 focus-visible:ring-primary/20 transition-all"
                />
                <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-4">
                  {isLoading && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
                  <kbd className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white/20 uppercase">
                    <Command size={12} /> ESC
                  </kbd>
                </div>
              </div>

              <Button
                variant="ghost"
                onClick={handleToggle}
                className="h-20 w-20 rounded-[2.5rem] bg-white/5 border border-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-500 transition-all flex items-center justify-center"
              >
                <X size={32} />
              </Button>
            </div>

            {/* CUERPO: HISTORIAL O RESULTADOS */}
            <div className="flex-1 w-full max-w-5xl mx-auto overflow-hidden flex flex-col">

              <AnimatePresence mode="wait">
                {query.length === 0 ? (
                  /* --- ESCENARIO A: HISTORIAL --- */
                  <motion.div
                    key="search-history"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-10"
                  >
                    <div className="flex items-center gap-4 px-2 opacity-30">
                      <History size={16} className="text-primary" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Exploraciones Recientes</h3>
                    </div>

                    {history.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {history.map((term) => (
                          <button
                            key={term}
                            onClick={() => setQuery(term)}
                            className="flex items-center justify-between p-7 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-primary/10 hover:border-primary/20 transition-all group shadow-xl"
                          >
                            <span className="text-xl font-black text-zinc-500 group-hover:text-white uppercase tracking-tight transition-colors">
                              {term}
                            </span>
                            <ArrowUpRight size={24} className="text-zinc-800 group-hover:text-primary transition-all" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-6 py-12 border-l border-white/5 ml-2">
                        <p className="text-sm text-zinc-600 font-medium italic">Sincronice una frecuencia de búsqueda para activar la memoria local.</p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* --- ESCENARIO B: RESULTADOS HÍBRIDOS --- */
                  <motion.div
                    key="search-results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col space-y-12 overflow-y-auto custom-scrollbar pr-4 pb-32"
                  >
                    {results.length > 0 ? (
                      <div className="grid grid-cols-1 gap-5">
                        {results.map((hit) => (
                          <SearchResultItem key={hit.id} result={hit} onClick={handleToggle} />
                        ))}
                      </div>
                    ) : !isLoading && (
                      <div className="flex flex-col items-center justify-center py-32 opacity-10">
                        <Zap size={80} className="mb-8" />
                        <p className="text-2xl font-black uppercase tracking-[0.4em]">Frecuencia Desconocida</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* FOOTER: TELEMETRÍA DEL MOTOR */}
            <div className="w-full max-w-5xl mx-auto pt-8 border-t border-white/5 flex items-center justify-between mt-auto">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-emerald-500/5 border border-emerald-500/10">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <span className="text-[9px] font-black text-emerald-500/80 uppercase tracking-widest">Vector Core Active</span>
                </div>
                <span className="hidden sm:block text-[9px] font-bold text-zinc-700 uppercase tracking-widest">
                  NicePod V2.5 • Unified Intelligence Interface
                </span>
              </div>
              <p className="text-[8px] font-black text-white/5 uppercase tracking-[0.6em]">Neural Sync Established</p>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * SUB-COMPONENTE: SearchResultItem
 * Misión: Proyectar hallazgos multimodales (Podcast, Usuario, Lugar, Bóveda).
 */
function SearchResultItem({ result, onClick }: { result: SearchResult, onClick: () => void }) {
  const href =
    result.result_type === 'podcast' ? `/podcast/${result.id}` :
      result.result_type === 'user' ? `/profile/${result.subtitle.replace('@', '')}` :
        result.result_type === 'place' ? `/map?lat=${result.metadata?.lat}&lng=${result.metadata?.lng}` :
          '#';

  return (
    <Link href={href} onClick={onClick} className="group outline-none">
      <div className="p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-primary/40 hover:bg-white/[0.04] transition-all flex items-center gap-8 shadow-2xl">

        {/* ACTIVO VISUAL SEGÚN NODO */}
        <div className="h-20 w-20 md:h-24 md:w-24 rounded-3xl bg-zinc-900 overflow-hidden flex-shrink-0 relative border border-white/5">
          {result.image_url ? (
            <Image
              src={result.image_url}
              alt=""
              fill
              sizes="96px"
              className="object-cover group-hover:scale-110 transition-transform duration-1000"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-primary/5">
              {result.result_type === 'place' ? <MapPin className="text-primary h-10 w-10" /> : <BookOpen className="text-primary h-10 w-10" />}
            </div>
          )}
          {result.result_type === 'podcast' && (
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <PlayCircle className="text-white h-12 w-12" />
            </div>
          )}
        </div>

        {/* NARRATIVA Y RESONANCIA */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-5 mb-2.5">
            <div className="flex items-center gap-3">
              {result.result_type === 'podcast' && <Mic2 size={14} className="text-zinc-600" />}
              {result.result_type === 'user' && <UserIcon size={14} className="text-zinc-600" />}
              {result.result_type === 'place' && <Navigation size={14} className="text-zinc-600" />}
              {result.result_type === 'vault_chunk' && <History size={14} className="text-zinc-600" />}
              <h4 className="font-black text-base md:text-2xl uppercase tracking-tighter truncate text-white group-hover:text-primary transition-colors leading-none">
                {result.title}
              </h4>
            </div>
            <Badge variant="outline" className="text-[9px] font-black uppercase border-primary/20 text-primary/70 rounded-full px-3 py-1">
              {Math.round(result.similarity * 100)}% Match
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <p className="text-[11px] md:text-sm text-zinc-500 truncate font-medium italic opacity-70">
              {result.subtitle}
            </p>
            <span className="h-1 w-1 rounded-full bg-white/10 shrink-0" />
            <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">{result.result_type.replace('_', ' ')}</span>
          </div>
        </div>

        <ChevronRight className="h-6 w-6 text-white/5 group-hover:text-primary group-hover:translate-x-1 transition-all mr-2" />
      </div>
    </Link>
  );
}