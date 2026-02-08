// app/(platform)/layout.tsx
// VERSIÓN: 1.2 (Workstation Shell - Structural Integrity Master)
// Misión: Proveer el contexto de audio y navegación asegurando que el contenido nazca siempre debajo del header.

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
 * PlatformLayout: El contenedor táctico para la zona operativa de NicePod.
 */
export default function PlatformLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <AudioProvider>
      <SmoothScrollWrapper>
        {/* SERVICIOS DE SISTEMA */}
        <OfflineIndicator />
        <InstallPwaButton />
        <ScrollToTop />
        
        {/* NAVEGACIÓN SUPERIOR (Sticky Layer) */}
        <Navigation />
        
        {/* 
            [SOLUCIÓN ESTRUCTURAL]: pt-24 (Padding Top)
            La Navigation tiene una altura de 16-20 unidades (64-80px). 
            Al añadir pt-24 (96px) al main, garantizamos que el Dashboard 
            comience visualmente debajo del menú, eliminando el solapamiento.
        */}
        <main className="relative z-10 pt-20 md:pt-24 lg:pt-28">
          <PageTransition>
            <div className="w-full">
              {children}
            </div>
          </PageTransition>
        </main>

        {/* SALIDA DE AUDIO Y NOTIFICACIONES */}
        <PlayerOrchestrator />
        <Toaster />
      </SmoothScrollWrapper>
    </AudioProvider>
  );
}