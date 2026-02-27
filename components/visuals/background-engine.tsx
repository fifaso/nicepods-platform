// components/visuals/background-engine.tsx
// VERSIÓN: 1.0 (NicePod Atmosphere Engine)

"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function BackgroundEngine() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evitamos discrepancias de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentTheme = resolvedTheme || theme;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-background">
      {/* 
          CAPA 1: LA MALLA DE GRADIENTES (Aurora)
          Se activa tanto en light como en dark, con opacidades ajustadas.
      */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${currentTheme === 'dark' ? 'opacity-40' : 'opacity-20'
        }`}>
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-primary/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/15 rounded-full blur-[150px] animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-[-10%] left-[10%] w-[50%] h-[50%] bg-indigo-500/15 rounded-full blur-[130px] animate-float" style={{ animationDelay: "4s" }} />
      </div>

      {/* 
          CAPA 2: EL VELO DE PROFUNDIDAD
          En modo oscuro, añadimos un degradado negro para dar profundidad técnica.
      */}
      {currentTheme === 'dark' && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />
      )}

      {/* Capa de grano sutil para estética industrial (opcional) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}