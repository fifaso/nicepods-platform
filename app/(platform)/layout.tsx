// app/(platform)/layout.tsx
// VERSIÓN: 2.3 (NiceCore V2.6 - Global Sensory Anchor Edition)
// Misión: Proveer infraestructura de identidad y sensores a toda la plataforma logueada.
// [ESTABILIZACIÓN]: Inyección de GeoEngineProvider para aniquilar el error de "Provider faltante".

import React from "react";

// --- INFRAESTRUCTURA DE NAVEGACIÓN Y ACCESO ---
/**
 * Navigation: Componente de mando fijo (fixed) con z-index: 100.
 * AuthGuard: Centinela que valida la sesión antes de montar la lógica del cliente.
 */
import { AuthGuard } from "@/components/auth/auth-guard";
import { Navigation } from "@/components/navigation";

// --- SERVICIOS DE INFRAESTRUCTURA Y PWA ---
/**
 * Estos componentes gestionan el estado técnico de la plataforma en segundo plano.
 */
import { InstallPwaButton } from '@/components/system/install-pwa-button';
import { OfflineIndicator } from '@/components/system/offline-indicator';
import { ScrollToTop } from "@/components/system/scroll-to-top";
import { SmoothScrollWrapper } from "@/components/system/smooth-scroll-wrapper";

// --- COMPONENTES DE SALIDA Y ANIMACIÓN ---
/**
 * PageTransition: Gestiona la entrada cinemática de las rutas.
 * PlayerOrchestrator: Centro de mando del audio neuronal.
 * Toaster: Gestor de notificaciones y alertas de sistema.
 */
import { PageTransition } from "@/components/system/page-transition";
import { PlayerOrchestrator } from "@/components/player/player-orchestrator";
import { Toaster } from "@/components/ui/toaster";

// --- CONTEXTOS DE INTELIGENCIA Y TELEMETRÍA ---
import { AudioProvider } from "@/contexts/audio-context";
import { GeoEngineProvider } from "@/hooks/use-geo-engine"; // [FIX CRÍTICO]: Motor Sensorial Global

/**
 * COMPONENTE: PlatformLayout
 * El chasis soberano para la experiencia de usuario logueado.
 * 
 * [RESPONSABILIDAD ARQUITECTÓNICA]:
 * 1. Persistencia: Mantiene vivos los sensores de GPS y el AudioProvider entre rutas.
 * 2. Transparencia: No inyecta fondos sólidos para dejar pasar la atmósfera Aurora.
 * 3. Seguridad: Actúa como la aduana final antes de pintar información sensible.
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
            CAPA 2.5: RED NEURONAL SENSORIAL (GeoEngineProvider)
            [MEJORA ESTRATÉGICA]: Al inyectar el motor aquí, garantizamos que el 
            Dashboard, el Explorador y cualquier vista futura puedan acceder a 
            la telemetría del usuario sin provocar colapsos de Contexto React.
        */}
        <GeoEngineProvider>

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
            */}
            <main
              className="relative z-10 flex flex-col min-h-screen pt-[84px] md:pt-[100px] bg-transparent transition-all duration-300"
            >
              {/* 
                  CAPA 6: ORQUESTADOR DE MOVIMIENTO (Page Transitions)
                  Sincroniza la entrada y salida de contenido.
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
        </GeoEngineProvider>
      </AuthGuard>
    </AudioProvider>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.3):
 * 1. Ubicuidad Sensorial: Al subir el GeoEngineProvider al layout, resolvemos el error
 *    de 'Provider no encontrado' en el Dashboard y otras subrutas.
 * 2. Jerarquía de Contexto: Se mantiene debajo del AuthGuard para asegurar que 
 *    los sensores solo se activen para usuarios autenticados, protegiendo la API 
 *    de Geolocalización de peticiones anónimas.
 * 3. Economía de Hardware: El estado de 'userLocation' ahora persiste. Si el 
 *    Voyager viaja del Dashboard al Mapa, el GPS no tiene que volver a triangular 
 *    desde cero, ahorrando batería y tiempo (Zero-Wait real).
 */