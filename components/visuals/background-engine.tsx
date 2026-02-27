// components/visuals/background-engine.tsx
// VERSIÓN: 4.0

"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function BackgroundEngine() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // --- LÓGICA DE RASTREO DE MOUSE (SISTEMA DE RESORTES) ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Configuramos la física de 'fluido': stiffness (rigidez) baja y damping (amortiguación) media
  const springConfig = { damping: 50, stiffness: 200 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    setMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      // Ajustamos las coordenadas para que el centro del blob sea el puntero
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  if (!mounted) return null;
  const isDark = resolvedTheme === "dark";

  return (
    <div className="fixed inset-0 -z-20 pointer-events-none overflow-hidden bg-background">

      {/* 
          I. EL PUNTERO DE RESONANCIA (MOUSE BLOB)
          Este elemento solo es visible en Desktop. 
          Genera una luz que sigue al curador, iluminando el cristal.
      */}
      <motion.div
        className="hidden md:block absolute w-[400px] h-[400px] rounded-full pointer-events-none z-10"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
          background: isDark
            ? "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
        }}
      />

      {/* II. MALLA AURORA DINÁMICA (Mantenemos los Blobs base para dar cuerpo) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isDark ? "dark-vibe" : "light-vibe"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
        >
          {/* BLOB ALFA: Morado Intenso */}
          <motion.div
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className={`absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full blur-[140px] ${isDark ? "bg-indigo-600/25" : "bg-indigo-400/15"
              }`}
          />

          {/* BLOB BETA: Cian/Azul */}
          <motion.div
            animate={{ x: [0, -40, 0], y: [0, 60, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
            className={`absolute top-[20%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] ${isDark ? "bg-cyan-500/20" : "bg-cyan-300/10"
              }`}
          />

          {/* BLOB GAMMA: Fucsia Suave */}
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 5 }}
            className={`absolute bottom-[-10%] left-[10%] w-[50%] h-[50%] rounded-full blur-[130px] ${isDark ? "bg-fuchsia-600/15" : "bg-fuchsia-400/5"
              }`}
          />
        </motion.div>
      </AnimatePresence>

      {/* III. FILTRO DE TEXTURA INDUSTRIAL (GRANO) */}
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      {/* IV. VIÑETEADO DE PROFUNDIDAD */}
      {isDark && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
      )}
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Desempeño: El uso de 'useMotionValue' y 'useSpring' de Framer Motion es 
 *    mucho más eficiente que usar un estado (useState) de React para el mouse, 
 *    ya que no dispara re-renders del componente, sino que muta el estilo 
 *    directamente en el nodo del DOM (GPU-Accelerated).
 * 2. Elegancia 'Liquid': El 'stiffness' de 200 y 'damping' de 50 crean ese 
 *    efecto de luz que 'persigue' al usuario de forma orgánica, no mecánica.
 * 3. Fallback Móvil: La clase 'hidden md:block' en el Mouse Blob asegura que 
 *    en teléfonos no gastemos CPU rastreando toques innecesarios.
 */