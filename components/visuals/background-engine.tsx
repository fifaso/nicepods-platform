// components/visuals/background-engine.tsx
// VERSIÓN: 7.1 (NicePod Aurora Engine - High Saturation & Contrast Edition)
// Misión: Orquestar una atmósfera visual dinámica de alta presencia cromática.
// [ESTABILIZACIÓN]: Aumento drástico de opacidad y difuminación para vencer pantallas OLED.

"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence, useSpring, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

export function BackgroundEngine() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState<boolean>(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 50, stiffness: 100, restDelta: 0.001 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    setMounted(true);

    const handleMouseMove = (event: MouseEvent) => {
      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
    };

    if (typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <div className={cn(
      "fixed inset-0 -z-20 pointer-events-none overflow-hidden transition-colors duration-1000",
      // Fondo base extremadamente oscuro o claro para que la luz destaque
      isDark ? "bg-[#050505]" : "bg-slate-50"
    )}>
      
      {/* 
          II. PUNTERO DE RESONANCIA
          Luz de seguimiento intensificada al 40% de opacidad.
      */}
      <motion.div
        className="hidden md:block absolute w-[600px] h-[600px] rounded-full z-20 mix-blend-screen pointer-events-none"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
          willChange: "transform",
          background: isDark 
            ? "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 60%)" 
            : "radial-gradient(circle, rgba(14,165,233,0.3) 0%, transparent 60%)",
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={isDark ? "dark-void" : "light-canvas"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* ORBE 1: Luz Principal (Arriba Izquierda) - Alta Vibrancia */}
          <motion.div
            animate={{
              x: ["0%", "5%", "-2%", "0%"],
              y: ["0%", "3%", "-4%", "0%"],
              scale: [1, 1.1, 0.9, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className={cn(
              "absolute top-[-10%] left-[-10%] w-[80%] h-[80%] rounded-full blur-[150px] md:blur-[180px] transition-colors duration-1000",
              // [FIX CRÍTICO]: Aumento de opacidad del 15% al 40/50% con colores neón.
              isDark ? "bg-indigo-500/40" : "bg-sky-300/50"
            )}
            style={{ willChange: "transform" }}
          />

          {/* ORBE 2: Resonancia de Fondo (Abajo Derecha) */}
          <motion.div
            animate={{
              x: ["0%", "-4%", "3%", "0%"],
              y: ["0%", "-5%", "4%", "0%"],
              scale: [1, 0.9, 1.1, 1]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className={cn(
              "absolute bottom-[-10%] right-[-10%] w-[90%] h-[90%] rounded-full blur-[160px] md:blur-[200px] transition-colors duration-1000",
              isDark ? "bg-purple-600/30" : "bg-fuchsia-300/40"
            )}
            style={{ willChange: "transform" }}
          />

          {/* ORBE 3: Núcleo Espacial (Centro) */}
          <motion.div
            animate={{
              x: ["0%", "2%", "-2%", "0%"],
              y: ["0%", "-2%", "2%", "0%"],
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear", delay: 2 }}
            className={cn(
              "absolute top-[20%] left-[20%] w-[60%] h-[60%] rounded-full blur-[150px] transition-colors duration-1000 mix-blend-screen",
              isDark ? "bg-blue-600/20" : "bg-emerald-300/30"
            )}
            style={{ willChange: "transform" }}
          />
        </motion.div>
      </AnimatePresence>

      {/* 
          FILTRO DE TEXTURA (Ruido Analógico)
          Se mantiene para eliminar el Banding, pero con menor opacidad en oscuro.
      */}
      <div className={cn(
        "absolute inset-0 pointer-events-none mix-blend-overlay z-30",
        isDark ? "opacity-[0.03]" : "opacity-[0.02]"
      )}>
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          <filter id="noiseFilter">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.9" 
              numOctaves="3" 
              stitchTiles="stitch" 
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V7.1):
 * 1. Aniquilación de la Oscuridad Plana: Las opacidades de los colores se han 
 *    triplicado (de bg-indigo-600/15 a bg-indigo-500/40). El blur se aumentó a 180px 
 *    para que la luz bañe toda la pantalla y traspase los componentes con 'backdrop-blur'.
 * 2. Modo Claro Vibrante: El uso de 'sky-300/50' asegura que el modo claro tenga un 
 *    aspecto premium, similar a un cristal iluminado, abandonando la paleta "gris sucia".
 * 3. Eliminación de Velos: Se borró el gradiente negro superpuesto que apagaba 
 *    la viveza de los colores generados.
 */