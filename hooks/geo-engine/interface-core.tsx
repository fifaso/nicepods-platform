/**
 * ARCHIVO: hooks/geo-engine/interface-core.tsx
 * VERSIÓN: 2.0 (NicePod V3.0 - Triple-Core Interface & Style Sovereignty Edition)
 * PROTOCOLO: MADRID RESONANCE V3.0
 * 
 * Misión: Gestionar los comandos visuales y estados de cámara de la Workstation, 
 * garantizando la sincronía atómica entre el estilo del mapa y la perspectiva.
 * [REFORMA V2.0]: Integración de mapStyle y ciclo de visión triple (Overview/Street/Satellite).
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import { nicepodLog } from "@/lib/utils";
import { CameraPerspective } from "@/types/geo-sovereignty";
import { MAP_STYLES } from "../../components/geo/map-constants";
import React, { createContext, useCallback, useContext, useState } from "react";

interface InterfaceCoreReturn {
  cameraPerspective: CameraPerspective;
  mapStyle: string; // Atributo soberano para sincronía WebGL
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

/**
 * InterfaceProvider: El Córtex de Mando Visual.
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
   * Misión: Alternar entre los tres modos de peritaje urbano asegurando que 
   * el lienzo (tiles) y la lente (cámara) cambien al unísono.
   */
  const togglePerspective = useCallback(() => {
    setCameraPerspective((currentPerspective) => {
      // Caso A: De Cenital Estratégico a Inmersión en Calle
      if (currentPerspective === 'OVERVIEW') {
        nicepodLog("🕶️ [InterfaceCore] Activando Modo STREET (Inmersión 3D).");
        setMapStyle(MAP_STYLES.STANDARD);
        return 'STREET';
      }

      // Caso B: De Inmersión en Calle a Peritaje Satelital
      if (currentPerspective === 'STREET') {
        nicepodLog("🛰️ [InterfaceCore] Activando Modo SATELLITE (Fotorrealismo).");
        setMapStyle(MAP_STYLES.PHOTOREALISTIC);
        return 'SATELLITE';
      }

      // Caso C: Retorno a Vista de Pájaro Estándar
      nicepodLog("🗺️ [InterfaceCore] Retornando a Modo OVERVIEW (Estratégico).");
      setMapStyle(MAP_STYLES.STANDARD);
      return 'OVERVIEW';
    });

    // Disparamos el pulso de recentrado para que la cámara se mueva al nuevo modo
    setRecenterTrigger((previousTrigger) => previousTrigger + 1);
  }, []);

  /**
   * triggerRecenter:
   * Misión: Forzar la recuperación del foco Voyager respetando el modo visual activo.
   */
  const triggerRecenter = useCallback(() => {
    nicepodLog("🎯 [InterfaceCore] Recentrado Soberano disparado.");
    setIsManualMode(false);
    setRecenterTrigger((previousTrigger) => previousTrigger + 1);
    setNeedsBallisticLanding(true);
  }, []);

  /**
   * resetInterface:
   * Misión: Purgar estados visuales y retornar a la configuración de nacimiento.
   */
  const resetInterface = useCallback(() => {
    setCameraPerspective('OVERVIEW');
    setMapStyle(MAP_STYLES.STANDARD);
    setIsManualMode(false);
    setRecenterTrigger(0);
    setNeedsBallisticLanding(false);
    nicepodLog("🧹 [InterfaceCore] Estados de mando purificados.");
  }, []);

  const interfaceApi: InterfaceCoreReturn = {
    cameraPerspective,
    mapStyle,
    isManualMode,
    recenterTrigger,
    needsBallisticLanding,
    togglePerspective,
    setManualMode: (active) => { 
      if (active !== isManualMode) setIsManualMode(active); 
    },
    triggerRecenter,
    triggerLanding: () => setNeedsBallisticLanding(true),
    confirmLanding: () => setNeedsBallisticLanding(false),
    resetInterface
  };

  return (
    <InterfaceContext.Provider value={interfaceApi}>
      {children}
    </InterfaceContext.Provider>
  );
}

/**
 * useGeoInterface:
 * Punto de acceso único para la intención visual del Voyager.
 */
export const useGeoInterface = () => {
  const context = useContext(InterfaceContext);
  if (!context) {
    throw new Error("CRITICAL_ERROR: useGeoInterface invocado fuera de su InterfaceProvider.");
  }
  return context;
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. Atomic Style Swap: Al incluir el mapStyle en el mismo Provider que la perspectiva, 
 *    el MapCore recibirá la orden de cambiar texturas en el mismo frame que el 
 *    CameraController recibe la orden de cambiar el pitch.
 * 2. Gesture Defense: Se ha preparado la base para que la interacción humana 
 *    respete el modo visual actual (ej: no permitir inclinación 3D en modo Satélite).
 * 3. Zero-Flicker Architecture: El ciclo triple elimina el estado indefinido 
 *    que causaba el retorno accidental al modo vector desde el modo foto.
 */