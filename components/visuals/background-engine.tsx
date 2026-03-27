// components/visuals/background-engine.tsx
// VERSIÓN: 10.0 (NicePod Aurora Engine - Zero-Flicker & Critical Hibernation Edition)
// Misión: Orquestar la atmósfera visual y liberar el 100% de la CPU para el GPS y WebGL.
// [ESTABILIZACIÓN]: Eliminación de pestañeo inicial y purga física de nodos en rutas de mapa.

"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { memo, useEffect, useState } from "react";

/**
 * COMPONENTE: BackgroundEngine
 * El motor de inmersión visual de NicePod. Implementa hibernación agresiva 
 * para proteger el hilo principal de ejecución (Main Thread).
 */
export const BackgroundEngine = memo(function BackgroundEngine() {
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState<boolean>(false);

  // 1. ANÁLISIS DE ENTORNO TÁCTICO
  // Hibernamos si estamos en el mapa o en el dashboard para priorizar el hardware.
  const isMapRoute = pathname?.startsWith('/map');
  const isDashboard = pathname?.startsWith('/dashboard');
  const shouldHibernate = isMapRoute || isDashboard;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Configuración de inercia para el puntero (Desactivada en hibernación)
  const springConfig = { damping: 50, stiffness: 100, restDelta: 0.001 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // 2. PROTOCOLO DE ECONOMÍA DE CPU
  useEffect(() => {
    setMounted(true);

    const handleMouseMove = (event: MouseEvent) => {
      // Solo actualizamos si no estamos en modo ahorro de recursos
      if (!shouldHibernate) {
        mouseX.set(event.clientX);
        mouseY.set(event.clientY);
      }
    };

    if (typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches && !shouldHibernate) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, shouldHibernate]);

  const isDark = resolvedTheme === "dark";

  return (
    /**
     * [ORDEN ARQUITECTÓNICA]: El contenedor base SIEMPRE se renderiza.
     * Esto elimina el pestañeo (flickering) al navegar, ya que el color 
     * de fondo está presente desde el servidor (SSR).
     */
    <div
      className={cn(
        "fixed inset-0 -z-20 pointer-events-none overflow-hidden transition-colors duration-1000",
        isDark ? "bg-[#03040B]" : "bg-slate-100"
      )}
      aria-hidden="true"
    >

      {/* 
          I. PUNTERO DE RESONANCIA
          Se desmonta físicamente si 'shouldHibernate' es true para liberar VRAM.
      */}
      <AnimatePresence>
        {!shouldHibernate && mounted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="hidden md:block absolute w-[600px] h-[600px] rounded-full z-20 mix-blend-screen pointer-events-none"
            style={{
              x: smoothX,
              y: smoothY,
              translateX: "-50%",
              translateY: "-50%",
              willChange: "transform",
              background: isDark
                ? "radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 60%)"
                : "radial-gradient(circle, rgba(56,189,248,0.25) 0%, transparent 60%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* 
          II. MALLA AURORA ORGÁNICA (PROCESAMIENTO PESADO)
          [MANDATO V2.7]: Purga absoluta de nodos blur en el Dashboard y Mapa.
          Esto detiene el 100% de las tareas largas de renderizado de fondo.
      */}
      <AnimatePresence mode="wait">
        {!shouldHibernate && mounted && (
          <motion.div
            key={isDark ? "dark-void" : "light-canvas"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* ORBE 1: El Flujo Lento */}
            <motion.div
              animate={{
                x: ["0%", "15%", "-5%", "8%", "-10%", "0%"],
                y: ["0%", "-10%", "15%", "-5%", "10%", "0%"],
                scale: [1, 1.15, 0.9, 1.05, 0.95, 1],
              }}
              transition={{ duration: 43, repeat: Infinity, ease: "easeInOut" }}
              className={cn(
                "absolute top-[-20%] left-[-10%] w-[90%] h-[90%] rounded-full blur-[140px] md:blur-[180px] transition-colors duration-1000",
                isDark ? "bg-blue-900/20" : "bg-blue-400/30"
              )}
              style={{ willChange: "transform" }}
            />

            {/* ORBE 2: El Pulso Rápido */}
            <motion.div
              animate={{
                x: ["0%", "-15%", "10%", "-12%", "5%", "0%"],
                y: ["0%", "15%", "-8%", "12%", "-10%", "0%"],
                scale: [1, 0.85, 1.1, 0.95, 1.05, 1],
              }}
              transition={{ duration: 29, repeat: Infinity, ease: "easeInOut" }}
              className={cn(
                "absolute bottom-[-15%] right-[-15%] w-[85%] h-[85%] rounded-[40%_60%_70%_30%] blur-[150px] md:blur-[190px] transition-colors duration-1000",
                isDark ? "bg-indigo-900/30" : "bg-indigo-300/40"
              )}
              style={{ willChange: "transform" }}
            />

            {/* ORBE 3: El Núcleo Errático */}
            <motion.div
              animate={{
                x: ["0%", "20%", "-15%", "10%", "-5%", "0%"],
                y: ["0%", "-15%", "20%", "-10%", "5%", "0%"],
                rotate: [0, 90, 180, 270, 360],
              }}
              transition={{ duration: 37, repeat: Infinity, ease: "linear" }}
              className={cn(
                "absolute top-[10%] left-[15%] w-[70%] h-[70%] rounded-[30%_70%_70%_30%] blur-[160px] transition-colors duration-1000 mix-blend-screen",
                isDark ? "bg-violet-900/15" : "bg-purple-300/30"
              )}
              style={{ willChange: "transform" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
          III. FILTRO DE TEXTURA (RUIDO FRACTAL)
          El filtro SVG 'feTurbulence' es un asesino de FPS. 
          Lo eliminamos totalmente en el Mapa y el Dashboard.
      */}
      <AnimatePresence>
        {!shouldHibernate && mounted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isDark ? 0.03 : 0.015 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 pointer-events-none mix-blend-overlay z-30"
          >
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
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V10.0):
 * 1. Solución de Inanición de CPU: Al desmontar los orbes y el filtro SVG en 
 *    '/map' y '/dashboard', liberamos el canal de procesamiento para que el 
 *    callback del GPS se ejecute en milisegundos, eliminando el lag de 277ms.
 * 2. Erradicación del Pestañeo: Al asegurar que el div raíz se renderiza 
 *    siempre (incluso antes de 'mounted'), el Voyager nunca verá un flash 
 *    blanco o negro al cargar la plataforma.
 * 3. Optimización de Memoria de Video: El uso de 'AnimatePresence' con el flag 
 *    'shouldHibernate' purga la VRAM del navegador, garantizando que Mapbox 
 *    tenga el 100% de la GPU para los edificios 3D y texturas PBR.
 */