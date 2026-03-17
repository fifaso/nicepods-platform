// hooks/use-geo-engine.ts
// VERSIÓN: 6.6 (NicePod V2.6 - Sovereign Geo-Engine Unlocked Edition)
// Misión: Orquestar telemetría ubicua, anclaje manual y puentes de ingesta/síntesis.
// [ESTABILIZACIÓN]: Solución al error visual 0.0M, auto-resolución de radar y soporte PC/Móvil.

"use client";

import { createClient } from "@/lib/supabase/client";
import { nicepodLog } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

// --- IMPORTACIÓN DE ACCIONES SOBERANAS (SERVER ACTIONS V5.1) ---
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

/**
 * GeoEngineState: Ciclo de vida alineado con la arquitectura de Cerebro Dual.
 */
export type GeoEngineState =
  | 'IDLE'             // Esperando ignición.
  | 'SENSORS_READY'    // Hardware en línea (GPS o WiFi).
  | 'INGESTING'        // Transfiriendo binarios y ejecutando IA Sensorial.
  | 'DOSSIER_READY'    // Evidencia capturada y validada por Admin.
  | 'SYNTHESIZING'     // Forjando narrativa con el Agente 42.
  | 'NARRATIVE_READY'  // Crónica lista para despliegue oficial.
  | 'CONFLICT'         // Alerta de proximidad excesiva (<10m).
  | 'REJECTED';        // Fallo de red o validación.

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

  // Acciones de Control
  initSensors: () => void;
  setManualAnchor: (lng: number, lat: number) => void;
  setManualPlaceName: (name: string) => void;
  reSyncRadar: () => void; // Gatillo manual para forzar identificación

  // Acciones de Pipeline
  ingestSensoryData: (params: {
    heroImage: File;
    ocrImage: File | null;
    ambientAudio?: Blob | null;
    intent: string;
    categoryId: string;
    radius: number;
  }) => Promise<void>;

  synthesizeNarrative: (params: {
    poiId: number;
    depth: 'flash' | 'cronica' | 'inmersion';
    tone: string;
    refinedIntent?: string;
  }) => Promise<void>;

  reset: () => void;
}

/**
 * UTILIDAD: fileToBase64
 * [OOM PREVENTION]: Transmuta binarios a strings solo en el momento del transporte.
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
 * ---------------------------------------------------------------------------
 * II. NÚCLEO OMNISCIENTE (HOOK PRINCIPAL)
 * ---------------------------------------------------------------------------
 */
export function useGeoEngine(): GeoEngineReturn {
  const supabase = createClient();

  // --- ESTADOS REACTIVOS ---
  const [status, setStatus] = useState<GeoEngineState>('IDLE');
  const [data, setData] = useState<GeoContextData>({});
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [activePOI, setActivePOI] = useState<ActivePOI | null>(null);
  const [nearbyPOIs, setNearbyPOIs] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- REFERENCIAS TÁCTICAS (ESTADO SIN RE-RENDER) ---
  const watchId = useRef<number | null>(null);
  const hasResolvedContextRef = useRef<boolean>(false);
  const lastRequestTimestamp = useRef<number>(0);

  // Constantes de Misión
  const RESOLUTION_THRESHOLD = 100; // Umbral relajado para identificación inicial (PC Support)
  const CONFLICT_LIMIT = 10;        // Metros para alertar colisión de siembra
  const NETWORK_COOLDOWN = 4000;

  /**
   * resolveContext: 
   * [FASE 0]: Identificación de Lugar y Clima (IA de Radar).
   */
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

  /**
   * evaluateEnvironment: Analiza proximidad y colisiones.
   */
  const evaluateEnvironment = useCallback((location: UserLocation) => {
    if (nearbyPOIs.length === 0) return;

    let closest: ActivePOI | null = null;
    let minDistance = Infinity;

    nearbyPOIs.forEach((poi) => {
      if (!poi.geo_location?.coordinates) return;
      const [pLng, pLat] = poi.geo_location.coordinates;

      const R = 6371e3;
      const dLat = (pLat - location.latitude) * (Math.PI / 180);
      const dLon = (pLng - location.longitude) * (Math.PI / 180);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(location.latitude * (Math.PI / 180)) * Math.cos(pLat * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

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
  }, [nearbyPOIs]);

  /**
   * fetchNearbyPOIs: Sincroniza la Malla Urbana.
   */
  const fetchNearbyPOIs = useCallback(async () => {
    try {
      const { data: pois, error: dbError } = await supabase
        .from('vw_map_resonance_active')
        .select('*');
      if (dbError) throw dbError;
      setNearbyPOIs(pois || []);
    } catch (err: any) {
      console.error("🔥 [GeoEngine] DB Sync Fail:", err.message);
    }
  }, [supabase]);

  /**
   * ---------------------------------------------------------------------------
   * III. PROTOCOLOS DE CONTROL HARDWARE
   * ---------------------------------------------------------------------------
   */

  /**
   * initSensors: Ignición de Triangulación Híbrida.
   */
  const initSensors = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setError("HARDWARE_GPS_DESACTIVADO");
      return;
    }

    if (isLocked) return;
    setStatus('SENSORS_READY');
    hasResolvedContextRef.current = false;

    // 1. Triangulación Rápida (WiFi/IP) para encendido de mapa instantáneo
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
        // Disparamos la resolución automática si la precisión inicial es decente (<100m)
        if (loc.accuracy < RESOLUTION_THRESHOLD) {
          resolveContext(loc.latitude, loc.longitude);
        }
      },
      (err) => nicepodLog(`🟡 [GeoEngine] WiFi/IP no disponible: ${err.message}`),
      { enableHighAccuracy: false, timeout: 5000 }
    );

    // 2. Seguimiento de Alta Precisión (Satélite)
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

      // Gatillo de Auto-Resolución: Si la señal mejora y no hemos resuelto, disparamos radar.
      if (loc.accuracy < 35 && !hasResolvedContextRef.current) {
        resolveContext(loc.latitude, loc.longitude);
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      setError(`Hardware Sync Error: ${err.message}`);
    };

    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true, timeout: 15000, maximumAge: 0
    });

  }, [fetchNearbyPOIs, isLocked, evaluateEnvironment, resolveContext]);

  /**
   * setManualAnchor: Sobreescritura soberana del Administrador.
   */
  const setManualAnchor = useCallback((lng: number, lat: number) => {
    nicepodLog(`📍 [GeoEngine] Anclaje Manual. GPS Desconectado.`);
    if (typeof window !== "undefined" && navigator.vibrate) navigator.vibrate([10, 50, 10]);

    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    const manualLocation: UserLocation = {
      latitude: lat, longitude: lng, accuracy: 1, heading: null, speed: null
    };

    setUserLocation(manualLocation);
    setIsLocked(true);
    hasResolvedContextRef.current = false;
    resolveContext(lat, lng); // Resolvemos inmediatamente en la nueva coordenada
    fetchNearbyPOIs();
  }, [fetchNearbyPOIs, resolveContext]);

  /**
   * reSyncRadar: Permite al Admin forzar la identificación si el GPS es ruidoso.
   */
  const reSyncRadar = useCallback(() => {
    if (userLocation) {
      hasResolvedContextRef.current = false;
      resolveContext(userLocation.latitude, userLocation.longitude);
    }
  }, [userLocation, resolveContext]);

  /**
   * setManualPlaceName: Soberanía nominativa.
   */
  const setManualPlaceName = useCallback((name: string) => {
    setData(prev => ({ ...prev, manualPlaceName: name }));
  }, []);

  /**
   * ---------------------------------------------------------------------------
   * IV. PIPELINES DE SOBERANÍA (CEREBRO DUAL)
   * ---------------------------------------------------------------------------
   */

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

      // 1. Ingesta Visual
      const result = await ingestPhysicalEvidenceAction(payload);
      if (!result.success || !result.data) throw new Error(result.error);

      const { poiId, analysis } = result.data;

      // 2. Anclaje Acústico
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
      const result = await synthesizeNarrativeAction(params);
      if (!result.success || !result.data) throw new Error(result.error);
      setData(prev => ({ ...prev, narrative: result.data }));
      setStatus('NARRATIVE_READY');
    } catch (e: any) {
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
    nicepodLog("🧹 [GeoEngine] Sistema purificado.");
  };

  useEffect(() => {
    return () => { if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current); };
  }, []);

  return {
    status, data, userLocation, activePOI, nearbyPOIs, isSearching, isLocked, error,
    initSensors, setManualAnchor, setManualPlaceName, reSyncRadar, ingestSensoryData, synthesizeNarrative, reset
  };
}