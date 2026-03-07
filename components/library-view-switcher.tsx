// components/library-view-switcher.tsx
// VERSIÓN: 3.5 (Premium View Orchestrator - Transition & Memory Edition)
// Misión: Gestionar la perspectiva del usuario con transiciones suaves y preservación de estado.
// [ESTABILIZACIÓN]: Uso de useTransition (React 18) para evitar bloqueos del UI en listas pesadas.

"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Compass, LayoutGrid, List, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * TIPO: LibraryViewMode
 * Define el contrato estricto de las perspectivas disponibles en la Workstation.
 */
type LibraryViewMode = 'grid' | 'list' | 'compass';

export function LibraryViewSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // React 18: Permite marcar el cambio de URL como una transición de baja prioridad
  const [isPending, startTransition] = useTransition();

  // 1. DETERMINACIÓN DEL ESTADO ACTUAL (Soberanía de URL)
  // Utilizamos 'grid' como fallback universal si la URL está limpia.
  const currentView = (searchParams.get('view') as LibraryViewMode) || 'grid';

  /**
   * ACCIÓN: setView
   * Orquestador que modifica la perspectiva sin destruir los filtros de búsqueda activos.
   */
  const setView = (view: LibraryViewMode) => {
    // Si el usuario ya está en esta vista, abortamos para ahorrar ciclos de renderizado.
    if (view === currentView) return;

    // [SALTO CUÁNTICO]: Si selecciona la brújula, abandonamos la biblioteca.
    if (view === 'compass') {
      startTransition(() => {
        // Mantenemos la latitud/longitud si existieran en el futuro, por ahora salto limpio.
        router.push('/map'); 
      });
      return;
    }

    // Construcción del nuevo estado de URL clonando el actual para preservar los filtros.
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', view);

    startTransition(() => {
      // scroll: false garantiza que la pantalla no salte hacia arriba al cambiar de vista.
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="flex items-center gap-1 p-1 bg-black/40 rounded-[1.25rem] border border-white/10 backdrop-blur-2xl shadow-inner">

      {/* --- BOTÓN: VISTA CUADRÍCULA (GRID) --- */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setView('grid')}
        disabled={isPending}
        aria-label="Cambiar a vista de cuadrícula"
        className={cn(
          'h-10 w-10 rounded-xl transition-all duration-300 relative overflow-hidden',
          currentView === 'grid'
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
        onClick={() => setView('list')}
        disabled={isPending}
        aria-label="Cambiar a vista de lista compacta"
        className={cn(
          'h-10 w-10 rounded-xl transition-all duration-300 relative overflow-hidden',
          currentView === 'list'
            ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]'
            : 'text-zinc-500 hover:text-white hover:bg-white/10'
        )}
      >
        {isPending && currentView !== 'list' && currentView !== 'grid' ? (
          <Loader2 className="h-4 w-4 animate-spin text-zinc-400 absolute" />
        ) : null}
        <List className={cn("h-4 w-4 relative z-10", isPending && "opacity-0")} />
      </Button>

      {/* DIVISOR ESTÉTICO */}
      <div className="w-[1px] h-6 bg-white/10 mx-1 rounded-full" />

      {/* --- BOTÓN: RADAR GEOESPACIAL (COMPASS) --- */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setView('compass')}
        disabled={isPending}
        aria-label="Activar radar en el mapa"
        className={cn(
          'h-10 w-10 rounded-xl transition-all duration-500 group',
          currentView === 'compass'
            ? 'bg-primary text-white shadow-[0_0_30px_rgba(139,92,246,0.4)]'
            : 'bg-primary/5 text-primary hover:bg-primary hover:text-white border border-primary/20'
        )}
      >
        <Compass className={cn(
          "h-4 w-4 transition-transform duration-700",
          currentView === 'compass' ? "animate-pulse" : "group-hover:rotate-90"
        )} />
      </Button>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Rendimiento React 18: La incorporación de 'useTransition' (isPending) asegura 
 *    que si la vista tiene cientos de tarjetas, el navegador no se congele 
 *    durante el cálculo de layout de Grid a List.
 * 2. Accesibilidad Industrial: Se han añadido etiquetas 'aria-label' a todos los 
 *    botones para cumplir con los estándares ARIA en la Workstation.
 * 3. UX de Precisión: Se deshabilita la interacción (disabled={isPending}) 
 *    mientras el Router de Next.js está calculando la nueva ruta para evitar
 *    dobles clicks accidentales que saturan el Historial del navegador.
 */