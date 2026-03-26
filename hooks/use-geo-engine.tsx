// hooks/use-geo-engine.tsx
// VERSIÓN: 22.0 (NicePod Sovereign Geo-Engine - Precision Lock & Materialization Edition)
// Misión: Orquestar telemetría estabilizada, integrar Geo-IP y garantizar el salto a ubicación real.
// [ESTABILIZACIÓN]: Implementación de isGPSLock, Salto Forzado por Calidad y Persistencia T0.

"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { compressNicePodImage, nicepodLog } from "@/lib/utils";

// --- IMPORTACIÓN DE ACCIONES SOBERANAS ---
import { 
  resolveLocationAction, 
  ingestPhysicalEvidenceAction, 
  synthesizeNarrativeAction, 
  attachAmbientAudioAction, 
  transcribeVoiceIntentAction 
} from "@/actions/geo-actions";

// --- CONSTITUCIÓN DE TIPOS (BUILD SHIELD V4.1) ---
import { 
  ActivePOI, 
  GeoContextData, 
  GeoEngineReturn, 
  GeoEngineState, 
  IngestionDossier, 
  PointOfInterest, 
  UserLocation 
} from "@/types/geo-sovereignty";

const GeoEngineContext = createContext<GeoEngineReturn | undefined>(undefined);

/**
 * INTERFAZ: GeoEngineProviderProps
 */
interface GeoEngineProviderProps {
  children: React.ReactNode;
  initialData?: {
    lat: number;
    lng: number;
    city: string;
    source: string;
  } | null;
}

/**
 * GeoEngineProvider: El Reactor Sensorial Maestro de NicePod.
 */
export function GeoEngineProvider({ children, initialData }: GeoEngineProviderProps) {
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
  const [error, setError] = useState<string | null>(null);
  
  // [NUEVO V22.0]: Soberanía de Triangulación Progresiva
  const [isTriangulated, setIsTriangulated] = useState<boolean>(false); // Alguna ubicación (IP/Caché/GPS)
  const [isGPSLock, setIsGPSLock] = useState<boolean>(false);           // Ubicación real confirmada (<50m)

  // Memoria volátil de la Forja (IA & Ingesta)
  const [data, setData] = useState<GeoContextData>({});
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // --- III. MATEMÁTICA DE FILTRADO (INDUSTRIAL RIGOR) ---
  
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Radio terrestre en metros
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  /**
   * updateTelemetry: Único punto de mutación del estado.
   * Centraliza los filtros y detecta el paso de IP a GPS real.
   */
  const updateTelemetry = useCallback((newCoords: UserLocation) => {
    const isFirstFix = !lastPositionRef.current;
    const isHighPrecision = newCoords.accuracy > 0 && newCoords.accuracy < 50;
    
    // [LOGICA DE RESCATE V22.0]: 
    // Si pasamos de una ubicación aproximada (IP) a una real (GPS Lock), 
    // forzamos el salto ignorando los filtros de movimiento.
    const justAchievedLock = isHighPrecision && !isGPSLock;

    // Filtro Espacial (5 metros)
    const movement = isFirstFix ? 0 : calculateDistance(
      lastPositionRef.current!.latitude, lastPositionRef.current!.longitude,
      newCoords.latitude, newCoords.longitude
    );

    // Filtro de Brújula (3 grados)
    const headingDelta = Math.abs((newCoords.heading || 0) - (lastHeadingRef.current || 0));
    const shouldRotate = newCoords.heading !== null && headingDelta > 3;

    // PROTOCOLO DE ACTUALIZACIÓN SOBERANA:
    // Aceptamos el dato si: es el primero, es un GPS Lock nuevo, hubo movimiento real o rotación.
    if (isFirstFix || justAchievedLock || movement > 5 || shouldRotate) {
      lastPositionRef.current = newCoords;
      if (newCoords.heading !== null) lastHeadingRef.current = newCoords.heading;
      
      setUserLocation(newCoords);
      setStatus('SENSORS_READY');
      
      // Persistencia en Caché y Estados de Misión
      if (!isTriangulated) {
        setIsTriangulated(true);
        localStorage.setItem('nicepod_last_fix', JSON.stringify(newCoords));
      }

      if (isHighPrecision && !isGPSLock) {
        nicepodLog("🔒 [GeoEngine] GPS Lock establecido. Precisión certificada.");
        setIsGPSLock(true);
      }
    }
  }, [isTriangulated, isGPSLock]);

  // --- IV. PROTOCOLO DE IGNICIÓN (THE GPS HANDSHAKE) ---

  const initSensors = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setError("HARDWARE_GPS_DESACTIVADO");
      return;
    }

    if (isHardwareIgnitedRef.current || isLocked) return;
    isHardwareIgnitedRef.current = true;

    nicepodLog("📡 [GeoEngine] Iniciando materialización progresiva...");

    /**
     * 1. FASE T0: MATERIALIZACIÓN POR IP/CACHÉ
     */
    if (initialData && !userLocation) {
      nicepodLog("🌐 [GeoEngine] Voyager materializado por IP (Edge).");
      updateTelemetry({
        latitude: initialData.lat,
        longitude: initialData.lng,
        accuracy: 5000, 
        heading: null,
        speed: null
      });
    } else {
      const cachedFix = localStorage.getItem('nicepod_last_fix');
      if (cachedFix && !userLocation) {
        nicepodLog("💾 [GeoEngine] Restaurando última ubicación conocida.");
        updateTelemetry(JSON.parse(cachedFix));
      }
    }

    /**
     * 2. FASE T+1: REFINAMIENTO POR HARDWARE GPS
     */
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
      if (err.code === 1) {
        setStatus('PERMISSION_DENIED');
        setError("Ubicación bloqueada por privacidad.");
      } else {
        nicepodLog("GPS_STALL", err.message, 'warn');
      }
    };

    watchIdRef.current = navigator.geolocation.watchPosition(onHardwareSignal, onHardwareError, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 25000
    });
  }, [updateTelemetry, initialData, userLocation, isLocked]);

  // --- V. ACCIONES SOBERANAS (PIPELINE DE IA) ---

  const ingestSensoryData = async (params: {
    heroImage: File;
    ocrImages: File[];
    intent: string;
    categoryId: string;
    radius: number;
    ambientAudio?: Blob | null;
  }) => {
    if (!userLocation) return;
    setIsLocked(true);
    setStatus('INGESTING');
    setError(null);

    try {
      nicepodLog("⚙️ [GeoEngine] Refinando evidencia visual...");
      await new Promise(r => setTimeout(r, 100)); // Yield

      const [compressedHero, ...compressedOcr] = await Promise.all([
        compressNicePodImage(params.heroImage, 2048, 0.85),
        ...params.ocrImages.map(img => compressNicePodImage(img, 1600, 0.75))
      ]);

      const fileToBase64 = (file: File | Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = e => reject(e);
        });
      };

      const heroBase64 = await fileToBase64(compressedHero);
      const ocrBase64 = await Promise.all(compressedOcr.map(blob => fileToBase64(blob)));

      const result = await ingestPhysicalEvidenceAction({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        accuracy: userLocation.accuracy,
        heroImage: heroBase64,
        ocrImages: ocrBase64,
        categoryId: params.categoryId,
        resonanceRadius: params.radius,
        adminIntent: params.intent
      });

      if (!result.success || !result.data) throw new Error(result.error || "FAIL");

      const { poiId, analysis } = result.data;

      if (params.ambientAudio) {
        const audioBase64 = await fileToBase64(params.ambientAudio);
        await attachAmbientAudioAction({ poiId, audioBase64 });
      }

      const dossier: IngestionDossier = {
        poi_id: poiId,
        raw_ocr_text: analysis.historicalDossier || null,
        weather_snapshot: data.dossier?.weather_snapshot || { temp_c: 0, condition: "Sincronizado", is_day: true },
        visual_analysis_dossier: analysis,
        sensor_accuracy: userLocation.accuracy,
        ingested_at: new Date().toISOString()
      };

      setData(prev => ({ ...prev, poiId, dossier }));
      setStatus('DOSSIER_READY');
      nicepodLog(`✅ [GeoEngine] Ingesta Completada Nodo #${poiId}`);
      return { poiId, dossier };

    } catch (e: unknown) {
      const errorObj = e instanceof Error ? e : new Error(String(e));
      setStatus('REJECTED');
      setError(errorObj.message);
      setIsLocked(false);
      throw errorObj;
    }
  };

  const synthesizeNarrative = async (params: {
    poiId: number;
    depth: 'flash' | 'cronica' | 'inmersion';
    tone: string;
    refinedIntent?: string;
  }) => {
    setStatus('SYNTHESIZING');
    try {
      const result = await synthesizeNarrativeAction(params);
      if (!result.success || !result.data) throw new Error(result.error || "SYNTH_FAIL");
      setData(prev => ({ ...prev, narrative: result.data }));
      setStatus('NARRATIVE_READY');
    } catch (e: unknown) {
      const errorObj = e instanceof Error ? e : new Error(String(e));
      setStatus('REJECTED');
      setError(errorObj.message);
      throw errorObj;
    }
  };

  const reset = () => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    isHardwareIgnitedRef.current = false;
    setStatus('IDLE');
    setData({});
    setIsLocked(false);
    setUserLocation(null);
    lastPositionRef.current = null;
    setError(null);
    setIsTriangulated(false);
    setIsGPSLock(false);
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  return (
    <GeoEngineContext.Provider value={{
      status, userLocation, nearbyPOIs, activePOI, error, data, isSearching, isLocked,
      isTriangulated,
      isGPSLock, // [NUEVO V22.0]: Expuesto para el refinamiento de cámara
      setTriangulated: () => setIsTriangulated(true),
      initSensors,
      setManualAnchor: (lng, lat) => updateTelemetry({ latitude: lat, longitude: lng, accuracy: 1, heading: null, speed: null }),
      reSyncRadar: () => userLocation && resolveLocationAction(userLocation.latitude, userLocation.longitude),
      ingestSensoryData,
      synthesizeNarrative,
      reset,
      transcribeVoiceIntent: async (audio) => await transcribeVoiceIntentAction({ audioBase64: audio }),
      setManualPlaceName: (n) => setData(p => ({ ...p, manualPlaceName: n }))
    }}>
      {children}
    </GeoEngineContext.Provider>
  );
}

export const useGeoEngine = () => {
  const context = useContext(GeoEngineContext);
  if (!context) throw new Error("Critical Error: useGeoEngine invoked outside of GeoEngineProvider.");
  return context;
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (V22.0):
 * 1. Lógica de Autoridad Progresiva: Se introdujo 'isGPSLock' para diferenciar entre 
 *    el paracaídas visual de IP y la verdad física del hardware.
 * 2. Salto Forzado por Calidad: El sistema ahora ignora los filtros de estabilidad 
 *    ante el primer dato de alta precisión (<50m), garantizando que el Voyager 
 *    se posicione sobre su casa lo antes posible tras el nacimiento en la ciudad.
 * 3. Materialización Determinista: La prioridad T0 (IP > Caché > GPS) asegura que 
 *    el mapa nunca se muestre vacío ni centrado erróneamente en Sol.
 * 4. Rigor NCIS: Implementación completa sin abreviaciones, protegiendo la 
 *    integridad de la IA y el Pipeline de Ingesta.
 */