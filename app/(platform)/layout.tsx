// app/(platform)/layout.tsx
// VERSIÓN: 3.0 (NiceCore V2.6 - Visual Chassis Edition)
// Misión: Proveer el enrutamiento visual y la aduana de seguridad para la plataforma interna.
// [ESTABILIZACIÓN]: Extirpación de Providers redundantes (Audio/Geo) elevados al RootLayout.

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

/**
 * COMPONENTE: PlatformLayout
 * El chasis soberano para la experiencia de usuario logueado en escritorio.
 * 
 * [RESPONSABILIDAD ARQUITECTÓNICA]:
 * 1. Transparencia: No inyecta fondos sólidos para dejar pasar la atmósfera Aurora del Root.
 * 2. Seguridad: Actúa como la aduana final antes de pintar información sensible.
 * 3. Ergonomía: Define el espacio sagrado debajo del menú superior (padding-top).
 */
export default function PlatformLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    /**
     * CAPA 1: CENTINELA DE SOBERANÍA (AuthGuard)
     * Valida que el usuario tenga un token nominal antes de renderizar 
     * el esqueleto de la aplicación interna. Si falla, orquesta el redirect.
     */
    <AuthGuard>

      {/* 
          CAPA 2: CONTROL DE DESPLAZAMIENTO (Smooth Scroll)
          Proporciona la inercia nativa y suavizado de scroll industrial 
          para las listas de podcasts y el Dashboard.
      */}
      <SmoothScrollWrapper>

        {/* SERVICIOS DE SISTEMA (Capa técnica invisible) */}
        <OfflineIndicator />
        <InstallPwaButton />
        <ScrollToTop />

        {/* 
            CAPA 3: NAVEGACIÓN TÁCTICA (Header Fijo)
            Se renderiza en el top del DOM para asegurar su anclaje visual.
        */}
        <Navigation />

        {/* 
            CAPA 4: CONTENEDOR MAESTRO DE CONTENIDO
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
              CAPA 5: ORQUESTADOR DE MOVIMIENTO (Page Transitions)
              Sincroniza la entrada y salida de contenido (Opacity 0 -> 1).
          */}
          <PageTransition>
            <div className="w-full flex-grow flex flex-col bg-transparent px-2 md:px-0">
              {children}
            </div>
          </PageTransition>
        </main>

        {/* 
            CAPA 6: TERMINALES DE SALIDA
            PlayerOrchestrator: Ubicado en Z-index: 200 (Capa superior).
            Toaster: Notificaciones flotantes de sistema.
            
            [NOTA]: El PlayerOrchestrator sigue viviendo aquí para que su 
            lógica visual flote sobre la plataforma, pero consume el 
            'AudioContext' que ahora reside en el RootLayout.
        */}
        <PlayerOrchestrator />
        <Toaster />

      </SmoothScrollWrapper>
    </AuthGuard>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Purga de Shadow Contexts: Al eliminar <AudioProvider> y <GeoEngineProvider> 
 *    de este archivo, garantizamos que los componentes consuman las instancias 
 *    creadas en el app/layout.tsx, manteniendo la continuidad de la memoria.
 * 2. Integridad de UI: Este layout se centra exclusivamente en el 'boxing' 
 *    (paddings, márgenes, z-index) de la aplicación interna, separando el 
 *    control de estado (Root) del control de presentación (Platform).
 */