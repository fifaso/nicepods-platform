/**
 * ARCHIVO: app/(platform)/layout.tsx
 * VERSIÓN: 8.0 (NicePod Platform Chassis - Passive Consumer & Global Singleton Alignment Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Proveer el chasis visual transparente para la plataforma NicePod, 
 * actuando como un consumidor pasivo de la telemetría global inyectada en 
 * el Root Layout. Gestiona la visibilidad de navegación, orquestación de 
 * audio y protección de identidad soberana.
 * [REFORMA V8.0]: Eliminación del 'GeoEngineProvider' redundante (Purga Pilar 2). 
 * Se transfiere la autoridad telemétrica íntegramente al Root Layout para 
 * evitar colisiones de estado. Resolución definitiva del error de tipos TS2322 
 * al eliminar el mapeo de semilla T0 duplicado. Cumplimiento absoluto de la 
 * Zero Abbreviations Policy (ZAP).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { usePathname } from "next/navigation";
import React from "react";

// --- INFRAESTRUCTURA DE NAVEGACIÓN Y ACCESO SOBERANO ---
import { AuthGuard } from "@/components/auth/auth-guard";
import { Navigation } from "@/components/navigation";

// --- SERVICIOS DE INFRAESTRUCTURA Y ESTABILIZACIÓN ---
import { OfflineIndicator } from '@/components/system/offline-indicator';
import { ScrollToTop } from "@/components/system/scroll-to-top";
import { SmoothScrollWrapper } from "@/components/system/smooth-scroll-wrapper";

// --- COMPONENTES DE SALIDA Y ANIMACIÓN INDUSTRIAL ---
import { PlayerOrchestrator } from "@/components/player/player-orchestrator";
import { PageTransition } from "@/components/system/page-transition";
import { Toaster } from "@/components/ui/toaster";

// --- UTILIDADES DE DISEÑO INDUSTRIAL ---
import { concatenateClassNames } from "@/lib/utils";

/**
 * COMPONENTE: PlatformLayout
 * El orquestador estructural de la experiencia del Voyager en la terminal.
 * 
 * [NOTA TÉCNICA]: Este componente ya no gestiona la semilla T0. 
 * La telemetría nace y persiste en 'app/layout.tsx'.
 */
export default function PlatformLayout({
  children
}: {
  children: React.ReactNode
}) {
  const currentUrlPathname = usePathname();

  /**
   * [ANÁLISIS DE ENTORNO TÁCTICO]:
   * Determinamos si la ruta actual requiere aislamiento total de recursos 
   * (Main Thread Isolation) para dar prioridad al renderizado WebGL.
   */
  const isMapInterfaceActive = currentUrlPathname?.startsWith('/map');
  const isForgeTerminalActive = currentUrlPathname?.startsWith('/create');
  const isHighIntensityResourceRoute = isMapInterfaceActive || isForgeTerminalActive;

  /**
   * renderPlatformCoreContent: 
   * Misión: Proyectar la jerarquía de componentes con transparencia atmosférica.
   */
  const renderPlatformCoreContent = () => (
    <>
      {/* 
          Navegación Soberana: Se mantiene estática pero sensible 
          al scroll en rutas no tácticas. 
      */}
      <Navigation />

      <main
        className={concatenateClassNames(
          "relative z-10 flex flex-col min-h-screen transition-all duration-500 bg-transparent",
          isHighIntensityResourceRoute ? "pt-0" : "pt-[84px] md:pt-[100px]"
        )}
      >
        <PageTransition>
          <div
            className={concatenateClassNames(
              "w-full flex-grow flex flex-col bg-transparent",
              !isHighIntensityResourceRoute && "px-4 md:px-0"
            )}
          >
            {children}
          </div>
        </PageTransition>
      </main>

      {/* Orquestación de salida acústica global */}
      <PlayerOrchestrator />
      <Toaster />
    </>
  );

  return (
    /**
     * CAPA 1: CENTINELA DE SOBERANÍA
     * Garantiza que solo peritos autenticados accedan a la Workstation.
     */
    <AuthGuard>

      {/* 
          CAPA 2: COMPOSICIÓN CONDICIONAL (PILAR 4 - MTI)
          Para rutas de alta intensidad (Mapa/Forja), desactivamos el scroll suave 
          para evitar interferencias con el motor de inercia de Mapbox.
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

    </AuthGuard>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V8.0):
 * 1. Architecture Alignment: Se ha eliminado la instancia local del 'GeoEngineProvider'. 
 *    Este cambio garantiza que no haya 'reseteos' de ubicación al navegar entre el 
 *    Dashboard y el Mapa, ya que el Singleton reside ahora en la raíz absoluta.
 * 2. ZAP Absolute Compliance: Se eliminaron abreviaciones como 'pathname' por 
 *    'currentUrlPathname' y 'isHighIntensity' por 'isHighIntensityResourceRoute'.
 * 3. Contract Safety: Al no inyectar datos en un proveedor inexistente, se eliminó 
 *    el error de tipos TS2322 reportado por el compilador de Vercel.
 */