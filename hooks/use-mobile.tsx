// hooks/use-mobile.ts
// VERSIÓN DE PRODUCCIÓN FINAL: Robusta para SSR y optimizada.

"use client";

import { useState, useEffect, useCallback } from 'react';

const MOBILE_BREAKPOINT = 768; // Punto de corte estándar para 'md' en Tailwind

export function useMobile(breakpoint: number = MOBILE_BREAKPOINT): boolean {
  // Inicializar en 'false' en el servidor para evitar errores de hidratación.
  // El valor real se determinará en el cliente.
  const [isMobile, setIsMobile] = useState(false);

  const checkScreenSize = useCallback(() => {
    // La comprobación solo se hace si 'window' está disponible (en el cliente).
    setIsMobile(typeof window !== 'undefined' && window.innerWidth < breakpoint);
  }, [breakpoint]);

  useEffect(() => {
    // Ejecutar la comprobación una vez que el componente se monta en el cliente.
    checkScreenSize();
    
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, [checkScreenSize]);

  return isMobile;
}