// hooks/use-debounce.ts
"use client";

import { useEffect, useState } from "react";

/**
 * Hook personalizado para retrasar la actualización de un valor.
 * Útil para evitar llamadas excesivas a APIs o Storage mientras el usuario escribe.
 * 
 * @param value El valor a observar
 * @param delay El retraso en milisegundos (default: 500ms)
 * @returns El valor "retrasado"
 */
export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Configurar el timer para actualizar el valor después del delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay || 500);

    // Limpiar el timer si el valor cambia antes de que termine el tiempo
    // (Esto es lo que logra el efecto de "cancelación" si sigues escribiendo)
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}