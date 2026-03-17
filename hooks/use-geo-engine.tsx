// hooks/use-geo-engine.tsx
// VERSIÓN: 7.2 (NicePod V2.6 - Sovereign Geo-Engine Provider)
// Misión: Orquestar telemetría ubicua asegurando una ÚNICA fuente de verdad.
// [ESTABILIZACIÓN]: Conversión a JSX (.tsx) para habilitar el Context Provider.

"use client";

import { createClient } from "@/lib/supabase/client";
import { nicepodLog } from "@/lib/utils";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

// --- IMPORTACIÓN DE ACCIONES SOBERANAS (SERVER ACTIONS) ---
import {
  attachAmbientAudioAction,
  ingestPhysicalEvidenceAction,
  resolveLocationAction,
  synthesizeNarrativeAction
} from "@/actions/geo-actions";

import {
  IngestionDossier,
  POICreationPayload
} from "@/types/geo-sovereignty";

/**
 * ---------------------------------------------------------------------------
 * I. CONTRATOS DE DATOS Y ESTADO TÁCTICO
 * ---------------------------------------------------------------------------
 */

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading: number | null;
  speed: number | null;
}

export interface ActivePOI {
  id: string;
  name: string;
  distance: number;
  isWithinRadius: boolean;
  historical_fact?: string;
}

export type GeoEngineState =
  | 'IDLE'
  | 'SENSORS_READY'
  | 'INGESTING'
  | 'DOSSIER_READY'
  | 'SYNTHESIZING'
  | 'NARRATIVE_READY'
  | 'CONFLICT'
  | 'REJECTED';

export interface GeoContextData {
  poiId?: number;
  dossier?: IngestionDossier;
  narrative?: {
    title: string;
    hook: string;
    script: string;
  };
  manualPlaceName?: string;
  isProximityConflict?: boolean;
  rejectionReason?: string;
}

export interface GeoEngineReturn {
  status: GeoEngineState;
  data: GeoContextData;
  userLocation: UserLocation | null;
  activePOI: ActivePOI | null;
  nearbyPOIs: any[];
  isSearching: boolean;
  isLocked: boolean;
  error: string | null;

  initSensors: () => void;
  setManualAnchor: (lng: number, lat: number) => void;
  setManualPlaceName: (name: string) => void;
  reSyncRadar: () => void;

  ingestSensoryData: (params: {
    heroImage: File;
    ocrImage: File | null;
    ambientAudio?: Blob | null;
    intent: string;
    categoryId: string;
    radius: number;
  }) => Promise<{ poiId: number; dossier: IngestionDossier } | void>;

  synthesizeNarrative: (params: {
    poiId: number;
    depth: 'flash' | 'cronica' | 'inmersion';
    tone: string;
    refinedIntent?: string;
  }) => Promise<void>;

  reset: () => void;
}

const fileToBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * ---------------------------------------------------------------------------
 * II. CREACIÓN DEL CONTEXTO
 * ---------------------------------------------------------------------------
 */
const GeoEngineContext = createContext<GeoEngineReturn | undefined>(undefined);

/**
 * ---------------------------------------------------------------------------
 * III. EL PROVIDER SOBERANO
 * Actúa como la fuente única de verdad para el mapa y la UI.
 * ---------------------------------------------------------------------------
 */
export function GeoEngineProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

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
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }, []);

  const resolveContext = useCallback(async (lat: number, lng: number) => {
    if (isSearching) return;
    setIsSearching(true);
    nicepodLog("📡 [GeoEngine] Radar activado. Consultando coordenadas...");

    try {
      const result = await resolveLocationAction(lat, lng);
      if (result.success && result.data) {
        setData(prev => ({
          ...prev,
          manualPlaceName: result.data.place.poiName,
          dossier: {
            ...(prev.dossier as any),
            weather_snapshot: result.data.weather
          }
        }));
        hasResolvedContextRef.current = true;
        nicepodLog(`✅ [GeoEngine] Nodo identificado: ${result.data.place.poiName}`);
      }
    } catch (err: any) {
      console.error("🔥 [GeoEngine] Radar Fail:", err.message);
    } finally {
      setIsSearching(false);
    }
  }, [isSearching]);

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
          historical_fact: poi.historical_fact
        };
      }
    });

    setActivePOI(closest);

    if (minDistance < CONFLICT_LIMIT) {
      setData(prev => ({ ...prev, isProximityConflict: true }));
    } else {
      setData(prev => ({ ...prev, isProximityConflict: false }));
    }
  }, [nearbyPOIs, calculateDistance]);

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
      setNearbyPOIs(pois || []);
    } catch (err: any) {
      console.error("🔥 [GeoEngine] DB Sync Fail:", err.message);
    } finally {
      setIsSearching(false);
    }
  }, [supabase]);

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
        const loc: UserLocation = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: null, speed: null
        };
        setUserLocation(loc);
        fetchNearbyPOIs();
        if (loc.accuracy < RESOLUTION_THRESHOLD) {
          resolveContext(loc.latitude, loc.longitude);
        }
      },
      (err) => nicepodLog(`🟡 [GeoEngine] WiFi/IP no disponible: ${err.message}`),
      { enableHighAccuracy: false, timeout: 5000 }
    );

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

      if (loc.accuracy < 35 && !hasResolvedContextRef.current) {
        resolveContext(loc.latitude, loc.longitude);
      }
    };

    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = navigator.geolocation.watchPosition(handleSuccess, (err) => setError(`Señal Perdida: ${err.message}`), {
      enableHighAccuracy: true, timeout: 15000, maximumAge: 0
    });

  }, [fetchNearbyPOIs, isLocked, evaluateEnvironment, resolveContext]);

  const setManualAnchor = useCallback((lng: number, lat: number) => {
    nicepodLog(`📍 [GeoEngine] Autoridad Admin: Anclaje Manual [${lng.toFixed(4)}, ${lat.toFixed(4)}]`);

    if (typeof window !== "undefined" && navigator.vibrate) navigator.vibrate([10, 50, 10]);

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
    evaluateEnvironment(manualLocation);
    setIsLocked(true);
    hasResolvedContextRef.current = false;
    resolveContext(lat, lng);
    fetchNearbyPOIs();
  }, [fetchNearbyPOIs, evaluateEnvironment, resolveContext]);

  const setManualPlaceName = useCallback((name: string) => {
    setData(prev => ({ ...prev, manualPlaceName: name }));
  }, []);

  const reSyncRadar = useCallback(() => {
    if (userLocation) {
      hasResolvedContextRef.current = false;
      resolveContext(userLocation.latitude, userLocation.longitude);
    }
  }, [userLocation, resolveContext]);

  const ingestSensoryData = async (params: {
    heroImage: File;
    ocrImage: File | null;
    ambientAudio?: Blob | null;
    intent: string;
    categoryId: string;
    radius: number;
  }) => {
    if (!userLocation) return;
    setIsLocked(true);
    setStatus('INGESTING');

    try {
      nicepodLog("📦 [GeoEngine] Codificando binarios...");
      const heroBase64 = await fileToBase64(params.heroImage);
      const ocrBase64 = params.ocrImage ? await fileToBase64(params.ocrImage) : undefined;

      const payload: POICreationPayload = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        accuracy: userLocation.accuracy,
        heroImage: heroBase64,
        ocrImage: ocrBase64,
        categoryId: params.categoryId,
        resonanceRadius: params.radius,
        adminIntent: params.intent
      };

      const result = await ingestPhysicalEvidenceAction(payload);
      if (!result.success || !result.data) throw new Error(result.error || result.message);

      const { poiId, analysis, location } = result.data;

      if (params.ambientAudio) {
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
          detectedOfficialName: analysis.officialName
        },
        sensor_accuracy: userLocation.accuracy,
        ingested_at: new Date().toISOString()
      };

      setData(prev => ({ ...prev, poiId, dossier: newDossier }));
      setStatus('DOSSIER_READY');

    } catch (e: any) {
      nicepodLog(`🛑 [GeoEngine] Ingest Fail: ${e.message}`);
      setStatus('REJECTED');
      setData(prev => ({ ...prev, rejectionReason: e.message }));
      setIsLocked(false);
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
      nicepodLog(`🧠 [GeoEngine] Invocando Agente 42 para POI #${params.poiId}`);
      const result = await synthesizeNarrativeAction(params);

      if (!result.success || !result.data) throw new Error(result.error || result.message);

      setData(prev => ({
        ...prev,
        narrative: {
          title: result.data.title,
          hook: result.data.hook,
          script: result.data.script
        }
      }));

      setStatus('NARRATIVE_READY');

    } catch (e: any) {
      nicepodLog(`🛑 [GeoEngine] Fallo en Agente 42: ${e.message}`);
      setStatus('REJECTED');
      setData(prev => ({ ...prev, rejectionReason: e.message }));
    }
  };

  const reset = () => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    setStatus('IDLE');
    setData({});
    setIsLocked(false);
    setUserLocation(null);
    hasResolvedContextRef.current = false;
  };

  useEffect(() => {
    return () => { if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current); };
  }, []);

  return (
    <GeoEngineContext.Provider value={{
      status, data, userLocation, activePOI, nearbyPOIs, isSearching, isLocked, error,
      initSensors, setManualAnchor, setManualPlaceName, reSyncRadar, ingestSensoryData, synthesizeNarrative, reset
    }}>
      {children}
    </GeoEngineContext.Provider>
  );
}

/**
 * ---------------------------------------------------------------------------
 * IV. HOOK DE CONSUMO (THE CLIENT)
 * ---------------------------------------------------------------------------
 */
export function useGeoEngine() {
  const context = useContext(GeoEngineContext);
  if (context === undefined) {
    throw new Error("useGeoEngine debe usarse dentro de un GeoEngineProvider.");
  }
  return context;
}