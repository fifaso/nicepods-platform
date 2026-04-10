/**
 * ARCHIVO: app/(platform)/layout.tsx
 * VERSIÓN: 6.0 (NicePod Platform Chassis - Unified Telemetry & Resource Optimization Edition)
 * PROTOCOLO: MADRID RESONANCE V4.5
 * 
 * Misión: Proveer el chasis visual transparente y orquestar el Ciclo de Vida Global 
 * de la telemetría, garantizando que el hardware GPS solo se active una vez 
 * para toda la sesión de la Workstation.
 * [REFORMA V6.0]: Integración de GeoEngineProvider como Singleton Global de 
 * plataforma. Sincronización nominal absoluta (ZAP) y optimización de 
 * Stacking Context para el motor WebGL.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import React from "react";
import { usePathname } from "next/navigation";

// --- INFRAESTRUCTURA DE NAVEGACIÓN Y ACCESO SOBERANO ---
import { AuthGuard } from "@/components/auth/auth-guard";
import { Navigation } from "@/components/navigation";

// --- NÚCLEO DE INTELIGENCIA Y TELEMETRÍA (SINGLETON GLOBAL) ---
import { GeoEngineProvider } from "@/hooks/use-geo-engine";

// --- SERVICIOS DE INFRAESTRUCTURA Y ESTABILIZACIÓN ---
import { OfflineIndicator } from '@/components/system/offline-indicator';
import { ScrollToTop } from "@/components/system/scroll-to-top";
import { SmoothScrollWrapper } from "@/components/system/smooth-scroll-wrapper";

// --- COMPONENTES DE SALIDA Y ANIMACIÓN INDUSTRIAL ---
import { PlayerOrchestrator } from "@/components/player/player-orchestrator";
import { PageTransition } from "@/components/system/page-transition";
import { Toaster } from "@/components/ui/toaster";

// --- UTILIDADES DE DISEÑO ---
import { cn } from "@/lib/utils";

/**
 * COMPONENTE: PlatformLayout
 * El chasis soberano para la experiencia de inteligencia industrial.
 */
export default function PlatformLayout({
  children
}: {
  children: React.ReactNode
}) {
  const currentUrlPathname = usePathname();

  /**
   * [ANÁLISIS DE ENTORNO TÁCTICO]:
   * Identificamos si el Voyager está en zonas de alta intensidad computacional.
   */
  const isMapInterfaceActive = currentUrlPathname?.startsWith('/map');
  const isForgeTerminalActive = currentUrlPathname?.startsWith('/create');
  
  // Zonas donde el chasis debe ser pasivo para liberar el Hilo Principal (MTI).
  const isHighIntensityResourceRoute = isMapInterfaceActive || isForgeTerminalActive;

  /**
   * renderPlatformCoreContent: 
   * Misión: Proyectar la jerarquía de componentes con transparencia atmosférica.
   */
  const renderPlatformCoreContent = () => (
    <>
      {/* 
          CAPA NAVEGACIÓN: 
          Permanece sobre la malla para control global de la terminal.
      */}
      <Navigation />

      <main
        className={cn(
          "relative z-10 flex flex-col min-h-screen transition-all duration-500 bg-transparent",
          // Eliminamos paddings en rutas de inmersión para maximizar el reactor WebGL
          isHighIntensityResourceRoute ? "pt-0" : "pt-[84px] md:pt-[100px]"
        )}
      >
        <PageTransition>
          <div
            className={cn(
              "w-full flex-grow flex flex-col bg-transparent",
              !isHighIntensityResourceRoute && "px-4 md:px-0"
            )}
          >
            {children}
          </div>
        </PageTransition>
      </main>

      {/* Terminales de salida de audio persistentes y avisos de sistema */}
      <PlayerOrchestrator />
      <Toaster />
    </>
  );

  return (
    /**
     * CAPA 1: CENTINELA DE SOBERANÍA
     * Valida la identidad del Administrador antes de despertar los sensores.
     */
    <AuthGuard>
      
      {/* 
          CAPA 2: MOTOR DE TELEMETRÍA UNIFICADO (V4.5)
          [INTERVENCIÓN ESTRATÉGICA]: Al situar el GeoEngineProvider aquí, el GPS 
          mantiene la persistencia de la ubicación exacta entre cambios de ruta.
          El Dashboard, el Mapa y la Forja ahora beben de la misma fuente de verdad.
      */}
      <GeoEngineProvider>
        
        {/* 
            CAPA 3: COMPOSICIÓN CONDICIONAL DE RECURSOS (HARDWARE HYGIENE)
        */}
        {isHighIntensityResourceRoute ? (
          <div className="flex flex-col min-h-screen bg-transparent overflow-hidden isolate">
            <OfflineIndicator />
            {renderPlatformCoreContent()}
          </div>
        ) : (
          <SmoothScrollWrapper>
            <div className="flex flex-col min-h-screen bg-transparent relative z-10 isolate">
              <OfflineIndicator />
              <ScrollToTop />
              {renderPlatformCoreContent()}
            </div>
          </SmoothScrollWrapper>
        )}

      </GeoEngineProvider>
    </AuthGuard>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.0):
 * 1. Global Telemetry Unification: El motor 'useGeoEngine' ahora es un Singleton para toda 
 *    la plataforma. La ubicación precisa capturada en el Dashboard es heredada por la 
 *    Forja en milisegundos, eliminando la latencia de re-triangulación.
 * 2. Zero Abbreviations Policy (ZAP): Refactorización total de variables de ruta 
 *    (isMapInterfaceActive, isForgeTerminalActive, currentUrlPathname).
 * 3. Resource Stewardship: Se preserva el aislamiento de 'SmoothScrollWrapper', liberando 
 *    ciclos de CPU para el Reactor WebGL en rutas de alta densidad gráfica.
 */