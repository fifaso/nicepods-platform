// app/(platform)/layout.tsx
// VERSIÓN: 2.2

import React from "react";

// --- INFRAESTRUCTURA DE NAVEGACIÓN Y ACCESO ---
/**
 * Navigation: Componente de mando fijo (fixed) con z-index: 100.
 * AuthGuard: Centinela que valida la sesión antes de montar la lógica del cliente.
 */
import { AuthGuard } from "@/components/auth-guard";
import { Navigation } from "@/components/navigation";

// --- SERVICIOS DE INFRAESTRUCTURA Y PWA ---
/**
 * Estos componentes gestionan el estado técnico de la plataforma en segundo plano.
 */
import { InstallPwaButton } from '@/components/install-pwa-button';
import { OfflineIndicator } from '@/components/offline-indicator';
import { ScrollToTop } from "@/components/scroll-to-top";
import { SmoothScrollWrapper } from "@/components/smooth-scroll-wrapper";

// --- COMPONENTES DE SALIDA Y ANIMACIÓN ---
/**
 * PageTransition: Gestiona la entrada cinemática de las rutas.
 * PlayerOrchestrator: Centro de mando del audio neuronal.
 * Toaster: Gestor de notificaciones y alertas de sistema.
 */
import { PageTransition } from "@/components/page-transition";
import { PlayerOrchestrator } from "@/components/player-orchestrator";
import { Toaster } from "@/components/ui/toaster";

// --- CONTEXTOS DE INTELIGENCIA ---
import { AudioProvider } from "@/contexts/audio-context";

/**
 * COMPONENTE: PlatformLayout
 * El chasis soberano para la experiencia de usuario logueado.
 * 
 * [RESPONSABILIDAD ARQUITECTÓNICA]:
 * 1. Persistencia: Mantiene vivo el AudioProvider durante el cambio de rutas.
 * 2. Transparencia: No inyecta fondos sólidos para dejar pasar la atmósfera Aurora.
 * 3. Ergonomía: Define el espacio sagrado debajo del menú superior.
 */
export default function PlatformLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    /**
     * CAPA 1: CONTEXTO DE INTELIGENCIA ACÚSTICA
     * Envuelve toda la plataforma para permitir que el hilo de audio sea persistente.
     */
    <AudioProvider>

      {/* 
          CAPA 2: CENTINELA DE SOBERANÍA (AuthGuard)
          Valida el Handshake de identidad SSR-Client. Si falla, orquesta el redirect.
      */}
      <AuthGuard>

        {/* 
            CAPA 3: CONTROL DE DESPLAZAMIENTO (Smooth Scroll)
            Proporciona la inercia nativa y suavizado de scroll industrial.
        */}
        <SmoothScrollWrapper>

          {/* SERVICIOS DE SISTEMA (Capa técnica invisible) */}
          <OfflineIndicator />
          <InstallPwaButton />
          <ScrollToTop />

          {/* 
              CAPA 4: NAVEGACIÓN TÁCTICA (Header Fijo)
              Se renderiza en el top del DOM para asegurar su anclaje visual.
          */}
          <Navigation />

          {/* 
              CAPA 5: CONTENEDOR MAESTRO DE CONTENIDO
              [OPTIMIZACIÓN DE ESPACIO VERTICAL]:
              Hemos reducido el padding-top (pt) al mínimo técnico para no perder 
              espacio valioso, compensando exactamente el área del Header V2.0.
              
              Cálculo Técnico:
              - Móvil: Header 72px + Padding de seguridad 12px = pt-[84px].
              - Desktop: Header 80px + Margen de respiración 20px = md:pt-[100px].
              
              Uso estricto de bg-transparent para visibilidad de la atmósfera.
          */}
          <main
            className="relative z-10 flex flex-col min-h-screen pt-[84px] md:pt-[100px] bg-transparent transition-all duration-300"
          >
            {/* 
                CAPA 6: ORQUESTADOR DE MOVIMIENTO (Page Transitions)
                Sincroniza la entrada y salida de contenido (Opacity 0 -> 1).
            */}
            <PageTransition>
              <div className="w-full flex-grow flex flex-col bg-transparent px-2 md:px-0">
                {children}
              </div>
            </PageTransition>
          </main>

          {/* 
              CAPA 7: TERMINALES DE SALIDA
              PlayerOrchestrator: Ubicado en Z-index: 200 (Capa superior).
              Toaster: Notificaciones flotantes de sistema.
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
 * 1. Eficiencia de Layout: Se ha reducido el padding superior de 140px a 100px 
 *    en escritorio. Esto recupera 40px de área de trabajo, permitiendo que el 
 *    saludo 'HOLA, FRAN' se sitúe justo debajo del cristal del menú.
 * 2. Transparencia Operativa: La clase 'bg-transparent' aplicada en el 'main' 
 *    y en el contenedor de 'PageTransition' elimina cualquier oclusión del 
 *    BackgroundEngine, restaurando el colorismo Aurora solicitado.
 * 3. Integridad de Tipos: El archivo está alineado con las exportaciones 
 *    nombradas de AuthGuard y Navigation, garantizando un build sin errores.
 */