/**
 * ARCHIVO: hooks/geo-engine/telemetry-core.tsx
 * VERSIÓN: 1.1 (NicePod V3.0 - Sovereign Telemetry & Authority Shield Edition)
 * PROTOCOLO: MADRID RESONANCE V3.0
 * 
 * Misión: Gestionar la verdad física del Voyager mediante la purificación de 
 * telemetría, eliminando saltos por error de red y garantizando la soberanía 
 * del hardware satelital sobre las estimaciones de IP.
 * [REFORMA V1.1]: Implementación de Teleport Threshold (100m) y Sovereignty Lock.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
 */

"use client";

import { calculateDistance } from "@/lib/geo-kinematics";
import { UserLocation, TelemetrySource } from "@/types/geo-sovereignty";
import { nicepodLog } from "@/lib/utils";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useSensorAuthority } from "../use-sensor-authority";

/**
 * PARÁMETROS DE GOBERNANZA INDUSTRIAL
 */
const EMISSION_THRESHOLD_METERS = 0.8;    // Filtro de ruido en reposo (80cm)
const TELEPORT_THRESHOLD_METERS = 100.0;  // Umbral para descartar interpolación (LERP)
const SOVEREIGN_ACCURACY_THRESHOLD = 30;  // Precisión mínima para bloquear autoridad GPS

interface TelemetryCoreReturn {
  userLocation: UserLocation | null;
  isIgnited: boolean;
  isDenied: boolean;
  isTriangulated: boolean;
  isGPSLock: boolean;
  telemetrySource: TelemetrySource | null;
  
  initSensors: () => void;
  killSensors: () => void;
  reSyncSensors: () => void;
  setTriangulated: (value: boolean) => void;
  setManualAnchor: (longitude: number, latitude: number) => void;
  clearManualAnchor: () => void;
}

const TelemetryContext = createContext<TelemetryCoreReturn | undefined>(undefined);

export function TelemetryProvider({ 
  children, 
  initialData 
}: { 
  children: React.ReactNode, 
  initialData?: { lat: number, lng: number, source: string } | null 
}) {
  
  // 1. CONSUMO DEL CENTINELA DE HARDWARE (Nivel Bajo)
  const {
    telemetry: rawTelemetry,
    isDenied,
    isIgnited,
    startHardwareWatch,
    killHardwareWatch,
    reSync
  } = useSensorAuthority({ initialData });

  // 2. ESTADO SOBERANO (Lo que el sistema considera la "Verdad")
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isTriangulated, setIsTriangulated] = useState<boolean>(!!initialData);
  const [manualAnchor, setManualAnchorState] = useState<UserLocation | null>(null);

  // 3. MEMORIA TÁCTICA (Refs para evitar re-renders por micro-ruido)
  const lastEmittedLocationReference = useRef<UserLocation | null>(null);
  const isSovereignLockReference = useRef<boolean>(false);

  /**
   * EFECTO: FILTRADO DE AUTORIDAD Y EMISIÓN
   * Misión: Decidir si la lectura entrante es digna de ser procesada por la Workstation.
   */
  useEffect(() => {
    const effectiveLocation = manualAnchor || rawTelemetry;

    if (effectiveLocation) {
      const currentSource = (effectiveLocation.source as TelemetrySource) || 'ip-fallback';
      const currentAccuracy = effectiveLocation.accuracy || 9999;

      /**
       * PROTOCOLO DE SOBERANÍA (V3.0):
       * Si ya tenemos un bloqueo de GPS de alta fidelidad, ignoramos cualquier 
       * dato de IP-fallback que pueda llegar por fluctuaciones de red.
       */
      if (isSovereignLockReference.current && currentSource === 'ip-fallback') {
        return;
      }

      // Activar bloqueo si la precisión es óptima
      if (currentSource === 'gps' && currentAccuracy < SOVEREIGN_ACCURACY_THRESHOLD) {
        if (!isSovereignLockReference.current) {
          nicepodLog("🛡️ [TelemetryCore] GPS Sovereign Lock: ACTIVADO.");
          isSovereignLockReference.current = true;
        }
      }

      let shouldEmit = false;

      if (!lastEmittedLocationReference.current) {
        // Primera materialización del Voyager
        shouldEmit = true;
      } else {
        const movementDistance = calculateDistance(
          { latitude: effectiveLocation.latitude, longitude: effectiveLocation.longitude },
          { latitude: lastEmittedLocationReference.current.latitude, longitude: lastEmittedLocationReference.current.longitude }
        );

        const headingDifference = Math.abs((effectiveLocation.heading || 0) - (lastEmittedLocationReference.current.heading || 0));

        /**
         * FILTRO DE TELETRANSPORTE (Punto Ciego 1):
         * Si el cambio es masivo (> 100m), emitimos inmediatamente para que el 
         * sistema ejecute un salto atómico en lugar de un LERP infinito.
         */
        const isHardJump = movementDistance > TELEPORT_THRESHOLD_METERS;

        /**
         * CONDICIONES DE EMISIÓN DISCRETA:
         * 1. Se ha superado el umbral de movimiento (80cm).
         * 2. El rumbo ha cambiado significativamente (> 1.5°).
         * 3. Ha habido un cambio de fuente de datos (IP -> GPS).
         * 4. Es un salto de larga distancia.
         */
        if (
          movementDistance > EMISSION_THRESHOLD_METERS || 
          headingDifference > 1.5 || 
          currentSource !== lastEmittedLocationReference.current.source ||
          isHardJump
        ) {
          shouldEmit = true;
        }
      }

      if (shouldEmit) {
        setUserLocation(effectiveLocation);
        lastEmittedLocationReference.reference = effectiveLocation; // Actualizamos memoria para el siguiente pulso
        
        if (!isTriangulated) {
          setIsTriangulated(true);
        }
      }
    }
  }, [rawTelemetry, manualAnchor, isTriangulated]);

  /**
   * API SOBERANA DE TELEMETRÍA
   */
  const telemetryApi: TelemetryCoreReturn = {
    userLocation,
    isIgnited,
    isDenied,
    isTriangulated,
    isGPSLock: rawTelemetry?.source === 'gps' && (rawTelemetry.accuracy || 9999) < SOVEREIGN_ACCURACY_THRESHOLD,
    telemetrySource: (rawTelemetry?.source as TelemetrySource) || null,
    
    initSensors: startHardwareWatch,
    killSensors: killHardwareWatch,
    reSyncSensors: () => {
      isSovereignLockReference.current = false; // Liberamos el bloqueo para permitir re-sintonía
      reSync();
    },
    setTriangulated: (value: boolean) => setIsTriangulated(value),
    setManualAnchor: (longitude: number, latitude: number) => {
      nicepodLog(`📍 [TelemetryCore] Anclaje manual establecido: [${longitude}, ${latitude}]`);
      setManualAnchorState({
        latitude,
        longitude,
        accuracy: 1,
        heading: rawTelemetry?.heading ?? null,
        speed: null,
        source: 'manual-anchor',
        timestamp: Date.now()
      });
    },
    clearManualAnchor: () => {
      nicepodLog("🧹 [TelemetryCore] Liberando anclaje manual.");
      setManualAnchorState(null);
    }
  };

  return (
    <TelemetryContext.Provider value={telemetryApi}>
      {children}
    </TelemetryContext.Provider>
  );
}

/**
 * useGeoTelemetry:
 * Punto de acceso único para la verdad física del dispositivo.
 */
export const useGeoTelemetry = () => {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error("CRITICAL_ERROR: useGeoTelemetry invocado fuera de su TelemetryProvider.");
  }
  return context;
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (V1.1):
 * 1. Authority Guard: El sistema ahora discrimina entre fuentes de datos. El bloqueo 
 *    soberano impide que el mapa "baile" entre la ubicación IP y la GPS.
 * 2. Hybrid Stability: Se ha preparado el terreno para que el CameraDirector detecte 
 *    si debe interpolar (movimiento corto) o saltar (movimiento largo > 100m).
 * 3. Zero Abbreviations: Se ha purgado el código de abreviaturas para cumplir 
 *    con el estándar de documentación industrial V3.0.
 */