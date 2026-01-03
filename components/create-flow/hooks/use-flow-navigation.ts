// components/create-flow/hooks/use-flow-navigation.ts
// VERSIÓN: 1.5 (Master Navigation Engine - Loading State Awareness)

import { useState, useCallback, useMemo } from "react";
import { FlowState } from "../shared/types";
import { MASTER_FLOW_PATHS } from "../shared/config";

interface UseFlowNavigationProps {
  currentPurpose: string;
}

export function useFlowNavigation({ currentPurpose }: UseFlowNavigationProps) {
  const [currentFlowState, setCurrentFlowState] = useState<FlowState>('SELECTING_PURPOSE');
  const [history, setHistory] = useState<FlowState[]>(['SELECTING_PURPOSE']);

  const getMasterPath = useCallback((): FlowState[] => {
    return MASTER_FLOW_PATHS[currentPurpose] || MASTER_FLOW_PATHS.learn;
  }, [currentPurpose]);

  const activePath = useMemo(() => getMasterPath(), [getMasterPath]);

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

  const syncNavigation = useCallback((state: FlowState, newHistory: FlowState[]) => {
    setCurrentFlowState(state);
    setHistory(newHistory);
  }, []);

  const progressMetrics = useMemo(() => {
    // Excluimos estados técnicos de la cuenta total para no confundir al usuario
    const visibleSteps = activePath.filter(s => s !== 'SELECTING_PURPOSE' && s !== 'DRAFT_GENERATION_LOADER');
    
    // Si estamos en el loader, visualmente seguimos en el paso previo (DETAILS_STEP)
    const effectiveState = currentFlowState === 'DRAFT_GENERATION_LOADER' ? 'DETAILS_STEP' : currentFlowState;
    const currentIndex = (visibleSteps as string[]).indexOf(effectiveState);
    
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
    transitionTo,
    goBack,
    syncNavigation,
    progressMetrics,
    activePath,
    getMasterPath 
  };
}