// components/visuals/background-engine.tsx
// VERSIÓN: 3.0 (Vivid Aurora - High Fidelity Standard)

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function BackgroundEngine() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  const isDark = resolvedTheme === "dark";

  return (
    <div className="fixed inset-0 -z-20 pointer-events-none overflow-hidden bg-background">

      {/* MALLA AURORA POTENCIADA */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isDark ? "dark-vibe" : "light-vibe"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
        >
          {/* BLOB 1: VIOLETA ELÉCTRICO (Superior Izquierda) */}
          <motion.div
            animate={{ x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full blur-[120px] transition-colors duration-1000 ${isDark ? "bg-indigo-600/30" : "bg-indigo-400/20"
              }`}
          />

          {/* BLOB 2: FUCSIA NEÓN (Derecha) */}
          <motion.div
            animate={{ x: [0, -80, 0], y: [0, 100, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className={`absolute top-[10%] right-[-10%] w-[70%] h-[70%] rounded-full blur-[140px] transition-colors duration-1000 ${isDark ? "bg-fuchsia-600/25" : "bg-fuchsia-400/15"
              }`}
          />

          {/* BLOB 3: CIAN ÁRTICO (Inferior Derecha) - [NUEVO] */}
          <motion.div
            animate={{ x: [0, -40, 0], y: [0, -60, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] rounded-full blur-[110px] transition-colors duration-1000 ${isDark ? "bg-cyan-500/20" : "bg-cyan-300/10"
              }`}
          />

          {/* BLOB 4: PRIMARY GLOW (Centro) */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] rounded-full blur-[160px] opacity-20 ${isDark ? "bg-primary/20" : "bg-primary/5"
            }`} />
        </motion.div>
      </AnimatePresence>

      {/* FILTRO DE TEXTURA INDUSTRIAL (GRANO) */}
      <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <filter id="n">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" />
          </filter>
          <rect width="100%" height="100%" filter="url(#n)" />
        </svg>
      </div>

      {/* VIÑETEADO DE PROFUNDIDAD */}
      {isDark && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
      )}
    </div>
  );
}