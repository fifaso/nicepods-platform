// components/navigation/shared/nav-styles.ts
// VERSIÓN: 2.1

import { cn } from "@/lib/utils";

/**
 * ESTILO: HEADER MAESTRO (Contenedor Externo)
 * 
 * [ARQUITECTURA]:
 * - fixed top-0: Posicionamiento absoluto para visibilidad persistente.
 * - z-[100]: Prioridad máxima sobre capas geoespaciales y modales.
 * - animate-in: Entrada cinemática suavizada.
 */
export const headerContainerClass = cn(
  "fixed top-0 left-0 right-0 z-[100] w-full p-3 md:p-5",
  "animate-in fade-in slide-in-from-top-2 duration-1000 ease-[0.16, 1, 0.3, 1]"
);

/**
 * ESTILO: PANEL DE VIDRIO (El Bastidor de Navegación)
 * 
 * [RE-CALIBRACIÓN DE LUJO]:
 * - bg-black/60: Translucidez equilibrada para permitir el sangrado del fondo Aurora.
 * - backdrop-blur-2xl: El estándar de NicePod para profundidad esmerilada.
 * - rounded-[2rem]: Radio de curvatura industrial consistente.
 */
export const glassPanelClass = cn(
  "relative max-w-screen-xl mx-auto flex items-center justify-between",
  "rounded-[2.5rem] border border-white/10 bg-black/60 shadow-2xl",
  "backdrop-blur-2xl supports-[backdrop-filter]:bg-black/40",
  "h-[4.5rem] md:h-20",
  "px-6 md:px-10"
);

/**
 * ESTILO: BOTÓN AURORA (Acción de Forja)
 * 
 * [REFINAMIENTO]:
 * - h-10 md:h-12: Altura calibrada para alineación perfecta con botones de texto.
 * - hover:shadow: Aumento de la dispersión de luz en hover para efecto de 'activación'.
 */
export const auroraButtonClass = cn(
  "bg-gradient-to-r from-indigo-600 via-primary to-fuchsia-600",
  "text-white border border-white/20 shadow-lg shadow-primary/20",
  "transition-all duration-500 ease-[0.16, 1, 0.3, 1] active:scale-95",
  "hover:shadow-[0_0_40px_-10px_rgba(139,92,246,0.5)] hover:scale-[1.03]",
  "relative overflow-hidden group/crear"
);

/**
 * ESTILO: ENLACES DE NAVEGACIÓN (Micro-Tipografía)
 * 
 * [ESTÁNDAR DE LUJO]:
 * - text-[10px]: Reducción de tamaño para aumentar la elegancia y el aire visual.
 * - tracking-[0.3em]: Espaciado entre letras expansivo, típico de interfaces profesionales.
 * - transition-all duration-300: Curva de respuesta suave al tacto.
 */
export const navLinkBaseClass = cn(
  "rounded-full px-7 py-2.5 text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300 block outline-none"
);

/**
 * ESTADO ACTIVO: La Pieza Resonante.
 * - bg-white/90: Blanco con ligera transparencia para evitar el aspecto de 'plástico sólido'.
 * - shadow-white/10: Brillo periférico sutil.
 */
export const navLinkActiveClass = cn(
  "bg-white/95 text-black shadow-lg shadow-white/5"
);

/**
 * ESTADO INACTIVO: La Sutileza del Fondo.
 * - text-zinc-500: Color base neutro para no competir con la marca o el botón activo.
 * - hover:text-white: Revelación progresiva al interactuar.
 */
export const navLinkInactiveClass = cn(
  "text-zinc-500 hover:text-white hover:bg-white/5"
);

/**
 * ESTILO: CÁPSULA DE ACCIÓN MÓVIL
 * Sincronización perfecta con el diseño de mano.
 */
export const mobileCreateButtonClass = cn(
  auroraButtonClass,
  "h-10 px-5 rounded-2xl flex items-center justify-center gap-2",
  "font-black text-[9px] uppercase tracking-[0.25em]"
);

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * El cambio más significativo es el aumento del 'tracking' a 0.3em. Esto expande 
 * visualmente la palabra sin ocupar más espacio de masa, creando una sensación 
 * de precisión y limpieza. El uso de blancos al 95% (bg-white/95) en el estado 
 * activo permite que el color del fondo Aurora 'ensucie' mínimamente el botón, 
 * integrándolo orgánicamente en la atmósfera de la página.
 */