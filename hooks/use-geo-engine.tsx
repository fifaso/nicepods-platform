// hooks/use-geo-engine.tsx
// VERSIÓN: 10.0 (NicePod Sovereign Geo-Engine - Complete Integration Edition)
// Misión: Orquestar telemetría ubicua, procesar activos JIT y garantizar persistencia atómica.
// [ESTABILIZACIÓN]: Integración total de Compresión, Build Shield y Circuit Breaker.

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

// --- IMPORTACIÓN DE ACCIONES SOBERANAS (V7.0 - Circuit Breaker) ---
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
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [activePOI, setActivePOI] = useState<ActivePOI | null>(null);

  // [FIX PUNTO 5]: nearbyPOIs es una colección de PointOfInterest estrictamente tipada.
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
      // Build Shield: Validación de presencia de coordenadas antes del cálculo
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
   */
  const initSensors = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setError("HARDWARE_GPS_DESACTIVADO");
      return;
    }
    if (isLocked) return;

    setStatus('SENSORS_READY');
    hasResolvedContextRef.current = false;

    // Primer contacto rápido
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: UserLocation = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: null,
          speed: null
        };
        setUserLocation(loc);
        fetchNearbyPOIs();
      },
      (err) => nicepodLog(`🟡 [GeoEngine] GPS Satelital no disponible (Usando WiFi): ${err.message}`),
      { enableHighAccuracy: false, timeout: 5000 }
    );

    // Seguimiento persistente de hardware
    const handleSuccess = (position: GeolocationPosition) => {
      if (isLocked) return;
      const loc: UserLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading,
        speed: position.coords.speed
      };
      setUserLocation(loc);
      evaluateEnvironment(loc);
    };

    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);

    watchId.current = navigator.geolocation.watchPosition(
      handleSuccess,
      (err) => setError(`Señal GPS Perdida: ${err.message}`),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [fetchNearbyPOIs, isLocked, evaluateEnvironment]);

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
      accuracy: 1, // Autoridad manual = precisión máxima
      heading: null,
      speed: null
    };
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
   * [PIPELINE V10.0]: Orquestación JIT y Circuit Breaker.
   * Es el proceso más pesado y crítico de la plataforma.
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
      nicepodLog("⚙️ [GeoEngine] Iniciando Refinamiento Visual JIT...");

      // 1. REFINAMIENTO (Punto 3 - Compresión por Hardware)
      // Comprimimos en paralelo para no bloquear el hilo de ejecución.
      const [compressedHero, ...compressedOcrArray] = await Promise.all([
        compressNicePodImage(params.heroImage, 2048, 0.85),
        ...params.ocrImages.map(img => compressNicePodImage(img, 1600, 0.75))
      ]);

      nicepodLog("📦 [GeoEngine] Transmutando evidencia para transporte...");

      // 2. TRANSMUTACIÓN BINARIA
      const heroBase64 = await fileToBase64(compressedHero);
      const ocrTasks = compressedOcrArray.map(blob => fileToBase64(blob));
      const ocrBase64Array = await Promise.all(ocrTasks);

      // 3. DESPACHO SOBERANO (Punto 6 - Circuit Breaker)
      // La Server Action ahora garantiza la subida al Storage antes de invocar a la IA.
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

      // 4. ANCLAJE ACÚSTICO (Soberanía Sonora)
      // El audio ambiente se ancla solo si la evidencia visual fue asegurada.
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
      nicepodLog(`✅ [GeoEngine] Misión completada: Nodo #${poiId} anclado.`);

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

/**
 * NOTA TÉCNICA DEL ARCHITECT (V10.0):
 * 1. Sincronía Industrial: Se implementó 'allSettled' y 'Promise.all' con 
 *    desestructuración para manejar el Hero Image y el Mosaico OCR por separado, 
 *    optimizando el pipeline JIT.
 * 2. Soberanía de Tipos: nearbyPOIs utiliza el contrato soberano, lo que permite 
 *    acceder a 'resonance_radius' sin errores de tipo.
 * 3. Resiliencia de Red: El motor captura y propaga los errores del Circuit 
 *    Breaker de las Server Actions, permitiendo al Admin reintentar subidas 
 *    fallidas sin perder los datos del formulario.
 */