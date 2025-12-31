// components/create-flow/hooks/use-flow-navigation.ts
// VERSIÓN: 1.1 (Master Navigation - Added Path Resolver)

import { useState, useCallback, useMemo } from "react";
import { FlowState } from "../shared/types";
import { MASTER_FLOW_PATHS } from "../shared/config";

interface UseFlowNavigationProps {
  currentPurpose: string;
}

export function useFlowNavigation({ currentPurpose }: UseFlowNavigationProps) {
  const [currentFlowState, setCurrentFlowState] = useState<FlowState>('SELECTING_PURPOSE');
  const [history, setHistory] = useState<FlowState[]>(['SELECTING_PURPOSE']);

  const getMasterPath = useCallback(() => {
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

  const progressMetrics = useMemo(() => {
    const path = getMasterPath();
    const effectiveSteps = path.filter(s => s !== 'SELECTING_PURPOSE');
    const currentIndex = (effectiveSteps as string[]).indexOf(currentFlowState);
    const isInitial = currentFlowState === 'SELECTING_PURPOSE';

    return {
      step: currentIndex !== -1 ? currentIndex + 1 : 1,
      total: effectiveSteps.length,
      percent: currentIndex !== -1 ? Math.round(((currentIndex + 1) / effectiveSteps.length) * 100) : 0,
      isInitial
    };
  }, [currentFlowState, getMasterPath]);

  return {
    currentFlowState,
    history,
    transitionTo,
    goBack,
    progressMetrics,
    getMasterPath // <--- FIX IMAGEN 72
  };
}