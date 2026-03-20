// components/visuals/background-engine.tsx
// VERSIÓN: 8.0 (NicePod Aurora Engine - Organic Fluidity & Deep Palette Edition)
// Misión: Orquestar una atmósfera visual impredecible, elegante y con calibración de contraste perfecta.
// [ESTABILIZACIÓN]: Implementación de tiempos primos (Asymmetric Keyframes) y paleta Deep Space / Prism.

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
      // Dark: Negro abismal con 1% de azul. Light: Slate muy suave para contraste.
      isDark ? "bg-[#03040B]" : "bg-slate-100"
    )}>
      
      {/* 
          II. PUNTERO DE RESONANCIA
          Adaptado para mezclarse orgánicamente con la nueva paleta.
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
            ? "radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 60%)" // Indigo suave
            : "radial-gradient(circle, rgba(56,189,248,0.25) 0%, transparent 60%)", // Cielo vibrante
        }}
      />

      {/* 
          III. MALLA AURORA ORGÁNICA (Caos Asimétrico)
          Tiempos primos (29s, 37s, 43s) para garantizar que los orbes nunca se sincronicen,
          creando un efecto de 'lámpara de lava' infinita.
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
          {/* ORBE 1: El Flujo Lento (Fondo Profundo) */}
          <motion.div
            animate={{
              x: ["0%", "15%", "-5%", "8%", "-10%", "0%"],
              y: ["0%", "-10%", "15%", "-5%", "10%", "0%"],
              scale: [1, 1.15, 0.9, 1.05, 0.95, 1],
            }}
            transition={{ duration: 43, repeat: Infinity, ease: "easeInOut" }}
            className={cn(
              "absolute top-[-20%] left-[-10%] w-[90%] h-[90%] rounded-full blur-[140px] md:blur-[180px] transition-colors duration-1000",
              // Dark: Azul marino oscuro. Light: Azul cerúleo.
              isDark ? "bg-blue-900/30" : "bg-blue-400/40"
            )}
            style={{ willChange: "transform" }}
          />

          {/* ORBE 2: El Pulso Rápido (Contraste Medio) */}
          <motion.div
            animate={{
              x: ["0%", "-15%", "10%", "-12%", "5%", "0%"],
              y: ["0%", "15%", "-8%", "12%", "-10%", "0%"],
              scale: [1, 0.85, 1.1, 0.95, 1.05, 1],
            }}
            transition={{ duration: 29, repeat: Infinity, ease: "easeInOut" }}
            className={cn(
              "absolute bottom-[-15%] right-[-15%] w-[85%] h-[85%] rounded-[40%_60%_70%_30%] blur-[150px] md:blur-[190px] transition-colors duration-1000",
              // Dark: Índigo oscuro (corta el morado excesivo). Light: Índigo vibrante.
              isDark ? "bg-indigo-900/40" : "bg-indigo-300/50"
            )}
            style={{ willChange: "transform" }}
          />

          {/* ORBE 3: El Núcleo Errático (Centro Flotante) */}
          <motion.div
            animate={{
              x: ["0%", "20%", "-15%", "10%", "-5%", "0%"],
              y: ["0%", "-15%", "20%", "-10%", "5%", "0%"],
              rotate: [0, 90, 180, 270, 360],
            }}
            transition={{ duration: 37, repeat: Infinity, ease: "linear" }}
            className={cn(
              "absolute top-[10%] left-[15%] w-[70%] h-[70%] rounded-[30%_70%_70%_30%] blur-[160px] transition-colors duration-1000 mix-blend-screen",
              // Dark: Violeta tenue para unir el azul y el negro. Light: Púrpura suave.
              isDark ? "bg-violet-900/20" : "bg-purple-300/40"
            )}
            style={{ willChange: "transform" }}
          />
        </motion.div>
      </AnimatePresence>

      {/* 
          IV. FILTRO DE TEXTURA (Ruido Analógico)
          Calibrado para no oscurecer el modo claro y mantener la textura premium en oscuro.
      */}
      <div className={cn(
        "absolute inset-0 pointer-events-none mix-blend-overlay z-30",
        isDark ? "opacity-[0.03]" : "opacity-[0.015]"
      )}>
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          <filter id="noiseFilter">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.85" 
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
 * NOTA TÉCNICA DEL ARCHITECT (V8.0):
 * 1. Caos Matemático: Se implementaron duraciones de animación en números primos 
 *    (29s, 37s, 43s) y vectores asimétricos con deformación de 'borderRadius'. 
 *    Esto garantiza que el fondo nunca se vea estático o predecible, simulando 
 *    el movimiento convectivo de fluidos o nebulosas.
 * 2. Paleta Calibrada (Dark Mode): Se erradicó el exceso de fucsia/púrpura brillante. 
 *    Ahora dominan los tonos 'blue-900', 'indigo-900' y 'violet-900' sobre un fondo 
 *    '#03040B'. El resultado es una elegancia sobria y nocturna.
 * 3. Contraste Eficiente (Light Mode): Se abandonaron los tonos pastel diluidos en 
 *    favor de 'blue-400', 'indigo-300' y 'purple-300' con opacidades más altas, 
 *    logrando que los colores sean distintivos y elegantes incluso bajo luz solar directa.
 */