/**
 * ARCHIVO: hooks/geo-engine/telemetry-core.tsx
 * VERSIÓN: 1.0 (NicePod V3.0 - Triple-Core Architecture)
 * Misión: Gestionar la ubicación física aislando el ruido sensorial (Emission Throttling).
 */

"use client";

import { calculateDistance } from "@/lib/geo-kinematics";
import { UserLocation } from "@/types/geo-sovereignty";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSensorAuthority } from "../use-sensor-authority";

const EMISSION_THRESHOLD_METERS = 0.8; // Umbral de Emisión UI: 80cm (Filtro de Jitter)
const GPS_LOCK_THRESHOLD = 80;         // Precisión satelital

interface TelemetryCoreReturn {
  userLocation: UserLocation | null;
  isIgnited: boolean;
  isDenied: boolean;
  isTriangulated: boolean;
  isGPSLock: boolean;
  telemetrySource: string | null;
  initSensors: () => void;
  killSensors: () => void;
  reSyncSensors: () => void;
  setTriangulated: (val: boolean) => void;
  setManualAnchor: (lng: number, lat: number) => void;
  clearManualAnchor: () => void;
}

const TelemetryContext = createContext<TelemetryCoreReturn | undefined>(undefined);

export function TelemetryProvider({ children, initialData }: { children: React.ReactNode, initialData?: any }) {
  const {
    telemetry,
    isDenied,
    isIgnited,
    startHardwareWatch,
    killHardwareWatch,
    reSync
  } = useSensorAuthority({ initialData });

  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isTriangulated, setIsTriangulated] = useState<boolean>(!!initialData);
  const [manualAnchor, setManualAnchorState] = useState<UserLocation | null>(null);

  const lastEmittedRef = useRef<UserLocation | null>(null);
  const effectiveLocation = manualAnchor || telemetry;

  useEffect(() => {
    if (effectiveLocation) {
      const currentSource = effectiveLocation.source || 'unknown';
      let shouldEmit = false;

      if (!lastEmittedRef.current) {
        shouldEmit = true;
      } else {
        const movementDelta = calculateDistance(
          { latitude: effectiveLocation.latitude, longitude: effectiveLocation.longitude },
          { latitude: lastEmittedRef.current.latitude, longitude: lastEmittedRef.current.longitude }
        );
        const headingDelta = Math.abs((effectiveLocation.heading || 0) - (lastEmittedRef.current.heading || 0));

        // Emisión discreta: Solo actualizar si se movió 80cm, giró 1.5° o cambió el origen (ej: IP -> GPS)
        if (movementDelta > EMISSION_THRESHOLD_METERS || headingDelta > 1.5 || currentSource !== lastEmittedRef.current.source) {
          shouldEmit = true;
        }
      }

      if (shouldEmit) {
        setUserLocation(effectiveLocation);
        lastEmittedRef.current = effectiveLocation;
        if (!isTriangulated) setIsTriangulated(true);
      }
    }
  }, [effectiveLocation, isTriangulated]);

  const api: TelemetryCoreReturn = {
    userLocation,
    isIgnited,
    isDenied,
    isTriangulated,
    isGPSLock: telemetry?.source === 'gps' && (telemetry.accuracy || 9999) < GPS_LOCK_THRESHOLD,
    telemetrySource: telemetry?.source || null,
    initSensors: startHardwareWatch,
    killSensors: killHardwareWatch,
    reSyncSensors: reSync,
    setTriangulated: (val) => setIsTriangulated(val),
    setManualAnchor: (lng, lat) => setManualAnchorState({
      latitude: lat, longitude: lng, accuracy: 1,
      heading: telemetry?.heading ?? null, speed: null,
      source: 'gps', timestamp: Date.now()
    }),
    clearManualAnchor: () => setManualAnchorState(null)
  };

  return <TelemetryContext.Provider value={api}>{children}</TelemetryContext.Provider>;
}

export const useGeoTelemetry = () => {
  const ctx = useContext(TelemetryContext);
  if (!ctx) throw new Error("useGeoTelemetry debe usarse dentro de TelemetryProvider");
  return ctx;
};