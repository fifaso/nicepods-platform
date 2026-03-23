// hooks/use-geo-engine.tsx
// VERSIÓN: 11.1 (NicePod Sovereign Geo-Engine - Absolute Integrity Edition)
// Misión: Orquestar telemetría ubicua protegiendo a React del 'Jitter' del hardware.
// [ESTABILIZACIÓN]: Implementación de Filtro de Ruido Espacial para evitar tormentas de re-renderizado.

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

// --- CONSTITUCIÓN DE TIPOS (BUILD SHIELD V3.0) ---
import {
  ActivePOI,
  GeoActionResponse,
  GeoContextData,
  GeoEngineReturn,
  GeoEngineState,
  IngestionDossier,
  PointOfInterest,
  UserLocation
} from "@/types/geo-sovereignty";

/**
 * UTILIDAD INTERNA: fileToBase64
 * Transmuta archivos o blobs procesados a strings para el transporte seguro hacia Vercel.
 * Se ejecuta tras la etapa de compresión JIT para minimizar el tamaño del string.
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
 * Controla el ciclo de vida desde el hardware sensorial hasta la forja del Agente 42.
 */
export function GeoEngineProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  // --- I. ESTADOS REACTIVOS TIPADOS (BUILD SHIELD) ---
  const [status, setStatus] = useState<GeoEngineState>('IDLE');
  const [data, setData] = useState<GeoContextData>({});
  
  // Estado que alimenta a la UI (Solo se actualiza si el movimiento es significativo)
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  
  // Ref para guardar la última posición real (para el filtro de ruido)
  const lastEmittedLocationRef = useRef<UserLocation | null>(null);
  
  const [activePOI, setActivePOI] = useState<ActivePOI | null>(null);
  
  // nearbyPOIs es una colección de PointOfInterest estrictamente tipada.
  const [nearbyPOIs, setNearbyPOIs] = useState<PointOfInterest[]>([]);

  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- II. REFERENCIAS DE CONTROL Y HARDWARE ---
  const watchId = useRef<number | null>(null);
  const hasResolvedContextRef = useRef<boolean>(false);
  const lastRequestTimestamp = useRef<number>(0);

  // Umbrales de Operación Industrial
  const RESOLUTION_THRESHOLD = 100; // Precisión necesaria para auto-disparo (metros)
  const CONFLICT_LIMIT = 10;        // Límite de colisión geoespacial (metros)
  const NETWORK_COOLDOWN = 4000;    // Cooldown para evitar saturación de la DB
  
  // [FILTRO DE RUIDO]: Ignorar movimientos menores a este valor (Metros)
  const NOISE_FILTER_METERS = 2.0;

  /**
   * calculateDistance: Matemática de Haversine.
   * Calcula la distancia real sobre la curvatura terrestre entre dos puntos.
   */
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Radio de la Tierra en metros
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }, []);

  /**
   * fetchNearbyPOIs: Sincronización de la Malla Activa.
   * Recupera los nodos publicados desde la vista diagnóstica del Metal.
   */
  const fetchNearbyPOIs = useCallback(async () => {
    const now = Date.now();
    if (now - lastRequestTimestamp.current < NETWORK_COOLDOWN) return;

    setIsSearching(true);
    lastRequestTimestamp.current = now;

    try {
      const { data: pois, error: dbError } = await supabase
        .from('vw_map_resonance_active')
        .select('*');

      if (dbError) throw dbError;
      
      // Aplicamos casting soberano basado en la Constitución de Tipos V3.0
      setNearbyPOIs((pois as unknown as PointOfInterest[]) || []);
    } catch (err: any) {
      nicepodLog("🔥 [GeoEngine] Error de Sincronía con Bóveda", err.message, 'error');
    } finally {
      setIsSearching(false);
    }
  }, [supabase]);

  /**
   * evaluateEnvironment: Procesador de proximidad táctica.
   * Determina si el Voyager está en radio de sintonía de algún hito.
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

    // Activamos bandera de conflicto si el Admin intenta sembrar sobre un nodo existente
    setData((prev) => ({
      ...prev,
      isProximityConflict: minDistance < CONFLICT_LIMIT
    }));
  }, [nearbyPOIs, calculateDistance]);

  /**
   * resolveContext: Resolución Ambiental (Fase 0).
   * Obtiene dirección y clima mediante el Oráculo en el Borde.
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
          dossier: {
            ...(prev.dossier as any),
            weather_snapshot: result.data.weather
          }
        }));
        hasResolvedContextRef.current = true;
      }
    } catch (err: any) {
      nicepodLog("🔥 [GeoEngine] Radar de Contexto fallido", err.message, 'error');
    } finally {
      setIsSearching(false);
    }
  }, [isSearching]);

  // Vigilancia de Auto-disparo: Resuelve el contexto cuando la precisión es industrial (<100m)
  useEffect(() => {
    async function autoTrigger() {
      if (!userLocation || hasResolvedContextRef.current) return;
      if (userLocation.accuracy <= RESOLUTION_THRESHOLD || isLocked) {
        hasResolvedContextRef.current = true;
        await resolveContext(userLocation.latitude, userLocation.longitude);
      }
    }
    autoTrigger();
  }, [userLocation, isLocked, resolveContext]);

  /**
   * initSensors: Ignición del hardware de posicionamiento.
   * Implementa el FILTRO DE RUIDO ESPACIAL para proteger a React de micro-renders.
   */
  const initSensors = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setError("HARDWARE_GPS_DESACTIVADO");
      return;
    }
    if (isLocked) return;

    setStatus('SENSORS_READY');
    hasResolvedContextRef.current = false;

    // Procesador central de telemetría
    const handleNewPosition = (position: GeolocationPosition) => {
      if (isLocked) return;

      const newLocation: UserLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading,
        speed: position.coords.speed
      };

      // Si es la primera lectura, la aplicamos directamente
      if (!lastEmittedLocationRef.current) {
        lastEmittedLocationRef.current = newLocation;
        setUserLocation(newLocation);
        evaluateEnvironment(newLocation);
        fetchNearbyPOIs();
        return;
      }

      // FILTRO DE RUIDO (Spatial Debounce)
      const driftDistance = calculateDistance(
        lastEmittedLocationRef.current.latitude,
        lastEmittedLocationRef.current.longitude,
        newLocation.latitude,
        newLocation.longitude
      );

      const precisionImproved = newLocation.accuracy < lastEmittedLocationRef.current.accuracy - 5;

      // Solo actualizamos el estado si el movimiento supera el umbral de ruido (2 metros)
      // o si la precisión mejoró drásticamente.
      if (driftDistance > NOISE_FILTER_METERS || precisionImproved) {
        lastEmittedLocationRef.current = newLocation;
        setUserLocation(newLocation);
        evaluateEnvironment(newLocation);
      }
    };

    navigator.geolocation.getCurrentPosition(
      handleNewPosition,
      (err) => nicepodLog(`🟡 [GeoEngine] Precisión inicial baja: ${err.message}`),
      { enableHighAccuracy: false, timeout: 5000 }
    );

    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);

    watchId.current = navigator.geolocation.watchPosition(
      handleNewPosition,
      (err) => setError(`Señal GPS Perdida: ${err.message}`),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 2000 } 
    );
  }, [fetchNearbyPOIs, isLocked, evaluateEnvironment, calculateDistance]);

  /**
   * setManualAnchor: Autoridad de Admin para fijar coordenadas por tacto.
   */
  const setManualAnchor = useCallback((lng: number, lat: number) => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    const manualLocation: UserLocation = {
      latitude: lat,
      longitude: lng,
      accuracy: 1, 
      heading: null,
      speed: null
    };
    lastEmittedLocationRef.current = manualLocation;
    setUserLocation(manualLocation);
    setIsLocked(true);
    hasResolvedContextRef.current = false;
    setStatus('SENSORS_READY');
    fetchNearbyPOIs();
  }, [fetchNearbyPOIs]);

  const setManualPlaceName = useCallback((name: string) => {
    setData((prev) => ({ ...prev, manualPlaceName: name }));
  }, []);

  const reSyncRadar = useCallback(() => {
    if (userLocation) {
      hasResolvedContextRef.current = false;
      resolveContext(userLocation.latitude, userLocation.longitude);
    }
  }, [userLocation, resolveContext]);

  /**
   * ingestSensoryData:
   * Pipeline JIT de Compresión e Integridad de Dossier.
   */
  const ingestSensoryData = async (params: {
    heroImage: File;
    ocrImages: File[];
    ambientAudio?: Blob | null;
    intent: string;
    categoryId: string;
    radius: number;
  }) => {
    if (!userLocation) return;

    setIsLocked(true);
    setStatus('INGESTING');
    setError(null);

    try {
      nicepodLog("⚙️ [GeoEngine] Iniciando Pipeline de Compresión JIT...");

      // 1. REFINAMIENTO VISUAL (Compresión por Hardware)
      const [compressedHero, ...compressedOcrArray] = await Promise.all([
        compressNicePodImage(params.heroImage, 2048, 0.85),
        ...params.ocrImages.map(img => compressNicePodImage(img, 1600, 0.75))
      ]);

      nicepodLog("📦 [GeoEngine] Empaquetando evidencia optimizada...");

      // 2. TRANSMUTACIÓN BINARIA
      const heroBase64 = await fileToBase64(compressedHero);
      const ocrTasks = compressedOcrArray.map(blob => fileToBase64(blob));
      const ocrBase64Array = await Promise.all(ocrTasks);

      // 3. DESPACHO AUTORIZADO (Circuit Breaker Activo)
      const result = await ingestPhysicalEvidenceAction({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        accuracy: userLocation.accuracy,
        heroImage: heroBase64,
        ocrImages: ocrBase64Array,
        categoryId: params.categoryId,
        resonanceRadius: params.radius,
        adminIntent: params.intent
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || result.message || "FALLO_ESTRUCTURAL_SERVIDOR");
      }

      const { poiId, analysis } = result.data;

      // 4. ANCLAJE ACÚSTICO
      if (params.ambientAudio) {
        nicepodLog("🔊 [GeoEngine] Anclando Paisaje Sonoro...");
        const audioBase64 = await fileToBase64(params.ambientAudio);
        await attachAmbientAudioAction({ poiId, audioBase64 });
      }

      // 5. MATERIALIZACIÓN DEL DOSSIER TÉCNICO
      const newDossier: IngestionDossier = {
        poi_id: poiId,
        raw_ocr_text: analysis.historicalDossier || analysis.ocrText || null,
        weather_snapshot: data.dossier?.weather_snapshot || { temp_c: 0, condition: "Sincronizado", is_day: true },
        visual_analysis_dossier: {
          architectureStyle: analysis.architectureStyle,
          atmosphere: analysis.atmosphere,
          detectedElements: analysis.detectedElements,
          detectedOfficialName: analysis.officialName
        },
        sensor_accuracy: userLocation.accuracy,
        ingested_at: new Date().toISOString()
      };

      setData((prev: GeoContextData) => ({ ...prev, poiId, dossier: newDossier }));
      setStatus('DOSSIER_READY');
      nicepodLog(`✅ [GeoEngine] Ingesta exitosa: Nodo #${poiId}`);

    } catch (e: any) {
      nicepodLog(`🛑 [GeoEngine] Misión Abortada: ${e.message}`, null, 'error');
      setStatus('REJECTED');
      setError(e.message);
      setData((prev: GeoContextData) => ({ ...prev, rejectionReason: e.message }));
      setIsLocked(false);
      // Lanzamos el error para que la UI del Step 2 libere el estado 'isIngesting'
      throw e; 
    }
  };

  /**
   * synthesizeNarrative: Inicia la forja lírica del Agente 42.
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
      if (!result.success || !result.data) throw new Error(result.error);
      setData((prev: GeoContextData) => ({ ...prev, narrative: result.data }));
      setStatus('NARRATIVE_READY');
    } catch (e: any) {
      nicepodLog("🔥 [GeoEngine] Fallo en la Síntesis del Oráculo", e.message, 'error');
      setStatus('REJECTED');
      setError(e.message);
      throw e;
    }
  };

  /**
   * transcribeVoiceIntent: Motor STT para la semilla de intención.
   */
  const transcribeVoiceIntent = async (audioBase64: string): Promise<GeoActionResponse<{ transcription: string }>> => {
    return await transcribeVoiceIntentAction({ audioBase64 });
  };

  /**
   * reset: Protocolo de limpieza absoluta del motor.
   */
  const reset = () => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    setStatus('IDLE');
    setData({});
    setIsLocked(false);
    setUserLocation(null);
    lastEmittedLocationRef.current = null;
    hasResolvedContextRef.current = false;
    setError(null);
  };

  // Cleanup de hardware al desmontar el motor
  useEffect(() => {
    return () => { if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current); };
  }, []);

  return (
    <GeoEngineContext.Provider value={{
      status, data, userLocation, activePOI, nearbyPOIs, isSearching, isLocked, error,
      initSensors, setManualAnchor, setManualPlaceName, reSyncRadar, ingestSensoryData, synthesizeNarrative, reset,
      transcribeVoiceIntent
    }}>
      {children}
    </GeoEngineContext.Provider>
  );
}

/**
 * useGeoEngine: Hook de acceso a la Malla Urbana.
 */
export function useGeoEngine() {
  const context = useContext(GeoEngineContext);
  if (context === undefined) {
    throw new Error("useGeoEngine debe ser invocado dentro de un GeoEngineProvider nominal.");
  }
  return context;
}