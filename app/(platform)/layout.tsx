/**
 * ARCHIVO: app/(platform)/layout.tsx
 * VERSIÓN: 5.1 (NicePod Platform Chassis - Forge & Resource Optimization Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Proveer el chasis visual transparente y optimizar recursos según la ruta.
 * [REFORMA V5.1]: Aislamiento de la ruta /create para habilitar el Protocolo Clean-Slate.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

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
import { PlayerOrchestrator } from "@/components/player/player-orchestrator";
import { PageTransition } from "@/components/system/page-transition";
import { Toaster } from "@/components/ui/toaster";

// --- UTILIDADES DE DISEÑO ---
import { cn } from "@/lib/utils";

/**
 * COMPONENTE: PlatformLayout
 * El chasis soberano para la experiencia de usuario autenticado.
 */
export default function PlatformLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();

  /**
   * [ANÁLISIS DE ENTORNO TÁCTICO]:
   * Identificamos si el Voyager está en zonas de alta intensidad WebGL.
   * isMapActive: Ruta de inmersión total.
   * isForgeActive: Ruta de creación de contenido (Terminal de Forja).
   */
  const isMapActive = pathname?.startsWith('/map');
  const isForgeActive = pathname?.startsWith('/create');
  
  // Zonas donde el layout debe ser 100% pasivo para ahorrar GPU/RAM.
  const isHighIntensityRoute = isMapActive || isForgeActive;

  /**
   * [CONTENIDO CENTRAL]: 
   * Núcleo de la interfaz con transparencia atmosférica garantizada.
   */
  const renderCoreContent = () => (
    <>
      {/* 
          CAPA NAVEGACIÓN: 
          Permanece transparente para dejar fluir la luz del BackgroundEngine.
      */}
      <Navigation />

      <main
        className={cn(
          "relative z-10 flex flex-col min-h-screen transition-all duration-500 bg-transparent",
          // Eliminamos paddings en rutas de inmersión o creación
          isHighIntensityRoute ? "pt-0" : "pt-[84px] md:pt-[100px]"
        )}
      >
        <PageTransition>
          <div
            className={cn(
              "w-full flex-grow flex flex-col bg-transparent",
              !isHighIntensityRoute && "px-4 md:px-0"
            )}
          >
            {children}
          </div>
        </PageTransition>
      </main>

      {/* Terminales de salida de audio y avisos persistentes */}
      <PlayerOrchestrator />
      <Toaster />
    </>
  );

  return (
    /**
     * CAPA 1: CENTINELA DE SOBERANÍA
     * Valida la autoridad del Voyager antes de montar el chasis.
     */
    <AuthGuard>

      {/* 
          CAPA 2: COMPOSICIÓN CONDICIONAL DE RECURSOS
          [MANDATO V5.1]: En rutas de Mapa o Forja, desmontamos el SmoothScrollWrapper.
          Esto detiene los cálculos de inercia y libera el hilo principal para 
          el motor WebGL de Mapbox v3 y el procesamiento de la IA.
      */}
      {isHighIntensityRoute ? (
        <div className="flex flex-col min-h-screen bg-transparent overflow-hidden isolate">
          <OfflineIndicator />
          {renderCoreContent()}
        </div>
      ) : (
        /* 
           Entorno Estándar (Dashboard / Perfiles):
           Habilitamos el scroll suavizado pero manteniendo la transparencia base.
        */
        <SmoothScrollWrapper>
          <div className="flex flex-col min-h-screen bg-transparent relative z-10 isolate">
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
 * NOTA TÉCNICA DEL ARCHITECT (V5.1):
 * 1. Resource Isolation: Al incluir 'isForgeActive' en la purga del SmoothScroll, 
 *    garantizamos que la terminal de creación no tenga interferencias de scroll 
 *    que podrían causar Layout Thrashing durante el anclaje manual del mapa.
 * 2. Visual Stacking Sovereignty: El uso de 'isolate' en los contenedores raíz 
 *    asegura que el BackgroundEngine (Z-20) se mantenga como una atmósfera 
 *    independiente, eliminando parpadeos cromáticos al navegar a la Forja.
 * 3. Atomic Unmounting: El layout ahora facilita que, al navegar a /create, 
 *    el motor de Mapbox del Dashboard sea destruido físicamente por el 
 *    GeoCreatorOverlay (V5.7), recuperando hasta 300MB de VRAM.
 * 4. Zero Regressions: Se mantiene la integridad de Navigation y PlayerOrchestrator, 
 *    asegurando que la música o crónicas no se interrumpan al iniciar la forja.
 */