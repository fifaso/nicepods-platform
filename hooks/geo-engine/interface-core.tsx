/**
 * ARCHIVO: hooks/geo-engine/interface-core.tsx
 * VERSIÓN: 3.0 (NicePod Sovereign Interface - Resilience & Passive State Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Gestionar los comandos visuales, estados de cámara y estilos WebGL.
 * [REFORMA V3.0]: Implementación de Inmunización de Contexto. El hook ya no lanza 
 * excepciones críticas ante la ausencia de su proveedor; en su lugar, activa 
 * el "Passive Industrial State" para permitir que la telemetría global fluya 
 * en rutas sin mapa (Marketing/Landing) sin colapsar el sistema.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { nicepodLog } from "@/lib/utils";
import { CameraPerspective } from "@/types/geo-sovereignty";
import { MAP_STYLES } from "../../components/geo/map-constants";
import React, { createContext, useCallback, useContext, useState } from "react";

/**
 * INTERFAZ: InterfaceCoreReturn
 * Misión: Definir la firma pública del comando visual.
 */
interface InterfaceCoreReturn {
  cameraPerspective: CameraPerspective;
  mapStyle: string; 
  isManualMode: boolean;
  recenterTrigger: number;
  needsBallisticLanding: boolean;

  togglePerspective: () => void;
  setManualMode: (isActive: boolean) => void;
  triggerRecenter: () => void;
  triggerLanding: () => void;
  confirmLanding: () => void;
  resetInterface: () => void;
}

/**
 * PASSIVE_INDUSTRIAL_INTERFACE_STATE:
 * Misión: Proveer un estado "No-Op" (Sin operación) para eludir el colapso del sistema.
 */
const PASSIVE_INDUSTRIAL_INTERFACE_STATE: InterfaceCoreReturn = {
  cameraPerspective: 'OVERVIEW',
  mapStyle: MAP_STYLES.STANDARD,
  isManualMode: false,
  recenterTrigger: 0,
  needsBallisticLanding: false,
  togglePerspective: () => {},
  setManualMode: () => {},
  triggerRecenter: () => {},
  triggerLanding: () => {},
  confirmLanding: () => {},
  resetInterface: () => {}
};

const InterfaceContext = createContext<InterfaceCoreReturn | undefined>(undefined);

/**
 * InterfaceProvider: El Córtex de Mando Visual.
 * Misión: Instanciar la voluntad visual para una terminal de mapa específica.
 */
export function InterfaceProvider({ children }: { children: React.ReactNode }) {
  // --- I. ESTADOS DE VISUALIZACIÓN SOBERANA ---
  const [cameraPerspective, setCameraPerspective] = useState<CameraPerspective>('OVERVIEW');
  const [mapStyle, setMapStyle] = useState<string>(MAP_STYLES.STANDARD);
  
  // --- II. ESTADOS DE CONTROL CINEMÁTICO ---
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const [recenterTrigger, setRecenterTrigger] = useState<number>(0);
  const [needsBallisticLanding, setNeedsBallisticLanding] = useState<boolean>(false);

  /**
   * togglePerspective: EL ALGORITMO DE CICLO SOBERANO
   */
  const togglePerspective = useCallback(() => {
    setCameraPerspective((currentPerspective) => {
      if (currentPerspective === 'OVERVIEW') {
        nicepodLog("🕶️ [InterfaceCore] Activando Modo STREET (Inmersión 3D).");
        setMapStyle(MAP_STYLES.STANDARD);
        return 'STREET';
      }

      if (currentPerspective === 'STREET') {
        nicepodLog("🛰️ [InterfaceCore] Activando Modo SATELLITE (Fotorrealismo).");
        setMapStyle(MAP_STYLES.PHOTOREALISTIC);
        return 'SATELLITE';
      }

      nicepodLog("🗺️ [InterfaceCore] Retornando a Modo OVERVIEW (Estratégico).");
      setMapStyle(MAP_STYLES.STANDARD);
      return 'OVERVIEW';
    });

    setRecenterTrigger((previousTriggerValue) => previousTriggerValue + 1);
  }, []);

  const triggerRecenter = useCallback(() => {
    nicepodLog("🎯 [InterfaceCore] Recentrado Soberano disparado.");
    setIsManualMode(false);
    setRecenterTrigger((previousTriggerValue) => previousTriggerValue + 1);
    setNeedsBallisticLanding(true);
  }, []);

  const resetInterface = useCallback(() => {
    setCameraPerspective('OVERVIEW');
    setMapStyle(MAP_STYLES.STANDARD);
    setIsManualMode(false);
    setRecenterTrigger(0);
    setNeedsBallisticLanding(false);
    nicepodLog("🧹 [InterfaceCore] Estados de mando visual purificados.");
  }, []);

  const interfaceApplicationProgrammingInterface: InterfaceCoreReturn = {
    cameraPerspective,
    mapStyle,
    isManualMode,
    recenterTrigger,
    needsBallisticLanding,
    togglePerspective,
    setManualMode: (isActive) => { 
      if (isActive !== isManualMode) setIsManualMode(isActive); 
    },
    triggerRecenter,
    triggerLanding: () => setNeedsBallisticLanding(true),
    confirmLanding: () => setNeedsBallisticLanding(false),
    resetInterface
  };

  return (
    <InterfaceContext.Provider value={interfaceApplicationProgrammingInterface}>
      {children}
    </InterfaceContext.Provider>
  );
}

/**
 * useGeoInterface:
 * Punto de consumo para la intención visual del Voyager.
 * [INMUNIZACIÓN V3.0]: Si el contexto es nulo, devuelve el estado pasivo industrial.
 */
export const useGeoInterface = () => {
  const contextReference = useContext(InterfaceContext);
  
  if (!contextReference) {
    // Retorno silencioso de estado inerte para prevenir el crash fatal reportado.
    return PASSIVE_INDUSTRIAL_INTERFACE_STATE;
  }
  
  return contextReference;
};