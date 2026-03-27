/**
 * NICEPOD V13.0 - AURORA ENGINE (HYDRATION SHIELD EDITION)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Orquestar la atmósfera visual erradicando fallos de hidratación.
 * [ESTABILIZACIÓN]: Implementación de Double-Pass Rendering para seguridad SSR.
 */

"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { memo, useEffect, useState } from "react";

/**
 * COMPONENTE: BackgroundEngine
 * El corazón estético de NicePod. Gestiona la profundidad visual.
 */
export const BackgroundEngine = memo(function BackgroundEngine() {
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();

  // 1. ESCUDO DE HIDRATACIÓN (CRÍTICO PARA ERROR #418/#422)
  const [mounted, setMounted] = useState<boolean>(false);

  // 2. ANÁLISIS DE ENTORNO TÁCTICO
  // Hibernamos solo en el mapa para proteger el Main Thread de WebGL.
  const isMapRoute = pathname?.startsWith('/map');
  const shouldHibernate = isMapRoute;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

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

  // Si no está montado, renderizamos un contenedor vacío que coincida 100% con el SSR.
  // Esto evita que React encuentre diferencias entre el HTML del servidor y el cliente.
  if (!mounted) {
    return <div className="fixed inset-0 -z-20 bg-[#030303]" aria-hidden="true" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
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
        {!shouldHibernate && (
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
                ? "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* 
          II. MOTOR AURORA (CAPAS CROMÁTICAS)
          Movimiento fluido de alta fidelidad.
      */}
      <AnimatePresence mode="wait">
        {!shouldHibernate && (
          <motion.div
            key={isDark ? "dark-resonance" : "light-resonance"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* CAPA ALPHA: El Flujo Profundo (Indigo 950 / Sky 200) */}
            <motion.div
              animate={{
                x: ["-5%", "10%", "-10%", "5%", "-5%"],
                y: ["-10%", "5%", "15%", "-5%", "-10%"],
                scale: [1, 1.15, 0.9, 1.05, 1],
              }}
              transition={{ duration: 50, repeat: Infinity, ease: "easeInOut" }}
              className={cn(
                "absolute top-[-20%] left-[-10%] w-[100%] h-[100%] rounded-full blur-[140px] md:blur-[180px] transition-colors duration-1000",
                isDark ? "bg-indigo-950/40" : "bg-sky-200/50"
              )}
              style={{ willChange: "transform" }}
            />

            {/* CAPA BETA: El Pulso Dinámico (Purple 900 / Fuchsia 300) */}
            <motion.div
              animate={{
                x: ["10%", "-12%", "8%", "-5%", "10%"],
                y: ["5%", "15%", "-10%", "12%", "5%"],
                scale: [1.1, 0.9, 1.15, 0.95, 1.1],
              }}
              transition={{ duration: 38, repeat: Infinity, ease: "easeInOut" }}
              className={cn(
                "absolute bottom-[-15%] right-[-5%] w-[90%] h-[90%] rounded-[45%] blur-[150px] md:blur-[190px] transition-colors duration-1000",
                isDark ? "bg-purple-900/30" : "bg-fuchsia-300/40"
              )}
              style={{ willChange: "transform" }}
            />

            {/* CAPA GAMMA: El Núcleo de Contraste (Blue 950 / White) */}
            <motion.div
              animate={{
                x: ["-15%", "15%", "0%", "-15%"],
                y: ["15%", "-15%", "10%", "15%"],
                rotate: [0, 180, 360],
              }}
              transition={{ duration: 65, repeat: Infinity, ease: "linear" }}
              className={cn(
                "absolute top-[10%] left-[10%] w-[70%] h-[70%] rounded-full blur-[160px] transition-colors duration-1000 mix-blend-soft-light",
                isDark ? "bg-blue-950/25" : "bg-white/40"
              )}
              style={{ willChange: "transform" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
          III. FILTRO DE TEXTURA INDUSTRIAL (GRANO)
      */}
      {!shouldHibernate && (
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay z-40">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <filter id="noiseFilterV13">
              <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilterV13)" />
          </svg>
        </div>
      )}

      {/* IV. GRADIENTE DE SELLADO */}
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
 * NOTA TÉCNICA DEL ARCHITECT (V13.0):
 * 1. Zero-Hydration-Error: Se implementó un guardado condicional (!mounted) que 
 *    asegura que el servidor y el cliente rendericen el mismo div base inicial.
 * 2. Visual Calibration: Se ajustaron las opacidades (Indigo-950/40 y Purple-900/30) 
 *    para permitir que el texto del Dashboard sea legible sin perder la atmósfera.
 * 3. Unique Filter ID: Se renombró el filtro a 'noiseFilterV13' para evitar 
 *    conflictos de caché de SVG en cambios de ruta rápidos.
 * 4. Refined Grain: Se aumentó el detalle del grano (numOctaves: 4) para un 
 *    aspecto más "pericial" y menos "digital".
 */