// app/(platform)/layout.tsx
// VERSIÓN: 2.1

import React from "react";

// --- INFRAESTRUCTURA DE NAVEGACIÓN Y ACCESO ---
//Navigation: Componente fixed (z-100) que flota sobre el contenido.
import { Navigation } from "@/components/navigation";
//AuthGuard: Centinela que bloquea el renderizado si no hay sesión activa.
import { AuthGuard } from "@/components/auth-guard";

// --- SERVICIOS DE INFRAESTRUCTURA Y PWA ---
import { InstallPwaButton } from '@/components/install-pwa-button';
import { OfflineIndicator } from '@/components/offline-indicator';
import { ScrollToTop } from "@/components/scroll-to-top";
import { SmoothScrollWrapper } from "@/components/smooth-scroll-wrapper";

// --- COMPONENTES DE SALIDA Y ANIMACIÓN ---
import { PageTransition } from "@/components/page-transition";
import { PlayerOrchestrator } from "@/components/player-orchestrator";
import { Toaster } from "@/components/ui/toaster";

// --- CONTEXTOS DE INTELIGENCIA ---
import { AudioProvider } from "@/contexts/audio-context";

/**
 * COMPONENTE: PlatformLayout
 * El bastidor soberano para el área de trabajo (Login Side).
 * 
 * [RESPONSABILIDAD ARQUITECTÓNICA]:
 * Este layout es responsable de la 'perforación visual'. Debe mantenerse
 * bg-transparent en todos sus niveles para que los gradientes Aurora
 * inyectados por el RootLayout sean visibles.
 */
export default function PlatformLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    /**
     * CAPA 1: CONTEXTO DE INTELIGENCIA ACÚSTICA
     * Asegura que el hilo de audio persista durante la navegación.
     */
    <AudioProvider>

      {/* 
          CAPA 2: CENTINELA DE SOBERANÍA (AuthGuard)
          Protege todas las rutas de la plataforma. Si el handshake falla,
          nada de lo que hay dentro se monta en el DOM.
      */}
      <AuthGuard>

        {/* 
            CAPA 3: CONTROL DE DESPLAZAMIENTO (Smooth Scroll)
            Gestiona la física del visor eliminando saltos bruscos.
        */}
        <SmoothScrollWrapper>

          {/* SERVICIOS DE SISTEMA (Capa técnica invisible) */}
          <OfflineIndicator />
          <InstallPwaButton />
          <ScrollToTop />

          {/* 
              CAPA 4: NAVEGACIÓN TÁCTICA (Header Fijo)
              Ubicado físicamente arriba para prioridad de renderizado.
          */}
          <Navigation />

          {/* 
              CAPA 5: CONTENEDOR MAESTRO DE CONTENIDO
              [RE-CALIBRACIÓN DE ESPACIO NEGATIVO]:
              - pt-[100px] en móvil: Header (72px) + Margen de seguridad (28px).
              - md:pt-[140px] en desktop: Header (80px) + Aire industrial (60px).
              
              [FIX ATMOSFÉRICO]: 
              Uso obligatorio de bg-transparent para evitar ocluir el BackgroundEngine.
          */}
          <main
            className="relative z-10 flex flex-col min-h-screen pt-[100px] md:pt-[140px] bg-transparent transition-all duration-500"
          >
            {/* 
                CAPA 6: ORQUESTADOR DE MOVIMIENTO (Page Transitions)
                Maneja la entrada cinemática del contenido. 
                El div interno también debe ser transparente.
            */}
            <PageTransition>
              <div className="w-full flex-grow flex flex-col bg-transparent px-1 md:px-0">
                {children}
              </div>
            </PageTransition>
          </main>

          {/* 
              CAPA 7: TERMINALES DE SALIDA
              PlayerOrchestrator: Z-index 200 para flotar sobre el contenido.
              Toaster: Notificaciones de sistema.
          */}
          <PlayerOrchestrator />
          <Toaster />

        </SmoothScrollWrapper>
      </AuthGuard>
    </AudioProvider>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Transparencia en Cascada: Al eliminar las clases 'bg-background' y 
 *    'bg-card' que existían en versiones previas, permitimos que la luz 
 *    del 'BackgroundEngine' atraviese el chasis, resolviendo el problema 
 *    de la pantalla gris detectado en el dashboard.
 * 2. Jerarquía de Z-Index: Mantenemos el contenido en 'z-10' para asegurar 
 *    que la interactividad (clics) esté por delante de la atmósfera (z-0), 
 *    pero por detrás del menú de navegación (z-100).
 * 3. Optimización de Layout: Al usar valores de padding fijos, eliminamos 
 *    la necesidad de que el navegador recalcule la posición del contenido 
 *    durante la hidratación, reduciendo el ruido de la consola (Violation rAF).
 */