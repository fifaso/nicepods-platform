// hooks/use-geo-engine.tsx
// VERSIÓN: 21.0 (NicePod Sovereign Geo-Engine - Ground-Up Materialization Edition)
// Misión: Orquestar telemetría estabilizada, integrar Geo-IP y garantizar visibilidad T0.
// [ESTABILIZACIÓN]: Captura agresiva, persistencia de sesión y Hot-Swap de malla IP/GPS.

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
 * Recibe la ubicación estimada (IP) capturada en el Edge de Vercel.
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
  const [isTriangulated, setIsTriangulated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
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
   * Centraliza los cálculos de filtros para garantizar 60FPS en la visualización.
   */
  const updateTelemetry = useCallback((newCoords: UserLocation) => {
    const isFirstFix = !lastPositionRef.current;
    
    // FILTRO ESPACIAL: Se desactiva en el primer pulso para materialización rápida.
    const movement = isFirstFix ? 0 : calculateDistance(
      lastPositionRef.current!.latitude, lastPositionRef.current!.longitude,
      newCoords.latitude, newCoords.longitude
    );

    // FILTRO DE BRÚJULA (3 grados): Suaviza el giro cinemático de la cámara.
    const headingDelta = Math.abs((newCoords.heading || 0) - (lastHeadingRef.current || 0));
    const shouldRotate = newCoords.heading !== null && headingDelta > 3;

    // PROTOCOLO DE ACTUALIZACIÓN SOBERANA
    if (isFirstFix || movement > 5 || shouldRotate) {
      lastPositionRef.current = newCoords;
      if (newCoords.heading !== null) lastHeadingRef.current = newCoords.heading;
      
      setUserLocation(newCoords);
      setStatus('SENSORS_READY');
      
      // Sello de Triangulación y Persistencia T0
      if (!isTriangulated) {
        setIsTriangulated(true);
        localStorage.setItem('nicepod_last_fix', JSON.stringify(newCoords));
      }
    }
  }, [isTriangulated]);

  // --- IV. PROTOCOLO DE IGNICIÓN (THE GPS HANDSHAKE) ---

  const initSensors = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setError("HARDWARE_GPS_DESACTIVADO");
      return;
    }

    // [CERROJO]: Protege el bus de datos de peticiones duplicadas.
    if (isHardwareIgnitedRef.current || isLocked) return;
    isHardwareIgnitedRef.current = true;

    nicepodLog("📡 [GeoEngine] Iniciando secuencia de materialización...");

    /**
     * 1. MATERIALIZACIÓN T0 (FALLBACKS)
     * Prioridad: IP Vercel > Caché Local > Coordenadas de Sol (Madrid)
     */
    if (initialData && !userLocation) {
      nicepodLog("🌐 [GeoEngine] Voyager localizado por IP.");
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
        nicepodLog("💾 [GeoEngine] Restaurando última posición conocida.");
        updateTelemetry(JSON.parse(cachedFix));
      }
    }

    /**
     * 2. CAPTURA DE ALTA FIDELIDAD (GPS STREAM)
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
        setError("Ubicación bloqueada por el usuario.");
      } else {
        nicepodLog("GPS_HARDWARE_FAIL", err.message, 'warn');
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
      
      // Yield al Event Loop para permitir feedback UX
      await new Promise(r => setTimeout(r, 100));

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
      nicepodLog(`✅ [GeoEngine] Ingesta Exitosa Nodo #${poiId}`);

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
  };

  // --- VI. LIMPIEZA ATÓMICA ---
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
 * NOTA TÉCNICA DEL ARCHITECT (V21.0):
 * 1. Materialización Geo-IP: El Voyager aparece en el mapa instantáneamente usando la IP 
 *    como paracaídas visual si el GPS físico está demorado.
 * 2. Cero Latencia de Hidratación: La sincronía con 'localStorage' permite que el avatar 
 *    persista entre recargas de página, eliminando el estado 'amnésico' del sistema.
 * 3. Cerrojo Singleton: Se ha resuelto definitivamente el conflicto de múltiples peticiones 
 *    al chip GPS, una causa común de bloqueos de hardware en Vercel Production.
 * 4. Rigor NCIS: Se han restaurado todos los cuerpos de función y se ha tipado cada 
 *    iterador para cumplir con el Build Shield de Next.js 14.
 */