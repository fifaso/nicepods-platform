// components/create-flow/hooks/use-flow-navigation.ts
// VERSIÓN: 2.0 (Master Navigation - Multi-Flow Logic & Async Progress Sync)

"use client";

import { useCallback, useMemo, useState } from "react";
import { MASTER_FLOW_PATHS } from "../shared/config";
import { FlowState } from "../shared/types";

interface UseFlowNavigationProps {
  currentPurpose: string;
}

/**
 * useFlowNavigation
 * El motor que gobierna el movimiento del usuario a través de la Malla de Creación.
 * Implementa una Máquina de Estados Finitos (FSM) con gestión de historial.
 */
export function useFlowNavigation({ currentPurpose }: UseFlowNavigationProps) {
  // Estado inicial: Siempre comenzamos en la selección de intención
  const [currentFlowState, setCurrentFlowState] = useState<FlowState>('SELECTING_PURPOSE');

  // Historial: Stack de navegación para el botón 'ATRÁS'
  const [history, setHistory] = useState<FlowState[]>(['SELECTING_PURPOSE']);

  /**
   * activePath
   * Recupera el mapa de ruta específico para la intención actual.
   * Fallback: 'learn' (Ruta por defecto del sistema).
   */
  const activePath = useMemo(() => {
    // [SISTEMA]: Mapeo de compatibilidad para flujos legacy
    const purpose = currentPurpose === 'answer' ? 'pulse' : currentPurpose;
    return MASTER_FLOW_PATHS[purpose] || MASTER_FLOW_PATHS.learn;
  }, [currentPurpose]);

  /**
   * transitionTo
   * Mueve al usuario a un nuevo estado y lo registra en el historial.
   */
  const transitionTo = useCallback((state: FlowState) => {
    setHistory((prev) => [...prev, state]);
    setCurrentFlowState(state);
  }, []);

  /**
   * jumpToStep
   * Realiza un salto cuántico en el flujo (usado para reanudar borradores).
   * Reconstruye el historial previo para asegurar que el botón 'ATRÁS' funcione.
   */
  const jumpToStep = useCallback((targetState: FlowState) => {
    const path = MASTER_FLOW_PATHS[currentPurpose] || MASTER_FLOW_PATHS.learn;
    const targetIndex = path.indexOf(targetState);

    if (targetIndex !== -1) {
      // Reconstrucción atómica del historial
      const syntheticHistory = path.slice(0, targetIndex + 1);
      setHistory(syntheticHistory);
      setCurrentFlowState(targetState);
    }
  }, [currentPurpose]);

  /**
   * goBack
   * Retrocede un paso en el historial y sincroniza el estado actual.
   */
  const goBack = useCallback(() => {
    setHistory((prev) => {
      if (prev.length <= 1) return prev;
      const newHistory = [...prev];
      newHistory.pop();
      const lastStep = newHistory[newHistory.length - 1];
      setCurrentFlowState(lastStep);
      return newHistory;
    });
  }, []);

  /**
   * progressMetrics
   * Calcula el estado de avance porcentual para la UI.
   * [ESTRATEGIA]: Filtra los estados de "Carga" para que el usuario perciba
   * el progreso solo en los pasos donde él tiene el control.
   */
  const progressMetrics = useMemo(() => {
    // 1. Definimos los hitos que cuentan para la barra de progreso
    const excludeFromProgress: FlowState[] = [
      'SELECTING_PURPOSE',
      'DRAFT_GENERATION_LOADER',
      'LOCAL_ANALYSIS_LOADER'
    ];

    const visibleSteps = activePath.filter(s => !excludeFromProgress.includes(s));

    // 2. Determinamos el estado efectivo para el cálculo
    // Si estamos en un loader, el progreso visual se mantiene en el paso anterior
    let effectiveState = currentFlowState;
    if (currentFlowState === 'DRAFT_GENERATION_LOADER') effectiveState = 'DETAILS_STEP';
    if (currentFlowState === 'LOCAL_ANALYSIS_LOADER') effectiveState = 'LOCAL_DISCOVERY_STEP';

    const currentIndex = visibleSteps.indexOf(effectiveState);

    // 3. Retorno de métricas para el Header
    return {
      step: currentIndex !== -1 ? currentIndex + 1 : 1,
      total: visibleSteps.length,
      percent: currentIndex !== -1
        ? Math.round(((currentIndex + 1) / visibleSteps.length) * 100)
        : 0,
      isInitial: currentFlowState === 'SELECTING_PURPOSE'
    };
  }, [currentFlowState, activePath]);

  return {
    currentFlowState,
    history,
    activePath,
    transitionTo,
    jumpToStep,
    goBack,
    progressMetrics
  };
}