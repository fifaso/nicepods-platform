// components/library-view-switcher.tsx
/**
 * =================================================================================
 * Library View Switcher - v1.0.0
 * =================================================================================
 *
 * Rol en la Arquitectura:
 * Este es un componente cliente "inteligente" pero enfocado. Su única responsabilidad es
 * leer el estado de la vista actual desde los parámetros de la URL y permitir al usuario
 * cambiarlo. Actúa como el panel de control para las diferentes modalidades de
 * visualización de la biblioteca.
 *
 * Principios de Diseño:
 * - Fuente Única de Verdad: El estado de la vista se deriva directamente de la URL
 *   (`useSearchParams`), garantizando que la UI sea un reflejo predecible del estado
 *   de la aplicación y permitiendo enlaces directos.
 * - Interactivo y Accesible: Proporciona feedback visual claro sobre la vista activa
 *   y utiliza 'title' para mejorar la accesibilidad de los botones de icono.
 * - Desacoplado: No sabe nada sobre cómo se renderizan las vistas; solo se encarga
 *   de comunicar la intención del usuario modificando la URL.
 *
 */

"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Compass, List } from 'lucide-react';
import { cn } from '@/lib/utils';

// Definimos los modos de vista posibles para una mayor seguridad de tipos.
type LibraryViewMode = 'grid' | 'list' | 'compass';

export function LibraryViewSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Leemos el parámetro 'view' de la URL. Si no existe, 'grid' es el valor por defecto.
  const currentView = (searchParams.get('view') as LibraryViewMode) || 'grid';

  /**
   * Actualiza el parámetro de consulta 'view' en la URL sin recargar la página.
   * Esto desencadenará una re-renderización del Componente de Servidor padre.
   * @param view El nuevo modo de vista a establecer.
   */
  const setView = (view: LibraryViewMode) => {
    // Creamos una nueva instancia de URLSearchParams para no mutar el original.
    const params = new URLSearchParams(searchParams);
    params.set('view', view);
    // Usamos router.push para una navegación suave del lado del cliente.
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-end mb-6 gap-2">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setView('grid')} 
        title="Vista de Cuadrícula" 
        className={cn('transition-colors', currentView === 'grid' && 'bg-accent text-accent-foreground')}
      >
        <LayoutGrid className="h-5 w-5" />
      </Button>
      
      {/* 
        Aunque no la hemos implementado, la lógica para una vista de lista está aquí,
        comentada y lista para ser activada en el futuro.
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setView('list')} 
        title="Vista de Lista" 
        className={cn('transition-colors', currentView === 'list' && 'bg-accent text-accent-foreground')}
      >
        <List className="h-5 w-5" />
      </Button> 
      */}

      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setView('compass')} 
        title="Vista de Brújula de Resonancia" 
        className={cn('transition-colors', currentView === 'compass' && 'bg-accent text-accent-foreground')}
      >
        <Compass className="h-5 w-5" />
      </Button>
    </div>
  );
}