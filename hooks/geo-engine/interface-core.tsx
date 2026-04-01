/**
 * ARCHIVO: hooks/geo-engine/interface-core.tsx
 * VERSIÓN: 1.0 (NicePod V3.0 - Triple-Core Architecture)
 * Misión: Mantener la soberanía de los comandos de usuario (UI) sin ser afectado por red o GPS.
 */

"use client";

import { nicepodLog } from "@/lib/utils";
import { CameraPerspective } from "@/types/geo-sovereignty";
import React, { createContext, useCallback, useContext, useState } from "react";

interface InterfaceCoreReturn {
  cameraPerspective: CameraPerspective;
  isManualMode: boolean;
  recenterTrigger: number;
  needsBallisticLanding: boolean;

  togglePerspective: () => void;
  setManualMode: (active: boolean) => void;
  triggerRecenter: () => void;
  triggerLanding: () => void;
  confirmLanding: () => void;
  resetInterface: () => void;
}

const InterfaceContext = createContext<InterfaceCoreReturn | undefined>(undefined);

export function InterfaceProvider({ children }: { children: React.ReactNode }) {
  const [cameraPerspective, setCameraPerspective] = useState<CameraPerspective>('OVERVIEW');
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const [recenterTrigger, setRecenterTrigger] = useState<number>(0);
  const [needsBallisticLanding, setNeedsBallisticLanding] = useState<boolean>(false);

  const togglePerspective = useCallback(() => {
    setCameraPerspective(prev => prev === 'STREET' ? 'OVERVIEW' : 'STREET');
    setRecenterTrigger(prev => prev + 1);
  }, []);

  const triggerRecenter = useCallback(() => {
    nicepodLog("🎯 [InterfaceCore] Recentrado Soberano disparado.");
    setIsManualMode(false);
    setRecenterTrigger(prev => prev + 1);
    setNeedsBallisticLanding(true);
  }, []);

  const resetInterface = useCallback(() => {
    setCameraPerspective('OVERVIEW');
    setIsManualMode(false);
    setRecenterTrigger(0);
    setNeedsBallisticLanding(false);
  }, []);

  const api: InterfaceCoreReturn = {
    cameraPerspective,
    isManualMode,
    recenterTrigger,
    needsBallisticLanding,
    togglePerspective,
    setManualMode: (active) => { if (active !== isManualMode) setIsManualMode(active); },
    triggerRecenter,
    triggerLanding: () => setNeedsBallisticLanding(true),
    confirmLanding: () => setNeedsBallisticLanding(false),
    resetInterface
  };

  return <InterfaceContext.Provider value={api}>{children}</InterfaceContext.Provider>;
}

export const useGeoInterface = () => {
  const ctx = useContext(InterfaceContext);
  if (!ctx) throw new Error("useGeoInterface debe usarse dentro de InterfaceProvider");
  return ctx;
};