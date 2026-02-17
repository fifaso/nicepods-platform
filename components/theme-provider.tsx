// components/theme-provider.tsx
// VERSIÓN: 7.0 (NicePod Atmospheric Shield - Zero-Flicker & Hydration Mastery)
// Misión: Orquestar la atmósfera visual (Amanecer/Nebulosa) eliminando el destello de carga inicial.
// [ESTABILIZACIÓN]: Eliminación del bloqueo 'mounted' para permitir sincronía total con el script de layout.tsx.

"use client";

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";

/**
 * ThemeProvider: El núcleo de gestión lumínica de NicePod V2.5.
 * 
 * Este componente es el responsable de aplicar las variables CSS del sistema Aurora
 * (definidas en globals.css) basándose en la preferencia del curador o del sistema operativo.
 * 
 * ESTRATEGIA ARQUITECTÓNICA:
 * 1. Sincronía con SSR: No bloqueamos el renderizado inicial. Dejamos que NextThemesProvider
 *    trabaje en paralelo con el script inyectado en el <head> del layout.
 * 2. Supresión de Transiciones: Bloqueamos las transiciones CSS durante el cambio de tema
 *    para evitar el efecto de 'fading' que se percibe como retardo en la carga.
 */
export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {

  /**
   * [RIGOR TÉCNICO]
   * Utilizamos el NextThemesProvider con una configuración optimizada para alto rendimiento:
   * 
   * - attribute="class": Fundamental para que las utilidades de Tailwind (dark:...) y 
   *   nuestro gradient-mesh reconozcan el estado visual.
   * - defaultTheme="dark": NicePod nace en la Nebulosa (modo oscuro) por identidad de marca.
   * - enableSystem={true}: Respeta la soberanía de la configuración global del usuario.
   * - disableTransitionOnChange={true}: ELIMINA EL PESTAÑEO. Al navegar entre páginas
   *   o hidratar, no queremos que el navegador pierda tiempo animando colores.
   */
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={true}
      disableTransitionOnChange={true} // <--- CLAVE: Mata el parpadeo de transición de color
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

/**
 * NOTA PARA EL EQUIPO DE INGENIERÍA:
 * Se ha eliminado el estado 'mounted' que existía en versiones anteriores.
 * 
 * ¿Por qué?
 * En Next.js 14, si el layout.tsx ya inyecta el tema correctamente mediante un script 
 * síncrono, 'next-themes' es capaz de hidratarse sobre ese estado sin provocar 
 * inconsistencias. Al quitar el retorno condicional 'if (!mounted)', garantizamos 
 * que el árbol de React sea idéntico en servidor y cliente, eliminando el 
 * 're-paint' que causaba el pestañeo visual.
 */