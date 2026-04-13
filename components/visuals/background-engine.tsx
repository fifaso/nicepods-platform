/**
 * ARCHIVO: components/visuals/background-engine.tsx
 * VERSIÓN: 15.0 (NicePod Aurora Engine - Nominal Integrity Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Orquestar la atmósfera visual de grado industrial erradicando 
 * advertencias de consola y fallos de hidratación.
 * [REFORMA V15.0]: Purificación de textura SVG (Data URI) para evitar 'unknown variables',
 * sincronía con layout.tsx (Anti-Flicker) y cumplimiento estricto del Dogma.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { memo, useEffect, useState } from "react";

/**
 * COMPONENTE: BackgroundEngine
 * El corazón estético de NicePod. Gestiona la profundidad visual y la termodinámica de colores.
 */
export const BackgroundEngine = memo(function BackgroundEngine() {
  const { resolvedTheme } = useTheme();
  const currentNavigationPathname = usePathname();

  // 1. ESCUDO DE HIDRATACIÓN (Zero-Flicker Shield)
  const [isComponentMounted, setIsComponentMounted] = useState<boolean>(false);

  /**
   * isDocumentHidden: Estado para suspender animaciones cuando la pestaña no es visible.
   * [THERMIC V15.1]: "Silence is Performance" protocol.
   */
  const [isDocumentHidden, setIsDocumentHidden] = useState<boolean>(false);

  // 2. ANÁLISIS DE ENTORNO TÁCTICO
  // Hibernamos la atmósfera solo en el mapa para proteger el Main Thread del WebGL.
  const isGeographicInterfaceActive = currentNavigationPathname?.startsWith('/map');
  const shouldHibernateAtmosphere = isGeographicInterfaceActive || isDocumentHidden;

  const horizontalPointerCoordinate = useMotionValue(0);
  const verticalPointerCoordinate = useMotionValue(0);

  const motionSpringConfiguration = { damping: 50, stiffness: 100, restDelta: 0.001 };
  const smoothHorizontalPointer = useSpring(horizontalPointerCoordinate, motionSpringConfiguration);
  const smoothVerticalPointer = useSpring(verticalPointerCoordinate, motionSpringConfiguration);

  useEffect(() => {
    setIsComponentMounted(true);

    const handleVisibilityChangeAction = () => {
      setIsDocumentHidden(document.hidden);
    };

    if (typeof document !== 'undefined') {
      document.addEventListener("visibilitychange", handleVisibilityChangeAction);
    }

    const handlePointerMovementAction = (mouseEvent: MouseEvent) => {
      if (!shouldHibernateAtmosphere) {
        horizontalPointerCoordinate.set(mouseEvent.clientX);
        verticalPointerCoordinate.set(mouseEvent.clientY);
      }
    };

    if (typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches && !shouldHibernateAtmosphere) {
      window.addEventListener("mousemove", handlePointerMovementAction);
    }
    return () => {
      window.removeEventListener("mousemove", handlePointerMovementAction);
      document.removeEventListener("visibilitychange", handleVisibilityChangeAction);
    };
  }, [horizontalPointerCoordinate, verticalPointerCoordinate, shouldHibernateAtmosphere]);

  // [FIX V15.0]: Si no está montado, renderizamos un contenedor vacío que coincida 100% 
  // con la capa de layout.tsx (#010101). Esto aniquila el pestañeo de hidratación.
  if (!isComponentMounted) {
    return <div className="fixed inset-0 -z-20 bg-[#010101]" aria-hidden="true" />;
  }

  const isDarkModeActive = resolvedTheme === "dark";

  return (
    <div
      className={cn(
        "fixed inset-0 -z-20 pointer-events-none overflow-hidden transition-colors duration-1000",
        isDarkModeActive ? "bg-[#010101]" : "bg-[#F8FAFC]"
      )}
      aria-hidden="true"
    >
      {/* 
          I. HALO DE RESONANCIA REACTIVA
          Puntero lumínico que reacciona a la presencia del Voyager.
      */}
      <AnimatePresence>
        {!shouldHibernateAtmosphere && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="hidden md:block absolute w-[800px] h-[800px] rounded-full z-10 mix-blend-plus-lighter pointer-events-none"
            style={{
              x: smoothHorizontalPointer,
              y: smoothVerticalPointer,
              translateX: "-50%",
              translateY: "-50%",
              willChange: "transform",
              background: isDarkModeActive
                ? "radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* 
          II. MOTOR AURORA (CAPAS CROMÁTICAS DE ALTA DENSIDAD)
      */}
      <AnimatePresence mode="wait">
        {!shouldHibernateAtmosphere && (
          <motion.div
            key={isDarkModeActive ? "dark_resonance_mode" : "light_resonance_mode"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* CAPA ALPHA: El Flujo Profundo (Indigo / Sky) */}
            <motion.div
              animate={{
                x: ["-5%", "10%", "-10%", "5%", "-5%"],
                y: ["-10%", "5%", "15%", "-5%", "-10%"],
                scale: [1, 1.15, 0.9, 1.05, 1],
              }}
              transition={{ duration: 50, repeat: Infinity, ease: "easeInOut" }}
              className={cn(
                "absolute top-[-20%] left-[-10%] w-[100%] h-[100%] rounded-full blur-[140px] md:blur-[180px] transition-colors duration-1000",
                isDarkModeActive ? "bg-indigo-950/40" : "bg-sky-200/50"
              )}
              style={{ willChange: "transform" }}
            />

            {/* CAPA BETA: El Pulso Dinámico (Purple / Fuchsia) */}
            <motion.div
              animate={{
                x: ["10%", "-12%", "8%", "-5%", "10%"],
                y: ["5%", "15%", "-10%", "12%", "5%"],
                scale: [1.1, 0.9, 1.15, 0.95, 1.1],
              }}
              transition={{ duration: 38, repeat: Infinity, ease: "easeInOut" }}
              className={cn(
                "absolute bottom-[-15%] right-[-5%] w-[90%] h-[90%] rounded-[45%] blur-[150px] md:blur-[190px] transition-colors duration-1000",
                isDarkModeActive ? "bg-purple-900/30" : "bg-fuchsia-300/40"
              )}
              style={{ willChange: "transform" }}
            />

            {/* CAPA GAMMA: El Núcleo de Contraste (Blue / White) */}
            <motion.div
              animate={{
                x: ["-15%", "15%", "0%", "-15%"],
                y: ["15%", "-15%", "10%", "15%"],
                rotate: [0, 180, 360],
              }}
              transition={{ duration: 65, repeat: Infinity, ease: "linear" }}
              className={cn(
                "absolute top-[10%] left-[10%] w-[70%] h-[70%] rounded-full blur-[160px] transition-colors duration-1000 mix-blend-soft-light",
                isDarkModeActive ? "bg-blue-950/25" : "bg-white/40"
              )}
              style={{ willChange: "transform" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
          III. FILTRO DE TEXTURA INDUSTRIAL (GRANO)
          [FIX V15.0]: Se implementa como Data URI para evitar advertencias de React
          sobre variables y atributos de imagen desconocidos en el DOM.
      */}
      {!shouldHibernateAtmosphere && (
        <div 
          className="absolute inset-0 opacity-[0.035] pointer-events-none mix-blend-overlay z-40"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      )}

      {/* IV. GRADIENTE DE SELLADO SOBERANO */}
      <div
        className={cn(
          "absolute inset-0 pointer-events-none transition-opacity duration-1000",
          isDarkModeActive
            ? "bg-gradient-to-b from-transparent via-[#010101]/20 to-[#010101]"
            : "bg-gradient-to-b from-transparent via-white/20 to-white"
        )}
      />
    </div>
  );
});