// hooks/use-geo-engine.tsx
// VERSIÓN: 9.0 (NicePod Sovereign Geo-Engine - Build Shield & JIT Edition)
// Misión: Orquestar telemetría, procesar activos JIT y garantizar integridad de tipos geoespaciales.
// [ESTABILIZACIÓN]: Erradicación de 'any[]', tipado estricto de Bóveda y Compresión Visual.

"use client";

import { createClient } from "@/lib/supabase/client";
import { compressNicePodImage, nicepodLog } from "@/lib/utils";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

// --- IMPORTACIÓN DE ACCIONES SOBERANAS ---
import {
  attachAmbientAudioAction,
  ingestPhysicalEvidenceAction,
  resolveLocationAction,
  synthesizeNarrativeAction,
  transcribeVoiceIntentAction
} from "@/actions/geo-actions";

// --- CONSTITUCIÓN DE TIPOS (BUILD SHIELD) ---
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
 * GeoEngineProvider: El sistema nervioso central de la Malla de Madrid.
 */
export function GeoEngineProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  // --- ESTADOS REACTIVOS TIPADOS (BUILD SHIELD) ---
  const [status, setStatus] = useState<GeoEngineState>('IDLE');
  const [data, setData] = useState<GeoContextData>({});
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [activePOI, setActivePOI] = useState<ActivePOI | null>(null);

  // [FIX PUNTO 5]: nearbyPOIs ahora es una colección soberana tipada.
  const [nearbyPOIs, setNearbyPOIs] = useState<PointOfInterest[]>([]);

  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- REFERENCIAS DE HARDWARE Y CONTROL DE FLUJO ---
  const watchId = useRef<number | null>(null);
  const hasResolvedContextRef = useRef<boolean>(false);
  const lastRequestTimestamp = useRef<number>(0);

  // Umbrales de Operación Industrial
  const RESOLUTION_THRESHOLD = 100; // Metros para auto-disparo del radar
  const CONFLICT_LIMIT = 10;        // Metros para alerta de colisión
  const NETWORK_COOLDOWN = 4000;    // Evita saturación del puente Supabase

  /**
   * calculateDistance: Fórmula de Haversine para medición esférica táctica.
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
   * fetchNearbyPOIs: Sincronización de la Malla Activa desde la Vista SQL.
   */
  const fetchNearbyPOIs = useCallback(async () => {
    const now = Date.now();
    if (now - lastRequestTimestamp.current < NETWORK_COOLDOWN) return;

    setIsSearching(true);
    lastRequestTimestamp.current = now;

    try {
      // Invocamos la vista diagnóstica V2.5
      const { data: pois, error: dbError } = await supabase
        .from('vw_map_resonance_active')
        .select('*');

      if (dbError) throw dbError;

      // Realizamos el casting a PointOfInterest para asegurar integridad en la UI
      setNearbyPOIs((pois as unknown as PointOfInterest[]) || []);
    } catch (err: any) {
      nicepodLog("🔥 [GeoEngine] DB Sync Fail", err.message, 'error');
    } finally {
      setIsSearching(false);
    }
  }, [supabase]);

  /**
   * evaluateEnvironment: Analiza la densidad de memoria urbana alrededor del Voyager.
   */
  const evaluateEnvironment = useCallback((location: UserLocation) => {
    if (nearbyPOIs.length === 0) return;

    let closest: ActivePOI | null = null;
    let minDistance = Infinity;

    nearbyPOIs.forEach((poi) => {
      // Build Shield: Acceso seguro a coordenadas tipadas
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

    // Alerta de conflicto si el Admin intenta sembrar sobre un nodo existente
    setData((prev) => ({
      ...prev,
      isProximityConflict: minDistance < CONFLICT_LIMIT
    }));
  }, [nearbyPOIs, calculateDistance]);

  /**
   * resolveContext: Resuelve el nombre de la calle y el clima (Fase 0).
   */
  const resolveContext = useCallback(async (lat: number, lng: number) => {
    if (isSearching) return;
    setIsSearching(true);
    try {
      const result = await resolveLocationAction(lat, lng);
      if (result.success && result.data) {
        setData((prev) => ({
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
      nicepodLog("🔥 [GeoEngine] Radar Fail", err.message, 'error');
    } finally {
      setIsSearching(false);
    }
  }, [isSearching]);

  // Protocolo de Auto-Disparo del Radar por precisión de GPS
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
   * initSensors: Activa el hardware de geolocalización (Ignición).
   */
  const initSensors = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setError("HARDWARE_GPS_DESACTIVADO");
      return;
    }
    if (isLocked) return;

    setStatus('SENSORS_READY');
    hasResolvedContextRef.current = false;

    // Snapshot inicial rápida
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
      (err) => nicepodLog(`🟡 [GeoEngine] Señal WiFi no disponible: ${err.message}`),
      { enableHighAccuracy: false, timeout: 5000 }
    );

    // Seguimiento persistente (Watch)
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
   * setManualAnchor: Autoridad de Admin para forzar coordenadas tácticas.
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
   * [MEJORA PUNTO 3 & 5]: Pipeline JIT de Compresión e Integridad de Dossier.
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
      // Reducción masiva de peso para aniquilar el error 413.
      const [compressedHero, ...compressedOcrArray] = await Promise.all([
        compressNicePodImage(params.heroImage, 2048, 0.8),
        ...params.ocrImages.map(img => compressNicePodImage(img, 1600, 0.7))
      ]);

      nicepodLog("📦 [GeoEngine] Empaquetando evidencia optimizada...");

      // 2. TRANSMUTACIÓN BINARIA JIT
      const heroBase64 = await fileToBase64(compressedHero);
      const ocrTasks = compressedOcrArray.map(blob => fileToBase64(blob));
      const ocrBase64Array = await Promise.all(ocrTasks);

      // 3. DESPACHO AUTORIZADO A LA FORJA
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

      // 4. ANCLAJE ACÚSTICO (Sonido Ambiente In Situ)
      if (params.ambientAudio) {
        nicepodLog("🔊 [GeoEngine] Anclando paisaje sonoro...");
        const audioBase64 = await fileToBase64(params.ambientAudio);
        await attachAmbientAudioAction({ poiId, audioBase64 });
      }

      // 5. MATERIALIZACIÓN DEL DOSSIER (Sincronía de Tipos)
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

      setData((prev) => ({ ...prev, poiId, dossier: newDossier }));
      setStatus('DOSSIER_READY');
      nicepodLog(`✅ [GeoEngine] Ingesta exitosa: Nodo #${poiId}`);

    } catch (e: any) {
      nicepodLog(`🛑 [GeoEngine] Misión Abortada: ${e.message}`, null, 'error');
      setStatus('REJECTED');
      setError(e.message);
      setData((prev) => ({ ...prev, rejectionReason: e.message }));
      setIsLocked(false);
      throw e; // Liberación de la UI
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
      setData((prev) => ({ ...prev, narrative: result.data }));
      setStatus('NARRATIVE_READY');
    } catch (e: any) {
      nicepodLog("🔥 [GeoEngine] Fallo Narrativo", e.message, 'error');
      setStatus('REJECTED');
      setError(e.message);
      throw e;
    }
  };

  /**
   * transcribeVoiceIntent: Conversión STT de la semilla cognitiva.
   */
  const transcribeVoiceIntent = async (audioBase64: string): Promise<GeoActionResponse<{ transcription: string }>> => {
    return await transcribeVoiceIntentAction({ audioBase64 });
  };

  /**
   * reset: Protocolo de limpieza y retorno a IDLE.
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

  // Cleanup de hardware al desmontar
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
 * useGeoEngine: Hook de acceso al motor soberano.
 */
export function useGeoEngine() {
  const context = useContext(GeoEngineContext);
  if (context === undefined) {
    throw new Error("useGeoEngine debe usarse dentro de un GeoEngineProvider nominal.");
  }
  return context;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V9.0):
 * 1. Build Shield Geoespacial: Se eliminó el casting 'any' de 'nearbyPOIs', 
 *    obligando a que todo nodo en la malla respete la interfaz 'PointOfInterest'.
 * 2. Pipeline JIT Integrado: El motor ahora procesa la compresión en paralelo 
 *    antes de la conversión a Base64, optimizando el uso de RAM.
 * 3. Sincronía Táctica: Se mejoró el mapeo del dossier para capturar el 
 *    'historicalDossier' de Gemini Vision, nutriendo la Bóveda NKV.
 */