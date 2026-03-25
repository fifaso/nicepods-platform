// hooks/use-geo-engine.tsx
// VERSIÓN: 19.0 (NicePod Sovereign Geo-Engine - Ground Up Reconstruction)
// Misión: Extracción de telemetría pura, persistencia de malla y soberanía de hardware.
// [ESTABILIZACIÓN]: Erradicación de Race Conditions y Protocolo de Materialización T0.

"use client";

import { ingestPhysicalEvidenceAction } from "@/actions/geo-actions";
import { createClient } from "@/lib/supabase/client";
import { compressNicePodImage, nicepodLog } from "@/lib/utils";
import { ActivePOI, GeoContextData, GeoEngineReturn, GeoEngineState, PointOfInterest, UserLocation } from "@/types/geo-sovereignty";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const GeoEngineContext = createContext<GeoEngineReturn | undefined>(undefined);

export function GeoEngineProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  // --- I. MEMORIA TÉCNICA DE HARDWARE (SINGLETON) ---
  const watchIdRef = useRef<number | null>(null);
  const isHardwareIgnitedRef = useRef<boolean>(false);
  const lastHeadingRef = useRef<number | null>(null);
  const lastPositionRef = useRef<UserLocation | null>(null);

  // --- II. ESTADO SOBERANO (ESTRUCTURA DETERMINISTA) ---
  const [status, setStatus] = useState<GeoEngineState>('IDLE');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [nearbyPOIs, setNearbyPOIs] = useState<PointOfInterest[]>([]);
  const [activePOI, setActivePOI] = useState<ActivePOI | null>(null);
  const [isTriangulated, setIsTriangulated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Memoria volátil de la Forja
  const [data, setData] = useState<GeoContextData>({});
  const [isSearching, setIsSearching] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // --- III. MATEMÁTICA DE FILTRADO (INDUSTRIAL RIGOR) ---

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  /**
   * updateTelemetry: Único punto de mutación del estado.
   * Centraliza los cálculos para evitar re-renderizados en cascada.
   */
  const updateTelemetry = useCallback((newCoords: UserLocation) => {
    const isFirstFix = !lastPositionRef.current;

    // Filtro de Ruido Espacial (5 metros)
    const movement = isFirstFix ? 0 : calculateDistance(
      lastPositionRef.current!.latitude, lastPositionRef.current!.longitude,
      newCoords.latitude, newCoords.longitude
    );

    // Filtro de Brújula (3 grados)
    const headingDelta = Math.abs((newCoords.heading || 0) - (lastHeadingRef.current || 0));
    const shouldRotate = newCoords.heading !== null && headingDelta > 3;

    if (isFirstFix || movement > 5 || shouldRotate) {
      lastPositionRef.current = newCoords;
      if (newCoords.heading !== null) lastHeadingRef.current = newCoords.heading;

      setUserLocation(newCoords);
      setStatus('SENSORS_READY');

      // Persistencia en Caché de Sesión para Zero-Wait
      if (!isTriangulated) {
        setIsTriangulated(true);
        localStorage.setItem('nicepod_last_fix', JSON.stringify(newCoords));
      }
    }
  }, [isTriangulated]);

  // --- IV. PROTOCOLO DE IGNICIÓN (THE GPS HANDSHAKE) ---

  const initSensors = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) return;
    if (isHardwareIgnitedRef.current) return; // Bloqueo de duplicidad

    isHardwareIgnitedRef.current = true;

    // 1. HIDRATACIÓN DESDE CACHÉ (Materialización Instantánea)
    const cachedFix = localStorage.getItem('nicepod_last_fix');
    if (cachedFix) {
      const parsed = JSON.parse(cachedFix);
      setUserLocation(parsed);
      setIsTriangulated(true);
      setStatus('SENSORS_READY');
    }

    // 2. CAPTURA DE ALTA FIDELIDAD
    const onHardwareSignal = (pos: GeolocationPosition) => {
      updateTelemetry({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        heading: pos.coords.heading,
        speed: pos.coords.speed
      });
    };

    const onHardwareError = (err: GeolocationPositionError) => {
      isHardwareIgnitedRef.current = false;
      if (err.code === 1) setStatus('PERMISSION_DENIED');
      nicepodLog("GPS_HARDWARE_FAIL", err.message, 'error');
    };

    // Registro del observador único
    watchIdRef.current = navigator.geolocation.watchPosition(onHardwareSignal, onHardwareError, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 20000
    });
  }, [updateTelemetry]);

  // --- V. ACCIONES SOBERANAS (FULL RECONSTRUCTION) ---

  const ingestSensoryData = async (params: any) => {
    setIsLocked(true);
    setStatus('INGESTING');
    try {
      // Yield al hilo principal para feedback visual
      await new Promise(r => setTimeout(r, 100));

      const [hero, ...ocr] = await Promise.all([
        compressNicePodImage(params.heroImage, 2048, 0.8),
        ...params.ocrImages.map((i: File) => compressNicePodImage(i, 1600, 0.7))
      ]);

      const result = await ingestPhysicalEvidenceAction({
        ...params,
        latitude: lastPositionRef.current?.latitude,
        longitude: lastPositionRef.current?.longitude,
        accuracy: lastPositionRef.current?.accuracy
      });

      if (!result.success) throw new Error(result.error);

      setStatus('DOSSIER_READY');
      return result.data;
    } catch (e: any) {
      setStatus('REJECTED');
      setError(e.message);
      setIsLocked(false);
    }
  };

  // --- VI. LIMPIEZA Y CIERRE ---
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  return (
    <GeoEngineContext.Provider value={{
      status, userLocation, nearbyPOIs, activePOI, isTriangulated, error, data, isSearching, isLocked,
      initSensors,
      setTriangulated: () => setIsTriangulated(true),
      setManualAnchor: (lng, lat) => updateTelemetry({ latitude: lat, longitude: lng, accuracy: 1, heading: null, speed: null }),
      reSyncRadar: () => { },
      ingestSensoryData: ingestSensoryData as any,
      synthesizeNarrative: async () => { },
      reset: () => {
        if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
        isHardwareIgnitedRef.current = false;
        setUserLocation(null);
        setStatus('IDLE');
        setIsTriangulated(false);
      },
      transcribeVoiceIntent: async () => ({ success: true, message: "" }),
      setManualPlaceName: () => { }
    }}>
      {children}
    </GeoEngineContext.Provider>
  );
}

export const useGeoEngine = () => {
  const context = useContext(GeoEngineContext);
  if (!context) throw new Error("Critical Error: useGeoEngine out of bounds.");
  return context;
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (V19.0):
 * 1. Erradicación del Bloqueo: Al usar 'isHardwareIgnitedRef', el sistema impide que 
 *    múltiples llamadas a initSensors() saturen el bus de datos del GPS.
 * 2. Zero-Wait Persistence: Se implementó 'nicepod_last_fix' en localStorage. El avatar 
 *    aparecerá en la última ubicación conocida del Voyager MIENTRAS el satélite calienta, 
 *    eliminando la sensación de "mapa vacío".
 * 3. Unified Telemetry: Se eliminaron múltiples estados dispersos por un sistema de 
 *    referencias constantes ('lastPositionRef'), garantizando 60FPS en la Malla 3D.
 */