// app/(platform)/layout.tsx
// VERSIÓN: 1.1 (Workstation Shell - Structural Spacer Fix)
// Misión: Proveer el contexto de audio y navegación asegurando que el contenido no colapse bajo el header.

import { InstallPwaButton } from '@/components/install-pwa-button';
import { Navigation } from "@/components/navigation";
import { OfflineIndicator } from '@/components/offline-indicator';
import { PageTransition } from "@/components/page-transition";
import { PlayerOrchestrator } from "@/components/player-orchestrator";
import { ScrollToTop } from "@/components/scroll-to-top";
import { SmoothScrollWrapper } from "@/components/smooth-scroll-wrapper";
import { Toaster } from "@/components/ui/toaster";
import { AudioProvider } from "@/contexts/audio-context";

export default function PlatformLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <AudioProvider>
      <SmoothScrollWrapper>
        {/* Capas de Utilidad de Sistema */}
        <OfflineIndicator />
        <InstallPwaButton />
        <ScrollToTop />
        
        {/* NAVEGACIÓN STICKY (Ocupa Z-50) */}
        <Navigation />
        
        <PageTransition>
          {/* 
              [FIX ESTRATÉGICO]: pt-20 (Padding Top)
              Añadimos un espaciado superior fijo de 5rem (80px) que es la altura 
              estándar de nuestra Navigation. Esto garantiza que el Dashboard 
              nazca siempre debajo del menú, eliminando el solapamiento inicial.
          */}
          <main className="relative z-10 pt-4 md:pt-8 lg:pt-10">
            <div className="w-full">
              {children}
            </div>
          </main>
        </PageTransition>

        {/* Capas de Salida y Notificación */}
        <PlayerOrchestrator />
        <Toaster />
      </SmoothScrollWrapper>
    </AudioProvider>
  );
}