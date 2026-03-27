/**
 * NICEPOD V12.0 - AURORA ENGINE (RESONANCE DENSITY EDITION)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Orquestar la atmósfera visual dinámica y liberar la hibernación en Dashboard.
 * [ESTABILIZACIÓN]: Reparación de bloqueo de renderizado en rutas de plataforma.
 */

"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { memo, useEffect, useState } from "react";

/**
 * COMPONENTE: BackgroundEngine
 * El corazón estético de NicePod. Gestiona la profundidad visual y el 
 * contraste de la interfaz mediante capas de color en movimiento orgánico.
 */
export const BackgroundEngine = memo(function BackgroundEngine() {
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState<boolean>(false);

  // 1. ANÁLISIS DE ENTORNO TÁCTICO (RE-CALIBRADO V12.0)
  // [CAMBIO CRÍTICO]: Solo hibernamos en el mapa (/map). 
  // El Dashboard ahora es zona de ALTA FIDELIDAD.
  const isMapRoute = pathname?.startsWith('/map');
  const shouldHibernate = isMapRoute;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Suavizado del puntero para mayor elegancia
  const springConfig = { damping: 50, stiffness: 100, restDelta: 0.001 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

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
    /**
     * [LIENZO BASE]: 
     * Provee el color de fondo sólido inicial para evitar parpadeos de carga.
     */
    <div
      className={cn(
        "fixed inset-0 -z-20 pointer-events-none overflow-hidden transition-colors duration-1000",
        isDark ? "bg-[#030303]" : "bg-[#F8FAFC]"
      )}
      aria-hidden="true"
    >
      {/* 
          I. HALO DE RESONANCIA
          Puntero lumínico que reacciona a la presencia del Voyager.
      */}
      <AnimatePresence>
        {!shouldHibernate && mounted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="hidden md:block absolute w-[800px] h-[800px] rounded-full z-10 mix-blend-plus-lighter pointer-events-none"
            style={{
              x: smoothX,
              y: smoothY,
              translateX: "-50%",
              translateY: "-50%",
              willChange: "transform",
              background: isDark
                ? "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* 
          II. MOTOR AURORA (CAPAS CROMÁTICAS)
          Movimiento fluido de larga duración para evitar fatiga cognitiva.
      */}
      <AnimatePresence mode="wait">
        {!shouldHibernate && mounted && (
          <motion.div
            key={isDark ? "dark-resonance" : "light-resonance"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* CAPA ALPHA: El Flujo Profundo (Morado / Celeste) */}
            <motion.div
              animate={{
                x: ["-5%", "10%", "-10%", "5%", "-5%"],
                y: ["-10%", "5%", "15%", "-5%", "-10%"],
                scale: [1, 1.1, 0.9, 1.05, 1],
              }}
              transition={{ duration: 45, repeat: Infinity, ease: "easeInOut" }}
              className={cn(
                "absolute top-[-20%] left-[-10%] w-[100%] h-[100%] rounded-full blur-[140px] md:blur-[180px] transition-colors duration-1000",
                isDark ? "bg-indigo-950/40" : "bg-sky-200/50"
              )}
              style={{ willChange: "transform" }}
            />

            {/* CAPA BETA: El Pulso Dinámico (Violeta / Fucsia) */}
            <motion.div
              animate={{
                x: ["10%", "-12%", "8%", "-5%", "10%"],
                y: ["5%", "15%", "-10%", "12%", "5%"],
                scale: [1.1, 0.9, 1.15, 0.95, 1.1],
              }}
              transition={{ duration: 33, repeat: Infinity, ease: "easeInOut" }}
              className={cn(
                "absolute bottom-[-15%] right-[-5%] w-[90%] h-[90%] rounded-[45%] blur-[150px] md:blur-[190px] transition-colors duration-1000",
                isDark ? "bg-purple-900/30" : "bg-fuchsia-300/40"
              )}
              style={{ willChange: "transform" }}
            />

            {/* CAPA GAMMA: El Núcleo de Contraste (Azul Oscuro / Blanco) */}
            <motion.div
              animate={{
                x: ["-15%", "15%", "0%", "-15%"],
                y: ["15%", "-15%", "10%", "15%"],
                rotate: [0, 180, 360],
              }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className={cn(
                "absolute top-[10%] left-[10%] w-[70%] h-[70%] rounded-full blur-[160px] transition-colors duration-1000 mix-blend-soft-light",
                isDark ? "bg-blue-950/20" : "bg-white/40"
              )}
              style={{ willChange: "transform" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
          III. FILTRO DE TEXTURA INDUSTRIAL
          Provee una capa de grano técnico para un look profesional y táctico.
      */}
      {!shouldHibernate && mounted && (
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay z-40">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <filter id="noiseFilter">
              <feTurbulence type="fractalNoise" baseFrequency="0.80" numOctaves="4" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
          </svg>
        </div>
      )}

      {/* IV. GRADIENTE DE SELLADO PROFUNDO */}
      <div
        className={cn(
          "absolute inset-0 pointer-events-none transition-opacity duration-1000",
          isDark
            ? "bg-gradient-to-b from-transparent via-transparent to-[#030303] opacity-90"
            : "bg-gradient-to-b from-transparent via-transparent to-white opacity-50"
        )}
      />
    </div>
  );
});

/**
 * NOTA TÉCNICA DEL ARCHITECT (V12.0):
 * 1. Dashboard Liberation: Se eliminó 'isDashboard' de la lógica de hibernación.
 *    Ahora los orbes fluidos son visibles en la Workstation central.
 * 2. Palette Refinement: Se ajustaron los colores Dark a Indigo-950 y Purple-900 
 *    para mayor profundidad. En Light se usa Sky-200 y Fuchsia-300 para elegancia.
 * 3. Performance Balance: Mantiene la purga física de nodos en /map para asegurar 
 *    que Mapbox v3 tenga el 100% de la GPU durante el peritaje geográfico.
 * 4. Stacking Integrity: El z-index: -20 y el uso de mix-blend-mode aseguran que 
 *    el fondo sea una atmósfera, no una interferencia.
 */