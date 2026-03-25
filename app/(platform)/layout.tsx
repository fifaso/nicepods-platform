// app/(platform)/layout.tsx
// VERSIÓN: 4.1 (NiceCore V2.7 - Visual Chassis & Conditional Composition Edition)
// Misión: Proveer el enrutamiento visual y liberar la interactividad del mapa WebGL.
// [ESTABILIZACIÓN]: Resolución de error de tipos ts(2322) mediante Composición Condicional.

"use client";

import React from "react";
import { usePathname } from "next/navigation";

// --- INFRAESTRUCTURA DE NAVEGACIÓN Y ACCESO ---
import { AuthGuard } from "@/components/auth/auth-guard";
import { Navigation } from "@/components/navigation";

// --- SERVICIOS DE INFRAESTRUCTURA Y PWA ---
import { OfflineIndicator } from '@/components/system/offline-indicator';
import { ScrollToTop } from "@/components/system/scroll-to-top";
import { SmoothScrollWrapper } from "@/components/system/smooth-scroll-wrapper";

// --- COMPONENTES DE SALIDA Y ANIMACIÓN ---
import { PageTransition } from "@/components/system/page-transition";
import { PlayerOrchestrator } from "@/components/player/player-orchestrator";
import { Toaster } from "@/components/ui/toaster";

// --- UTILIDADES DE DISEÑO ---
import { cn } from "@/lib/utils";

/**
 * COMPONENTE: PlatformLayout
 * El chasis soberano para la experiencia de usuario logueado.
 */
export default function PlatformLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();

  /**
   * [SISTEMA DE EXCEPCIÓN DE GESTOS]:
   * Identificamos si el Voyager está en la zona de inmersión total (/map).
   */
  const isMapActive = pathname?.startsWith('/map');

  /**
   * [CONTENIDO CENTRAL]: 
   * Definimos el núcleo de la interfaz una sola vez para evitar 
   * duplicidad de renderizado y mantener el principio DRY.
   */
  const renderCoreContent = () => (
    <>
      {/* 
          CAPA NAVEGACIÓN: 
          En el mapa, la navegación flota. En el resto, tiene padding.
      */}
      <Navigation />

      <main
        className={cn(
          "relative z-10 flex flex-col min-h-screen bg-transparent transition-all duration-500",
          isMapActive ? "pt-0" : "pt-[84px] md:pt-[100px]"
        )}
      >
        <PageTransition>
          <div 
            className={cn(
              "w-full flex-grow flex flex-col bg-transparent",
              !isMapActive && "px-4 md:px-0"
            )}
          >
            {children}
          </div>
        </PageTransition>
      </main>

      {/* Terminales de salida persistentes */}
      <PlayerOrchestrator />
      <Toaster />
    </>
  );

  return (
    /**
     * CAPA 1: CENTINELA DE SOBERANÍA
     */
    <AuthGuard>
      
      {/* 
          CAPA 2: COMPOSICIÓN CONDICIONAL
          [SOLUCIÓN V2.7]: Si el mapa está activo, no montamos el SmoothScrollWrapper.
          Esto elimina el error de tipos ts(2322) y garantiza que el motor WebGL 
          tenga soberanía total sobre los eventos del ratón y el tacto.
      */}
      {isMapActive ? (
        <div className="flex flex-col min-h-screen bg-transparent overflow-hidden">
          <OfflineIndicator />
          {renderCoreContent()}
        </div>
      ) : (
        <SmoothScrollWrapper>
          <div className="flex flex-col min-h-screen bg-transparent">
            <OfflineIndicator />
            <ScrollToTop />
            {renderCoreContent()}
          </div>
        </SmoothScrollWrapper>
      )}

    </AuthGuard>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.1):
 * 1. Resolución de Tipos: Se eliminó el intento de pasar 'disabled' a un componente
 *    que no lo soporta. El renderizado condicional ({isMapActive ? ... : ...})
 *    es la forma más robusta de aislar el comportamiento del scroll suavizado.
 * 2. Malla Liberada: Al no existir el 'SmoothScrollWrapper' en la ruta /map, 
 *    el navegador no intercepta los eventos de inercia, permitiendo que el 
 *    SpatialEngine de Mapbox v3 opere al 100% de su capacidad interactiva.
 * 3. Optimización de Inmersión: Se mantiene el 'pt-0' (padding-top cero) para
 *    el mapa, asegurando que la cámara ocupe el visor completo del móvil.
 * 4. Gestión de Estado: Se conservan los componentes críticos (Navigation, Player, 
 *    Toaster) en ambos escenarios, garantizando que el AudioProvider no sufra cortes.
 */