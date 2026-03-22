// app/map/layout.tsx
// VERSIÓN: 3.0 (NicePod Map Layout - Seamless Immersive Hub)
// Misión: Proveer el chasis visual y la aduana de seguridad para el mapa de pantalla completa.
// [ESTABILIZACIÓN]: Extirpación del AudioProvider redundante para consolidar la persistencia desde la Raíz.

import React from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { ErrorBoundary } from "@/components/system/error-boundary";

/**
 * COMPONENTE: MapLayout
 * Chasis inmersivo diseñado para el renderizado del motor geoespacial a pantalla completa.
 * 
 * [RESPONSABILIDAD ARQUITECTÓNICA]:
 * 1. Protección de Identidad: AuthGuard valida la sesión soberana del usuario antes de
 *    exponer cualquier dato geográfico privado o permitir la forja de nodos.
 * 2. Integridad UI: Define el 'viewport' (100dvh) para que los elementos táctiles 
 *    floten correctamente sobre la pantalla sin ser cortados por el navegador del móvil.
 * 3. Aislamiento de Fallos: Protege el resto de la Workstation si WebGL colapsa.
 */
export default function MapLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    /**
     * CAPA 1: CENTINELA DE SOBERANÍA (AuthGuard)
     * Actúa como el portero (Bouncer). Si un invitado intenta acceder directamente 
     * a '/map' mediante una URL, será expulsado al Login.
     */
    <AuthGuard>
      
      {/* 
          CAPA 2: RED DE SEGURIDAD DE ERRORES (ErrorBoundary)
          Mapbox GL JS (WebGL) puede fallar por falta de memoria gráfica (VRAM) 
          en dispositivos de gama baja. Este límite asegura que el crash no 
          provoque una pantalla blanca total, sino un mensaje de error elegante.
      */}
      <ErrorBoundary>
        
        {/* 
            CAPA 3: CONTENEDOR DE ESPACIO SEGURO (IMMERSIVE CHASSIS)
            [MANDATO ESTRUCTURAL]:
            - 'h-[100dvh]': El mapa debe ocupar la altura física real de la pantalla,
              ignorando las barras de dirección colapsables de Safari o Chrome.
            - 'overflow-hidden': Previene el "efecto goma" (overscroll-y) del body 
              cuando el usuario arrastra el mapa con el dedo.
            - 'bg-black': Si el mapa tarda en cargar, el fondo será negro profundo, 
              manteniendo la estética Aurora.
        */}
        <div className="relative w-full h-[100dvh] overflow-hidden bg-black selection:bg-primary/20">
          {children}
        </div>

      </ErrorBoundary>
    </AuthGuard>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Independencia de Vista: A diferencia del 'PlatformLayout', este Layout 
 *    NO inyecta paddings superiores ni menús fijos (<Navigation />), permitiendo que 
 *    el componente hijo ('MapExplorerPage') se expanda hasta el último pixel 
 *    disponible de la pantalla.
 * 2. Persistencia Aislada (Logro Alcanzado): Al haber eliminado el 'AudioProvider' 
 *    y confiar en el 'RootLayout', la transición del usuario entre el Dashboard 
 *    y este Mapa es 100% armónica, sin micro-cortes en la reproducción del podcast.
 * 3. Blindaje Móvil: La combinación de 'h-[100dvh]' y 'overflow-hidden' 
 *    garantiza que los gestos táctiles (Pinch to Zoom, Pan) solo muevan la 
 *    cámara 3D y no arrastren el documento web subyacente.
 */