/**
 * ARCHIVO: hooks/geo-engine/interface-core.tsx
 * VERSIÓN: 4.1 (NicePod Sovereign Interface - Imperative Command Protocol Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Gestionar los comandos visuales y estados de cámara, actuando como el 
 * centro de despacho de órdenes tácticas para el reactor visual de la Workstation.
 * [REFORMA V4.1]: Implementación del 'Imperative Command Protocol'. Se introduce 
 * la emisión de eventos nativos para despertar al CameraController sin latencia 
 * de React. Resolución del fallo de 'botón inerte'. Purificación nominal total (ZAP).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { nicepodLog } from "@/lib/utils";
import { CameraPerspective } from "@/types/geo-sovereignty";
import { MAP_STYLES } from "../../components/geo/map-constants";
import React, { createContext, useCallback, useContext, useState } from "react";

/**
 * CONSTANTE: GEODETIC_CAMERA_COMMAND_EVENT_NAME
 * Nombre del canal de eventos para la comunicación directa Interfaz -> Cámara.
 */
export const GEODETIC_CAMERA_COMMAND_EVENT_NAME = "nicepod_geodetic_camera_command";

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
   * dispatchImperativeCameraCommand:
   * Misión: Emitir una orden física al bus del navegador para despertar al motor de cámara.
   * [MTI]: Bypass de React para comunicación de latencia cero.
   */
  const dispatchImperativeCameraCommand = useCallback((commandIdentification: string) => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(GEODETIC_CAMERA_COMMAND_EVENT_NAME, { 
      detail: { command: commandIdentification } 
    }));
  }, []);

  /**
   * triggerRecenter:
   * Misión: Ordenar a la cámara que capture la posición del Voyager.
   */
  const triggerRecenter = useCallback(() => {
    nicepodLog("🎯 [InterfaceCore] Recentrado Balístico disparado.");
    setIsManualModeActive(false);
    setRecenterTriggerPulse((previousPulseValue) => previousPulseValue + 1);
    setNeedsBallisticLanding(true);

    // [SINCRO V4.1]: Pulso imperativo para aniquilar la estasis del controlador.
    dispatchImperativeCameraCommand("RECENTER_COMMAND");
  }, [dispatchImperativeCameraCommand]);

  /**
   * togglePerspective:
   * Misión: Ciclar y forzar la nueva perspectiva visual.
   */
  const togglePerspective = useCallback(() => {
    let nextPerspectiveValue: CameraPerspective;

    setCameraPerspectiveState((currentPerspective) => {
      if (currentPerspective === 'OVERVIEW') {
        nicepodLog("🕶️ [InterfaceCore] Activando Modo STREET (Inmersión 3D).");
        setActiveMapStyle(MAP_STYLES.STANDARD);
        nextPerspectiveValue = 'STREET';
      } else if (currentPerspective === 'STREET') {
        nicepodLog("🛰️ [InterfaceCore] Activando Modo SATELLITE (Fotorrealismo).");
        setActiveMapStyle(MAP_STYLES.PHOTOREALISTIC);
        nextPerspectiveValue = 'SATELLITE';
      } else {
        nicepodLog("🗺️ [InterfaceCore] Retornando a Modo OVERVIEW (Estratégico).");
        setActiveMapStyle(MAP_STYLES.STANDARD);
        nextPerspectiveValue = 'OVERVIEW';
      }

      // [SINCRO V4.1]: Emitimos el comando de cambio de perspectiva al bus de datos.
      dispatchImperativeCameraCommand(`PERSPECTIVE_CHANGE:${nextPerspectiveValue}`);
      
      return nextPerspectiveValue;
    });

    setRecenterTriggerPulse((previousPulseValue) => previousPulseValue + 1);
  }, [dispatchImperativeCameraCommand]);

  /**
   * executeUnifiedCommandAction:
   * Misión: Cerebro lógico del botón único de ubicación.
   */
  const executeUnifiedCommandAction = useCallback(() => {
    if (isManualModeActive) {
      triggerRecenter();
    } else {
      togglePerspective();
    }
  }, [isManualModeActive, triggerRecenter, togglePerspective]);

  /**
   * resetInterface:
   * Misión: Purga absoluta de estados visuales.
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
    setManualMode: (isActiveValue) => { 
      if (isActiveValue !== isManualModeActive) setIsManualModeActive(isActiveValue); 
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

export const useGeoInterface = () => {
  const contextReference = useContext(InterfaceContext);
  return contextReference || PASSIVE_INDUSTRIAL_INTERFACE_STATE;
};