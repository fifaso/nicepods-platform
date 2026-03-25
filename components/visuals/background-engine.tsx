// components/visuals/background-engine.tsx
// VERSIÓN: 9.0 (NicePod Aurora Engine - GPU Hibernation Protocol Edition)
// Misión: Orquestar la atmósfera visual y liberar el 100% de los recursos gráficos al activar la malla 3D.
// [ESTABILIZACIÓN]: Detección de ruta y purga de VRAM para evitar Out of Memory (OOM) en iOS/Android.

"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function BackgroundEngine() {
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState<boolean>(false);

  // 1. SENSOR DE ENTORNO (Hibernación Cartográfica)
  // Si estamos en cualquier ruta que empiece por /map, el motor Aurora debe ceder los recursos al WebGL.
  const isMapRoute = pathname?.startsWith('/map');

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 50, stiffness: 100, restDelta: 0.001 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // 2. PROTOCOLO DE AHORRO DE CPU
  useEffect(() => {
    setMounted(true);

    const handleMouseMove = (event: MouseEvent) => {
      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
    };

    // Solo rastreamos el puntero si hay un ratón fino Y no estamos en el mapa.
    if (typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches && !isMapRoute) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, isMapRoute]);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <div className={cn(
      "fixed inset-0 -z-20 pointer-events-none overflow-hidden transition-colors duration-1000",
      // El color base estático se mantiene siempre como fondo de seguridad.
      isDark ? "bg-[#03040B]" : "bg-slate-100"
    )}>

      {/* 
          I. PUNTERO DE RESONANCIA
          Se desmonta en el mapa para no ocluir interacciones ni gastar GPU.
      */}
      <AnimatePresence>
        {!isMapRoute && (
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
          II. MALLA AURORA ORGÁNICA (HIBERNACIÓN PURA)
          [MANDATO V2.7]: Al usar AnimatePresence con isMapRoute, React elimina estos 
          nodos del DOM. Purga instantánea de los 'blur-[180px]' de la memoria de video.
      */}
      <AnimatePresence mode="wait">
        {!isMapRoute && (
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
                isDark ? "bg-blue-900/30" : "bg-blue-400/40"
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
                isDark ? "bg-indigo-900/40" : "bg-indigo-300/50"
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
                isDark ? "bg-violet-900/20" : "bg-purple-300/40"
              )}
              style={{ willChange: "transform" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
          III. FILTRO DE TEXTURA (Ruido Analógico)
          El filtro SVG es altamente demandante. Lo apagamos en la Malla 3D.
      */}
      <AnimatePresence>
        {!isMapRoute && (
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
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V9.0):
 * 1. Protocolo de Hibernación (OOM Prevention): Se implementó la detección activa de la 
 *    ruta '/map'. Al entrar al ecosistema geoespacial, el motor Aurora desmonta todos los 
 *    nodos con filtros de desenfoque masivos y texturas SVG.
 * 2. Purga de VRAM: Usar 'AnimatePresence' con un condicional asegura que el navegador 
 *    libere la memoria de video asociada a estos elementos, garantizando que Mapbox v3 
 *    tenga el 100% de la GPU dedicada a renderizar los edificios 3D y texturas fotorrealistas.
 * 3. Transición Transparente: Al mantener el 'bg-[#03040B]' del contenedor principal, la 
 *    transición hacia el mapa de pantalla negra es visualmente continua y libre de parpadeos.
 */