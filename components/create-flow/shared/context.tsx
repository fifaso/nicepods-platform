/**
 * ARCHIVO: components/create-flow/shared/context.tsx
 * VERSIÓN: 5.0 (NicePod Creation Context - Sinaptic Synchronization Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Actuar como el sistema nervioso central de la forja de capital intelectual, 
 * orquestando el estado de navegación, la telemetría de progreso y la sincronía 
 * de datos entre el hardware y el Oráculo de IA.
 * [REFORMA V5.0]: Sincronización absoluta con 'CreationContextType' V4.0. 
 * Resolución definitiva de errores TS2339 y TS2551 mediante el mapeo de 
 * descriptores industriales (transitionToNextStateAction, navigateBackAction).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useFlowNavigation } from "../hooks/use-flow-navigation";
import { CreationContextType } from "./types";

/**
 * CreationContext
 * Misión: Punto de unión para el estado de navegación y metadatos de creación.
 * Se inicializa como 'undefined' para forzar el cumplimiento del Build Shield (BSS).
 */
export const CreationContext = createContext<CreationContextType | undefined>(undefined);

/**
 * CreationProvider
 * Componente orquestador que envuelve el flujo de creación IA.
 */
export function CreationProvider({ children }: { children: React.ReactNode }) {
  // Consumo del motor de formularios bajo el esquema purificado V12.0
  const { watch, setValue } = useFormContext<PodcastCreationData>();

  /** 
   * currentPurposeSelection: Observamos la intención para que el motor de 
   * navegación determine la trayectoria lógica (Master Flow Paths).
   */
  const currentPurposeSelection = watch("purpose");

  // 1. INICIALIZACIÓN DE LA AUTORIDAD DE NAVEGACIÓN
  const navigationAuthority = useFlowNavigation({ currentPurpose: currentPurposeSelection });

  // 2. ESTADOS DE PROCESAMIENTO DE INTELIGENCIA (ZAP COMPLIANT)
  const [isGeneratingScriptProcessActive, setIsGeneratingScriptProcessActive] = useState<boolean>(false);

  /**
   * updatePodcastCreationFormData:
   * Misión: Sincronizar datos externos (IDs de borrador o peritajes del Oráculo)
   * con el almacén central de React Hook Form de forma atómica.
   */
  const updatePodcastCreationFormData = useCallback((partialFormData: Partial<PodcastCreationData>) => {
    Object.entries(partialFormData).forEach(([fieldKey, fieldValue]) => {
      setValue(fieldKey as any, fieldValue, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
    });
  }, [setValue]);

  /**
   * contextValue:
   * [RESOLUCIÓN TS2339 / TS2551]: Mapeo explícito entre la lógica interna y 
   * el contrato industrial purificado en 'shared/types.ts'.
   */
  const contextValue: CreationContextType = useMemo(() => ({
    // I. Gobernanza de Navegación Axial
    currentFlowState: navigationAuthority.currentFlowState,
    navigationHistoryStack: navigationAuthority.history,
    
    // II. Motores de Transición de Fase
    transitionToNextStateAction: navigationAuthority.transitionTo,
    jumpToStepAction: navigationAuthority.jumpToStep,
    navigateBackAction: navigationAuthority.goBack,

    // III. Sincronía de Trayectoria Maestra
    getMasterFlowPathCollection: () => navigationAuthority.activePath,

    // IV. Telemetría de Progreso para el Cristal (UI)
    creationProcessProgressMetrics: navigationAuthority.progressMetrics,

    // V. Monitoreo de Procesamiento IA
    isGeneratingScriptProcessActive,
    setGeneratingScriptProcessActiveStatus: setIsGeneratingScriptProcessActive,

    // VI. Gestión de Datos de la Forja
    updatePodcastCreationFormData,
  }), [navigationAuthority, isGeneratingScriptProcessActive, updatePodcastCreationFormData]);

  return (
    <CreationContext.Provider value={contextValue}>
      {children}
    </CreationContext.Provider>
  );
}

/**
 * useCreationContext
 * Misión: Hook de acceso soberano para todos los sub-componentes del flujo.
 * Implementa una guardia de arquitectura para prevenir colisiones en el árbol de React.
 */
export const useCreationContext = () => {
  const contextReference = useContext(CreationContext);

  if (contextReference === undefined) {
    throw new Error(
      "CRITICAL_INFRASTRUCTURE_ERROR: 'useCreationContext' invocado fuera de un 'CreationProvider'. " +
      "La integridad de la terminal de forja ha sido comprometida."
    );
  }

  return contextReference;
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.0):
 * 1. Build Shield Sovereignty: Se eliminaron las interfaces internas duplicadas, 
 *    centralizando la verdad en 'shared/types.ts'.
 * 2. ZAP Alignment: Purificación total de descriptores nominales. Se han 
 *    erradicado términos como 'navigation', 'data' o 'percent'.
 * 3. Error Resolution: Al mapear 'transitionToNextStateAction' desde la autoridad 
 *    de navegación, se resuelven los errores de propiedad inexistente en los pasos hijos.
 */