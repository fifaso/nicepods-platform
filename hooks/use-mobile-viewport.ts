"use client";

import { useState, useEffect, RefObject } from "react";

export function useMobileViewport(containerRef: RefObject<HTMLElement>) {
  const [height, setHeight] = useState<number | string>('100%');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      if (window.visualViewport && containerRef.current) {
        // Obtenemos la posición superior del contenedor para restar ese espacio
        const offsetTop = containerRef.current.getBoundingClientRect().top;
        // Calculamos el espacio visible real disponible
        // Math.max(0, ...) evita valores negativos en rebotes de scroll
        const availableHeight = window.visualViewport.height - Math.max(0, offsetTop);
        
        setHeight(`${availableHeight}px`);
      }
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('scroll', handleResize);
    window.addEventListener('resize', handleResize);
    
    // Invocación inicial
    handleResize();

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, [containerRef]);

  return height;
}