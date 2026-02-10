// app/(platform)/layout.tsx
// VERSIÓN: 1.5 (NicePod Architecture Standard - Structural Precision Edition)
// Misión: Orquestar el ecosistema operativo para usuarios autenticados. 
// [FIX]: Optimización de espacios verticales y eliminación de colisiones de capas visuales.

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
 * PlatformLayout: Contenedor maestro para la Workstation.
 * Provee los servicios de Audio, Navegación y Notificaciones persistentes.
 */
export default function PlatformLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    /**
     * CAPA 1: Contexto de Audio
     * Habilita el motor de síntesis y el protocolo 'nicepod-timeupdate' en toda la plataforma.
     */
    <AudioProvider>

      {/* CAPA 2: Optimización de Desplazamiento */}
      <SmoothScrollWrapper>

        {/* SERVICIOS DE INFRAESTRUCTURA */}
        <OfflineIndicator />
        <InstallPwaButton />
        <ScrollToTop />

        {/* 
            CAPA 3: Navegación Táctica (Sticky)
            Este componente está fijado en la parte superior (z-index: 50).
            Es el encargado de la identidad, búsqueda y acceso a creación.
        */}
        <Navigation />

        {/* 
            CAPA 4: Contenedor Maestro de Contenido
            [INGENIERÍA ESTRUCTURAL]: 
            Ajustamos el padding-top (pt) para eliminar el espacio muerto detectado.
            - pt-16 (64px) en móvil: Coincide exactamente con la altura de la Navigation.
            - md:pt-20 (80px) en tablet/desktop: Provee el aire necesario para la jerarquía visual.
        */}
        <main className="relative z-10 pt-16 md:pt-20 min-h-screen flex flex-col">

          {/* 
              CAPA 5: Orquestador de Transiciones de Página
              Gestiona el fundido (fade) y deslizamiento entre rutas operativas.
          */}
          <PageTransition>
            <div className="w-full flex-grow flex flex-col">
              {children}
            </div>
          </PageTransition>

        </main>

        {/* 
            CAPA 6: Terminales de Salida
            PlayerOrchestrator: El centro de mandos del audio (Flotante).
            Toaster: Gestor de avisos y alertas de sistema.
        */}
        <PlayerOrchestrator />
        <Toaster />

      </SmoothScrollWrapper>
    </AudioProvider>
  );
}