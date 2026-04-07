/**
 * ARCHIVO: components/profile/profile-hydration-guard.tsx
 * VERSIÓN: 3.0 (NicePod Hydration Shield - Atomic Integrity Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Centinela de estabilidad que previene colisiones entre el renderizado 
 * del servidor y las capacidades dinámicas del cliente (Auth/Realtime).
 * [REFORMA V3.0]: Cumplimiento absoluto de la Zero Abbreviations Policy y 
 * optimización del ciclo de revelación.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Zap } from "lucide-react";
import React, { useEffect, useState } from "react";

/**
 * INTERFAZ: ProfileHydrationGuardProperties
 */
interface ProfileHydrationGuardProperties {
  children: React.ReactNode;
  /** fallback: Interfaz de transición mientras el DOM alcanza soberanía técnica. */
  fallbackInterface?: React.ReactNode;
}

/**
 * ProfileHydrationGuard: El velo de seguridad para el montaje de componentes.
 */
export function ProfileHydrationGuard({
  children,
  fallbackInterface
}: ProfileHydrationGuardProperties) {

  // --- ESTADO DE SOBERANÍA TÉCNICA ---
  const [isComponentHydrated, setIsComponentHydrated] = useState<boolean>(false);

  useEffect(() => {
    /**
     * Misión: Confirmar la estabilidad del hilo principal antes de activar 
     * los componentes dependientes del navegador.
     */
    const hydrationStabilizationTimeout = setTimeout(() => {
      setIsComponentHydrated(true);
    }, 10);

    return () => clearTimeout(hydrationStabilizationTimeout);
  }, []);

  /**
   * CAPA 0 (Estado Síncrono / Servidor):
   * Renderizamos la arquitectura de carga industrial para evitar parpadeos visuales.
   */
  if (!isComponentHydrated) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-black/5 backdrop-blur-sm rounded-[3rem] border border-white/5 animate-in fade-in duration-700">
        {fallbackInterface || (
          <div className="flex flex-col items-center gap-6 select-none pointer-events-none">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
              <Loader2 className="h-10 w-10 text-primary animate-spin relative z-10" />
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <Zap size={12} className="text-primary/40" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">
                  Sincronizando Bóveda
                </span>
                <Zap size={12} className="text-primary/40" />
              </div>
              <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-[0.3em]">
                Identidad Atómica NicePod V4.0
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /**
   * CAPA 1 (Estado Activo / Cliente):
   * Revelación mediante fundido cinemático bajo el estándar de la Workstation.
   */
  return (
    <AnimatePresence>
      <motion.div
        key="hydration-sovereignty-content"
        initial={{ opacity: 0, filter: "blur(10px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1]
        }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}