/**
 * ARCHIVO: app/(marketing)/layout.tsx
 * VERSIÓN: 5.1 (Madrid Resonance)
 * PROTOCOLO: Intellectual Capital & Traceability
 * MISIÓN: Orquestación del bastidor de la landing page con soporte total para la Malla WebGL.
 * NIVEL DE INTEGRIDAD: 100%
 */

import React from "react";

// --- INFRAESTRUCTURA DE NAVEGACIÓN Y ACCESO ---
/**
 * Navigation: Componente de mando fijo (fixed) con z-index: 100.
 * Este componente es inteligente; adapta su UI si el usuario es un invitado.
 */
import { Navigation } from "@/components/navigation";

// --- COMPONENTES DE SALIDA Y ANIMACIÓN ---
/**
 * PageTransition: Gestiona la entrada cinemática de las rutas.
 * SmoothScrollWrapper: Otorga inercia nativa al scroll de la landing.
 */
import { PageTransition } from "@/components/system/page-transition";
import { SmoothScrollWrapper } from "@/components/system/smooth-scroll-wrapper";

// --- CONTEXTOS DE INTELIGENCIA Y TELEMETRÍA ---
/**
 * [SHIELD CRÍTICO]: GeoEngineProvider
 * Envolvemos el layout de marketing con el motor de sensores. Aunque el usuario 
 * no esté logueado, esto permite que componentes públicos interactúen con el 
 * mapa (modo EXPLORE) sin causar un 'Fatal React Context Error'.
 */
import { GeoEngineProvider } from "@/hooks/use-geo-engine";

/**
 * COMPONENTE: MarketingLayout
 * El bastidor de primer impacto para los Voyagers no registrados.
 * 
 * [RESPONSABILIDAD ARQUITECTÓNICA]:
 * 1. Paridad Visual: Mantiene exactamente la misma estructura de paddings que 
 *    el PlatformLayout para eliminar saltos de contenido (CLS).
 * 2. Inmunidad Sensorial: Permite renderizar ecos urbanos en la portada.
 */
export default function MarketingLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex flex-col min-h-screen">
      
      {/* 
          CAPA 1: RED NEURONAL SENSORIAL (GeoEngineProvider)
          [MEJORA ESTRATÉGICA]: Si en el futuro añadimos un 'MapPreviewFrame' 
          a la Landing Page para mostrar actividad en vivo, este provider 
          garantiza que el motor WebGL encuentre su contexto de ejecución.
      */}
      <GeoEngineProvider>

        {/* 
            CAPA 2: CONTROL DE DESPLAZAMIENTO (Smooth Scroll)
            Proporciona la inercia premium esperada en una landing industrial.
        */}
        <SmoothScrollWrapper>

          {/* 
              CAPA 3: NAVEGACIÓN TÁCTICA (Header Fijo)
              Se renderiza en el top del DOM para asegurar su anclaje visual.
          */}
          <Navigation />

          {/* 
              CAPA 4: CONTENEDOR MAESTRO DE MARKETING
              Bloqueamos el 'padding-top' exactamente igual que en PlatformLayout.
              Esto mata el pestañeo de posición cuando el usuario refresca.
          */}
          <main
            className="relative z-10 flex-grow flex flex-col pt-[84px] md:pt-[100px]"
          >

            {/* 
                CAPA 5: ORQUESTADOR DE MOVIMIENTO (Page Transitions)
                Sincroniza la entrada y salida de contenido (Opacity 0 -> 1).
            */}
            <PageTransition>
              <div className="w-full flex-grow flex flex-col">
                {children}
              </div>
            </PageTransition>

          </main>

          {/* 
              FOOTER DE MARCA (Placeholder para futura expansión)
          */}
        </SmoothScrollWrapper>

      </GeoEngineProvider>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. Prevención de Colapsos: La inclusión del 'GeoEngineProvider' en esta capa es 
 *    la cura definitiva para el error "useGeoEngine debe ser invocado dentro de 
 *    un GeoEngineProvider nominal" que derribó la plataforma en el último despliegue.
 * 2. Economía de Recursos: Aunque el Provider está montado, el hardware de GPS no se
 *    encenderá (initSensors) a menos que un componente hijo lo solicite explícitamente, 
 *    por lo que no hay consumo innecesario de batería para el invitado.
 * 3. Experiencia Fluida: Se ha añadido el 'SmoothScrollWrapper' para mantener la 
 *    paridad de interacción táctil entre el interior y el exterior de la bóveda.
 */