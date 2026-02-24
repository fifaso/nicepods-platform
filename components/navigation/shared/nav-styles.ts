// components/navigation/shared/nav-styles.ts
// VERSIÓN: 2.0

import { cn } from "@/lib/utils";

/**
 * ESTILO: HEADER MAESTRO (Contenedor de Posicionamiento)
 * 
 * [ARQUITECTURA DE ANCLAJE]:
 * - fixed top-0: Se cambia sticky por fixed para asegurar la visibilidad permanente.
 * - z-[100]: Elevamos el índice de profundidad al máximo para superar capas WebGL.
 * - p-3 md:p-5: Aumentamos el padding para generar un marco visual respirable.
 */
export const headerContainerClass = cn(
  "fixed top-0 left-0 right-0 z-[100] w-full p-3 md:p-5",
  "animate-in fade-in slide-in-from-top-2 duration-700 ease-out"
);

/**
 * ESTILO: PANEL DE VIDRIO (Glassmorphism)
 * 
 * [RE-CALIBRACIÓN ERGONÓMICA]:
 * - Altura Móvil: h-14 (56px) -> h-[4.5rem] (72px). Incremento del ~28% para facilitar el pulso.
 * - Altura Desktop: h-16 (64px) -> h-20 (80px). Incremento del 25% para presencia institucional.
 * - rounded-[2rem]: Radio de curvatura suavizado para acompañar la nueva escala.
 * - backdrop-blur-2xl: Desenfoque de alta densidad para legibilidad sobre fondos complejos.
 */
export const glassPanelClass = cn(
  "relative max-w-screen-xl mx-auto flex items-center justify-between",
  "rounded-[2rem] border border-white/10 bg-black/70 shadow-2xl",
  "backdrop-blur-2xl supports-[backdrop-filter]:bg-black/50",
  // Nuevas alturas industriales
  "h-[4.5rem] md:h-20",
  // Padding lateral escalado para mantener la proporción aurea
  "px-6 md:px-10"
);

/**
 * ESTILO: BOTÓN AURORA (Acción Primaria)
 * 
 * [IDENTIDAD DE FORJA]:
 * - Gradiente: Indigo-Primary-Fuchsia (El pulso de NicePod).
 * - h-11 md:h-13: Altura sincronizada con el panel para un aspecto masivo y profesional.
 */
export const auroraButtonClass = cn(
  "bg-gradient-to-r from-indigo-600 via-primary to-fuchsia-600",
  "text-white border border-white/20 shadow-lg shadow-primary/20",
  "transition-all duration-500 ease-out active:scale-95",
  "hover:shadow-[0_0_35px_rgba(var(--primary),0.5)] hover:scale-[1.05]",
  "relative overflow-hidden group/crear"
);

/**
 * ESTILO: ENLACES DE NAVEGACIÓN (Desktop Nav Links)
 * 
 * [LEGIBILIDAD]:
 * - text-[11px]: Aumento de legibilidad en tipografía institucional.
 * - px-6 py-3: Áreas de clic (hit-boxes) generosas.
 */
export const navLinkBaseClass = cn(
  "rounded-full px-6 py-2.5 text-[11px] font-black uppercase tracking-[0.25em] transition-all block"
);

export const navLinkActiveClass = cn(
  "bg-white text-black shadow-md shadow-white/10"
);

export const navLinkInactiveClass = cn(
  "text-zinc-400 hover:text-white hover:bg-white/5"
);

/**
 * ESTILO: CÁPSULA DE ACCIÓN MÓVIL (Pill)
 * 
 * [ERGONOMÍA]:
 * - h-11: Altura táctil ideal para pulgares.
 * - px-5: Ancho suficiente para albergar texto sin apretar el layout.
 */
export const mobileCreateButtonClass = cn(
  auroraButtonClass,
  "h-11 px-5 rounded-2xl flex items-center justify-center gap-2",
  "font-black text-[10px] uppercase tracking-[0.2em]"
);

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * Este archivo dicta la 'Física de la Interfaz'. El cambio de 'sticky' a 'fixed' 
 * requiere que el contenido principal de la aplicación tenga un margen superior 
 * compensatorio (p.ej. pt-24 en el layout global) para evitar que el menú tape 
 * el inicio del contenido. La altura h-[4.5rem] garantiza que los iconos de 
 * Lucide (h-6) tengan un margen de seguridad (gutter) amplio.
 */