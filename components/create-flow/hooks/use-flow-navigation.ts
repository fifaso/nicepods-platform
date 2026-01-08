// components/create-flow/hooks/use-flow-navigation.ts
// VERSIÓN: 1.6 (Master Navigation - Deep Linking & History Injection)

import { useState, useCallback, useMemo } from "react";
import { FlowState } from "../shared/types";
import { MASTER_FLOW_PATHS } from "../shared/config";

interface UseFlowNavigationProps {
  currentPurpose: string;
}

export function useFlowNavigation({ currentPurpose }: UseFlowNavigationProps) {
  const [currentFlowState, setCurrentFlowState] = useState<FlowState>('SELECTING_PURPOSE');
  const [history, setHistory] = useState<FlowState[]>(['SELECTING_PURPOSE']);

  const activePath = useMemo(() => {
    return MASTER_FLOW_PATHS[currentPurpose] || MASTER_FLOW_PATHS.learn;
  }, [currentPurpose]);

  const transitionTo = useCallback((state: FlowState) => {
    setHistory((prev) => [...prev, state]);
    setCurrentFlowState(state);
  }, []);

  /**
   * [NUEVO]: jumpToStep
   * Permite saltar a un paso avanzado (ej: SCRIPT_EDITING) 
   * reconstruyendo el historial previo para que el botón "ATRÁS" no se rompa.
   */
  const jumpToStep = useCallback((targetState: FlowState) => {
    const path = MASTER_FLOW_PATHS[currentPurpose] || MASTER_FLOW_PATHS.learn;
    const targetIndex = path.indexOf(targetState);

    if (targetIndex !== -1) {
      // Creamos un historial sintético con todos los pasos anteriores al objetivo
      const syntheticHistory = path.slice(0, targetIndex + 1);
      setHistory(syntheticHistory);
      setCurrentFlowState(targetState);
    }
  }, [currentPurpose]);

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

  const progressMetrics = useMemo(() => {
    const steps = activePath.filter(s => s !== 'SELECTING_PURPOSE' && s !== 'DRAFT_GENERATION_LOADER');
    const effectiveState = currentFlowState === 'DRAFT_GENERATION_LOADER' ? 'DETAILS_STEP' : currentFlowState;
    const currentIndex = (steps as string[]).indexOf(effectiveState);

    return {
      step: currentIndex !== -1 ? currentIndex + 1 : 1,
      total: steps.length,
      percent: currentIndex !== -1 ? Math.round(((currentIndex + 1) / steps.length) * 100) : 0,
      isInitial: currentFlowState === 'SELECTING_PURPOSE'
    };
  }, [currentFlowState, activePath]);

  return {
    currentFlowState,
    history,
    transitionTo,
    jumpToStep, // <--- Exportación vital para hidratación
    goBack,
    progressMetrics,
    activePath
  };
}