/**
 * ARCHIVO: components/feed/library-view-switcher.tsx
 * VERSIÓN: 4.0 (NicePod Premium View Orchestrator - Nominative Transmutation Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Gestionar la perspectiva visual del Voyager mediante transiciones 
 * suaves y preservación de estado en la cadena de consulta de la URL.
 * [REFORMA V4.0]: Implementación de la 'Transmutación Nominal Total'. Se 
 * resuelven los errores TS18047 mediante el blindaje de 'urlSearchParameters'. 
 * Aplicación absoluta de la Zero Abbreviations Policy (ZAP), eliminando 
 * términos como 'params', 'view' o 'pathname' en favor de descriptores completos.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { Compass, LayoutGrid, List, Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

// --- INFRAESTRUCTURA DE INTERFAZ SOBERANA ---
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * TIPO: LibraryViewMode
 * Define el contrato estricto de las perspectivas disponibles en la Workstation.
 */
type LibraryViewMode = 'grid' | 'list' | 'compass';

/**
 * COMPONENTE: LibraryViewSwitcher
 * El reactor de conmutación de perspectiva de la Bóveda de Podcasts.
 */
export function LibraryViewSwitcher() {
  const navigationRouter = useRouter();
  const currentUrlPathname = usePathname();
  const urlSearchParameters = useSearchParams();

  /**
   * [MTI]: AISLAMIENTO DE PROCESAMIENTO
   * Marcamos el cambio de ruta como una transición de baja prioridad para 
   * no bloquear la interactividad del Hilo Principal en listas densas.
   */
  const [isTransitionProcessPending, executeSovereignTransition] = useTransition();

  /**
   * [BUILD SHIELD]: DETERMINACIÓN DEL ESTADO ACTUAL
   * Aplicamos encadenamiento opcional para satisfacer la restricción de nulidad.
   */
  const currentLibraryViewMode = (urlSearchParameters?.get('view') as LibraryViewMode) || 'grid';

  /**
   * handleLibraryViewSelectionAction:
   * Orquestador que modifica la perspectiva sin destruir los filtros de búsqueda activos.
   */
  const handleLibraryViewSelectionAction = (targetViewMode: LibraryViewMode) => {
    // Si la Workstation ya opera bajo este modo, abortamos la ejecución.
    if (targetViewMode === currentLibraryViewMode) return;

    // [SALTO CUÁNTICO]: Si se selecciona la brújula, el Voyager abandona la biblioteca hacia el mapa.
    if (targetViewMode === 'compass') {
      executeSovereignTransition(() => {
        navigationRouter.push('/map');
      });
      return;
    }

    /**
     * [ZAP]: CONSTRUCCIÓN DE PARÁMETROS ACTUALIZADOS
     * Clonamos el estado actual de la URL para garantizar la persistencia de filtros.
     */
    const searchParametersString = urlSearchParameters?.toString() || "";
    const updatedUrlSearchParameters = new URLSearchParams(searchParametersString);
    updatedUrlSearchParameters.set('view', targetViewMode);

    executeSovereignTransition(() => {
      /**
       * scroll: false garantiza que el dispositivo mantenga la posición 
       * térmica del scroll al conmutar la malla de visualización.
       */
      const targetNavigationPath = `${currentUrlPathname}?${updatedUrlSearchParameters.toString()}`;
      navigationRouter.push(targetNavigationPath, { scroll: false });
    });
  };

  return (
    <div className="flex items-center gap-1 p-1 bg-black/40 rounded-[1.25rem] border border-white/10 backdrop-blur-2xl shadow-inner isolate">

      {/* --- BOTÓN: VISTA CUADRÍCULA (GRID) --- */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleLibraryViewSelectionAction('grid')}
        disabled={isTransitionProcessPending}
        aria-label="Cambiar a vista de cuadrícula"
        className={cn(
          'h-10 w-10 rounded-xl transition-all duration-300 relative overflow-hidden',
          currentLibraryViewMode === 'grid'
            ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]'
            : 'text-zinc-500 hover:text-white hover:bg-white/10'
        )}
      >
        <LayoutGrid className="h-4 w-4 relative z-10" />
      </Button>

      {/* --- BOTÓN: VISTA LISTA (LIST) --- */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleLibraryViewSelectionAction('list')}
        disabled={isTransitionProcessPending}
        aria-label="Cambiar a vista de lista compacta"
        className={cn(
          'h-10 w-10 rounded-xl transition-all duration-300 relative overflow-hidden',
          currentLibraryViewMode === 'list'
            ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]'
            : 'text-zinc-500 hover:text-white hover:bg-white/10'
        )}
      >
        {isTransitionProcessPending && currentLibraryViewMode !== 'list' && currentLibraryViewMode !== 'grid' ? (
          <Loader2 className="h-4 w-4 animate-spin text-zinc-400 absolute" />
        ) : null}
        <List className={cn("h-4 w-4 relative z-10", isTransitionProcessPending && "opacity-0")} />
      </Button>

      {/* DIVISOR ATMOSFÉRICO */}
      <div className="w-[1px] h-6 bg-white/10 mx-1 rounded-full" />

      {/* --- BOTÓN: RADAR GEOESPACIAL (COMPASS) --- */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleLibraryViewSelectionAction('compass')}
        disabled={isTransitionProcessPending}
        aria-label="Activar radar en el mapa"
        className={cn(
          'h-10 w-10 rounded-xl transition-all duration-500 group',
          currentLibraryViewMode === 'compass'
            ? 'bg-primary text-white shadow-[0_0_30px_rgba(var(--primary-rgb),0.4)]'
            : 'bg-primary/5 text-primary hover:bg-primary hover:text-white border border-primary/20'
        )}
      >
        <Compass className={cn(
          "h-4 w-4 transition-transform duration-700",
          currentLibraryViewMode === 'compass' ? "animate-pulse" : "group-hover:rotate-90"
        )} />
      </Button>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. ZAP Absolute Compliance: Se eliminaron todas las abreviaciones. 'router' pasó a 
 *    'navigationRouter', 'pathname' a 'currentUrlPathname', y 'params' a 
 *    'updatedUrlSearchParameters'.
 * 2. Build Shield Sovereignty: Se resolvió la vulnerabilidad de nulidad (TS18047) 
 *    mediante encadenamiento opcional y el uso de 'searchParametersString' como 
 *    puente de seguridad hacia el constructor 'URLSearchParams'.
 * 3. Main Thread Isolation: El uso de 'executeSovereignTransition' garantiza que 
 *    la interfaz no se congele durante la re-hidratación de la malla de podcasts.
 */