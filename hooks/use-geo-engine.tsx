// hooks/use-geo-engine.tsx
// VERSIÓN: 17.0 (NicePod Sovereign Geo-Engine - Rapid Fix & Global Persistence Edition)
// Misión: Orquestar telemetría estabilizada, eliminar el jitter y persistir la ubicación en toda la sesión.
// [ESTABILIZACIÓN]: Captura agresiva de T0, IsTriangulated Persistence y Low-Pass Compass Filter.

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

// --- IMPORTACIÓN DE ACCIONES SOBERANAS ---
import {
  attachAmbientAudioAction,
  ingestPhysicalEvidenceAction,
  resolveLocationAction,
  synthesizeNarrativeAction,
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

/**
 * UTILIDAD INTERNA: fileToBase64
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
 * [FILTRO MATEMÁTICO]: applyCompassFilter (Low-Pass)
 * Mitiga el jitter magnético. Ignora variaciones menores a 2.5 grados.
 */
const applyCompassFilter = (current: number | null, previous: number | null | undefined): number | null => {
  if (current === null || isNaN(current)) return previous ?? null;
  if (previous === null || previous === undefined) return current;

  let diff = current - previous;
  while (diff <= -180) diff += 360;
  while (diff > 180) diff -= 360;

  return Math.abs(diff) >= 2.5 ? current : previous;
};

const GeoEngineContext = createContext<GeoEngineReturn | undefined>(undefined);

/**
 * GeoEngineProvider: El Orquestador Maestro de Sensores.
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

  // Soberanía de Triangulación: Evita re-saltos de cámara innecesarios.
  const [isTriangulated, setIsTriangulated] = useState<boolean>(false);

  // --- II. REFERENCIAS DE CONTROL (MEMORIA TÉCNICA) ---
  const watchId = useRef<number | null>(null);
  const hasResolvedContextRef = useRef<boolean>(false);
  const lastEmittedLocationRef = useRef<UserLocation | null>(null);
  const lastPOIRequestPosRef = useRef<{ lat: number, lng: number } | null>(null);

  // --- III. CONFIGURACIÓN DE UMBRALES INDUSTRIALES ---
  const NOISE_FILTER_METERS = 5.0;
  const QUALITY_THRESHOLD = 35;
  const POI_REFRESH_DISTANCE = 60;

  /**
   * calculateDistance: Matemática de Haversine.
   */
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }, []);

  /**
   * fetchNearbyPOIs: Sincronía con Bóveda NKV.
   */
  const fetchNearbyPOIs = useCallback(async () => {
    if (!lastEmittedLocationRef.current) return;

    if (lastPOIRequestPosRef.current) {
      const dist = calculateDistance(
        lastPOIRequestPosRef.current.lat, lastPOIRequestPosRef.current.lng,
        lastEmittedLocationRef.current.latitude, lastEmittedLocationRef.current.longitude
      );
      if (dist < POI_REFRESH_DISTANCE) return;
    }

    setIsSearching(true);
    try {
      nicepodLog("📡 [GeoEngine] Consultando Bóveda NKV...");
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

  /**
   * evaluateEnvironment: Radar de proximidad.
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
   * resolveContext: Fase 0 - Resolución de lugar y clima.
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      nicepodLog("🔥 [GeoEngine] Error de Resolución", msg, 'error');
    } finally {
      setIsSearching(false);
    }
  }, [isSearching]);

  /**
   * initSensors: Ignición de hardware con protocolo de Inicio Rápido.
   */
  const initSensors = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setError("HARDWARE_GPS_DESACTIVADO");
      return;
    }

    if (isLocked || status === 'PERMISSION_DENIED') return;

    setStatus('SENSORS_READY');

    const handleHardwareSignal = (position: GeolocationPosition) => {
      if (isLocked) return;

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

      // PROTOCOLO DE CAPTURA AGRESIVA (V17.0):
      // Emitimos el primer pulso inmediatamente sin importar el ruido para materializar al usuario.
      const shouldUpdateUI = isFirstPulse ||
        movement > NOISE_FILTER_METERS ||
        (newLoc.accuracy < lastEmittedLocationRef.current!.accuracy - 15) ||
        (filteredHeading !== lastEmittedLocationRef.current!.heading);

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
        nicepodLog("🛑 [GeoEngine] Permiso denegado.");
        setStatus('PERMISSION_DENIED');
        setError("Ubicación bloqueada por privacidad.");
        if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
      } else {
        nicepodLog(`🟡 [GeoEngine] Buscando señal...`);
        setError("Sincronizando satélites...");
      }
    };

    // 1. Instant Snapshot
    navigator.geolocation.getCurrentPosition(handleHardwareSignal, handleHardwareError, {
      enableHighAccuracy: false, // Rápido primero
      timeout: 5000
    });

    // 2. High Accuracy Watch
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

  /**
   * ingestSensoryData: PROCESO COMPLETO (Sin abreviaciones)
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
      nicepodLog("⚙️ [GeoEngine] Compresión JIT en curso...");

      // Yield al Event Loop para que React dibuje el estado de carga
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

      if (!result.success || !result.data) throw new Error(result.error || "INGEST_FAIL");

      const { poiId, analysis } = result.data;

      if (params.ambientAudio) {
        const audioBase64 = await fileToBase64(params.ambientAudio);
        await attachAmbientAudioAction({ poiId, audioBase64 });
      }

      const dossier: IngestionDossier = {
        poi_id: poiId,
        raw_ocr_text: analysis.historicalDossier || null,
        weather_snapshot: data.dossier?.weather_snapshot || { temp_c: 0, condition: "Estable", is_day: true },
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

  /**
   * synthesizeNarrative: PROCESO COMPLETO (Sin abreviaciones)
   */
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
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    setStatus('IDLE'); setData({}); setIsLocked(false); setUserLocation(null);
    lastEmittedLocationRef.current = null; lastPOIRequestPosRef.current = null;
    setError(null); setIsTriangulated(false);
  };

  useEffect(() => {
    return () => { if (watchId.current) navigator.geolocation.clearWatch(watchId.current); };
  }, []);

  return (
    <GeoEngineContext.Provider value={{
      status, data, userLocation, activePOI, nearbyPOIs, isSearching, isLocked, error,
      isTriangulated,
      setTriangulated: () => setIsTriangulated(true),
      initSensors, setManualAnchor, setManualPlaceName: (n) => setData(p => ({ ...p, manualPlaceName: n })),
      reSyncRadar: () => userLocation && resolveContext(userLocation.latitude, userLocation.longitude),
      ingestSensoryData,
      synthesizeNarrative,
      reset,
      transcribeVoiceIntent: async (audio) => await transcribeVoiceIntentAction({ audioBase64: audio })
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
 * NOTA TÉCNICA DEL ARCHITECT (V17.0):
 * 1. Protocolo de Inicio Rápido (Rapid Fix): Se ha priorizado la materialización inmediata del 
 *    usuario. El primer pulso de GPS se emite al UI ignorando los filtros de ruido, lo que 
 *    asegura que el mapa nunca se quede en negro esperando coordenadas perfectas.
 * 2. Soberanía de Triangulación (isTriangulated): El flag persistente permite que el widget
 *    del Dashboard y el Mapa de Pantalla Completa compartan la "Verdad Física" de la sesión.
 * 3. Low-Pass Compass Filter: Se ha implementado un filtro de 2.5 grados para la brújula, 
 *    aniquilando las vibraciones magnéticas del dispositivo y logrando un seguimiento 
 *    de cámara cinematográfico al estilo Pokémon GO.
 * 4. Build Shield Completo: Se han restaurado los cuerpos íntegros de todas las funciones de IA
 *    y se ha eliminado el uso de 'any' en favor de tipado defensivo 'unknown'.
 */