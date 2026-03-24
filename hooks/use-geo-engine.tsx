// hooks/use-geo-engine.tsx
// VERSIÓN: 13.1 (NicePod Sovereign Geo-Engine - High Authority Edition)
// Misión: Orquestar telemetría estabilizada eliminando el Render Thrashing.
// [ESTABILIZACIÓN]: Filtro de ruido de 5m y Throttling de red para Bóveda NKV.

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
 * GeoEngineProvider: El sistema nervioso central estabilizado.
 */
export function GeoEngineProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  // --- I. ESTADOS REACTIVOS ---
  const [status, setStatus] = useState<GeoEngineState>('IDLE');
  const [data, setData] = useState<GeoContextData>({});
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [activePOI, setActivePOI] = useState<ActivePOI | null>(null);
  const [nearbyPOIs, setNearbyPOIs] = useState<PointOfInterest[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- II. REFERENCIAS DE AUTORIDAD (ESTABILIZACIÓN) ---
  const watchId = useRef<number | null>(null);
  const hasResolvedContextRef = useRef<boolean>(false);

  // Guardamos la última posición física para evitar re-renders por ruido
  const lastEmittedLocationRef = useRef<UserLocation | null>(null);

  // Guardamos la posición del último fetch a la DB para no saturar Supabase
  const lastPOIRequestPosRef = useRef<{ lat: number, lng: number } | null>(null);

  // Umbrales de Operación Industrial
  const NOISE_FILTER_METERS = 5.0;  // Umbral Pokémon GO: Ignorar saltos menores a 5m
  const QUALITY_THRESHOLD = 50;     // Precisión aceptable para resolver clima/calle
  const POI_REFRESH_DISTANCE = 60;  // Refrescar Bóveda cada 60 metros recorridos
  const NETWORK_COOLDOWN = 5000;

  /**
   * calculateDistance: Matemática de Haversine para medición real de territorio.
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
   * fetchNearbyPOIs: Sincronización inteligente con la Bóveda NKV.
   */
  const fetchNearbyPOIs = useCallback(async () => {
    if (!lastEmittedLocationRef.current) return;

    // THROTTLING GEOGRÁFICO: ¿Se ha movido el Voyager lo suficiente para pedir más datos?
    if (lastPOIRequestPosRef.current) {
      const dist = calculateDistance(
        lastPOIRequestPosRef.current.lat, lastPOIRequestPosRef.current.lng,
        lastEmittedLocationRef.current.latitude, lastEmittedLocationRef.current.longitude
      );
      if (dist < POI_REFRESH_DISTANCE) return;
    }

    setIsSearching(true);
    try {
      nicepodLog("📡 [GeoEngine] Recargando nodos de la Malla (NKV Sync).");
      const { data: pois, error: dbError } = await supabase.from('vw_map_resonance_active').select('*');
      if (dbError) throw dbError;

      setNearbyPOIs((pois as unknown as PointOfInterest[]) || []);

      // Anclamos la posición del último fetch exitoso
      lastPOIRequestPosRef.current = {
        lat: lastEmittedLocationRef.current.latitude,
        lng: lastEmittedLocationRef.current.longitude
      };
    } catch (err: any) {
      nicepodLog("🔥 [GeoEngine] Fallo en sincronía de Bóveda", err.message, 'error');
    } finally {
      setIsSearching(false);
    }
  }, [supabase, calculateDistance]);

  /**
   * evaluateEnvironment: Procesador de proximidad táctica.
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
   * resolveContext: Fase 0 - Resolución de Atmósfera y Calle.
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

    const handleHardwareSignal = (position: GeolocationPosition) => {
      if (isLocked) return;

      const newLoc: UserLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading,
        speed: position.coords.speed
      };

      // --- FILTRO DE AUTORIDAD (SPATIAL DEBOUNCE) ---
      const isFirstPulse = !lastEmittedLocationRef.current;

      const movement = isFirstPulse ? 0 : calculateDistance(
        lastEmittedLocationRef.current!.latitude, lastEmittedLocationRef.current!.longitude,
        newLoc.latitude, newLoc.longitude
      );

      // Decisión: ¿Informamos a React del cambio?
      // Sí, si es el primer pulso, o si se movió > 5m, o si la precisión mejoró notablemente.
      const shouldUpdate = isFirstPulse ||
        movement > NOISE_FILTER_METERS ||
        (newLoc.accuracy < lastEmittedLocationRef.current!.accuracy - 15);

      if (shouldUpdate) {
        lastEmittedLocationRef.current = newLoc;
        setUserLocation(newLoc);
        evaluateEnvironment(newLoc);

        // Disparamos la sincronía de POIs (con su propio throttle interno)
        fetchNearbyPOIs();

        // Resolución de contexto automática ante señal de alta calidad
        if (!hasResolvedContextRef.current && newLoc.accuracy < QUALITY_THRESHOLD) {
          resolveContext(newLoc.latitude, newLoc.longitude);
        }
      }
    };

    const handleSignalLoss = (err: GeolocationPositionError) => {
      if (err.code === err.PERMISSION_DENIED) {
        setStatus('PERMISSION_DENIED');
        setError("GPS bloqueado por privacidad.");
        if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
      } else {
        nicepodLog(`🟡 [GeoEngine] Señal débil: ${err.message}`);
      }
    };

    // Snapshot inicial
    navigator.geolocation.getCurrentPosition(handleHardwareSignal, handleSignalLoss, { enableHighAccuracy: false, timeout: 5000 });

    // Vigilancia constante
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = navigator.geolocation.watchPosition(handleHardwareSignal, handleSignalLoss, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 3000 // Cache de hardware de 3s para ahorro energético
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
    // Forzamos carga inmediata de POIs en la nueva zona
    fetchNearbyPOIs();
  }, [fetchNearbyPOIs]);

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
    lastPOIRequestPosRef.current = null;
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

/**
 * NOTA TÉCNICA DEL ARCHITECT (V13.1):
 * 1. Aniquilación de Jitter: El filtro de 5 metros asegura que Mapbox no tenga que
 *    recalcular su frustum y terreno 3D innecesariamente, matando el error de 'Source removal'.
 * 2. Throttling de Bóveda: El refresco geográfico (60m) evita peticiones basura 
 *    a Supabase mientras el usuario camina, optimizando el uso de datos.
 * 3. Cache de Hardware: 'maximumAge: 3000' reduce el consumo de batería al 
 *    permitir al SO reutilizar lecturas recientes de satélite.
 */