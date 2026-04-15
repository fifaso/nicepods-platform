/**
 * ARCHIVO: components/ui/unified-search-bar.tsx
 * VERSIÓN: 7.0 (NicePod Void Search - Industrial Intelligence Synchronization)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Terminal de inmersión total optimizada para el descubrimiento semántico 
 * de capital intelectual, gestionando el ciclo de vida del radar de búsqueda.
 * [REFORMA V7.0]: Resolución definitiva de TS2305 y TS7006. Sincronización nominal 
 * absoluta con 'useSearchRadarIntelligence' V5.0 y 'SearchRadarResult' V12.0. 
 * Aplicación integral de la Zero Abbreviations Policy (ZAP) y Build Shield Sovereignty.
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
import { classNamesUtility, nicepodLog } from "@/lib/utils";
import { 
  useSearchRadarIntelligence, 
  SearchRadarResult 
} from "@/hooks/use-search-radar";

/**
 * INTERFAZ: UnifiedSearchBarProperties
 */
export interface UnifiedSearchBarProperties {
  placeholderText?: string;
  onSearchIdentificationResults?: (resultsCollection: SearchRadarResult[] | null) => void;
  onLoadingStatusChange?: (isProcessActive: boolean) => void;
  onClearAction?: () => void;
  latitudeCoordinate?: number;
  longitudeCoordinate?: number;
  variantType?: 'default' | 'console';
  additionalTailwindClassName?: string;
}

/**
 * UnifiedSearchBar: El motor reactivo de descubrimiento de nodos de sabiduría.
 */
export function UnifiedSearchBar({
  placeholderText = "¿Qué capital intelectual buscamos?",
  onSearchIdentificationResults,
  onLoadingStatusChange,
  onClearAction,
  latitudeCoordinate,
  longitudeCoordinate,
  variantType = 'default',
  additionalTailwindClassName
}: UnifiedSearchBarProperties) {
  
  // --- ESTADOS DE INTERFAZ Y CICLO DE VIDA ---
  const [isSearchInterfaceOpenStatus, setIsSearchInterfaceOpenStatus] = useState<boolean>(false);
  const [isComponentMountedStatus, setIsComponentMountedStatus] = useState<boolean>(false);
  const searchInputReference = useRef<HTMLInputElement>(null);

  /**
   * [SINCRO V7.0]: Consumo del motor de inteligencia V5.0.
   * [RESOLUCIÓN TS2305]: Uso de 'useSearchRadarIntelligence'.
   */
  const {
    currentSearchQueryText,
    setCurrentSearchQueryText,
    searchRadarResultsCollection,
    isSearchProcessActive,
    searchHistoryCollection,
    clearSearchRadarAction,
    executeSearchRadarAction,
    removeSearchTermFromHistoryAction
  } = useSearchRadarIntelligence({ 
    latitudeCoordinate, 
    longitudeCoordinate, 
    resultsLimitMagnitude: 30 
  });

  // 1. Handshake de Hidratación para el Cristal
  useEffect(() => {
    setIsComponentMountedStatus(true);
  }, []);

  // 2. Sincronía de Resultados con el Orquestador Superior (Dashboard/Feed)
  useEffect(() => {
    if (isComponentMountedStatus && onSearchIdentificationResults) {
      onSearchIdentificationResults(searchRadarResultsCollection);
    }
  }, [searchRadarResultsCollection, onSearchIdentificationResults, isComponentMountedStatus]);

  // 3. Comunicación del Estado de Carga para Feedback de Usuario
  useEffect(() => {
    if (isComponentMountedStatus && onLoadingStatusChange) {
      onLoadingStatusChange(isSearchProcessActive);
    }
  }, [isSearchProcessActive, onLoadingStatusChange, isComponentMountedStatus]);

  // 4. Gobernanza de Higiene del Scroll (Hardware UI Hygiene)
  useEffect(() => {
    if (isSearchInterfaceOpenStatus) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSearchInterfaceOpenStatus]);

  /**
   * handleInterfaceToggleAction:
   * Misión: Gestionar la apertura y el cierre de la terminal de búsqueda Void.
   */
  const handleInterfaceToggleAction = useCallback(() => {
    setIsSearchInterfaceOpenStatus((previousToggleState) => {
      const nextToggleState = !previousToggleState;
      if (!nextToggleState) {
        clearSearchRadarAction();
        if (onClearAction) onClearAction();
      }
      return nextToggleState;
    });
  }, [clearSearchRadarAction, onClearAction]);

  /**
   * handleSearchTriggerAction:
   * Misión: Ejecutar la consulta al radar vectorial.
   */
  const handleSearchTriggerAction = () => {
    if (currentSearchQueryText.trim().length >= 3) {
      executeSearchRadarAction(currentSearchQueryText);
    }
  };

  /**
   * handleKeyboardNavigationAction:
   * Misión: Procesar comandos físicos dentro de la terminal de entrada.
   */
  const handleKeyboardNavigationAction = (keyboardEvent: React.KeyboardEvent<HTMLInputElement>) => {
    if (keyboardEvent.key === "Escape") {
      handleInterfaceToggleAction();
    }
    if (keyboardEvent.key === "Enter") {
      keyboardEvent.preventDefault();
      handleSearchTriggerAction();
    }
  };

  /**
   * searchPortalInterfaceMarkup:
   * Misión: Renderizar el portal de búsqueda en el nivel superior del Cristal.
   */
  const searchPortalInterfaceMarkup = isComponentMountedStatus && isSearchInterfaceOpenStatus ? createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9999] bg-black/98 backdrop-blur-3xl flex flex-col selection:bg-primary/30 isolate"
      >
        {/* BARRA DE ENTRADA SUPERIOR INDUSTRIAL */}
        <div className="w-full flex items-center justify-between gap-4 p-6 md:p-10 bg-[#050505] border-b border-white/5 isolate">
          <div className="relative flex-1 max-w-5xl mx-auto flex items-center group">
            <Search className={classNamesUtility(
              "absolute left-5 h-6 w-6 transition-all duration-500 z-10", 
              isSearchProcessActive ? "text-primary animate-spin" : "text-zinc-700 group-focus-within:text-primary"
            )} />
            <Input
              autoFocus
              ref={searchInputReference}
              value={currentSearchQueryText}
              onChange={(inputChangeEvent) => setCurrentSearchQueryText(inputChangeEvent.target.value)}
              onKeyDown={handleKeyboardNavigationAction}
              placeholder={placeholderText}
              className="w-full h-16 md:h-20 pl-16 pr-6 bg-white/[0.02] border border-white/5 rounded-2xl text-lg md:text-3xl font-black text-white placeholder:text-zinc-800 focus-visible:ring-1 focus-visible:ring-primary/30 transition-all shadow-inner"
            />
          </div>
          <Button 
            variant="ghost" 
            onClick={handleInterfaceToggleAction} 
            className="p-4 h-auto w-auto rounded-2xl bg-white/5 border border-white/10 hover:bg-red-500/10 hover:text-red-500 text-zinc-600 shrink-0 transition-all duration-500 isolate"
            aria-label="Cerrar Terminal de Inteligencia"
          >
            <X size={32} strokeWidth={2.5} />
          </Button>
        </div>

        {/* CONTENEDOR DE RESULTADOS Y MEMORIA TÁCTICA */}
        <div className="flex-1 w-full max-w-5xl mx-auto overflow-y-auto px-6 py-10 custom-scrollbar isolate">
          <AnimatePresence mode="wait">
            {currentSearchQueryText.length === 0 ? (
              <motion.div 
                key="history_resonance_section" 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0 }}
                className="isolate"
              >
                <div className="flex items-center gap-3 mb-8 opacity-40">
                  <History size={16} className="text-primary" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Memorias de Búsqueda</h3>
                </div>
                {searchHistoryCollection.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {searchHistoryCollection.map((historySearchTermText: string) => (
                      <div 
                        key={historySearchTermText} 
                        className="flex items-center justify-between p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all duration-500 group isolate"
                      >
                        <button 
                          onClick={() => { setCurrentSearchQueryText(historySearchTermText); executeSearchRadarAction(historySearchTermText); }} 
                          className="flex-1 text-left font-black text-sm text-zinc-500 group-hover:text-white transition-colors uppercase tracking-tight italic"
                        >
                          {historySearchTermText}
                        </button>
                        <button 
                          onClick={() => removeSearchTermFromHistoryAction(historySearchTermText)} 
                          className="p-2.5 text-zinc-800 hover:text-red-500 rounded-xl transition-all"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-zinc-700 font-black uppercase tracking-widest p-6 italic text-center">
                    Sector de memoria local sin registros activos.
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="radar_results_section" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="space-y-5 pb-40 isolate"
              >
                {searchRadarResultsCollection && searchRadarResultsCollection.length > 0 ? (
                  searchRadarResultsCollection.map((searchMatchItem: SearchRadarResult) => (
                    <SearchResultItem 
                      key={searchMatchItem.identification} 
                      searchMatchResult={searchMatchItem} 
                      onSelectionAction={handleInterfaceToggleAction} 
                    />
                  ))
                ) : searchRadarResultsCollection !== null && !isSearchProcessActive && (
                  <div className="flex flex-col items-center justify-center py-32 opacity-20 text-white grayscale">
                    <Zap size={60} className="mb-6 animate-pulse text-primary" />
                    <p className="text-sm font-black uppercase tracking-[0.6em] italic">Sin Resonancia Detectada</p>
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
    <div className={classNamesUtility("relative z-20 isolate", additionalTailwindClassName)}>
      {!isSearchInterfaceOpenStatus && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          {variantType === 'console' ? (
            <Button
              onClick={() => setIsSearchInterfaceOpenStatus(true)}
              variant="outline"
              className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-black/40 backdrop-blur-2xl border border-white/5 shadow-2xl group active:scale-95 transition-all duration-500 hover:border-primary/40 isolate"
              aria-label="Disparar radar semántico"
            >
              <Search className="h-6 w-6 text-primary group-hover:scale-110 transition-transform drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.6)]" />
            </Button>
          ) : (
            <div
              onClick={() => setIsSearchInterfaceOpenStatus(true)}
              className="flex items-center bg-white/[0.03] border border-white/5 rounded-2xl h-14 px-6 cursor-pointer hover:border-primary/20 transition-all duration-500 backdrop-blur-xl shadow-inner group isolate"
            >
              <Search className="h-5 w-5 text-zinc-600 mr-4 group-hover:text-primary transition-colors" />
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest group-hover:text-zinc-400 transition-colors">Activar Radar de Inteligencia...</span>
            </div>
          )}
        </motion.div>
      )}
      {searchPortalInterfaceMarkup}
    </div>
  );
}

/**
 * COMPONENTE INTERNO: SearchResultItem
 * Misión: Proyectar un nodo semántico individual con tipado estricto V12.0.
 * [RESOLUCIÓN TS7006]: Tipado explícito de propiedades y mapeo nominal.
 */
function SearchResultItem({ 
  searchMatchResult, 
  onSelectionAction 
}: { 
  searchMatchResult: SearchRadarResult, 
  onSelectionAction: () => void 
}) {
  
  /** navigationTargetUrl: Resolución dinámica de ruta basada en la taxonomía industrial. */
  const navigationTargetUrl =
    searchMatchResult.resultCategoryType === 'podcast' ? `/podcast/${searchMatchResult.identification}` : 
    searchMatchResult.resultCategoryType === 'user' ? `/profile/${searchMatchResult.subtitleContentText.replace('@', '')}` :
    searchMatchResult.resultCategoryType === 'place' ? `/map?latitude=${searchMatchResult.intellectualMetadata?.latitudeCoordinate}&longitude=${searchMatchResult.intellectualMetadata?.longitudeCoordinate}` : '#';

  return (
    <Link href={navigationTargetUrl} onClick={onSelectionAction} className="block group isolate">
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/40 hover:bg-white/[0.05] transition-all duration-500 flex items-center gap-5 shadow-xl isolate">
        {/* PROYECCIÓN VISUAL DEL NODO */}
        <div className="h-14 w-14 rounded-xl bg-black overflow-hidden relative shrink-0 border border-white/10 shadow-2xl isolate">
          {searchMatchResult.imageUniformResourceLocator ? (
            <Image 
              src={searchMatchResult.imageUniformResourceLocator} 
              alt={searchMatchResult.titleTextContent} 
              fill 
              sizes="56px" 
              className="object-cover transition-transform duration-1000 group-hover:scale-110" 
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-primary/5">
              <BookOpen className="text-primary/20 h-6 w-6" />
            </div>
          )}
        </div>

        {/* METADATOS DEL RESULTADO [SINCRO V12.0] */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            {searchMatchResult.resultCategoryType === 'podcast' && <Mic2 size={12} className="text-primary/60" />}
            {searchMatchResult.resultCategoryType === 'user' && <UserIcon size={12} className="text-primary/60" />}
            <h4 className="font-black text-sm md:text-base text-white truncate group-hover:text-primary transition-colors uppercase tracking-tight italic font-serif">
              {searchMatchResult.titleTextContent}
            </h4>
          </div>
          <p className="text-[10px] font-bold text-zinc-600 truncate uppercase tracking-widest">
              {searchMatchResult.subtitleContentText}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-zinc-900 group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V7.0):
 * 1. Build Shield Absolute: Resolución definitiva de TS2305 y TS7006. Sincronización 
 *    nominal con el motor vectorial mediante descriptores V12.0 (identification, 
 *    resultCategoryType, titleTextContent).
 * 2. ZAP Compliance: Purificación total. Se han eliminado abreviaciones en props 
 *    (placeholderText, variantType, additionalTailwindClassName) y lógica.
 * 3. Kinematic Optimization: Uso de motion.div y createPortal para asegurar que 
 *    la terminal Void no interfiera con el árbol de renderizado de React, 
 *    manteniendo la fluidez de 60 FPS en el Main Thread.
 */