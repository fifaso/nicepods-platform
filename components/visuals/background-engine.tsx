// components/visuals/background-engine.tsx
// VERSIÓN: 6.0

"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence, useSpring, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * COMPONENTE: BackgroundEngine
 * El orquestador de la atmósfera visual optimizado para alto rendimiento.
 * 
 * [OPTIMIZACIONES TÁCTICAS V6.0]:
 * 1. Reducción de Capas: Pasamos de 4 a 2 Blobs dinámicos para reducir el 'GPU Overdraw'.
 * 2. Suavizado de Resorte: Calibración de 'springConfig' para minimizar ciclos de pintura.
 * 3. Aceleración por Hardware: Inyección de 'willChange' para pre-renderizado en GPU.
 * 4. Noise Filter Nativo: SVG optimizado para evitar bandas de color sin peso de imagen.
 */
export function BackgroundEngine() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState<boolean>(false);

  // --- I. SISTEMA DE RESONANCIA DE MOUSE ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  /**
   * springConfig:
   * Calibrado para una persecución fluida pero de bajo impacto computacional.
   */
  const springConfig = { damping: 45, stiffness: 150, restDelta: 0.01 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    setMounted(true);

    const handleMouseMove = (event: MouseEvent) => {
      // Rastreamos el cursor y actualizamos los valores de movimiento
      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
    };

    // Escuchamos el movimiento solo si estamos en dispositivos con puntero (Desktop)
    if (typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Protección de hidratación inicial
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <div className="fixed inset-0 -z-20 pointer-events-none overflow-hidden bg-background transition-colors duration-1000">
      
      {/* 
          II. EL PUNTERO DE RESONANCIA (MOUSE BLOB)
          Visible solo en Desktop para ahorrar batería y CPU en móviles.
      */}
      <motion.div
        className="hidden md:block absolute w-[400px] h-[400px] rounded-full z-10 opacity-40"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
          willChange: "transform", // Optimización de capa en GPU
          background: isDark 
            ? "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)" 
            : "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
        }}
      />

      {/* 
          III. MALLA AURORA OPTIMIZADA
          Dos ejes de color bastan para crear la ilusión de profundidad infinita.
      */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isDark ? "dark-nebula" : "light-dawn"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* BLOB ALFA: Indigo / Sky (Dominancia Superior) */}
          <motion.div
            animate={{
              x: [0, 30, 0],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className={cn(
              "absolute top-[-5%] left-[-5%] w-[85%] h-[85%] rounded-full blur-[100px] transition-colors duration-1000",
              isDark ? "bg-indigo-600/15" : "bg-sky-400/25"
            )}
            style={{ willChange: "transform" }}
          />

          {/* BLOB BETA: Purple / Fuchsia (Resonancia Inferior) */}
          <motion.div
            animate={{
              x: [0, -30, 0],
              y: [0, 40, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
              delay: 2,
            }}
            className={cn(
              "absolute bottom-[-10%] right-[-10%] w-[75%] h-[75%] rounded-full blur-[110px] transition-colors duration-1000",
              isDark ? "bg-purple-700/10" : "bg-fuchsia-400/15"
            )}
            style={{ willChange: "transform" }}
          />
        </motion.div>
      </AnimatePresence>

      {/* 
          IV. FILTRO DE TEXTURA (NOISE)
          Generado mediante SVG nativo para evitar descargas de imágenes y bandas de color.
      */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          <filter id="noiseFilter">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.75" 
              numOctaves="3" 
              stitchTiles="stitch" 
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      {/* 
          V. VELO DE PROFUNDIDAD
          Asegura el contraste perfecto para los componentes de la Workstation.
      */}
      <div className={cn(
        "absolute inset-0 transition-opacity duration-1000",
        isDark 
          ? "bg-gradient-to-b from-transparent via-transparent to-black/60" 
          : "bg-gradient-to-b from-white/5 via-transparent to-white/30"
      )} />

    </div>
  );
}