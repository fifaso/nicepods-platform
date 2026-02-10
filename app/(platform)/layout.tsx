// app/(platform)/layout.tsx
// VERSIÓN: 1.4 (NicePod Architecture Standard - Workstation Shell)
// Misión: Orquestar el entorno operativo. Gestiona la jerarquía de audio, navegación y transiciones.
// [FIX]: Corrección de sintaxis de comentarios JSX (react/jsx-no-comment-textnodes).

import { InstallPwaButton } from '@/components/install-pwa-button';
import { Navigation } from "@/components/navigation";
import { OfflineIndicator } from '@/components/offline-indicator';
import { PageTransition } from "@/components/page-transition";
import { PlayerOrchestrator } from "@/components/player-orchestrator";
import { ScrollToTop } from "@/components/scroll-to-top";
import { SmoothScrollWrapper } from "@/components/smooth-scroll-wrapper";
import { Toaster } from "@/components/ui/toaster";
import { AudioProvider } from "@/contexts/audio-context";
import React from "react";

/**
 * PlatformLayout: El ecosistema de trabajo para el usuario autenticado.
 * Este contenedor envuelve todas las rutas operativas (dashboard, create, map, podcasts).
 */
export default function PlatformLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <AudioProvider>
      <SmoothScrollWrapper>
        {/* SERVICIOS DE UTILIDAD TÁCTICA */}
        <OfflineIndicator />
        <InstallPwaButton />
        <ScrollToTop />

        {/* NAVEGACIÓN SUPERIOR (STICKY LAYER)
            Este componente utiliza un z-index de 50. 
            Contiene la identidad del usuario, el buscador y el acceso a la forja.
        */}
        <Navigation />

        {/* 
            CONTENEDOR MAESTRO DE CONTENIDO (THE WORKSTATION)
            [SOLUCIÓN ESTRUCTURAL]: 
            Aplicamos un padding-top (pt) responsivo para compensar el componente Navigation.
        */}
        <main className="relative z-10 pt-20 md:pt-24 lg:pt-28 min-h-screen">

          {/* 
              CAPA 3: Orquestador de Transiciones
              Aplica animaciones suaves cuando el usuario navega entre pestañas.
          */}
          <PageTransition>
            <div className="w-full h-full">
              {children}
            </div>
          </PageTransition>

        </main>

        {/* 
            CAPA DE SALIDA MULTIMEDIA Y SISTEMA
            PlayerOrchestrator: El reproductor flotante persistente.
            Toaster: Sistema de notificaciones emergentes.
        */}
        <PlayerOrchestrator />
        <Toaster />

      </SmoothScrollWrapper>
    </AudioProvider>
  );
}