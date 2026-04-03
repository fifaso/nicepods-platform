/**
 * ARCHIVO: hooks/geo-engine/telemetry-core.tsx
 * VERSIÓN: 1.2 (NicePod V3.0 - Sovereign Telemetry & Handshake T0 Fix)
 * PROTOCOLO: MADRID RESONANCE V3.0
 * 
 * Misión: Gestionar la ubicación física del Voyager purificando la telemetría 
 * y garantizando la integridad del contrato de datos inicial (Geo-IP).
 * [FIX V1.2]: Resolución de error de compilación TS2330 mediante la inclusión 
 * de la propiedad 'city' en el contrato de InitialData.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
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
const EMISSION_THRESHOLD_METERS = 0.8;    
const TELEPORT_THRESHOLD_METERS = 100.0;  
const SOVEREIGN_ACCURACY_THRESHOLD = 30;  

/**
 * INTERFAZ: TelemetryCoreReturn
 * La firma pública que expone el núcleo de hardware a la Fachada.
 */
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

/**
 * TelemetryProvider: El Reactor de Ubicación Primario.
 */
export function TelemetryProvider({ 
  children, 
  initialData 
}: { 
  children: React.ReactNode, 
  /**
   * initialData: Datos provenientes del Middleware (Geo-IP) para el arranque T0.
   * [FIX V1.2]: Se añade 'city' para cumplir con el contrato de useSensorAuthority.
   */
  initialData?: { 
    lat: number; 
    lng: number; 
    city: string; 
    source: string; 
  } | null 
}) {
  
  // 1. CONSUMO DEL CENTINELA DE HARDWARE
  const {
    telemetry: rawTelemetry,
    isDenied,
    isIgnited,
    startHardwareWatch,
    killHardwareWatch,
    reSync
  } = useSensorAuthority({ initialData });

  // 2. ESTADO SOBERANO DE UBICACIÓN
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isTriangulated, setIsTriangulated] = useState<boolean>(!!initialData);
  const [manualAnchor, setManualAnchorState] = useState<UserLocation | null>(null);

  // 3. MEMORIA TÁCTICA (Refs para protección de re-renders)
  const lastEmittedLocationReference = useRef<UserLocation | null>(null);
  const isSovereignLockReference = useRef<boolean>(false);

  /**
   * EFECTO: FILTRADO DE AUTORIDAD Y EMISIÓN
   * Misión: Decidir si la lectura entrante es válida para la Malla de Madrid.
   */
  useEffect(() => {
    const effectiveLocation = manualAnchor || rawTelemetry;

    if (effectiveLocation) {
      const currentSource = (effectiveLocation.source as TelemetrySource) || 'ip-fallback';
      const currentAccuracy = effectiveLocation.accuracy || 9999;

      /**
       * PROTOCOLO DE SOBERANÍA (V3.0):
       * Si el GPS ha alcanzado un bloqueo HD, blindamos el sistema contra 
       * retrocesos accidentales a la ubicación por IP.
       */
      if (isSovereignLockReference.current && currentSource === 'ip-fallback') {
        return;
      }

      if (currentSource === 'gps' && currentAccuracy < SOVEREIGN_ACCURACY_THRESHOLD) {
        if (!isSovereignLockReference.current) {
          nicepodLog("🛡️ [TelemetryCore] GPS Sovereign Lock: ACTIVADO.");
          isSovereignLockReference.current = true;
        }
      }

      let shouldEmitLocation = false;

      if (!lastEmittedLocationReference.current) {
        shouldEmitLocation = true;
      } else {
        const movementDistance = calculateDistance(
          { latitude: effectiveLocation.latitude, longitude: effectiveLocation.longitude },
          { latitude: lastEmittedLocationReference.current.latitude, longitude: lastEmittedLocationReference.current.longitude }
        );

        const headingDifference = Math.abs((effectiveLocation.heading || 0) - (lastEmittedLocationReference.current.heading || 0));

        // Filtro de Teletransporte: Emisión inmediata si el salto es > 100m
        const isHardJump = movementDistance > TELEPORT_THRESHOLD_METERS;

        /**
         * CONDICIONES DE EMISIÓN DISCRETA (CPU Shield):
         * Solo notificamos a la UI si hay un cambio físico real o cambio de fuente.
         */
        if (
          movementDistance > EMISSION_THRESHOLD_METERS || 
          headingDifference > 1.5 || 
          currentSource !== lastEmittedLocationReference.current.source ||
          isHardJump
        ) {
          shouldEmitLocation = true;
        }
      }

      if (shouldEmitLocation) {
        setUserLocation(effectiveLocation);
        lastEmittedLocationReference.current = effectiveLocation;
        
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
      isSovereignLockReference.current = false;
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
 * Consumo único de la verdad física del silicio.
 */
export const useGeoTelemetry = () => {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error("CRITICAL_ERROR: useGeoTelemetry invocado fuera de su TelemetryProvider.");
  }
  return context;
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (V1.2):
 * 1. Contract Alignment: La inclusión de 'city' en el objeto initialData asegura 
 *    la compatibilidad atómica con el Handshake T0 de Vercel.
 * 2. Reference Integrity: Se corrigió el acceso a lastEmittedLocationReference.current, 
 *    eliminando el error de compilación en el seguimiento de historial.
 * 3. Zero Abbreviations: Se ha purgado el código de términos cortos para garantizar 
 *    la transparencia técnica del motor V3.0.
 */