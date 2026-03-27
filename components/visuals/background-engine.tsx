/**
 * NICEPOD V11.0 - AURORA ENGINE (RESONANCE EDITION)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Orquestar la atmósfera visual con elegancia y economía de CPU.
 * [ESTABILIZACIÓN]: Nuevas paletas de alto contraste y refinamiento de fluidos.
 */

"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { memo, useEffect, useState } from "react";

export const BackgroundEngine = memo(function BackgroundEngine() {
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState<boolean>(false);

  // 1. ANÁLISIS DE ENTORNO TÁCTICO
  const isMapRoute = pathname?.startsWith('/map');
  const isDashboard = pathname?.startsWith('/dashboard');
  const shouldHibernate = isMapRoute || isDashboard;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 50, stiffness: 100, restDelta: 0.001 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // 2. PROTOCOLO DE CAPTURA DE RESONANCIA (MOUSE)
  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (event: MouseEvent) => {
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
    <div
      className={cn(
        "fixed inset-0 -z-20 pointer-events-none overflow-hidden transition-colors duration-1000",
        isDark ? "bg-[#030303]" : "bg-[#FDFDFD]"
      )}
      aria-hidden="true"
    >
      {/* 
          I. PUNTERO DE RESONANCIA
          Efecto de halo que sigue al Voyager en páginas de contenido.
      */}
      <AnimatePresence>
        {!shouldHibernate && mounted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="hidden md:block absolute w-[800px] h-[800px] rounded-full z-20 mix-blend-plus-lighter pointer-events-none"
            style={{
              x: smoothX,
              y: smoothY,
              translateX: "-50%",
              translateY: "-50%",
              willChange: "transform",
              background: isDark
                ? "radial-gradient(circle, rgba(76,29,149,0.12) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(217,70,239,0.08) 0%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* 
          II. MALLA AURORA DINÁMICA
          Capas de color fluido con lógica de movimiento asíncrono.
      */}
      <AnimatePresence mode="wait">
        {!shouldHibernate && mounted && (
          <motion.div
            key={isDark ? "void-dark" : "canvas-light"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* CAPA ALPHA: El Flujo Profundo (Indigo / Celeste) */}
            <motion.div
              animate={{
                x: ["-10%", "10%", "-5%", "15%", "-10%"],
                y: ["-5%", "15%", "10%", "-10%", "-5%"],
                scale: [1, 1.2, 0.9, 1.1, 1],
              }}
              transition={{ duration: 55, repeat: Infinity, ease: "easeInOut" }}
              className={cn(
                "absolute top-[-25%] left-[-15%] w-[110%] h-[110%] rounded-full blur-[120px] md:blur-[160px] transition-colors duration-1000",
                isDark ? "bg-indigo-950/40" : "bg-sky-200/50"
              )}
              style={{ willChange: "transform" }}
            />

            {/* CAPA BETA: El Pulso Vital (Violeta / Fucsia) */}
            <motion.div
              animate={{
                x: ["10%", "-15%", "15%", "-10%", "10%"],
                y: ["15%", "-10%", "-15%", "10%", "15%"],
                scale: [1.1, 0.9, 1.15, 0.95, 1.1],
              }}
              transition={{ duration: 42, repeat: Infinity, ease: "easeInOut" }}
              className={cn(
                "absolute bottom-[-20%] right-[-10%] w-[100%] h-[100%] rounded-[45%] blur-[130px] md:blur-[180px] transition-colors duration-1000",
                isDark ? "bg-purple-900/30" : "bg-fuchsia-200/40"
              )}
              style={{ willChange: "transform" }}
            />

            {/* CAPA GAMMA: El Núcleo de Contraste (Azul Oscuro / Blanco) */}
            <motion.div
              animate={{
                x: ["-20%", "20%", "0%", "-20%"],
                y: ["20%", "-20%", "10%", "20%"],
                rotate: [0, 180, 360],
              }}
              transition={{ duration: 65, repeat: Infinity, ease: "linear" }}
              className={cn(
                "absolute top-[20%] left-[20%] w-[60%] h-[60%] rounded-full blur-[140px] transition-colors duration-1000 mix-blend-soft-light",
                isDark ? "bg-blue-900/20" : "bg-white/60"
              )}
              style={{ willChange: "transform" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
          III. FILTRO DE GRANO TÉCNICO
          Añade una textura de "papel industrial" o "interferencia analógica".
      */}
      {!shouldHibernate && mounted && (
        <div className="absolute inset-0 opacity-[0.03] md:opacity-[0.05] pointer-events-none mix-blend-overlay z-50">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <filter id="nicepodNoise">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#nicepodNoise)" />
          </svg>
        </div>
      )}

      {/* IV. GRADIENTE DE SELLADO */}
      <div
        className={cn(
          "absolute inset-0 pointer-events-none transition-opacity duration-1000",
          isDark
            ? "bg-gradient-to-b from-transparent via-transparent to-[#030303] opacity-80"
            : "bg-gradient-to-b from-transparent via-transparent to-white opacity-40"
        )}
      />
    </div>
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V11.0):
 * 1. Definición Cromática: Se han usado tonos 'indigo-950' y 'purple-900' para el modo oscuro,
 *    garantizando un contraste perfecto con el texto 'muted-foreground'.
 * 2. Elegancia Celeste: El modo claro ahora respira con tonos 'sky-200' y 'fuchsia-200', 
 *    evitando la fatiga visual del blanco puro.
 * 3. Mezcla 'Soft-Light': La Capa Gamma usa mezcla de luz suave para crear zonas de brillo 
 *    que parecen orgánicas y no artificiales.
 * 4. Preservación de Ciclo: Se mantiene la hibernación en rutas críticas. El fondo no 
 *    competirá jamás con el Mapa de Inmersión.
 */