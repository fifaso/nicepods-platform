// components/profile/profile-hydration-guard.tsx
// VERSIÓN: 1.0 (NicePod Hydration Shield - Zero-Flicker Standard)
// Misión: Prevenir discrepancias de hidratación y el Error de React #310.
// [ESTABILIZACIÓN]: Implementación de Velo de Hidratación para sincronía servidor-cliente.

"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";

/**
 * INTERFAZ: ProfileHydrationGuardProps
 * Define los elementos necesarios para proteger el montaje del componente.
 */
interface ProfileHydrationGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode; // UI opcional a mostrar mientras se estabiliza el DOM
}

/**
 * ProfileHydrationGuard: El centinela de la estabilidad del cliente.
 * 
 * Este componente es vital en el perfil del curador para evitar que 
 * los hooks de autenticación y las animaciones pesadas se disparen 
 * antes de que el navegador haya asentado el HTML del servidor.
 */
export function ProfileHydrationGuard({
  children,
  fallback
}: ProfileHydrationGuardProps) {

  /**
   * isMounted: Estado soberano que confirma la interactividad del cliente.
   * Inicializado en 'false' para coincidir estrictamente con el estado del servidor.
   */
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    /**
     * El useEffect solo se ejecuta en el cliente tras el montaje inicial.
     * Al cambiar el estado a 'true', liberamos el contenido real.
     */
    setIsMounted(true);
  }, []);

  /**
   * RENDERIZADO POR CAPAS:
   * 
   * CAPA 0 (Servidor/Hidratación Inicial): 
   * Renderizamos el fallback (un esqueleto o spinner) de forma estática.
   */
  if (!isMounted) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center animate-in fade-in duration-500">
        {fallback || (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary/20" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10">
              Sincronizando Bóveda
            </span>
          </div>
        )}
      </div>
    );
  }

  /**
   * CAPA 1 (Cliente Activo):
   * Revelamos el contenido real mediante un fundido cinemático.
   * Esto oculta cualquier micro-ajuste de layout que Next.js realice al hidratar.
   */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}

/**
 * NOTA TÉCNICA PARA EL DESPLIEGUE:
 * El uso de este componente es obligatorio en las rutas /profile para 
 * envolver tanto al 'PrivateProfileDashboard' como al 'PublicProfilePage'. 
 * Al garantizar que los Hooks internos de esos componentes (como useAuth) 
 * solo se evalúen cuando isMounted es true, eliminamos la posibilidad 
 * de que React encuentre un orden de hooks diferente entre SSR y Cliente.
 */