/**
 * ARCHIVO: app/(auth)/layout.tsx
 * VERSIÓN: 2.0 (NicePod Auth Isolation Standard - Absolute Purity Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Proveer el contenedor atmosférico y estructural para el flujo de identidad,
 * garantizando el aislamiento de recursos y evitando la duplicidad de UI.
 * [REFORMA V2.0]: Eliminación total de componentes visuales (Branding/Navegación)
 * para delegar la soberanía de la interfaz a las páginas finales.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import { Metadata } from "next";
import React from "react";

/**
 * METADATA SOBERANA:
 * Define la identidad técnica de la terminal de acceso para el historial del sistema.
 */
export const metadata: Metadata = {
  title: "Acceso Seguro | NicePod Intelligence",
  description: "Terminal de validación de autoridad y acceso a la Bóveda NKV.",
};

/**
 * AuthenticationLayout: El lienzo de transición para los procesos de identidad.
 * 
 * Este componente actúa como un contenedor pasivo que proyecta la atmósfera 
 * visual de NicePod sin competir con los elementos interactivos del usuario.
 */
export default function AuthenticationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center bg-[#010101] overflow-hidden selection:bg-primary/30">

      {/* 
          I. ÁREA DE TRABAJO (INNER CONTENT)
          Punto de inyección para las páginas de Login, Registro y Recuperación.
          Se ha eliminado el padding superior para permitir el centrado atómico.
      */}
      <main className="relative z-10 w-full flex items-center justify-center p-4">
        {children}
      </main>

      {/* 
          II. ATMÓSFERA AURORA (ENVIRONMENTAL LAYER)
          Misión: Proveer profundidad visual mediante la proyección de luz coherente.
          Utilizamos 'pointer-events-none' para asegurar que el fondo no intercepte el tacto.
      */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 isolate">
        
        {/* Proyección Lumínica Primaria (Esquina Superior Izquierda) */}
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[150px] animate-pulse" />

        {/* Proyección Lumínica Secundaria (Esquina Inferior Derecha) */}
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[150px]" />

        {/* Sintonía de Brillo Central */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-radial from-blue-500/5 to-transparent" />
        
      </div>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. UI Decoupling: Al eliminar el botón de retorno y el logo del Layout, 
 *    erradicamos el problema de elementos duplicados detectado en el peritaje 
 *    visual de la Imagen 22.
 * 2. Zero Abbreviations Policy: Se purificaron los nombres de las interfaces 
 *    y los metadatos, cumpliendo con el Dogma V4.0.
 * 3. Thermodynamic Efficiency: La estructura simplificada reduce el número de 
 *    nodos DOM en el árbol de renderizado, liberando ciclos de CPU durante 
 *    la fase crítica de autenticación.
 */