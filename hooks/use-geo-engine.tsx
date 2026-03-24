// hooks/use-geo-engine.tsx
// VERSIÓN: 13.0 (NicePod Sovereign Geo-Engine - Signal Stabilization Edition)
// Misión: Orquestar telemetría ubicua estabilizando la señal para evitar colapsos de GPU.
// [ESTABILIZACIÓN]: Implementación de Calibración de Precisión y Filtro de Ruido Dinámico.

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
 * GeoEngineProvider: El sistema nervioso central de la Malla de Madrid Resonance.
 */
export function GeoEngineProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  // --- I. ESTADOS REACTIVOS (BUILD SHIELD) ---
  const [status, setStatus] = useState<GeoEngineState>('IDLE');
  const [data, setData] = useState<GeoContextData>({});
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [activePOI, setActivePOI] = useState<ActivePOI | null>(null);
  const [nearbyPOIs, setNearbyPOIs] = useState<PointOfInterest[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- II. REFERENCIAS DE HARDWARE Y FILTRADO ---
  const watchId = useRef<number | null>(null);
  const hasResolvedContextRef = useRef<boolean>(false);
  const lastEmittedLocationRef = useRef<UserLocation | null>(null);
  const lastPOIRequestPosRef = useRef<{ lat: number, lng: number } | null>(null);

  // Umbrales de Operación Industrial
  const QUALITY_THRESHOLD = 30;     // Precisión deseada en metros para sintonía fina
  const NOISE_FILTER_METERS = 3.0;  // Ignorar micro-movimientos para salvar la GPU
  const POI_REFRESH_DISTANCE = 50;  // Distancia para re-consultar la Bóveda NKV

  /**
   * calculateDistance: Matemática de Haversine para medición real.
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
   * fetchNearbyPOIs: Sincronización optimizada con la Bóveda.
   */
  const fetchNearbyPOIs = useCallback(async () => {
    if (!userLocation) return;

    // Evitamos peticiones redundantes si el Voyager no se ha desplazado significativamente
    if (lastPOIRequestPosRef.current) {
      const distSinceLastReq = calculateDistance(
        lastPOIRequestPosRef.current.lat, lastPOIRequestPosRef.current.lng,
        userLocation.latitude, userLocation.longitude
      );
      if (distSinceLastReq < POI_REFRESH_DISTANCE) return;
    }

    setIsSearching(true);
    try {
      const { data: pois, error: dbError } = await supabase.from('vw_map_resonance_active').select('*');
      if (dbError) throw dbError;
      setNearbyPOIs((pois as unknown as PointOfInterest[]) || []);
      lastPOIRequestPosRef.current = { lat: userLocation.latitude, lng: userLocation.longitude };
    } catch (err: any) {
      nicepodLog("🔥 [GeoEngine] Error de Bóveda", err.message, 'error');
    } finally {
      setIsSearching(false);
    }
  }, [supabase, userLocation, calculateDistance]);

  /**
   * evaluateEnvironment: Procesador de proximidad.
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
   * resolveContext: Fase 0 - Identidad y Clima.
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
      nicepodLog("🔥 [GeoEngine] Radar Fail", err.message, 'error');
    } finally {
      setIsSearching(false);
    }
  }, [isSearching]);

  /**
   * initSensors: Ignición estabilizada del hardware GPS.
   */
  const initSensors = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setError("HARDWARE_GPS_DESACTIVADO");
      return;
    }
    if (isLocked || status === 'PERMISSION_DENIED') return;

    setStatus('SENSORS_READY');

    const handlePositionUpdate = (position: GeolocationPosition) => {
      if (isLocked) return;

      const newLoc: UserLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading,
        speed: position.coords.speed
      };

      // LÓGICA DE ESTABILIZACIÓN:
      // Si es la primera lectura, o si la precisión mejora, o si el movimiento es real (>3m)
      const isFirst = !lastEmittedLocationRef.current;
      const movement = isFirst ? 0 : calculateDistance(
        lastEmittedLocationRef.current!.latitude, lastEmittedLocationRef.current!.longitude,
        newLoc.latitude, newLoc.longitude
      );

      const shouldUpdate = isFirst || movement > NOISE_FILTER_METERS || (newLoc.accuracy < lastEmittedLocationRef.current!.accuracy - 10);

      if (shouldUpdate) {
        lastEmittedLocationRef.current = newLoc;
        setUserLocation(newLoc);
        evaluateEnvironment(newLoc);

        // Auto-resolución de contexto solo si la señal es de alta calidad (<30m)
        if (!hasResolvedContextRef.current && newLoc.accuracy < QUALITY_THRESHOLD) {
          resolveContext(newLoc.latitude, newLoc.longitude);
        }
      }
    };

    const handleHardwareError = (err: GeolocationPositionError) => {
      if (err.code === err.PERMISSION_DENIED) {
        setStatus('PERMISSION_DENIED');
        setError("Acceso al GPS bloqueado por el sistema.");
        if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
      } else {
        setError("Señal inestable.");
      }
    };

    // Snapshot inicial
    navigator.geolocation.getCurrentPosition(handlePositionUpdate, handleHardwareError, { enableHighAccuracy: false, timeout: 5000 });

    // Seguimiento continuo
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = navigator.geolocation.watchPosition(handlePositionUpdate, handleHardwareError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 3000 // Cache de hardware de 3s para ahorrar batería
    });
  }, [isLocked, status, calculateDistance, evaluateEnvironment, resolveContext]);

  // [MÉTODOS DE ACCIÓN MANTENIDOS...]
  const setManualAnchor = useCallback((lng: number, lat: number) => {
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    const manualLoc: UserLocation = { latitude: lat, longitude: lng, accuracy: 1, heading: null, speed: null };
    lastEmittedLocationRef.current = manualLoc;
    setUserLocation(manualLoc);
    setIsLocked(true);
    hasResolvedContextRef.current = false;
    setStatus('SENSORS_READY');
  }, []);

  const ingestSensoryData = async (params: any) => {
    if (!userLocation) return;
    setIsLocked(true);
    setStatus('INGESTING');
    try {
      const [compressedHero, ...compressedOcr] = await Promise.all([
        compressNicePodImage(params.heroImage, 2048, 0.85),
        ...params.ocrImages.map((img: File) => compressNicePodImage(img, 1600, 0.75))
      ]);
      const heroBase64 = await fileToBase64(compressedHero);
      const ocrBase64 = await Promise.all(compressedOcr.map(blob => fileToBase64(blob)));

      const result = await ingestPhysicalEvidenceAction({
        ...params,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        accuracy: userLocation.accuracy,
        heroImage: heroBase64,
        ocrImages: ocrBase64
      });

      if (!result.success || !result.data) throw new Error(result.error);

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
    } catch (e: any) {
      setStatus('REJECTED');
      setError(e.message);
      setIsLocked(false);
      throw e;
    }
  };

  const synthesizeNarrative = async (params: any) => {
    setStatus('SYNTHESIZING');
    try {
      const result = await synthesizeNarrativeAction(params);
      if (!result.success) throw new Error(result.error);
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
    setStatus('IDLE'); setData({}); setIsLocked(false); setUserLocation(null); lastEmittedLocationRef.current = null;
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

export const useGeoEngine = () => {
  const context = useContext(GeoEngineContext);
  if (!context) throw new Error("useGeoEngine debe ser invocado dentro de un GeoEngineProvider nominal.");
  return context;
};