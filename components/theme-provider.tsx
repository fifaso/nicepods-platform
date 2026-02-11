// components/theme-provider.tsx
// VERSIÓN: 6.0 (Global Aesthetic Shield - Hydration Integrity Edition)
// Misión: Gestionar la sintonía lumínica global (Amanecer/Nebulosa) sin ruidos de hidratación.
// [ESTABILIDAD]: Resolución de errores React #418/#422 mediante el patrón de montaje diferido.

"use client";

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";
import * as React from "react";

/**
 * ThemeProvider: El orquestador de la atmósfera visual de NicePod.
 * 
 * Este componente envuelve la aplicación en el Root Layout para proveer
 * acceso dinámico a los temas Dark y Light, gestionando la persistencia
 * en el almacenamiento local del navegador.
 */
export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {

  /**
   * [CONTROL DE HIDRATACIÓN]
   * mounted: Variable de estado que nos indica si el código se está ejecutando 
   * en el cliente después del primer renderizado.
   */
  const [mounted, setMounted] = React.useState<boolean>(false);

  /**
   * useEffect: Se dispara inmediatamente tras el montaje en el DOM.
   * Esto nos permite evitar discrepancias entre el HTML generado por el servidor
   * y el primer ciclo de renderizado del cliente.
   */
  React.useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * [ESTRATEGIA FAIL-SAFE]:
   * Si el componente aún no se ha montado (Fase de Servidor o Hidratación inicial),
   * renderizamos los hijos sin el proveedor de temas activo.
   * 
   * Esto permite que el script síncrono del 'app/layout.tsx' tome el control 
   * total del tema inicial, eliminando los errores #418 y #422 de la consola.
   */
  if (!mounted) {
    return <>{children}</>;
  }

  /**
   * RENDERIZADO FINAL:
   * Una vez montado, entregamos el control a NextThemesProvider para permitir
   * al usuario cambiar dinámicamente entre modo 'dark' (Nebulosa) y 'light' (Amanecer).
   */
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={true}
      disableTransitionOnChange={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}