// components/visuals/background-engine.tsx
// VERSIÓN: 7.0 (NicePod Aurora Engine - Triadic Resonance Edition)
// Misión: Orquestar una atmósfera visual dinámica, de alta densidad y con profundidad aeroespacial.
// [ESTABILIZACIÓN]: Implementación de malla triádica (3 orbes) y paleta cromática de grado industrial para Light/Dark mode.

"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence, useSpring, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * COMPONENTE: BackgroundEngine
 * El motor GPU-driven que da vida al "Vacío" de NicePod.
 * 
 * [ARQUITECTURA VISUAL V7.0]:
 * 1. Malla Triádica: Se utilizan 3 orbes de luz asíncronos para generar un volumen de color orgánico.
 * 2. Psicología del Color: 
 *    - Modo Oscuro: Índigo profundo, Púrpura eléctrico y un toque de Cobalto para la inmersión.
 *    - Modo Claro: Cian vibrante, Violeta suave y Esmeralda tenue para evitar la fatiga del "blanco plano".
 * 3. Rendimiento Absoluto: Uso estricto de transformaciones compuestas (translate3d) para evitar repintados del DOM.
 */
export function BackgroundEngine() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState<boolean>(false);

  // --- I. SISTEMA DE SEGUIMIENTO TÁCTICO (Mouse Resonance) ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  /**
   * Física del Resorte (Spring Physics):
   * Configurada con alta amortiguación (damping) para que la luz siga al 
   * cursor con la inercia pesada de un fluido, proyectando solidez.
   */
  const springConfig = { damping: 50, stiffness: 100, restDelta: 0.001 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    setMounted(true);

    const handleMouseMove = (event: MouseEvent) => {
      // Solo actualizamos los MotionValues, React no se entera (Zero Re-renders)
      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
    };

    // Activamos la resonancia solo en hardware con ratón físico (ahorro de batería en móviles)
    if (typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Guardia de Hidratación: Evita el 'Flash' de colores incorrectos durante el SSR.
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <div className={cn(
      "fixed inset-0 -z-20 pointer-events-none overflow-hidden transition-colors duration-1000",
      // El modo claro deja de ser blanco puro para ser un "Humo de Seda" muy sutil
      isDark ? "bg-[#020202]" : "bg-[#f8f9fa]"
    )}>
      
      {/* 
          II. EL PUNTERO DE RESONANCIA (Luz de Guía)
          Un haz de luz sutil que sigue la intención del usuario.
      */}
      <motion.div
        className="hidden md:block absolute w-[500px] h-[500px] rounded-full z-20 opacity-30 mix-blend-screen"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
          willChange: "transform",
          background: isDark 
            ? "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 60%)" // Púrpura NicePod
            : "radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 60%)", // Cian vibrante
        }}
      />

      {/* 
          III. MALLA AURORA (Triada de Profundidad)
          Los tres orbes bailan en bucles asíncronos para que el patrón nunca se repita exactamente igual.
      */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isDark ? "dark-void" : "light-canvas"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* ORBE 1: Dominancia Superior Izquierda (El ancla del color) */}
          <motion.div
            animate={{
              x: ["0%", "5%", "-2%", "0%"],
              y: ["0%", "3%", "-4%", "0%"],
              scale: [1, 1.05, 0.95, 1]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className={cn(
              "absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full blur-[120px] transition-colors duration-1000",
              isDark ? "bg-indigo-600/15" : "bg-sky-400/20"
            )}
            style={{ willChange: "transform" }}
          />

          {/* ORBE 2: Resonancia Inferior Derecha (El contraste térmico) */}
          <motion.div
            animate={{
              x: ["0%", "-4%", "3%", "0%"],
              y: ["0%", "-5%", "4%", "0%"],
              scale: [1, 0.95, 1.05, 1]
            }}
            transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className={cn(
              "absolute bottom-[-15%] right-[-10%] w-[80%] h-[80%] rounded-full blur-[130px] transition-colors duration-1000",
              isDark ? "bg-purple-700/10" : "bg-violet-400/15"
            )}
            style={{ willChange: "transform" }}
          />

          {/* ORBE 3: Profundidad Central (El volumen del cristal) */}
          <motion.div
            animate={{
              x: ["0%", "2%", "-2%", "0%"],
              y: ["0%", "-2%", "2%", "0%"],
            }}
            transition={{ duration: 32, repeat: Infinity, ease: "linear", delay: 2 }}
            className={cn(
              "absolute top-[30%] left-[20%] w-[60%] h-[60%] rounded-full blur-[140px] transition-colors duration-1000",
              isDark ? "bg-blue-900/10" : "bg-emerald-300/10"
            )}
            style={{ willChange: "transform" }}
          />
        </motion.div>
      </AnimatePresence>

      {/* 
          IV. FILTRO DE TEXTURA (Ruido Analógico)
          Aporta la sensación de "hardware premium" al cristal de la interfaz.
          La opacidad se calibra según el tema para que no ensucie los fondos blancos.
      */}
      <div className={cn(
        "absolute inset-0 pointer-events-none mix-blend-overlay transition-opacity duration-1000 z-10",
        isDark ? "opacity-[0.04]" : "opacity-[0.02]"
      )}>
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          <filter id="noiseFilter">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.8" 
              numOctaves="3" 
              stitchTiles="stitch" 
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      {/* 
          V. VELO DE CONTRASTE (Viñeta)
          Oscurece sutilmente los bordes (o los aclara en light mode) para dirigir 
          la vista del curador hacia el centro de la Workstation.
      */}
      <div className={cn(
        "absolute inset-0 transition-all duration-1000 z-10 pointer-events-none",
        isDark 
          ? "bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" 
          : "bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(255,255,255,0.5)_100%)]"
      )} />

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Malla Triádica: La inclusión del 'Orbe 3' en el centro de la pantalla 
 *    soluciona el problema de los "espacios muertos" en monitores ultrawide, 
 *    garantizando que siempre haya información cromática detrás del contenido.
 * 2. Viñeta Fotográfica: El 'Velo de Contraste' (Capa V) utiliza un gradiente 
 *    radial inverso. En el modo claro, esto empuja el color hacia el centro y 
 *    "lava" los bordes de la pantalla con blanco, dándole un aspecto inmaculado 
 *    y profesional que reduce la fatiga visual.
 * 3. Mix-Blend-Screen: El puntero del ratón ahora usa el modo de mezcla 'screen' 
 *    para que la luz se sume a los orbes de fondo de forma realista, en lugar 
 *    de simplemente superponerse con opacidad plana.
 */