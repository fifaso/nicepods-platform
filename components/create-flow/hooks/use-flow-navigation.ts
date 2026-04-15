/**
 * ARCHIVO: components/create-flow/hooks/use-flow-navigation.ts
 * VERSIÓN: 3.0 (NicePod Master Navigation - FSM Industrial Synchronization)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Gobernar la Máquina de Estados Finitos (FSM) que guía al Voyager a través 
 * de la malla de creación, gestionando el historial de navegación y la telemetría.
 * [REFORMA V3.0]: Resolución definitiva de TS2322 y TS2678. Sincronización nominal 
 * absoluta con 'FlowState' V4.0. Aplicación integral de la Zero Abbreviations 
 * Policy (ZAP) y Build Shield Sovereignty.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { useCallback, useMemo, useState } from "react";
import { MASTER_FLOW_PATHS } from "../shared/config";
import { FlowState } from "../shared/types";
import { nicepodLog } from "@/lib/utils";

/**
 * INTERFAZ: UseFlowNavigationProperties
 */
interface UseFlowNavigationProperties {
  currentMissionPurposeIdentification: string;
}

/**
 * useFlowNavigation: El motor de propulsión de estados de la terminal NicePod.
 */
export function useFlowNavigation({ 
  currentMissionPurposeIdentification 
}: UseFlowNavigationProperties) {
  
  // I. ESTADO DE POSICIONAMIENTO EN LA MALLA
  const [currentFlowStateDescriptor, setCurrentFlowStateDescriptor] = useState<FlowState>('SELECTING_PURPOSE');

  // II. HISTORIAL TÁCTICO: Stack de navegación para el protocolo de retroceso
  const [navigationHistoryStack, setNavigationHistoryStack] = useState<FlowState[]>(['SELECTING_PURPOSE']);

  /**
   * activeMasterFlowPathCollection:
   * Misión: Recuperar la genealogía de pasos específica para la intención actual.
   * [SINCRO V3.0]: Mapeo de compatibilidad para intenciones semánticas.
   */
  const activeMasterFlowPathCollection = useMemo((): FlowState[] => {
    const purposeIdentification = currentMissionPurposeIdentification === 'answer' 
      ? 'pulse' 
      : currentMissionPurposeIdentification;
      
    return MASTER_FLOW_PATHS[purposeIdentification] || MASTER_FLOW_PATHS.learn;
  }, [currentMissionPurposeIdentification]);

  /**
   * transitionToNextStateAction:
   * Misión: Mover al Voyager a una nueva fase técnica y registrarla en el Metal.
   */
  const transitionToNextStateAction = useCallback((targetState: FlowState) => {
    nicepodLog(`🛰️ [Navigation] Transición de fase detectada: ${targetState}`);
    setNavigationHistoryStack((previousHistoryStack) => [...previousHistoryStack, targetState]);
    setCurrentFlowStateDescriptor(targetState);
  }, []);

  /**
   * jumpToStepAction:
   * Misión: Realizar un salto atómico en el flujo (Rehidratación de Bóveda).
   * Reconstruye la genealogía previa para asegurar la integridad del retroceso.
   */
  const jumpToStepAction = useCallback((targetState: FlowState) => {
    const activePath = MASTER_FLOW_PATHS[currentMissionPurposeIdentification] || MASTER_FLOW_PATHS.learn;
    const targetPhaseIndexMagnitude = activePath.indexOf(targetState);

    if (targetPhaseIndexMagnitude !== -1) {
      nicepodLog(`⚡ [Navigation] Salto atómico ejecutado hacia: ${targetState}`);
      // Reconstrucción atómica del historial: [Inicio ... Objetivo]
      const syntheticHistoryStack = activePath.slice(0, targetPhaseIndexMagnitude + 1);
      setNavigationHistoryStack(syntheticHistoryStack);
      setCurrentFlowStateDescriptor(targetState);
    }
  }, [currentMissionPurposeIdentification]);

  /**
   * navigateBackAction:
   * Misión: Retroceder un paso en el historial y sincronizar el hardware visual.
   */
  const navigateBackAction = useCallback(() => {
    setNavigationHistoryStack((previousHistoryStack) => {
      if (previousHistoryStack.length <= 1) return previousHistoryStack;
      
      const updatedHistoryStack = [...previousHistoryStack];
      updatedHistoryStack.pop();
      
      const previousStateDescriptor = updatedHistoryStack[updatedHistoryStack.length - 1];
      setCurrentFlowStateDescriptor(previousStateDescriptor);
      
      nicepodLog(`🔙 [Navigation] Retroceso a fase: ${previousStateDescriptor}`);
      return updatedHistoryStack;
    });
  }, []);

  /**
   * creationProcessProgressMetrics:
   * Misión: Calcular la magnitud de avance porcentual para el HUD de la terminal.
   * [SINCRO V3.0]: Resolución de TS2322 mediante el uso de estados purificados.
   */
  const creationProcessProgressMetrics = useMemo(() => {
    // 1. Filtro de fase: Excluimos estados de carga del cálculo de avance percibido.
    const nonProgressStatesCollection: FlowState[] = [
      'SELECTING_PURPOSE',
      'DRAFT_GENERATION_LOADER',
      'LOCAL_ANALYSIS_LOADER'
    ];

    const visibleStepsCollection = activeMasterFlowPathCollection.filter(
      (flowState) => !nonProgressStatesCollection.includes(flowState)
    );

    /**
     * effectiveOperationalStateDescriptor: 
     * Misión: Mantener el progreso visual durante las transiciones asíncronas.
     * [RESOLUCIÓN TS2322]: Alineación con descriptores industriales V12.0.
     */
    let effectiveOperationalStateDescriptor: FlowState = currentFlowStateDescriptor;
    
    if (currentFlowStateDescriptor === 'DRAFT_GENERATION_LOADER') {
      effectiveOperationalStateDescriptor = 'TECHNICAL_DETAILS_STEP';
    }
    if (currentFlowStateDescriptor === 'LOCAL_ANALYSIS_LOADER') {
      effectiveOperationalStateDescriptor = 'LOCAL_DISCOVERY_STEP';
    }

    const currentStepIndexMagnitude = visibleStepsCollection.indexOf(effectiveOperationalStateDescriptor);

    return {
      currentStepMagnitude: currentStepIndexMagnitude !== -1 ? currentStepIndexMagnitude + 1 : 1,
      totalStepsMagnitude: visibleStepsCollection.length,
      completionPercentageValue: currentStepIndexMagnitude !== -1
        ? Math.round(((currentStepIndexMagnitude + 1) / visibleStepsCollection.length) * 100)
        : 0,
      isInitialPhaseStatus: currentFlowStateDescriptor === 'SELECTING_PURPOSE'
    };
  }, [currentFlowStateDescriptor, activeMasterFlowPathCollection]);

  return {
    currentFlowState: currentFlowStateDescriptor,
    history: navigationHistoryStack,
    activePath: activeMasterFlowPathCollection,
    transitionTo: transitionToNextStateAction,
    jumpToStep: jumpToStepAction,
    goBack: navigateBackAction,
    progressMetrics: creationProcessProgressMetrics
  };
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Zero Abbreviations Policy (ZAP): Purga absoluta de términos. 'id' -> 'identification', 
 *    'prev' -> 'previousHistoryStack', 'step' -> 'magnitude', 's' -> 'flowState'.
 * 2. TS2322 Resolution: Se han sustituido los literales 'DETAILS_STEP' por los 
 *    nombres industriales correctos definidos en 'shared/types.ts'.
 * 3. BSS Sovereignty: El motor de navegación ahora garantiza que el estado actual 
 *    siempre pertenezca al conjunto de estados válidos de 'FlowState'.
 */