// app/map/layout.tsx
// VERSIÓN: 2.0 (NicePod Map Layout - Spatial Hub Foundation)
// Misión: Proveer el chasis acústico y de autenticación para el modo mapa de pantalla completa.
// [ESTABILIZACIÓN]: Integración de AudioProvider para persistencia de resonancia.

import React from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AudioProvider } from "@/contexts/audio-context";
import { ErrorBoundary } from "@/components/system/error-boundary";

/**
 * COMPONENTE: MapLayout
 * Chasis inmersivo diseñado para el renderizado del motor geoespacial a pantalla completa.
 * 
 * [RESPONSABILIDAD ARQUITECTÓNICA]:
 * 1. Persistencia: El AudioProvider aquí garantiza que, aunque el Mapa no herede el
 *    menú de la plataforma, el hilo de audio neuronal siga vivo y sincronizado.
 * 2. Protección de Identidad: AuthGuard valida la sesión soberana del usuario antes de
 *    exponer cualquier dato geográfico privado.
 * 3. Integridad UI: Define las zonas de seguridad (safe-areas) para que los elementos 
 *    táctiles floten correctamente sobre la pantalla sin ser cortados.
 */
export default function MapLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    /**
     * CAPA 1: CONTEXTO DE INTELIGENCIA ACÚSTICA
     * Mantenemos el flujo de audio persistente fuera de la navegación de plataforma.
     */
    <AudioProvider>
      
      {/* 
          CAPA 2: CENTINELA DE SOBERANÍA (AuthGuard)
          Valida que el acceso al motor geoespacial esté autenticado.
      */}
      <AuthGuard>
        
        {/* 
            CAPA 3: RED DE SEGURIDAD DE ERRORES
            Blinda la renderización del mapa ante cualquier fallo del motor WebGL.
        */}
        <ErrorBoundary>
          
          {/* 
              CAPA 4: CONTENEDOR DE ESPACIO SEGURO
              'h-[100dvh]' junto con los 'safe-area' asegura que el mapa ocupe 
              el 100% real de la pantalla táctil sin colisionar con las barras 
              gestuales del sistema operativo.
          */}
          <div className="relative w-full h-[100dvh] overflow-hidden bg-black selection:bg-primary/20">
            {children}
          </div>

        </ErrorBoundary>
      </AuthGuard>
    </AudioProvider>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Independencia de Vista: A diferencia del Layout de Plataforma, este Layout 
 *    no inyecta paddings superiores ni menús fijos, permitiendo que 'MapExplorerPage' 
 *    se expanda hasta el último pixel disponible.
 * 2. Persistencia Aislada: Al integrar 'AudioProvider' aquí, logramos que la 
 *    transición entre el mapa y los podcasts sea armónica, sin cortes de audio.
 * 3. Blindaje Móvil: La combinación de 'h-[100dvh]' y la gestión de 'overflow-hidden' 
 *    evita el scroll accidental del body, lo cual es vital para la navegación 
 *    fluida en el motor de Mapbox.
 */