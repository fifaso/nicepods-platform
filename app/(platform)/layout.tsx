// app/(platform)/layout.tsx
// VERSIÓN: 4.0 (NiceCore V2.7 - Visual Chassis & Gesture Passthrough Edition)
// Misión: Proveer el enrutamiento visual y liberar la interactividad del mapa WebGL.
// [ESTABILIZACIÓN]: Detección de ruta /map para desactivar scroll y permitir inmersión 100dvh.

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
 * 
 * [RE-ARQUITECTURA V2.7]:
 * Se ha transformado en Client Component para permitir la reacción dinámica 
 * a la ruta, necesaria para liberar los recursos de hardware en el mapa.
 */
export default function PlatformLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();

  /**
   * [SISTEMA DE EXCEPCIÓN DE GESTOS]:
   * Identificamos si el Voyager está en la zona de inmersión total.
   * Si es así, debemos 'perforar' el layout para que los gestos toquen el mapa.
   */
  const isMapActive = pathname?.startsWith('/map');

  return (
    /**
     * CAPA 1: CENTINELA DE SOBERANÍA
     * Valida la sesión antes de montar cualquier lógica de presentación.
     */
    <AuthGuard>

      {/* 
          CAPA 2: CONTROL DE DESPLAZAMIENTO (Smooth Scroll)
          [MANDATO V2.7]: Si el mapa está activo, desactivamos el wrapper.
          Esto evita que el suavizado de scroll capture los eventos de 'drag' 
          destinados al mapa WebGL, devolviendo la soberanía táctil al motor 3D.
      */}
      <SmoothScrollWrapper disabled={isMapActive}>

        {/* SERVICIOS DE SISTEMA */}
        <OfflineIndicator />
        {!isMapActive && <ScrollToTop />}

        {/* 
            CAPA 3: NAVEGACIÓN TÁCTICA 
            Se mantiene visible pero el mapa fluirá por debajo.
        */}
        <Navigation />

        {/* 
            CAPA 4: CONTENEDOR MAESTRO DE CONTENIDO
            [OPTIMIZACIÓN DE INMERSIÓN]:
            - Si NO es mapa: Aplicamos el padding técnico para el Header.
            - Si ES mapa: pt-0 para permitir 100dvh de visualización pura.
        */}
        <main
          className={cn(
            "relative z-10 flex flex-col min-h-screen bg-transparent transition-all duration-500",
            isMapActive ? "pt-0" : "pt-[84px] md:pt-[100px]"
          )}
        >
          {/* 
              CAPA 5: ORQUESTADOR DE MOVIMIENTO
              Sincroniza la entrada y salida de contenido sin afectar al motor WebGL.
          */}
          <PageTransition>
            <div 
              className={cn(
                "w-full flex-grow flex flex-col bg-transparent",
                // El mapa requiere libertad total de bordes
                !isMapActive && "px-4 md:px-0"
              )}
            >
              {children}
            </div>
          </PageTransition>
        </main>

        {/* 
            CAPA 6: TERMINALES DE SALIDA
            El PlayerOrchestrator flota en la capa Z superior (200).
        */}
        <PlayerOrchestrator />
        <Toaster />

      </SmoothScrollWrapper>
    </AuthGuard>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Solución de Gestos: La desactivación condicional del 'SmoothScrollWrapper' 
 *    es la clave para que el mapa deje de sentirse 'bloqueado'. Ahora el 
 *    Voyager puede rotar y hacer zoom sin que el layout interfiera.
 * 2. Soberanía de Viewport: Al eliminar el 'pt' (padding-top) en la ruta /map, 
 *    el SpatialEngine recibe las coordenadas tácticas con precisión absoluta 
 *    respecto al 0,0 de la pantalla del dispositivo.
 * 3. Hot-Swap Visual: El uso de 'cn' y transiciones de 500ms asegura que 
 *    el cambio entre el Dashboard (con padding) y el Mapa (sin padding) 
 *    sea una experiencia fluida y cinematográfica.
 */