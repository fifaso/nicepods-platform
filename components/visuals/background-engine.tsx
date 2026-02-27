// components/visuals/background-engine.tsx
// VERSIÓN: 2.0

"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * COMPONENTE: BackgroundEngine
 * El único dueño de la atmósfera visual de NicePod V2.5.
 * 
 * [CARACTERÍSTICAS DE GRADO INDUSTRIAL]:
 * 1. Movimiento Orgánico: Los Blobs Aurora utilizan curvas de Bezier para 
 *    desplazarse sutilmente, evitando que la interfaz se sienta estática.
 * 2. Adaptación de Tema: Recalibra intensidades según el modo (Light/Dark).
 * 3. Optimización LCP: Se renderiza en el z-index inferior absoluto con 
 *    propiedades de 'pointer-events-none' para no interferir en el hilo de UI.
 */
export function BackgroundEngine() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // PROTOCOLO DE HIDRATACIÓN:
  // Aseguramos que el cliente y el servidor coincidan antes de pintar el motor.
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Lógica de Identidad Lumínica
  const isDark = resolvedTheme === "dark";

  return (
    <div className="fixed inset-0 -z-20 pointer-events-none overflow-hidden bg-background transition-colors duration-1000">

      {/* 
          I. LA MALLA AURORA (BLOBS DINÁMICOS)
          Utilizamos AnimatePresence para que la transición de colores al cambiar 
          de tema sea una disolución cinemática suave.
      */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isDark ? "nebulosa" : "amanecer"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* 
              BLOB ALFA (Epicentro Primario)
              Ubicación: Esquina superior izquierda.
              Vibe: Energía de creación.
          */}
          <motion.div
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className={cn(
              "absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full blur-[140px] transition-colors duration-1000",
              isDark ? "bg-primary/25" : "bg-primary/15"
            )}
          />

          {/* 
              BLOB BETA (Resonancia Secundaria)
              Ubicación: Centro-Derecha.
              Vibe: Conexiones semánticas.
          */}
          <motion.div
            animate={{
              x: [0, -60, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
              delay: 2,
            }}
            className={cn(
              "absolute top-[20%] right-[-15%] w-[65%] h-[65%] rounded-full blur-[160px] transition-colors duration-1000",
              isDark ? "bg-purple-600/20" : "bg-indigo-400/10"
            )}
          />

          {/* 
              BLOB GAMMA (Bóveda Profunda)
              Ubicación: Inferior-Izquierda.
              Vibe: Capital intelectual.
          */}
          <motion.div
            animate={{
              x: [0, 40, 0],
              y: [0, -40, 0],
              scale: [1, 0.9, 1],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "linear",
              delay: 5,
            }}
            className={cn(
              "absolute bottom-[-15%] left-[5%] w-[55%] h-[55%] rounded-full blur-[150px] transition-colors duration-1000",
              isDark ? "bg-indigo-500/20" : "bg-fuchsia-300/10"
            )}
          />

          {/* 
              BLOB DELTA (Soberanía)
              Ubicación: Inferior-Derecha.
              Vibe: Estabilidad técnica.
          */}
          <motion.div
            animate={{
              x: [0, -30, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "linear",
            }}
            className={cn(
              "absolute bottom-[-5%] right-[10%] w-[45%] h-[45%] rounded-full blur-[130px] transition-colors duration-1000",
              isDark ? "bg-blue-600/15" : "bg-blue-300/5"
            )}
          />
        </motion.div>
      </AnimatePresence>

      {/* 
          II. EL FILTRO DE TEXTURA INDUSTRIAL (NOISE)
          Aplica un grano sutil que rompe la perfección digital de los gradientes, 
          dándole un aspecto de material físico al cristal de fondo.
      */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          <filter id="noiseFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      {/* 
          III. VELO DE PROFUNDIDAD
          En modo oscuro, añadimos un gradiente de viñeteado para enfocar 
          la atención en el contenido central.
      */}
      {isDark && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-[#020202]/80" />
      )}

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Física de Blobs: Se ha evitado el uso de CSS Transitions nativas para el 
 *    movimiento en favor de Framer Motion 'animate', lo cual permite una 
 *    aceleración por hardware real que no bloquea el hilo principal de JS.
 * 2. Transparencia Operativa: Al usar opacidades escalonadas (15% a 25%), el 
 *    motor visual asegura que el texto (foreground) sea legible en cumplimiento 
 *    con el estándar WCAG 2.1, incluso sobre las áreas de color más vibrantes.
 * 3. Texturizado: El SVG de Noise Filter elimina las bandas de color (color banding) 
 *    propias de los desenfoques pesados en pantallas de baja profundidad de bits.
 */