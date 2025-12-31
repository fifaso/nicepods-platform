// components/create-flow/hooks/use-flow-navigation.ts
// VERSIÓN: 1.4 (Master Navigation Engine - Path Resolver & Progress Shield)

import { useState, useCallback, useMemo } from "react";
import { FlowState } from "../shared/types";
import { MASTER_FLOW_PATHS } from "../shared/config";

interface UseFlowNavigationProps {
  currentPurpose: string;
}

/**
 * useFlowNavigation
 * El "GPS Lógico" de NicePod. Gestiona el historial de navegación, 
 * el estado actual y la resolución de rutas dinámicas.
 */
export function useFlowNavigation({ currentPurpose }: UseFlowNavigationProps) {
  // --- ESTADOS DE RASTREO ---
  const [currentFlowState, setCurrentFlowState] = useState<FlowState>('SELECTING_PURPOSE');
  const [history, setHistory] = useState<FlowState[]>(['SELECTING_PURPOSE']);

  /**
   * getMasterPath
   * [FIX IMAGEN 72]: Resuelve el array de pasos para el propósito actual.
   * Centraliza el conocimiento de la ruta para el Orquestador y los Métricas.
   */
  const getMasterPath = useCallback((): FlowState[] => {
    return MASTER_FLOW_PATHS[currentPurpose] || MASTER_FLOW_PATHS.learn;
  }, [currentPurpose]);

  /**
   * activePath
   * Propiedad computada para acceso rápido desde el Orquestador.
   */
  const activePath = useMemo(() => getMasterPath(), [getMasterPath]);

  // --- ACCIONES DE MOVIMIENTO ---

  /**
   * Registra el avance a un nuevo estado en el historial.
   */
  const transitionTo = useCallback((state: FlowState) => {
    setHistory((prev) => [...prev, state]);
    setCurrentFlowState(state);
  }, []);

  /**
   * Gestiona el retroceso eliminando el último nodo del stack de navegación.
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
   * Sincronización forzada (Uso interno para recuperación de sesión).
   */
  const syncNavigation = useCallback((state: FlowState, newHistory: FlowState[]) => {
    setCurrentFlowState(state);
    setHistory(newHistory);
  }, []);

  // --- INTELIGENCIA VISUAL (MÉTRICAS) ---

  /**
   * progressMetrics
   * Calcula el porcentaje de completitud y el número de paso actual.
   * Filtra 'SELECTING_PURPOSE' para que la barra de progreso sea relevante al trabajo.
   */
  const progressMetrics = useMemo(() => {
    const steps = activePath.filter(s => s !== 'SELECTING_PURPOSE');
    const currentIndex = (steps as string[]).indexOf(currentFlowState);
    
    return {
      step: currentIndex !== -1 ? currentIndex + 1 : 1,
      total: steps.length,
      percent: currentIndex !== -1 
        ? Math.round(((currentIndex + 1) / steps.length) * 100) 
        : 0,
      isInitial: currentFlowState === 'SELECTING_PURPOSE'
    };
  }, [currentFlowState, activePath]);

  // --- CONTRATO DE SALIDA ---
  return {
    currentFlowState,
    history,
    transitionTo,
    goBack,
    syncNavigation,
    progressMetrics,
    activePath,
    getMasterPath // <--- EXPORTACIÓN CRÍTICA PARA RESOLVER ERROR TS(2339)
  };
}