// components/create-flow/shared/context.tsx
// VERSIÓN: 3.0 (Madrid Resonance - Full Contract Export & Narrative Sync)
// Misión: Orquestador de estado y tipos para los flujos de creación IA.

"use client";

import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useFlowNavigation } from "../hooks/use-flow-navigation";
import { CreationContextType } from "./types";

/**
 * [INTERFAZ DE EXPORTACIÓN]: NarrativeOption
 * [FIX]: Se exporta este tipo para resolver el error ts(2305) 
 * en el paso de selección de narrativa.
 */
export interface NarrativeOption {
  title: string;
  thesis: string;
}

/**
 * CreationContext
 * Punto de unión para el estado de navegación y metadatos de creación.
 * Se inicializa como undefined para forzar el uso del Provider en el árbol.
 */
export const CreationContext = createContext<CreationContextType | undefined>(undefined);

/**
 * CreationProvider
 * Componente orquestador que envuelve el flujo de creación.
 * Centraliza la lógica de navegación para los flujos:
 * Pulse, Local Soul, Learn, Explore y Reflect.
 */
export function CreationProvider({ children }: { children: React.ReactNode }) {
  const { watch, setValue } = useFormContext<PodcastCreationData>();

  // Observamos el propósito actual para que el motor de navegación sepa qué mapa usar
  const currentPurpose = watch("purpose");

  // 1. INICIALIZACIÓN DEL SISTEMA NERVIOSO (NAVEGACIÓN)
  const navigation = useFlowNavigation({ currentPurpose });

  // 2. ESTADOS DE PROCESAMIENTO ASÍNCRONO
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  /**
   * updateFormData
   * Sincroniza datos externos (como el draft_id de las Edge Functions) 
   * con el store de React Hook Form de forma segura.
   */
  const updateFormData = useCallback((data: Partial<PodcastCreationData>) => {
    Object.entries(data).forEach(([key, value]) => {
      setValue(key as any, value, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
    });
  }, [setValue]);

  /**
   * contextValue
   * [FIX]: Sincronización explícita con la interfaz CreationContextType.
   */
  const contextValue: CreationContextType = useMemo(() => ({
    // Propiedades de Navegación
    currentFlowState: navigation.currentFlowState,
    history: navigation.history,
    transitionTo: navigation.transitionTo,
    jumpToStep: navigation.jumpToStep,
    goBack: navigation.goBack,

    // [RESOLUCIÓN ERROR ts2741]: Mapeo de la función de ruta maestra
    getMasterPath: () => navigation.activePath,

    // Métricas de progreso para el Header
    progressMetrics: navigation.progressMetrics,

    // Estados de Procesamiento
    isGeneratingScript,
    setIsGeneratingScript,

    // Utilidades de Datos
    updateFormData,
  }), [navigation, isGeneratingScript, updateFormData]);

  return (
    <CreationContext.Provider value={contextValue}>
      {children}
    </CreationContext.Provider>
  );
}

/**
 * useCreationContext
 * Hook de acceso seguro para todos los sub-componentes del flujo.
 * Implementa una guardia de arquitectura Senior para prevenir usos huérfanos.
 */
export const useCreationContext = () => {
  const context = useContext(CreationContext);

  if (context === undefined) {
    throw new Error(
      "CRITICAL ARCHITECTURE ERROR: useCreationContext debe ser utilizado dentro de un CreationProvider. " +
      "Asegúrese de que el componente raíz del flujo (index.tsx) envuelva al StepRenderer."
    );
  }

  return context;
};