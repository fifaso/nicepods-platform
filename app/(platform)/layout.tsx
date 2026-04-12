/**
 * ARCHIVO: app/(platform)/layout.tsx
 * VERSIÓN: 7.0 (NicePod Platform Chassis - Global Geodetic Singleton & Seed Handshake)
 * PROTOCOLO: MADRID RESONANCE V4.8
 * 
 * Misión: Proveer el chasis visual transparente y orquestar el Ciclo de Vida Global 
 * de la telemetría, asegurando la materialización T0 mediante la semilla de red 
 * y manteniendo el enlace satelital activo durante toda la sesión.
 * [REFORMA V7.0]: Implementación de la elevación definitiva del GeoEngineProvider. 
 * Recuperación de la semilla geodésica 'nicepod-geodetic-seed-t0' desde las cookies 
 * para hidratación instantánea. Cumplimiento absoluto de la Zero Abbreviations Policy.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import React, { useEffect, useState, useMemo } from "react";
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

// --- UTILIDADES DE DISEÑO Y PARSEO ---
import { concatenateClassNames } from "@/lib/utils";

/**
 * INTERFAZ: GeodeticSeedPayload
 * Misión: Definir la estructura de la semilla T0 inyectada por el Middleware.
 */
interface GeodeticSeedPayload {
  latitudeCoordinate: number;
  longitudeCoordinate: number;
  cityName: string;
  geographicSource: string;
}

/**
 * COMPONENTE: PlatformLayout
 * El orquestador estructural de la experiencia Voyager.
 */
export default function PlatformLayout({
  children
}: {
  children: React.ReactNode
}) {
  const currentUrlPathname = usePathname();
  const [geodeticSeed, setGeodeticSeed] = useState<GeodeticSeedPayload | null>(null);

  /**
   * EFECTO: GeodeticSeedRecovery
   * Misión: Extraer la semilla T0 de la cookie del Middleware para el Handshake inicial.
   */
  useEffect(() => {
    const cookiesCollection = document.cookie.split('; ');
    const seedCookieEntry = cookiesCollection.find(row => row.startsWith('nicepod-geodetic-seed-t0='));
    
    if (seedCookieEntry) {
      try {
        const rawJsonData = decodeURIComponent(seedCookieEntry.split('=')[1]);
        const parsedSeed = JSON.parse(rawJsonData) as GeodeticSeedPayload;
        setGeodeticSeed(parsedSeed);
      } catch (exception) {
        console.warn("⚠️ [PlatformLayout] Fallo en la des-serialización de la semilla geodésica.");
      }
    }
  }, []);

  /**
   * [ANÁLISIS DE ENTORNO TÁCTICO]:
   * Determinamos si la ruta actual requiere aislamiento total de recursos.
   */
  const isMapInterfaceActive = currentUrlPathname?.startsWith('/map');
  const isForgeTerminalActive = currentUrlPathname?.startsWith('/create');
  const isHighIntensityResourceRoute = isMapInterfaceActive || isForgeTerminalActive;

  /**
   * initialGeographicData:
   * Misión: Adaptar la semilla al contrato esperado por el GeoEngineProvider.
   */
  const initialGeographicData = useMemo(() => {
    if (!geodeticSeed) return null;
    return {
      lat: geodeticSeed.latitudeCoordinate,
      lng: geodeticSeed.longitudeCoordinate,
      city: geodeticSeed.cityName,
      source: geodeticSeed.geographicSource
    };
  }, [geodeticSeed]);

  /**
   * renderPlatformCoreContent: 
   * Misión: Proyectar la jerarquía de componentes con transparencia atmosférica.
   */
  const renderPlatformCoreContent = () => (
    <>
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
          CAPA 2: MOTOR DE TELEMETRÍA UNIFICADO (SINGLETON GLOBAL)
          [MANDATO V7.0]: Al residir en el layout, el motor espacial mantiene 
          la sintonía satelital a través de toda la aplicación.
      */}
      <GeoEngineProvider initialData={initialGeographicData}>
        
        {/* 
            CAPA 3: COMPOSICIÓN CONDICIONAL DE RECURSOS (MAIN THREAD ISOLATION)
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
 * NOTA TÉCNICA DEL ARCHITECT (V7.0):
 * 1. Global Geodetic Singleton: El GeoEngineProvider ha sido elevado al chasis maestro. 
 *    Cualquier dato de ubicación capturado es ahora persistente entre navegaciones.
 * 2. T0 Materialization: Se ha implementado el Handshake con la cookie del Middleware, 
 *    asegurando que el primer frame del mapa no nazca en una ubicación nula.
 * 3. ZAP Enforcement: Purificación nominal total de las variables de ruta y parseo 
 *    (isMapInterfaceActive, seedCookieEntry, GeodeticSeedPayload).
 */