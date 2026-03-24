// hooks/use-geo-engine.tsx
// VERSIÓN: 14.0 (NicePod Sovereign Geo-Engine - High Authority & Signal Stability Edition)
// Misión: Orquestar telemetría estabilizada eliminando el Render Thrashing y optimizando el consumo de red.
// [ESTABILIZACIÓN]: Filtro de ruido de 5m, Throttling de Bóveda de 60m y Permission Shield.

"use client";

import { createClient } from "@/lib/supabase/client";
import { compressNicePodImage, nicepodLog } from "@/lib/utils";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";

// --- IMPORTACIÓN DE ACCIONES SOBERANAS (V7.0) ---
import {
  attachAmbientAudioAction,
  ingestPhysicalEvidenceAction,
  resolveLocationAction,
  synthesizeNarrativeAction,
  transcribeVoiceIntentAction
} from "@/actions/geo-actions";

// --- CONSTITUCIÓN DE TIPOS (BUILD SHIELD V4.0) ---
import {
  ActivePOI,
  GeoContextData,
  GeoEngineReturn,
  GeoEngineState,
  IngestionDossier,
  PointOfInterest,
  UserLocation
} from "@/types/geo-sovereignty";

/**
 * UTILIDAD INTERNA: fileToBase64
 * Transmuta archivos procesados a strings para el transporte seguro hacia Vercel.
 */
const fileToBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const GeoEngineContext = createContext<GeoEngineReturn | undefined>(undefined);

/**
 * GeoEngineProvider: El orquestador de telemetría y sensores de NicePod.
 * Implementa la lógica de filtrado necesaria para la estabilidad de la Malla 3D.
 */
export function GeoEngineProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  // --- I. ESTADOS REACTIVOS (ESTADO SOBERANO) ---
  const [status, setStatus] = useState<GeoEngineState>('IDLE');
  const [data, setData] = useState<GeoContextData>({});

  // userLocation: Solo emite cambios significativos (>5m) para proteger a Mapbox.
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  const [activePOI, setActivePOI] = useState<ActivePOI | null>(null);
  const [nearbyPOIs, setNearbyPOIs] = useState<PointOfInterest[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- II. REFERENCIAS DE CONTROL (MEMORIA TÉCNICA) ---
  const watchId = useRef<number | null>(null);
  const hasResolvedContextRef = useRef<boolean>(false);

  // lastEmittedLocationRef: Compara la posición física real contra el último estado emitido.
  const lastEmittedLocationRef = useRef<UserLocation | null>(null);

  // lastPOIRequestPosRef: Controla el Throttling geográfico de las llamadas a Supabase.
  const lastPOIRequestPosRef = useRef<{ lat: number, lng: number } | null>(null);

  // --- III. CONFIGURACIÓN DE UMBRALES INDUSTRIALES ---
  const NOISE_FILTER_METERS = 5.0;  // Umbral de estabilidad (No actualizar si < 5m)
  const QUALITY_THRESHOLD = 35;     // Precisión GPS deseada (metros)
  const POI_REFRESH_DISTANCE = 60;  // Refrescar Bóveda cada 60 metros de desplazamiento
  const NETWORK_COOLDOWN = 5000;    // Protección contra saturación de API

  /**
   * calculateDistance: Matemática de Haversine.
   * Calcula la distancia real en metros sobre la curvatura de la Tierra.
   */
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Radio terrestre
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }, []);

  /**
   * fetchNearbyPOIs: Sincronización inteligente con la Bóveda NKV.
   * Implementa Throttling Geográfico para reducir el tráfico de red.
   */
  const fetchNearbyPOIs = useCallback(async () => {
    if (!lastEmittedLocationRef.current) return;

    // Verificamos si el Voyager se ha movido lo suficiente para requerir nuevos datos.
    if (lastPOIRequestPosRef.current) {
      const distSinceLastFetch = calculateDistance(
        lastPOIRequestPosRef.current.lat, lastPOIRequestPosRef.current.lng,
        lastEmittedLocationRef.current.latitude, lastEmittedLocationRef.current.longitude
      );

      if (distSinceLastFetch < POI_REFRESH_DISTANCE) {
        return; // Sincronía mantenida; no es necesario fetch.
      }
    }

    setIsSearching(true);
    try {
      nicepodLog("📡 [GeoEngine] Solicitando sincronía con Bóveda NKV.");
      const { data: pois, error: dbError } = await supabase
        .from('vw_map_resonance_active')
        .select('*');

      if (dbError) throw dbError;

      setNearbyPOIs((pois as unknown as PointOfInterest[]) || []);

      // Actualizamos el ancla de la última petición exitosa.
      lastPOIRequestPosRef.current = {
        lat: lastEmittedLocationRef.current.latitude,
        lng: lastEmittedLocationRef.current.longitude
      };
    } catch (err: any) {
      nicepodLog("🔥 [GeoEngine] Error de Bóveda", err.message, 'error');
    } finally {
      setIsSearching(false);
    }
  }, [supabase, calculateDistance]);

  /**
   * evaluateEnvironment: Procesador de proximidad.
   * Determina si el Voyager está en el radio de sintonía de un hito histórico.
   */
  const evaluateEnvironment = useCallback((location: UserLocation) => {
    if (nearbyPOIs.length === 0) return;

    let closest: ActivePOI | null = null;
    let minDistance = Infinity;

    nearbyPOIs.forEach((poi) => {
      if (!poi.geo_location?.coordinates) return;

      const [pLng, pLat] = poi.geo_location.coordinates;
      const dist = calculateDistance(location.latitude, location.longitude, pLat, pLng);

      if (dist < minDistance) {
        minDistance = dist;
        closest = {
          id: poi.id.toString(),
          name: poi.name,
          distance: Math.round(dist),
          isWithinRadius: dist <= (poi.resonance_radius || 35),
          historical_fact: poi.historical_fact || undefined
        };
      }
    });

    setActivePOI(closest);
    setData((prev) => ({ ...prev, isProximityConflict: minDistance < 10 }));
  }, [nearbyPOIs, calculateDistance]);

  /**
   * resolveContext: Fase 0 - Identidad del territorio.
   */
  const resolveContext = useCallback(async (lat: number, lng: number) => {
    if (isSearching) return;
    setIsSearching(true);
    try {
      const result = await resolveLocationAction(lat, lng);
      if (result.success && result.data) {
        setData((prev: GeoContextData) => ({
          ...prev,
          manualPlaceName: result.data.place.poiName,
          dossier: { ...(prev.dossier as any), weather_snapshot: result.data.weather }
        }));
        hasResolvedContextRef.current = true;
      }
    } catch (err: any) {
      nicepodLog("🔥 [GeoEngine] Error de Resolución Radar", err.message, 'error');
    } finally {
      setIsSearching(false);
    }
  }, [isSearching]);

  /**
   * initSensors: Ignición del hardware sensorial.
   * Implementa el FILTRO DE RUIDO y el PERMISSION SHIELD.
   */
  const initSensors = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setError("HARDWARE_GPS_DESACTIVADO");
      return;
    }

    // Evitamos duplicidad de ignición o estados de denegación previos.
    if (isLocked || status === 'PERMISSION_DENIED') return;

    setStatus('SENSORS_READY');

    const handleHardwareSignal = (position: GeolocationPosition) => {
      if (isLocked) return;

      const newLoc: UserLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading,
        speed: position.coords.speed
      };

      // --- PROTOCOLO DE FILTRADO ESPACIAL ---
      const isFirstPulse = !lastEmittedLocationRef.current;

      // Si no es el primer pulso, calculamos el 'drift' (desviación)
      const movement = isFirstPulse ? 0 : calculateDistance(
        lastEmittedLocationRef.current!.latitude, lastEmittedLocationRef.current!.longitude,
        newLoc.latitude, newLoc.longitude
      );

      // Solo actualizamos el estado de React si:
      // A) Es el primer pulso (Indispensable).
      // B) El Voyager se ha movido > 5 metros (Filtro de Ruido).
      // C) La precisión mejoró significativamente (>15m de ganancia).
      const shouldUpdateUI = isFirstPulse ||
        movement > NOISE_FILTER_METERS ||
        (newLoc.accuracy < lastEmittedLocationRef.current!.accuracy - 15);

      if (shouldUpdateUI) {
        lastEmittedLocationRef.current = newLoc;
        setUserLocation(newLoc);
        evaluateEnvironment(newLoc);
        fetchNearbyPOIs(); // Throttled internamente por distancia.

        // Resolución de contexto automática para señales de alta fidelidad.
        if (!hasResolvedContextRef.current && newLoc.accuracy < QUALITY_THRESHOLD) {
          resolveContext(newLoc.latitude, newLoc.longitude);
        }
      }
    };

    const handleHardwareError = (err: GeolocationPositionError) => {
      // Permission Shield: Capturamos el bloqueo de privacidad del SO o Navegador.
      if (err.code === err.PERMISSION_DENIED) {
        nicepodLog("🛑 [GeoEngine] Permiso de GPS denegado.");
        setStatus('PERMISSION_DENIED');
        setError("Acceso al hardware de ubicación bloqueado.");
        if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
      } else {
        nicepodLog(`🟡 [GeoEngine] Señal inestable: ${err.message}`);
        setError("Buscando señal satelital...");
      }
    };

    // 1. Snapshot Inicial
    navigator.geolocation.getCurrentPosition(handleHardwareSignal, handleHardwareError, {
      enableHighAccuracy: false,
      timeout: 5000
    });

    // 2. Seguimiento Persistente
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = navigator.geolocation.watchPosition(handleHardwareSignal, handleHardwareError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 3000 // Cacheamos la lectura 3s para ahorrar CPU.
    });
  }, [isLocked, status, calculateDistance, evaluateEnvironment, resolveContext, fetchNearbyPOIs]);

  const setManualAnchor = useCallback((lng: number, lat: number) => {
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    const manualLoc: UserLocation = { latitude: lat, longitude: lng, accuracy: 1, heading: null, speed: null };
    lastEmittedLocationRef.current = manualLoc;
    setUserLocation(manualLoc);
    setIsLocked(true);
    hasResolvedContextRef.current = false;
    setStatus('SENSORS_READY');
    fetchNearbyPOIs(); // Carga forzada de la zona seleccionada.
  }, [fetchNearbyPOIs]);

  /**
   * ingestSensoryData:
   * Procesa el dossier de evidencia multimodal con compresión JIT.
   */
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
      nicepodLog("⚙️ [GeoEngine] Refinando activos visuales...");

      const [compressedHero, ...compressedOcr] = await Promise.all([
        compressNicePodImage(params.heroImage, 2048, 0.85),
        ...params.ocrImages.map(img => compressNicePodImage(img, 1600, 0.75))
      ]);

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
      nicepodLog(`✅ [GeoEngine] Ingesta completada para Nodo #${poiId}`);

    } catch (e: any) {
      setStatus('REJECTED');
      setError(e.message);
      setIsLocked(false);
      throw e;
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
      if (!result.success || !result.data) throw new Error(result.error);
      setData(prev => ({ ...prev, narrative: result.data }));
      setStatus('NARRATIVE_READY');
    } catch (e: any) {
      setStatus('REJECTED');
      setError(e.message);
      throw e;
    }
  };

  const transcribeVoiceIntent = async (audio: string) => await transcribeVoiceIntentAction({ audioBase64: audio });

  const reset = () => {
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    setStatus('IDLE'); setData({}); setIsLocked(false); setUserLocation(null);
    lastEmittedLocationRef.current = null; lastPOIRequestPosRef.current = null;
    setError(null);
  };

  useEffect(() => { return () => { if (watchId.current) navigator.geolocation.clearWatch(watchId.current); }; }, []);

  return (
    <GeoEngineContext.Provider value={{
      status, data, userLocation, activePOI, nearbyPOIs, isSearching, isLocked, error,
      initSensors, setManualAnchor, setManualPlaceName: (n) => setData(p => ({ ...p, manualPlaceName: n })),
      reSyncRadar: () => userLocation && resolveContext(userLocation.latitude, userLocation.longitude),
      ingestSensoryData, synthesizeNarrative, reset, transcribeVoiceIntent
    }}>
      {children}
    </GeoEngineContext.Provider>
  );
}

export function useGeoEngine() {
  const context = useContext(GeoEngineContext);
  if (!context) throw new Error("useGeoEngine debe ser invocado dentro de un GeoEngineProvider nominal.");
  return context;
}