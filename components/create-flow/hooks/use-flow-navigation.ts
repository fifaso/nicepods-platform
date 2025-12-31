// components/create-flow/hooks/use-flow-navigation.ts
// VERSIÓN: 1.3 (Master Navigation Hook - Atomic Progress Control)

import { useState, useCallback, useMemo } from "react";
import { FlowState } from "../shared/types";
import { MASTER_FLOW_PATHS } from "../shared/config";

interface UseFlowNavigationProps {
  currentPurpose: string;
}

export function useFlowNavigation({ currentPurpose }: UseFlowNavigationProps) {
  const [currentFlowState, setCurrentFlowState] = useState<FlowState>('SELECTING_PURPOSE');
  const [history, setHistory] = useState<FlowState[]>(['SELECTING_PURPOSE']);

  // Obtiene la ruta actual de forma segura
  const activePath = useMemo(() => {
    return MASTER_FLOW_PATHS[currentPurpose] || MASTER_FLOW_PATHS.learn;
  }, [currentPurpose]);

  const transitionTo = useCallback((state: FlowState) => {
    setHistory((prev) => [...prev, state]);
    setCurrentFlowState(state);
  }, []);

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
   * Calcula el avance real filtrando el portal de entrada.
   */
  const progressMetrics = useMemo(() => {
    const steps = activePath.filter(s => s !== 'SELECTING_PURPOSE');
    const currentIndex = (steps as string[]).indexOf(currentFlowState);
    
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
    goBack,
    progressMetrics,
    activePath
  };
}