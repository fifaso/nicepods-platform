// hooks/use-geo-engine.tsx
// VERSIÓN: 15.0 (NicePod Sovereign Geo-Engine - Compass Filter & Zero-Any Edition)
// Misión: Orquestar telemetría estabilizada, eliminar el Jitter del giroscopio y proteger el Main Thread.
// [ESTABILIZACIÓN]: Filtro de paso bajo (2.5°) para brújula, Event Loop Yielding y tipado estricto.

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

/**
 * [FILTRO MATEMÁTICO]: applyCompassFilter (Low-Pass Filter)
 * Calcula la diferencia angular real. Ignora micro-vibraciones magnéticas (<2.5°).
 */
const applyCompassFilter = (current: number | null, previous: number | null | undefined): number | null => {
  if (current === null || isNaN(current)) return previous ?? null;
  if (previous === null || previous === undefined) return current;

  let diff = current - previous;
  // Normalización del salto de 360° (Ej: de 359° a 1° es un delta de 2°, no de -358°)
  while (diff <= -180) diff += 360;
  while (diff > 180) diff -= 360;

  return Math.abs(diff) >= 2.5 ? current : previous;
};

const GeoEngineContext = createContext<GeoEngineReturn | undefined>(undefined);

/**
 * GeoEngineProvider: El orquestador de telemetría y sensores de NicePod.
 */
export function GeoEngineProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  // --- I. ESTADOS REACTIVOS (ESTADO SOBERANO) ---
  const [status, setStatus] = useState<GeoEngineState>('IDLE');
  const [data, setData] = useState<GeoContextData>({});
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [activePOI, setActivePOI] = useState<ActivePOI | null>(null);
  const [nearbyPOIs, setNearbyPOIs] = useState<PointOfInterest[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- II. REFERENCIAS DE CONTROL (MEMORIA TÉCNICA) ---
  const watchId = useRef<number | null>(null);
  const hasResolvedContextRef = useRef<boolean>(false);
  const lastEmittedLocationRef = useRef<UserLocation | null>(null);
  const lastPOIRequestPosRef = useRef<{ lat: number, lng: number } | null>(null);

  // --- III. CONFIGURACIÓN DE UMBRALES INDUSTRIALES ---
  const NOISE_FILTER_METERS = 5.0;  // Umbral de estabilidad métrica
  const QUALITY_THRESHOLD = 35;     // Precisión GPS requerida
  const POI_REFRESH_DISTANCE = 60;  // Throttling de la Bóveda NKV

  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }, []);

  const fetchNearbyPOIs = useCallback(async () => {
    if (!lastEmittedLocationRef.current) return;

    if (lastPOIRequestPosRef.current) {
      const distSinceLastFetch = calculateDistance(
        lastPOIRequestPosRef.current.lat, lastPOIRequestPosRef.current.lng,
        lastEmittedLocationRef.current.latitude, lastEmittedLocationRef.current.longitude
      );

      if (distSinceLastFetch < POI_REFRESH_DISTANCE) return;
    }

    setIsSearching(true);
    try {
      nicepodLog("📡 [GeoEngine] Solicitando sincronía con Bóveda NKV.");
      const { data: pois, error: dbError } = await supabase
        .from('vw_map_resonance_active')
        .select('*');

      if (dbError) throw dbError;

      setNearbyPOIs((pois as PointOfInterest[]) || []);

      lastPOIRequestPosRef.current = {
        lat: lastEmittedLocationRef.current.latitude,
        lng: lastEmittedLocationRef.current.longitude
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      nicepodLog("🔥 [GeoEngine] Error de Bóveda", msg, 'error');
    } finally {
      setIsSearching(false);
    }
  }, [supabase, calculateDistance]);

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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      nicepodLog("🔥 [GeoEngine] Error de Resolución Radar", msg, 'error');
    } finally {
      setIsSearching(false);
    }
  }, [isSearching]);

  const initSensors = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setError("HARDWARE_GPS_DESACTIVADO");
      return;
    }

    if (isLocked || status === 'PERMISSION_DENIED') return;

    setStatus('SENSORS_READY');

    const handleHardwareSignal = (position: GeolocationPosition) => {
      if (isLocked) return;

      // 1. Aplicamos el Filtro Espacial a la brújula
      const filteredHeading = applyCompassFilter(position.coords.heading, lastEmittedLocationRef.current?.heading);

      const newLoc: UserLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: filteredHeading,
        speed: position.coords.speed
      };

      const isFirstPulse = !lastEmittedLocationRef.current;

      const movement = isFirstPulse ? 0 : calculateDistance(
        lastEmittedLocationRef.current!.latitude, lastEmittedLocationRef.current!.longitude,
        newLoc.latitude, newLoc.longitude
      );

      const accuracyImproved = !isFirstPulse && (newLoc.accuracy < lastEmittedLocationRef.current!.accuracy - 15);

      // 2. Activador de Rotación (El mapa debe girar aunque no caminemos)
      const headingChanged = !isFirstPulse && (filteredHeading !== lastEmittedLocationRef.current!.heading);

      const shouldUpdateUI = isFirstPulse || movement > NOISE_FILTER_METERS || accuracyImproved || headingChanged;

      if (shouldUpdateUI) {
        lastEmittedLocationRef.current = newLoc;
        setUserLocation(newLoc);
        evaluateEnvironment(newLoc);
        fetchNearbyPOIs();

        if (!hasResolvedContextRef.current && newLoc.accuracy < QUALITY_THRESHOLD) {
          resolveContext(newLoc.latitude, newLoc.longitude);
        }
      }
    };

    const handleHardwareError = (err: GeolocationPositionError) => {
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

    navigator.geolocation.getCurrentPosition(handleHardwareSignal, handleHardwareError, {
      enableHighAccuracy: false,
      timeout: 5000
    });

    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = navigator.geolocation.watchPosition(handleHardwareSignal, handleHardwareError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 3000
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
    fetchNearbyPOIs();
  }, [fetchNearbyPOIs]);

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

      // [YIELD AL EVENT LOOP]: Permitimos que React dibuje el estado 'INGESTING' 
      // y la animación de carga antes de bloquear la CPU con la compresión Canvas.
      await new Promise(resolve => setTimeout(resolve, 50));

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
      if (!result.success || !result.data) throw new Error(result.error || "Error Desconocido");
      setData(prev => ({ ...prev, narrative: result.data }));
      setStatus('NARRATIVE_READY');
    } catch (e: unknown) {
      const errorObj = e instanceof Error ? e : new Error(String(e));
      setStatus('REJECTED');
      setError(errorObj.message);
      throw errorObj;
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

/**
 * NOTA TÉCNICA DEL ARCHITECT (V15.0):
 * 1. Low-Pass Compass Filter: La brújula de los móviles es inestable. 'applyCompassFilter' 
 *    mitiga el Jitter al ignorar fluctuaciones menores a 2.5°. Esto es CRÍTICO para que 
 *    el seguimiento de cámara en Mapbox no genere un movimiento espasmódico que maree al usuario.
 * 2. Event Loop Yielding: La línea 'await new Promise(...50)' en 'ingestSensoryData' 
 *    permite que el hilo principal (Main Thread) respire. React tiene tiempo de repintar 
 *    la pantalla (mostrando el estado INGESTING) antes de que la CPU se ahogue comprimiendo 
 *    las imágenes a través del Canvas.
 * 3. Zero-Any Policy: Todos los bloques catch ahora usan 'unknown' y comprobaciones 
 *    'instanceof Error', blindando la fiabilidad de las alertas de fallo en el Frontend.
 * 4. Rotation Trigger: El estado del GPS ahora se emite a React no solo si caminas 5 metros,
 *    sino también si giras sobre ti mismo. Vital para la Inmersión Pokémon GO.
 */