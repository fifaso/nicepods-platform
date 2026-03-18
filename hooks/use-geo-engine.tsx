// hooks/use-geo-engine.tsx
// VERSIÓN: 7.5 (NicePod V2.6 - Sovereign Geo-Engine Final Pro Edition)
// Misión: Orquestar telemetría ubicua, anclaje manual y puentes de ingesta/síntesis.
// [ESTABILIZACIÓN]: Tolerancia a OCR vacío, propagación de errores UI y STT neuronal.

"use client";

import { createClient } from "@/lib/supabase/client";
import { nicepodLog } from "@/lib/utils";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

// --- IMPORTACIÓN DE ACCIONES SOBERANAS (V6.4) ---
import {
  attachAmbientAudioAction,
  ingestPhysicalEvidenceAction,
  resolveLocationAction,
  synthesizeNarrativeAction,
  transcribeVoiceIntentAction // Nueva acción STT inyectada
} from "@/actions/geo-actions";

import {
  ActivePOI,
  GeoContextData,
  GeoEngineReturn,
  GeoEngineState,
  IngestionDossier,
  UserLocation
} from "@/types/geo-sovereignty";

/**
 * UTILIDAD INTERNA: fileToBase64
 * Transmuta archivos a strings para el puente de transporte JIT.
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

export function GeoEngineProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  // --- ESTADOS REACTIVOS TIPADOS ---
  const [status, setStatus] = useState<GeoEngineState>('IDLE');
  const [data, setData] = useState<GeoContextData>({});
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [activePOI, setActivePOI] = useState<ActivePOI | null>(null);
  const [nearbyPOIs, setNearbyPOIs] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const watchId = useRef<number | null>(null);
  const hasResolvedContextRef = useRef<boolean>(false);
  const lastRequestTimestamp = useRef<number>(0);

  const RESOLUTION_THRESHOLD = 100;
  const CONFLICT_LIMIT = 10;
  const NETWORK_COOLDOWN = 4000;

  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }, []);

  const fetchNearbyPOIs = useCallback(async () => {
    const now = Date.now();
    if (now - lastRequestTimestamp.current < NETWORK_COOLDOWN) return;
    setIsSearching(true);
    lastRequestTimestamp.current = now;
    try {
      const { data: pois, error: dbError } = await supabase.from('vw_map_resonance_active').select('*');
      if (dbError) throw dbError;
      setNearbyPOIs(pois || []);
    } catch (err: any) {
      console.error("🔥 [GeoEngine] DB Sync Fail:", err.message);
    } finally {
      setIsSearching(false);
    }
  }, [supabase]);

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
          id: poi.id.toString(), name: poi.name, distance: Math.round(dist),
          isWithinRadius: dist <= (poi.resonance_radius || 35), historical_fact: poi.historical_fact
        };
      }
    });

    setActivePOI(closest);
    setData((prev: GeoContextData) => ({ ...prev, isProximityConflict: minDistance < CONFLICT_LIMIT }));
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
    } catch (err: any) {
      console.error("🔥 [GeoEngine] Radar Fail:", err.message);
    } finally {
      setIsSearching(false);
    }
  }, [isSearching]);

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

  const initSensors = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setError("HARDWARE_GPS_DESACTIVADO");
      return;
    }
    if (isLocked) return;

    setStatus('SENSORS_READY');
    hasResolvedContextRef.current = false;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: UserLocation = { latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy, heading: null, speed: null };
        setUserLocation(loc);
        fetchNearbyPOIs();
      },
      (err) => nicepodLog(`🟡 [GeoEngine] WiFi/IP no disponible: ${err.message}`),
      { enableHighAccuracy: false, timeout: 5000 }
    );

    const handleSuccess = (position: GeolocationPosition) => {
      if (isLocked) return;
      const loc: UserLocation = { latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy, heading: position.coords.heading, speed: position.coords.speed };
      setUserLocation(loc);
      evaluateEnvironment(loc);
    };

    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = navigator.geolocation.watchPosition(handleSuccess, (err) => setError(`Señal Perdida: ${err.message}`), {
      enableHighAccuracy: true, timeout: 15000, maximumAge: 0
    });
  }, [fetchNearbyPOIs, isLocked, evaluateEnvironment]);

  const setManualAnchor = useCallback((lng: number, lat: number) => {
    if (watchId.current !== null) { navigator.geolocation.clearWatch(watchId.current); watchId.current = null; }
    const manualLocation: UserLocation = { latitude: lat, longitude: lng, accuracy: 1, heading: null, speed: null };
    setUserLocation(manualLocation);
    setIsLocked(true);
    hasResolvedContextRef.current = false;
    setStatus('SENSORS_READY');
    fetchNearbyPOIs();
  }, [fetchNearbyPOIs]);

  const setManualPlaceName = useCallback((name: string) => {
    setData((prev: GeoContextData) => ({ ...prev, manualPlaceName: name }));
  }, []);

  const reSyncRadar = useCallback(() => {
    if (userLocation) { hasResolvedContextRef.current = false; resolveContext(userLocation.latitude, userLocation.longitude); }
  }, [userLocation, resolveContext]);

  /**
   * ingestSensoryData:
   * [MEJORA CRÍTICA]: Transmite el error a la UI mediante 'throw e' para liberar botones.
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
    setError(null); // Purgamos errores previos antes de un nuevo intento

    try {
      nicepodLog("📦 [GeoEngine] Empaquetando evidencia visual y acústica...");

      const heroBase64 = await fileToBase64(params.heroImage);
      // El array ocrImages puede estar vacío, el map lo gestiona con seguridad
      const ocrTasks = params.ocrImages.map(file => fileToBase64(file));
      const ocrBase64Array = await Promise.all(ocrTasks);

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

      const { poiId, analysis, location } = result.data;

      if (params.ambientAudio) {
        nicepodLog("🔊 [GeoEngine] Anclando paisaje sonoro en la Bóveda...");
        const audioBase64 = await fileToBase64(params.ambientAudio);
        await attachAmbientAudioAction({ poiId, audioBase64 });
      }

      const newDossier: IngestionDossier = {
        poi_id: poiId,
        raw_ocr_text: analysis.ocrText || null,
        weather_snapshot: data.dossier?.weather_snapshot || { temp_c: 0, condition: "Sincronizado", is_day: true },
        visual_analysis_dossier: {
          architectureStyle: analysis.architectureStyle,
          atmosphere: analysis.atmosphere,
          detectedElements: analysis.detectedElements,
          detectedOfficialName: analysis.detectedOfficialName || analysis.officialName
        },
        sensor_accuracy: userLocation.accuracy,
        ingested_at: new Date().toISOString()
      };

      setData((prev: GeoContextData) => ({ ...prev, poiId, dossier: newDossier }));
      setStatus('DOSSIER_READY');
      nicepodLog(`✅ [GeoEngine] Ingesta exitosa confirmada.`);

    } catch (e: any) {
      nicepodLog(`🛑 [GeoEngine] Rechazo detectado: ${e.message}`);
      setStatus('REJECTED');
      setError(e.message);
      setData((prev: GeoContextData) => ({ ...prev, rejectionReason: e.message }));
      setIsLocked(false);
      // [MANDATO]: Lanzamos el error para que el 'catch' de Step 2 lo reciba
      // y ponga 'isIngesting' a false, habilitando el botón de nuevo.
      throw e;
    }
  };

  const synthesizeNarrative = async (params: { poiId: number; depth: 'flash' | 'cronica' | 'inmersion'; tone: string; refinedIntent?: string; }) => {
    setStatus('SYNTHESIZING');
    try {
      const result = await synthesizeNarrativeAction(params);
      if (!result.success || !result.data) throw new Error(result.error);
      setData((prev: GeoContextData) => ({ ...prev, narrative: result.data }));
      setStatus('NARRATIVE_READY');
    } catch (e: any) {
      setStatus('REJECTED');
      setError(e.message);
      setData((prev: GeoContextData) => ({ ...prev, rejectionReason: e.message }));
      throw e;
    }
  };

  /**
   * transcribeVoiceIntentAction:
   * Exponemos la acción STT para que el Step 2 la consuma directamente.
   */
  const transcribeVoiceIntent = async (audioBase64: string) => {
    return await transcribeVoiceIntentAction({ audioBase64 });
  };

  const reset = () => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    setStatus('IDLE'); setData({}); setIsLocked(false); setUserLocation(null); hasResolvedContextRef.current = false; setError(null);
  };

  useEffect(() => { return () => { if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current); }; }, []);

  return (
    <GeoEngineContext.Provider value={{
      status, data, userLocation, activePOI, nearbyPOIs, isSearching, isLocked, error,
      initSensors, setManualAnchor, setManualPlaceName, reSyncRadar, ingestSensoryData, synthesizeNarrative, reset,
      transcribeVoiceIntent // Añadido para resolver el TS2339 en Step 2
    }}>
      {children}
    </GeoEngineContext.Provider>
  );
}

export function useGeoEngine() {
  const context = useContext(GeoEngineContext);
  if (context === undefined) throw new Error("useGeoEngine debe usarse dentro de un GeoEngineProvider.");
  return context;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V7.5):
 * 1. Throw-Passthrough: El bloque catch de ingestSensoryData (Línea 296) 
 *    ahora lanza el error a la capa superior. Esto es lo que garantiza 
 *    que el botón "PROCESAR EXPEDIENTE" deje de girar si falla la subida.
 * 2. Transcripción Integrada: Se añadió 'transcribeVoiceIntent' a la interfaz 
 *    y al provider, resolviendo el último error de compilación (TS2339) 
 *    en el archivo del Step 2.
 */