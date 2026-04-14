/**
 * ARCHIVO: hooks/geo-engine/interface-core.tsx
 * VERSIÓN: 4.0 (NicePod Sovereign Interface - Contextual Command & Cinematic Stability Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Gestionar los comandos visuales, estados de cámara y estilos WebGL, 
 * actuando como la capa de decisión para la cinemática inmersiva de la Workstation.
 * [REFORMA V4.0]: Implementación del 'Unified Command Protocol'. El motor ahora 
 * prioriza el recentrado geodésico sobre el cambio de perspectiva si detecta 
 * autoridad manual activa. Purificación total bajo la Zero Abbreviations 
 * Policy (ZAP) e inmunización de contexto industrial.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { nicepodLog } from "@/lib/utils";
import { CameraPerspective } from "@/types/geo-sovereignty";
import { MAP_STYLES } from "../../components/geo/map-constants";
import React, { createContext, useCallback, useContext, useState } from "react";

/**
 * INTERFAZ: InterfaceCoreReturn
 * Misión: Definir la firma pública del comando visual soberano.
 */
interface InterfaceCoreReturn {
  cameraPerspective: CameraPerspective;
  activeMapStyle: string; 
  isManualModeActive: boolean;
  recenterTriggerPulse: number;
  needsBallisticLanding: boolean;

  /** executeUnifiedCommandAction: El actuador inteligente para el botón de ubicación. */
  executeUnifiedCommandAction: () => void;
  
  togglePerspective: () => void;
  setManualMode: (isActive: boolean) => void;
  triggerRecenter: () => void;
  triggerLanding: () => void;
  confirmLanding: () => void;
  resetInterface: () => void;
}

/**
 * PASSIVE_INDUSTRIAL_INTERFACE_STATE:
 * Estado inerte para rutas sin reactor visual (Marketing/Dashboard estático).
 */
const PASSIVE_INDUSTRIAL_INTERFACE_STATE: InterfaceCoreReturn = {
  cameraPerspective: 'OVERVIEW',
  activeMapStyle: MAP_STYLES.STANDARD,
  isManualModeActive: false,
  recenterTriggerPulse: 0,
  needsBallisticLanding: false,
  executeUnifiedCommandAction: () => {},
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
 * Misión: Orquestar la voluntad visual y cinemática de la terminal.
 */
export function InterfaceProvider({ children }: { children: React.ReactNode }) {
  
  // --- I. ESTADOS DE VISUALIZACIÓN SOBERANA (CRYSTAL LAYER) ---
  const [cameraPerspective, setCameraPerspectiveState] = useState<CameraPerspective>('OVERVIEW');
  const [activeMapStyle, setActiveMapStyle] = useState<string>(MAP_STYLES.STANDARD);
  
  // --- II. ESTADOS DE CONTROL CINEMÁTICO (KINETIC LAYER) ---
  const [isManualModeActive, setIsManualModeActive] = useState<boolean>(false);
  const [recenterTriggerPulse, setRecenterTriggerPulse] = useState<number>(0);
  const [needsBallisticLanding, setNeedsBallisticLanding] = useState<boolean>(false);

  /**
   * triggerRecenter:
   * Misión: Emitir un pulso de autoridad para que la cámara capture al Voyager.
   */
  const triggerRecenter = useCallback(() => {
    nicepodLog("🎯 [InterfaceCore] Recentrado Balístico disparado.");
    setIsManualModeActive(false);
    setRecenterTriggerPulse((previousPulseValue) => previousPulseValue + 1);
    setNeedsBallisticLanding(true);
  }, []);

  /**
   * togglePerspective:
   * Misión: Ciclar entre los perfiles de visión industrial de la Workstation.
   */
  const togglePerspective = useCallback(() => {
    setCameraPerspectiveState((currentPerspective) => {
      if (currentPerspective === 'OVERVIEW') {
        nicepodLog("🕶️ [InterfaceCore] Activando Modo STREET (Inmersión 3D).");
        setActiveMapStyle(MAP_STYLES.STANDARD);
        return 'STREET';
      }

      if (currentPerspective === 'STREET') {
        nicepodLog("🛰️ [InterfaceCore] Activando Modo SATELLITE (Fotorrealismo).");
        setActiveMapStyle(MAP_STYLES.PHOTOREALISTIC);
        return 'SATELLITE';
      }

      nicepodLog("🗺️ [InterfaceCore] Retornando a Modo OVERVIEW (Estratégico).");
      setActiveMapStyle(MAP_STYLES.STANDARD);
      return 'OVERVIEW';
    });

    // Cada cambio de perspectiva requiere un pulso de re-sincronía de cámara.
    setRecenterTriggerPulse((previousPulseValue) => previousPulseValue + 1);
  }, []);

  /**
   * [SINCRO V4.0]: executeUnifiedCommandAction
   * Misión: El cerebro del botón único. Decide entre recentrar o cambiar de vista.
   * Resuelve el requerimiento de "Si no está centrado -> centrar. Si centrado -> cambiar vista".
   */
  const executeUnifiedCommandAction = useCallback(() => {
    if (isManualModeActive) {
      // Prioridad 1: Recuperar autoridad sobre el Voyager si el mapa fue movido manualmente.
      triggerRecenter();
    } else {
      // Prioridad 2: Si ya está centrado, procedemos al ciclo de inmersión.
      togglePerspective();
    }
  }, [isManualModeActive, triggerRecenter, togglePerspective]);

  /**
   * resetInterface:
   * Misión: Purga absoluta de estados visuales (Hardware Hygiene).
   */
  const resetInterface = useCallback(() => {
    setCameraPerspectiveState('OVERVIEW');
    setActiveMapStyle(MAP_STYLES.STANDARD);
    setIsManualModeActive(false);
    setRecenterTriggerPulse(0);
    setNeedsBallisticLanding(false);
    nicepodLog("🧹 [InterfaceCore] Memoria de mando purificada.");
  }, []);

  const interfaceApplicationProgrammingInterface: InterfaceCoreReturn = {
    cameraPerspective,
    activeMapStyle,
    isManualModeActive,
    recenterTriggerPulse,
    needsBallisticLanding,
    executeUnifiedCommandAction,
    togglePerspective,
    setManualMode: (isActive) => { 
      if (isActive !== isManualModeActive) setIsManualModeActive(isActive); 
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
 * Punto de acceso único para la voluntad visual de la terminal.
 */
export const useGeoInterface = () => {
  const contextReference = useContext(InterfaceContext);
  return contextReference || PASSIVE_INDUSTRIAL_INTERFACE_STATE;
};