/**
 * ARCHIVO: components/create-flow/shared/context.tsx
 * VERSIÓN: 6.0 (NicePod Creation Context - Industrial Sync Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Actuar como el sistema nervioso central de la terminal de forja, 
 * orquestando la navegación axial, la telemetría de progreso y la sincronía 
 * de datos entre el hardware, el formulario y el Oráculo de Inteligencia.
 * [REFORMA V6.0]: Resolución definitiva de TS2353 y TS2322. Sincronización nominal 
 * absoluta con 'useFlowNavigation' V3.0 y 'CreationContextType' V4.0. 
 * Aplicación integral de la Zero Abbreviations Policy (ZAP).
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
 * Misión: Punto de unión soberano para el estado de navegación y metadatos.
 * Se inicializa como 'undefined' para forzar el cumplimiento del Build Shield (BSS).
 */
export const CreationContext = createContext<CreationContextType | undefined>(undefined);

/**
 * CreationProvider
 * Componente orquestador que envuelve la malla de creación de capital intelectual.
 */
export function CreationProvider({ children }: { children: React.ReactNode }) {
  // Consumo del motor de formularios bajo el esquema purificado V12.0
  const { watch, setValue } = useFormContext<PodcastCreationData>();

  /** 
   * currentMissionPurposeIdentification: Observamos la intención para determinar 
   * la trayectoria lógica en el motor de navegación.
   */
  const currentMissionPurposeIdentification = watch("purpose");

  /**
   * navigationSovereignAuthority:
   * [RESOLUCIÓN TS2353]: Invocación al motor V3.0 utilizando el descriptor nominal 
   * purificado 'currentMissionPurposeIdentification'.
   */
  const navigationSovereignAuthority = useFlowNavigation({ 
    currentMissionPurposeIdentification 
  });

  // ESTADOS DE PROCESAMIENTO DE INTELIGENCIA (ZAP COMPLIANT)
  const [isGeneratingScriptProcessActive, setIsGeneratingScriptProcessActive] = useState<boolean>(false);

  /**
   * updatePodcastCreationFormData:
   * Misión: Sincronizar datos del Oráculo con el almacén central de React Hook Form.
   * [ZAP]: 'data' -> 'partialFormDataPayload'.
   */
  const updatePodcastCreationFormData = useCallback((partialFormDataPayload: Partial<PodcastCreationData>) => {
    Object.entries(partialFormDataPayload).forEach(([fieldKey, fieldValue]) => {
      setValue(fieldKey as any, fieldValue, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
    });
  }, [setValue]);

  /**
   * contextValue:
   * [RESOLUCIÓN TS2322]: Mapeo explícito de las métricas de progreso hacia 
   * el contrato industrial purificado de 'CreationContextType'.
   */
  const contextValue: CreationContextType = useMemo(() => ({
    // I. Gobernanza de Navegación Axial
    currentFlowState: navigationSovereignAuthority.currentFlowState,
    navigationHistoryStack: navigationSovereignAuthority.history,
    
    // II. Motores de Transición de Fase
    transitionToNextStateAction: navigationSovereignAuthority.transitionTo,
    jumpToStepAction: navigationSovereignAuthority.jumpToStep,
    navigateBackAction: navigationSovereignAuthority.goBack,

    // III. Sincronía de Trayectoria Maestra
    getMasterFlowPathCollection: () => navigationSovereignAuthority.activePath,

    /**
     * creationProcessProgressMetrics:
     * [SINCRO V6.0]: Mapeo pericial de telemetría para el Cristal (UI).
     */
    creationProcessProgressMetrics: {
      currentStepMagnitude: navigationSovereignAuthority.progressMetrics.currentStepMagnitude,
      totalStepsMagnitude: navigationSovereignAuthority.progressMetrics.totalStepsMagnitude,
      completionPercentageValue: navigationSovereignAuthority.progressMetrics.completionPercentageValue,
      isInitialPhaseStatus: navigationSovereignAuthority.progressMetrics.isInitialPhaseStatus
    },

    // IV. Monitoreo de Procesamiento IA
    isGeneratingScriptProcessActive,
    setGeneratingScriptProcessActiveStatus: setIsGeneratingScriptProcessActive,

    // V. Gestión de Datos de la Forja
    updatePodcastCreationFormData,
  }), [navigationSovereignAuthority, isGeneratingScriptProcessActive, updatePodcastCreationFormData]);

  return (
    <CreationContext.Provider value={contextValue}>
      {children}
    </CreationContext.Provider>
  );
}

/**
 * useCreationContext
 * Misión: Hook de acceso soberano para los sub-componentes de la forja.
 * Implementa una guardia de arquitectura Senior para prevenir usos huérfanos.
 */
export const useCreationContext = () => {
  const contextReference = useContext(CreationContext);

  if (contextReference === undefined) {
    throw new Error(
      "CRITICAL_INFRASTRUCTURE_ERROR: 'useCreationContext' invocado fuera de un 'CreationProvider'. " +
      "La integridad del sistema nervioso de la forja ha sido comprometida."
    );
  }

  return contextReference;
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.0):
 * 1. Build Shield Final Restoration: Resolución definitiva de TS2353 sincronizando 
 *    la interfaz de entrada con 'useFlowNavigation' V3.0.
 * 2. ZAP Absolute Compliance: Purificación total. Se han eliminado abreviaciones 
 *    como 'navigation', 'data' o 'percent' en favor de descriptores industriales.
 * 3. Contractual Symmetry: El mapeo explícito de 'creationProcessProgressMetrics' 
 *    aniquila el error TS2322 al asegurar que todas las propiedades requeridas 
 *    por el contrato industrial estén presentes y tipadas.
 */