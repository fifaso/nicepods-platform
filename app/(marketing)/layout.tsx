// app/(marketing)/layout.tsx
// VERSIÓN: 1.1 (NicePod Marketing Architecture - Structural Parity Edition)
// Misión: Orquestar el bastidor de la landing page eliminando el salto de contenido (CLS).
// [ESTABILIZACIÓN]: Sincronización de paddings con el chasis operativo y activación de transiciones.

import { Navigation } from "@/components/navigation";
import { PageTransition } from "@/components/page-transition";
import React from "react";

/**
 * MarketingLayout: El bastidor de primer impacto para NicePod V2.5.
 * 
 * Este layout es el encargado de recibir a los nuevos curadores y testigos urbanos.
 * Para eliminar el pestañeo, debe compartir la misma geometría base que el 
 * resto de la Workstation, garantizando que la Navigation no desplace el DOM.
 */
export default function MarketingLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex flex-col min-h-screen">

      {/* 
          CAPA 1: Navegación Táctica (Invitado/Explorador)
          Incluimos la Navigation de forma explícita. El componente detectará 
          que el usuario no tiene sesión y mostrará los controles de 'Explorar' 
          y 'Planes', pero ocupando el mismo espacio físico que en el Dashboard.
      */}
      <Navigation />

      {/* 
          CAPA 2: Contenedor Maestro de Marketing
          [INGENIERÍA DE SINCRO]: 
          Bloqueamos el 'pt' (padding-top) exactamente igual que en PlatformLayout.
          - pt-[80px] en móvil.
          - md:pt-[100px] en desktop.
          Esto mata el pestañeo de posición cuando el usuario refresca la landing.
      */}
      <main
        className="relative z-10 flex-grow flex flex-col pt-[80px] md:pt-[100px]"
      >

        {/* 
            CAPA 3: Orquestador de Entrada Visual
            Usamos PageTransition para que el contenido de la landing (Hero, Universos)
            nazca con el mismo fade-in que el Dashboard, creando una sensación de
            ecosistema único y profesional.
        */}
        <PageTransition>
          <div className="w-full flex-grow flex flex-col">
            {children}
          </div>
        </PageTransition>

      </main>

      {/* 
          FOOTER DE MARCA (Placeholder para futura expansión):
          Se mantiene fuera del flujo de PageTransition para actuar como 
          ancla estática en el scroll.
      */}
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * La Versión 1.0 no incluía el componente <Navigation />. Esto causaba un 
 * conflicto de jerarquía: el RootLayout ponía el fondo, pero el contenido 
 * de la landing aparecía pegado al techo del navegador. Cuando React 
 * hidrataba, la Navigation aparecía de golpe, empujando todo el contenido 
 * hacia abajo. Con esta cirugía, el espacio superior está pre-asignado 
 * y el 'pestañeo' de movimiento desaparece por completo.
 */