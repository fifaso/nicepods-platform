// app/(platform)/layout.tsx
// VERSIÓN: 5.0 (NicePod Platform Chassis - Atmospheric Resonance Edition)
// Misión: Proveer el chasis visual y asegurar la visibilidad total del BackgroundEngine.
// [ESTABILIZACIÓN]: Erradicación de oclusión por capas y optimización de interactividad WebGL.

"use client";

import { usePathname } from "next/navigation";
import React from "react";

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
   * Identificamos si el Voyager está en el mapa (/map).
   */
  const isMapActive = pathname?.startsWith('/map');

  /**
   * [CONTENIDO CENTRAL]: 
   * Definimos el núcleo de la interfaz asegurando bg-transparent
   * en todos los niveles para permitir la visibilidad del BackgroundEngine.
   */
  const renderCoreContent = () => (
    <>
      {/* 
          CAPA NAVEGACIÓN: 
          Flota sobre el fondo visual. Se mantiene transparente.
      */}
      <Navigation />

      <main
        className={cn(
          "relative z-10 flex flex-col min-h-screen transition-all duration-500",
          "bg-transparent", // Mantenemos la transparencia crítica
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
          Misión: Aislar el scroll suavizado del mapa WebGL.
      */}
      {isMapActive ? (
        <div className="flex flex-col min-h-screen bg-transparent overflow-hidden">
          <OfflineIndicator />
          {renderCoreContent()}
        </div>
      ) : (
        /* 
           SmoothScrollWrapper: Aseguramos que no inyecte fondos sólidos 
           al envolver el contenido del Dashboard.
        */
        <SmoothScrollWrapper>
          <div className="flex flex-col min-h-screen bg-transparent relative z-10">
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
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. Atmospheric Perforation: Se ha reforzado 'bg-transparent' en todos los divs de alto nivel.
 *    Esto elimina cualquier posibilidad de que este layout bloquee al BackgroundEngine.
 * 2. Visual Stacking: Se añadió 'relative z-10' al contenedor de scroll para asegurar que 
 *    el contenido sea interactivo sin interferir con el plano z: -20 del fondo.
 * 3. Zero-Wait UI: Se mantiene la estructura síncrona para evitar parpadeos de navegación.
 * 4. Malla Geográfica: Se preserva la exclusión del SmoothScroll en /map para no 
 *    secuestrar los eventos de inercia del motor WebGL.
 */