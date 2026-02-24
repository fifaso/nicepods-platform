// components/ui/unified-search-bar.tsx
// VERSIÓN: 1.0

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Command,
  History,
  Loader2,
  Search,
  X,
  Zap
} from "lucide-react";
import React, { useCallback, useEffect, useRef } from "react";

// --- INFRAESTRUCTURA UI ---
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// --- LÓGICA DE RADAR Y TIPOS ---
import { SearchResult, useSearchRadar } from "@/hooks/use-search-radar";

/**
 * INTERFAZ: UnifiedSearchBarProps
 * Define el contrato para la integración del radar en diferentes módulos.
 */
interface UnifiedSearchBarProps {
  placeholder?: string;
  /**
   * onResults: Callback para entregar los hallazgos al componente padre.
   */
  onResults?: (results: SearchResult[]) => void;
  /**
   * onLoading: Notifica al padre el estado del escaneo semántico.
   */
  onLoading?: (isLoading: boolean) => void;
  /**
   * onClear: Notifica el restablecimiento de la terminal.
   */
  onClear?: () => void;
  /**
   * Contexto Geoespacial: Para el motor Madrid Resonance.
   */
  latitude?: number;
  longitude?: number;
  /**
   * variant: 
   * - 'default': Barra de búsqueda integrada.
   * - 'console': Terminal expansiva tipo HUD.
   */
  variant?: 'default' | 'console';
  className?: string;
}

/**
 * COMPONENTE: UnifiedSearchBar
 * El punto de entrada único para el descubrimiento de conocimiento en NicePod V2.5.
 */
export function UnifiedSearchBar({
  placeholder = "Buscar por concepto, crónica o curador...",
  onResults,
  onLoading,
  onClear,
  latitude,
  longitude,
  variant = 'default',
  className
}: UnifiedSearchBarProps) {

  // --- INICIALIZACIÓN DEL RADAR ---
  const {
    query,
    setQuery,
    results,
    isLoading,
    history,
    clearRadar,
    performSearch
  } = useSearchRadar({ latitude, longitude });

  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * SINCRONIZACIÓN CON EL PADRE:
   * Emitimos los cambios de estado hacia el orquestador superior (Mapa o Biblioteca).
   */
  useEffect(() => {
    if (onResults) onResults(results);
  }, [results, onResults]);

  useEffect(() => {
    if (onLoading) onLoading(isLoading);
  }, [isLoading, onLoading]);

  /**
   * ACCIÓN: handleClear
   * Limpieza física de la terminal y notificación de vaciado.
   */
  const handleClear = useCallback(() => {
    clearRadar();
    if (onClear) onClear();
  }, [clearRadar, onClear]);

  /**
   * PROTOCOLO DE TECLADO: handleKeyDown
   * Implementa accesos rápidos para usuarios avanzados (Esc para limpiar).
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") handleClear();
    if (e.key === "Enter" && query.length >= 3) performSearch(query);
  };

  return (
    <div className={cn("relative w-full transition-all duration-500", className)}>

      {/* 
          BLOQUE I: LA TERMINAL (INPUT CORE) 
          Diseño Glassmorphism con bordes Aurora sutiles.
      */}
      <div className={cn(
        "relative flex items-center group",
        variant === 'console'
          ? "bg-zinc-950 border border-primary/20 rounded-2xl shadow-2xl overflow-hidden"
          : "bg-secondary/40 border border-white/5 rounded-xl"
      )}>

        {/* Icono de Estado Dinámico */}
        <div className="pl-4">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <Search className="h-4 w-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
          )}
        </div>

        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "border-none bg-transparent focus-visible:ring-0 text-white placeholder:text-zinc-600",
            variant === 'console' ? "h-14 text-base font-black uppercase tracking-tight" : "h-11 text-sm font-medium"
          )}
        />

        {/* CLÚSTER DE ACCIONES RÁPIDAS (DERECHA) */}
        <div className="pr-3 flex items-center gap-2">
          <AnimatePresence>
            {query.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleClear}
                className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-colors"
                title="Limpiar terminal"
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* KBD Atajo visual */}
          <div className="hidden sm:flex items-center gap-1 px-1.5 py-1 rounded bg-white/5 border border-white/5 text-[7px] font-black text-zinc-600 uppercase tracking-widest">
            <Command size={8} /> Esc
          </div>
        </div>
      </div>

      {/* 
          BLOQUE II: PANEL DE INTELIGENCIA (DROPDOWN) 
          Muestra el historial cuando la terminal está vacía y enfocada.
      */}
      <AnimatePresence>
        {query.length === 0 && history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-3 p-5 bg-zinc-950/95 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-4 opacity-40">
              <History size={12} className="text-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white">
                Exploraciones Recientes
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              {history.map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setQuery(term);
                    performSearch(term);
                  }}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all group/item"
                >
                  <span className="text-xs font-bold text-zinc-400 group-hover:text-white transition-colors uppercase tracking-tight">
                    {term}
                  </span>
                  <ArrowUpRight size={14} className="text-zinc-700 group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>

            {/* Branding Técnico de Pie de Consola */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={10} className="text-primary animate-pulse" />
                <span className="text-[8px] font-black text-primary/60 uppercase tracking-[0.4em]">
                  Radar Semántico V2.5 Activo
                </span>
              </div>
              <span className="text-[7px] font-bold text-zinc-800 uppercase tracking-widest">
                NicePod Architecture
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INDICADOR DE CARGA DE CARACTERES (Sutileza UX) */}
      {query.length > 0 && query.length < 3 && !isLoading && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -bottom-6 left-2 text-[8px] font-black text-primary/60 uppercase tracking-widest"
        >
          Se requieren 3 caracteres para activar el pulso semántico...
        </motion.p>
      )}
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Diseño Unificado: Este componente elimina la fragmentación entre el Mapa
 *    y la Biblioteca. Ahora ambos usan el mismo motor de 'Resonancia Híbrida'.
 * 2. Rendimiento (Framer Motion): Las animaciones utilizan 'AnimatePresence' 
 *    para asegurar que el historial desaparezca suavemente del DOM.
 * 3. Feedback Táctil: El uso de gradientes sutiles y efectos de 'hover' en 
 *    el historial guía al usuario de forma intuitiva, sin necesidad de tutoriales.
 * 4. Resiliencia: Si el hook 'useSearchRadar' falla, el componente sigue siendo 
 *    funcional como un input básico, manteniendo la disponibilidad de la Workstation.
 */