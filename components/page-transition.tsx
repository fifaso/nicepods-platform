// components/page-transition.tsx
// VERSIÓN: 2.0 (NicePod Fluid Motion - Zero-Flicker Standard)
// Misión: Gestionar el flujo visual entre rutas eliminando el parpadeo de hidratación inicial.
// [ESTABILIZACIÓN]: Uso de hardware acceleration y lógica de 'First Mount Shield'.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

/**
 * PageTransition: El orquestador cinemático de la plataforma.
 * 
 * Este componente envuelve el contenido de los layouts para suavizar 
 * la navegación asíncrona típica de Next.js App Router.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Guardián de montaje para evitar el pestañeo en el primer renderizado (SSR -> Hydration)
  const [isFirstMount, setIsFirstMount] = useState(true);

  // Referencia para el scroll, asegurando que el reset sea atómico
  const firstRender = useRef(true);

  useEffect(() => {
    // Al primer montaje, desactivamos el escudo después de la hidratación inicial
    if (firstRender.current) {
      firstRender.current = false;
      setIsFirstMount(false);
      return;
    }

    // En navegaciones subsiguientes, realizamos un reset de scroll impecable
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  /**
   * VARIANTES DE ANIMACIÓN AURORA:
   * Diseñadas para ser lo suficientemente rápidas para no frustrar, 
   * y lo suficientemente suaves para ocultar la carga de datos.
   */
  const variants = {
    initial: {
      opacity: 0,
      y: 8, // Pequeño desplazamiento ascendente para dar sensación de 'elevación'
      filter: "blur(4px)" // Desenfoque sutil coherente con el sistema Aurora
    },
    enter: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1], // Curva cinemática de alta gama (Quart Out)
      },
    },
    exit: {
      opacity: 0,
      y: -8,
      filter: "blur(4px)",
      transition: {
        duration: 0.3,
        ease: [0.7, 0, 0.84, 0], // Aceleración rápida en la salida
      },
    },
  };

  return (
    /**
     * AnimatePresence: Permite que los componentes se animen al salir del DOM.
     * mode="wait": Garantiza que la página anterior termine de salir antes que la nueva entre.
     */
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={isFirstMount ? false : "initial"} // Bloqueamos animación si es el arranque inicial
        animate="enter"
        exit="exit"
        variants={variants}
        className="w-full flex-grow flex flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * NOTA TÉCNICA PARA EL DESPLIEGUE:
 * La propiedad 'initial={isFirstMount ? false : "initial"}' es la clave de esta cirugía.
 * - Al entrar por primera vez (F5 o link directo), el contenido se muestra tal cual vino del servidor.
 * - Al navegar internamente (clic en 'Crear' o 'Biblioteca'), se activa la transición cinemática.
 * Esto erradica el parpadeo de opacidad que el usuario percibe como una falla de carga profesional.
 */