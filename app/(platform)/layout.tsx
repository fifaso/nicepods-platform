// app/(platform)/layout.tsx
// VERSIÓN: 1.9

import React from "react";

// --- INFRAESTRUCTURA DE NAVEGACIÓN Y ACCESO ---
import { AuthGuard } from "@/components/auth-guard"; // [FIX TS2305]: Importación nombrada validada.
import { Navigation } from "@/components/navigation";

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
 * El bastidor soberano de la Workstation NicePod.
 * 
 * Este layout centraliza los servicios críticos para el curador autenticado
 * y garantiza que la transición entre herramientas sea fluida y profesional.
 */
export default function PlatformLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    /**
     * CAPA 1: CONTEXTO DE INTELIGENCIA ACÚSTICA
     * El AudioProvider reside en la raíz de la plataforma para permitir que
     * las crónicas de voz persistan durante la navegación interna.
     */
    <AudioProvider>

      {/* 
          CAPA 2: CENTINELA DE SOBERANÍA (AuthGuard)
          Protección atómica para todas las rutas dentro de (platform).
          Si el handshake de sesión falla, el guardia orquesta el redireccionamiento.
      */}
      <AuthGuard>

        {/* 
            CAPA 3: CONTROL DE DESPLAZAMIENTO (Smooth Scroll)
            Gestiona la física del scroll para una sensación de aplicación nativa.
        */}
        <SmoothScrollWrapper>

          {/* SERVICIOS DE SISTEMA (Invisibles en el flujo de renderizado) */}
          <OfflineIndicator />
          <InstallPwaButton />
          <ScrollToTop />

          {/* 
              CAPA 4: NAVEGACIÓN TÁCTICA (Header Fijo)
              Ubicado físicamente arriba en el DOM. Z-index: 100 inyectado
              desde el componente Navigation para superar el mapa y el feed.
          */}
          <Navigation />

          {/* 
              CAPA 5: CONTENEDOR MAESTRO DE INTELIGENCIA
              [RE-CALIBRACIÓN DE ESPACIO NEGATIVO]:
              Ajustamos el padding-top (pt) para compensar el Header Monumental V2.0.
              
              Cálculo Técnico de Grado Industrial:
              - Móvil: Header 72px + Padding Contenedor 24px = 96px. pt-[100px] para aire.
              - Desktop: Header 80px + Padding Contenedor 40px = 120px. md:pt-[140px] para elegancia.
          */}
          <main
            className="relative z-10 flex flex-col min-h-screen pt-[100px] md:pt-[140px] transition-all duration-500 ease-[0.16, 1, 0.3, 1]"
          >
            {/* 
                CAPA 6: ORQUESTADOR DE MOVIMIENTO (Page Transitions)
                Sincroniza la entrada y salida de contenido (Opacity 0 -> 1).
            */}
            <PageTransition>
              <div className="w-full flex-grow flex flex-col px-1 md:px-0">
                {children}
              </div>
            </PageTransition>
          </main>

          {/* 
              CAPA 7: TERMINALES DE SALIDA
              PlayerOrchestrator: Centro de mando del audio (Z-index: 200).
              Toaster: Gestor de notificaciones de sistema.
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
 * 1. Sincronía pt: El aumento a 'md:pt-[140px]' es la solución estructural 
 *    definitiva para que el saludo soberano 'Hola, [Nombre]' del Dashboard 
 *    sea visible íntegramente bajo el cristal del menú.
 * 2. Integridad de Tipos: Se ha validado la importación de AuthGuard eliminando 
 *    el error TS2305. El sistema es ahora Type-Safe en el despliegue.
 * 3. Rendimiento Cognitivo: Al envolver el contenido en PageTransition dentro 
 *    del main con padding fijo, evitamos el 'Layout Shift' (salto de página) 
 *    durante las transiciones de ruta, manteniendo un CLS de cero.
 */