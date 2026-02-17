// app/(platform)/layout.tsx
// VERSIÓN: 1.6 (NicePod Architecture Standard - Zero-Shift Structural Edition)
// Misión: Orquestar el chasis operativo para usuarios autenticados eliminando saltos de layout.
// [ESTABILIZACIÓN]: Sincronización de paddings y aislamiento de capas para una carga fluida.

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
 * PlatformLayout: El bastidor soberano de la Workstation.
 * 
 * Este layout centraliza los servicios críticos de la plataforma y garantiza
 * que la transición entre herramientas (Dashboard, Create, Map) sea imperceptible.
 */
export default function PlatformLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    /**
     * CAPA 1: Contexto de Inteligencia Acústica
     * Envolvemos toda la aplicación operativa para permitir que el audio
     * persista y el protocolo 'nicepod-timeupdate' fluya sin interrupciones.
     */
    <AudioProvider>

      {/* CAPA 2: Control de Inercia y Scroll
          Gestionamos el suavizado de desplazamiento desde la raíz para evitar
          pestañeos en elementos con posición 'sticky' o 'fixed'.
      */}
      <SmoothScrollWrapper>

        {/* SERVICIOS DE INFRAESTRUCTURA (Invisibles en el flujo inicial) */}
        <OfflineIndicator />
        <InstallPwaButton />
        <ScrollToTop />

        {/* 
            CAPA 3: Navegación Táctica (Soberanía Visual)
            Ubicada físicamente arriba en el DOM para que el navegador le dé 
            prioridad de renderizado. Z-index: 50 configurado en el componente.
        */}
        <Navigation />

        {/* 
            CAPA 4: Contenedor Maestro de Contenido
            [RIGOR ESTRUCTURAL]: 
            Bloqueamos el espacio superior con 'pt' (padding-top) estricto.
            - pt-[80px] en móvil: Reserva el espacio exacto del header + márgenes.
            - md:pt-[100px] en desktop: Garantiza aire visual sin saltos al cargar.
            'contain-intrinsic-size' ayuda al navegador a pre-calcular el layout.
        */}
        <main
          className="relative z-10 flex flex-col min-h-screen pt-[80px] md:pt-[100px]"
          style={{ containIntrinsicSize: 'auto 1000px' }}
        >

          {/* 
              CAPA 5: Orquestador de Movimiento Narrativo
              PageTransition maneja los estados de entrada y salida (Opacity 0 -> 1).
              Esto suaviza la aparición del contenido tras el handshake de identidad.
          */}
          <PageTransition>
            <div className="w-full flex-grow flex flex-col">
              {children}
            </div>
          </PageTransition>

        </main>

        {/* 
            CAPA 6: Terminales de Salida y Notificación
            PlayerOrchestrator: El centro de mando del audio (Z-index: 60).
            Toaster: Gestor de eventos de sistema.
        */}
        <PlayerOrchestrator />
        <Toaster />

      </SmoothScrollWrapper>
    </AudioProvider>
  );
}

/**
 * NOTA TÉCNICA PARA EL DESPLIEGUE:
 * El cambio quirúrgico de 'pt-16' a 'pt-[80px]' (y su equivalente en md) 
 * responde a la necesidad de sincronizar el chasis con el componente Navigation. 
 * Al usar valores exactos en lugar de utilidades genéricas, el motor de 
 * renderizado de Chrome/Safari deja de recalcular la posición del 'children' 
 * una vez que el avatar del perfil se carga, matando el pestañeo de posición.
 */