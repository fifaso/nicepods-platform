// components/create-flow/shared/context.tsx
// VERSIÓN: 1.0 (Safe Communication Tunnel)

"use client";

import { createContext, useContext } from "react";
import { CreationContextType } from "./types";

/**
 * CreationContext
 * Se inicializa como undefined para forzar el uso de un Provider 
 * y detectar errores de arquitectura en desarrollo.
 */
export const CreationContext = createContext<CreationContextType | undefined>(undefined);

/**
 * useCreationContext
 * Hook personalizado de nivel Senior con validación de existencia.
 * Todos los sub-componentes (steps) consumirán este hook.
 */
export const useCreationContext = () => {
  const context = useContext(CreationContext);
  
  if (context === undefined) {
    throw new Error(
      "CRITICAL ARCHITECTURE ERROR: useCreationContext debe ser utilizado dentro de un CreationFormProvider. " +
      "Verifique que el componente step-renderer esté envuelto correctamente."
    );
  }
  
  return context;
};