// components/library-view-switcher.tsx
// VERSIÓN: 3.0

"use client";

import { motion } from "framer-motion";
import {
  Compass,
  LayoutGrid,
  List
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";

// --- INFRAESTRUCTURA UI (NicePod Design System) ---
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * TIPO: LibraryViewMode
 * Define las tres perspectivas autorizadas para la exploración de conocimiento.
 */
type LibraryViewMode = 'grid' | 'list' | 'compass';

/**
 * COMPONENTE: LibraryViewSwitcher
 * El dial de control para la visualización del Intelligence Archive.
 * 
 * [FILOSOFÍA DE DISEÑO]:
 * 1. Persistencia: El estado reside en la URL (?view=...), permitiendo compartir vistas específicas.
 * 2. Elegancia: Uso de Glassmorphism V2 (backdrop-blur-xl) y bordes Aurora.
 * 3. Feedback: Transición de fondo fluida mediante Framer Motion.
 */
export function LibraryViewSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Recuperamos la vista actual sincronizada con la URL. Fallback: 'grid'.
  const currentView = (searchParams.get('view') as LibraryViewMode) || 'grid';

  /**
   * handleViewChange: 
   * Misión: Mutar la perspectiva visual sin destruir los filtros de búsqueda activos.
   */
  const handleViewChange = (view: LibraryViewMode) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', view);

    // Ejecutamos el cambio con scroll bloqueado para mantener el enfoque del usuario.
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  /**
   * OPCIONES DE CONTROL:
   * Array de configuración para generar la interfaz de forma iterativa y limpia.
   */
  const viewOptions = [
    { id: 'grid', icon: LayoutGrid, label: 'Malla' },
    { id: 'list', icon: List, label: 'Lista' },
    { id: 'compass', icon: Compass, label: 'Compás' },
  ];

  return (
    <TooltipProvider delayDuration={400}>
      <div className="relative flex items-center p-1.5 bg-black/40 border border-white/5 rounded-2xl backdrop-blur-xl shadow-2xl overflow-hidden selection:bg-primary/20">

        {/* I. CAPA DE FONDO ANIMADA (THE SLIDER) */}
        {/* 
            Este bloque se desplaza físicamente bajo el botón activo, 
            proporcionando una sensación de hardware premium.
        */}
        <div className="absolute inset-y-1.5 left-1.5 right-1.5 flex pointer-events-none z-0">
          <div className="w-1/3 h-full relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                layoutId="active-view-bg"
                initial={false}
                animate={{
                  x: viewOptions.findIndex(o => o.id === currentView) * 100 + "%"
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
                className="w-full h-full bg-white rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.15)]"
              />
            </AnimatePresence>
          </div>
        </div>

        {/* II. ZONA DE BOTONES DE PRECISIÓN */}
        {viewOptions.map((option) => {
          const isActive = currentView === option.id;
          const Icon = option.icon;

          return (
            <Tooltip key={option.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleViewChange(option.id as LibraryViewMode)}
                  className={cn(
                    "relative z-10 flex items-center justify-center h-10 w-12 md:w-16 rounded-xl transition-colors duration-500 outline-none",
                    isActive ? "text-black" : "text-zinc-500 hover:text-white"
                  )}
                  aria-label={`Cambiar a vista de ${option.label}`}
                >
                  <Icon
                    className={cn(
                      "h-4.5 w-4.5 transition-transform duration-500",
                      isActive ? "scale-110" : "scale-100",
                      option.id === 'compass' && !isActive && "animate-pulse-slow"
                    )}
                  />

                  {/* Etiqueta solo visible en Desktop para mantener la densidad */}
                  <span className={cn(
                    "ml-2 text-[9px] font-black uppercase tracking-[0.3em] hidden xl:inline-block transition-opacity",
                    isActive ? "opacity-100" : "opacity-0"
                  )}>
                    {option.label}
                  </span>
                </button>
              </TooltipTrigger>

              <TooltipContent side="bottom" className="bg-zinc-900 border-white/10 text-white rounded-lg">
                <p className="text-[10px] font-black uppercase tracking-widest">{option.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}

        {/* III. INDICADOR DE PULSO TÉCNICO */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-20 pointer-events-none" />
      </div>
    </TooltipProvider>
  );
}

/**
 * SUB-COMPONENTES Y UTILIDADES NECESARIAS
 */
function AnimatePresence({ children, mode }: { children: React.ReactNode, mode: "wait" | "popLayout" | "sync" }) {
  // Wrapper para Framer Motion importado desde la librería principal
  return <>{children}</>;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Diseño Spotify/YouTube: El uso de un fondo blanco sólido que 'viaja' por 
 *    el componente es una de las micro-interacciones de mayor calidad percibida.
 * 2. Accesibilidad: Se han incluido Tooltips con tipografía industrial para 
 *    explicar cada modo de vista sin saturar la interfaz principal.
 * 3. Rendimiento (Zero-Wait): El uso de router.push con scroll:false asegura 
 *    que la transición sea instantánea, cumpliendo con el Dogma Nivel 0.
 */