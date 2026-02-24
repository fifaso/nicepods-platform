// components/navigation/shared/nav-styles.ts
// VERSIÓN: 1.0

import { cn } from "@/lib/utils";

/**
 * ESTILO: HEADER MAESTRO (Glassmorphism)
 * Define el contenedor principal que flota sobre la aplicación.
 * 
 * [CARACTERÍSTICAS]:
 * - sticky top-0: Mantiene la navegación accesible.
 * - backdrop-blur-xl: Efecto de vidrio esmerilado de alta calidad.
 * - border-white/5: Borde sutil para definición en modo oscuro.
 */
export const headerContainerClass = cn(
  "sticky top-0 z-50 w-full p-3 md:p-4 animate-in fade-in duration-500"
);

export const glassPanelClass = cn(
  "relative max-w-screen-xl mx-auto flex items-center",
  "rounded-2xl border border-white/5 bg-black/60 shadow-2xl",
  "backdrop-blur-xl supports-[backdrop-filter]:bg-black/40",
  // Alturas optimizadas por dispositivo
  "h-14 md:h-16",
  // Paddings laterales para respiración
  "px-3 md:px-4"
);

/**
 * ESTILO: BOTÓN AURORA (Acción Primaria)
 * El gradiente distintivo de NicePod para llamadas a la acción (CTA).
 */
export const auroraButtonClass = cn(
  // Gradiente Maestro
  "bg-gradient-to-r from-indigo-600 via-primary to-fuchsia-600",
  // Bordes y Sombras
  "text-white border border-white/20 shadow-lg shadow-primary/20",
  // Micro-interacciones
  "transition-all duration-500 ease-out active:scale-95",
  "hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:scale-[1.03]",
  // Contenedor de brillo
  "relative overflow-hidden group/crear"
);

/**
 * ESTILO: ENLACE DE NAVEGACIÓN (Estado Base y Activo)
 * Define cómo se ven los botones de "Inicio", "Biblioteca", etc.
 */
export const navLinkBaseClass = cn(
  "rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all block"
);

export const navLinkActiveClass = cn(
  "bg-white text-black shadow-md"
);

export const navLinkInactiveClass = cn(
  "text-zinc-400 hover:text-white hover:bg-white/5"
);

/**
 * ESTILO: BOTÓN MÓVIL COMPACTO (Pill)
 * Variación del botón Aurora para pantallas <768px.
 */
export const mobileCreateButtonClass = cn(
  auroraButtonClass,
  "h-8 px-4 rounded-full flex items-center justify-center gap-1.5",
  "font-black text-[9px] uppercase tracking-widest"
);