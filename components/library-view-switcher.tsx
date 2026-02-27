// components/library-view-switcher.tsx
// VERSIÓN: 2.0 (Premium View Orchestrator - State Persistence & Compass Support)

"use client";

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Compass, LayoutGrid, List } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/**
 * LibraryViewMode: Definición de las tres dimensiones de visualización de NicePod.
 */
type LibraryViewMode = 'grid' | 'list' | 'compass';

export function LibraryViewSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Determinamos la vista actual con 'grid' como fallback seguro.
  const currentView = (searchParams.get('view') as LibraryViewMode) || 'grid';

  /**
   * setView: Cambia la perspectiva visual sin romper los filtros de contenido.
   * [ESTRATEGIA]: Preservamos el parámetro 'filter' (Pulse/Narrativa) y 'tab'.
   */
  const setView = (view: LibraryViewMode) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', view);

    // Ejecutamos la transición con scroll bloqueado para evitar saltos visuales.
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-1.5 p-1 bg-black/20 dark:bg-white/5 rounded-xl border border-white/5 backdrop-blur-md">

      {/* VISTA: CUADRÍCULA (Default) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setView('grid')}
        title="Vista de Cuadrícula"
        className={cn(
          'h-8 w-8 rounded-lg transition-all duration-300',
          currentView === 'grid'
            ? 'bg-white text-black shadow-lg shadow-white/5'
            : 'text-white/40 hover:text-white hover:bg-white/10'
        )}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>

      {/* VISTA: LISTA (Compacta) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setView('list')}
        title="Vista de Lista"
        className={cn(
          'h-8 w-8 rounded-lg transition-all duration-300',
          currentView === 'list'
            ? 'bg-white text-black shadow-lg shadow-white/5'
            : 'text-white/40 hover:text-white hover:bg-white/10'
        )}
      >
        <List className="h-4 w-4" />
      </Button>

      {/* VISTA: BRÚJULA (Exploración Semántica) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setView('compass')}
        title="Brújula de Inteligencia"
        className={cn(
          'h-8 w-8 rounded-lg transition-all duration-300',
          currentView === 'compass'
            ? 'bg-primary text-white shadow-lg shadow-primary/20'
            : 'text-white/40 hover:text-white hover:bg-white/10'
        )}
      >
        <Compass className={cn("h-4 w-4", currentView === 'compass' && "animate-pulse")} />
      </Button>

    </div>
  );
}