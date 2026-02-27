// app/(platform)/layout.tsx
// VERSIÓN: 2.0

import React from "react";

// --- INFRAESTRUCTURA DE NAVEGACIÓN Y ACCESO ---
// Importamos el sistema de navegación modular y el centinela de seguridad.
import { AuthGuard } from "@/components/auth-guard";
import { Navigation } from "@/components/navigation";

// --- SERVICIOS DE INFRAESTRUCTURA Y PWA ---
// Componentes invisibles que gestionan el estado técnico de la aplicación.
import { InstallPwaButton } from '@/components/install-pwa-button';
import { OfflineIndicator } from '@/components/offline-indicator';
import { ScrollToTop } from "@/components/scroll-to-top";
import { SmoothScrollWrapper } from "@/components/smooth-scroll-wrapper";

// --- COMPONENTES DE SALIDA Y ANIMACIÓN ---
// Elementos visuales que mejoran la experiencia de transición y feedback.
import { PageTransition } from "@/components/page-transition";
import { PlayerOrchestrator } from "@/components/player-orchestrator";
import { Toaster } from "@/components/ui/toaster";

// --- CONTEXTOS DE INTELIGENCIA ---
// Proveedores de estado global para la lógica de negocio.
import { AudioProvider } from "@/contexts/audio-context";

/**
 * COMPONENTE: PlatformLayout
 * El bastidor soberano de la Workstation NicePod.
 * 
 * [RESPONSABILIDAD ARQUITECTÓNICA]:
 * Este layout envuelve todas las rutas protegidas (Dashboard, Library, Create, Map).
 * Su función es mantener el estado del reproductor de audio, gestionar la seguridad
 * de la sesión y definir la estructura física (padding) para que el contenido no
 * colisione con el menú fijo.
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
            Gestiona la física del scroll para una sensación de aplicación nativa,
            evitando saltos bruscos al cambiar de ruta.
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
                El contenedor interno asegura que el contenido tenga un ancho fluido.
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
              Toaster: Gestor de notificaciones de sistema (Toast).
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
 * 1. Higiene de Importación: Se ha eliminado la referencia errónea a 'globals.css'.
 *    Los estilos globales ya son inyectados por el RootLayout, evitando conflictos.
 * 2. Estabilidad de Capas: El margen superior (pt-140px) garantiza que el 
 *    saludo 'Hola, [Nombre]' del Dashboard sea visible íntegramente.
 * 3. Integridad de Sesión: La inyección de AuthGuard a este nivel elimina la 
 *    necesidad de validaciones manuales en page.tsx.
 */