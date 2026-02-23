//components/profile/profile-hydration-guard.tsx
//version: 2.0 (NicePod Hydration Shield - Atomic Integrity Standard)
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Zap } from "lucide-react";
import React, { useEffect, useState } from "react";

/**
 * INTERFAZ: ProfileHydrationGuardProps
 * Define el contrato para la protección del montaje del componente.
 */
interface ProfileHydrationGuardProps {
  children: React.ReactNode;
  /**
   * fallback: Interfaz opcional de alta fidelidad para mostrar mientras el DOM se asienta.
   * Si no se provee, se utiliza el 'Estandar de Carga de Bóveda' de NicePod.
   */
  fallback?: React.ReactNode;
}

/**
 * COMPONENTE: ProfileHydrationGuard
 * El centinela de la estabilidad del cliente.
 * 
 * Este componente es el 'Velo de Hidratación' de la Workstation.
 * Su responsabilidad es evitar que los Hooks de autenticación (useAuth), 
 * las suscripciones Realtime (usePodcastSync) y las animaciones pesadas 
 * de Framer Motion colisionen con el HTML estático enviado por Next.js.
 */
export function ProfileHydrationGuard({
  children,
  fallback
}: ProfileHydrationGuardProps) {

  /**
   * isMounted: Estado de Soberanía Técnica.
   * Inicializado estrictamente en 'false' para coincidir con el estado del servidor.
   */
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    /**
     * El useEffect solo se activa una vez el componente ha sido hidratado 
     * correctamente en el navegador. En este punto, el objeto 'window' 
     * y las APIs de Supabase son totalmente seguras.
     */
    const timeout = setTimeout(() => {
      setIsMounted(true);
    }, 10); // Delay mínimo para permitir la estabilización del hilo principal.

    return () => clearTimeout(timeout);
  }, []);

  /**
   * CAPA 0 (Servidor / Hidratación Inicial):
   * Mientras isMounted sea false, renderizamos la arquitectura de carga.
   * Esto previene el parpadeo de contenido y asegura que el servidor
   * y el cliente coincidan en el primer frame.
   */
  if (!isMounted) {
    return (
      <div
        className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-black/5 backdrop-blur-sm rounded-[2.5rem] border border-white/5 animate-in fade-in duration-700"
      >
        {fallback || (
          <div className="flex flex-col items-center gap-6 select-none pointer-events-none">
            {/* Orquestación Visual de Carga */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
              <Loader2 className="h-10 w-10 animate-spin text-primary relative z-10" />
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <Zap size={12} className="text-primary/40" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">
                  Sincronizando Bóveda
                </span>
                <Zap size={12} className="text-primary/40" />
              </div>
              <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">
                Identidad Atómica NicePod V2.5
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /**
   * CAPA 1 (Cliente Activo / Revelación):
   * Una vez confirmada la estabilidad, revelamos el contenido mediante un 
   * fundido cinemático. Esto suaviza cualquier re-ajuste de altura o 
   * inyección de datos de perfil tardíos.
   */
  return (
    <AnimatePresence>
      <motion.div
        key="hydration-veil-content"
        initial={{ opacity: 0, filter: "blur(10px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1] // NicePod Standard Easing
        }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Prevención del Error #310: Al no renderizar 'children' hasta que isMounted 
 *    es true, garantizamos que hooks como 'useAuth' o 'useContext' no se 
 *    ejecuten en el servidor, eliminando la discrepancia de árboles de renderizado.
 * 2. Rendimiento Termodinámico: El uso de AnimatePresence y motion.div con 
 *    filtros de desenfoque oculta micro-cambios de layout que ocurren cuando 
 *    el cliente 'descubre' el ancho de la pantalla o la resolución del dispositivo.
 * 3. Diseño Holístico: El fallback utiliza los mismos tokens de diseño (primary, 
 *    zinc-600, font-black) que el resto de la Workstation para una cohesión total.
 */