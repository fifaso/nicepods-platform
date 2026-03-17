// hooks/use-geo-engine.ts
// VERSIÓN: 6.3 (NicePod V2.6 - Sovereign Geo-Engine Hybrid Edition)
// Misión: Orquestar telemetría progresiva, anclaje manual y puentes de ingesta/síntesis.
// [ESTABILIZACIÓN]: Solución al error visual 0.0M y soporte para PC/Móvil con anclaje de autoridad.

"use client";

import { createClient } from "@/lib/supabase/client";
import { nicepodLog } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

// --- IMPORTACIÓN DE SOBERANÍA TÉCNICA (NICECORE V2.6) ---
import {
  attachAmbientAudioAction,
  ingestPhysicalEvidenceAction,
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
  | 'IDLE'             // Esperando activación.
  | 'SENSORS_READY'    // Sensores activos (GPS o WiFi).
  | 'INGESTING'        // Transfiriendo binarios y ejecutando IA Sensorial.
  | 'DOSSIER_READY'    // Ingesta exitosa, esperando revisión humana.
  | 'SYNTHESIZING'     // Forjando narrativa con el Agente 42.
  | 'NARRATIVE_READY'  // Crónica lista para ser publicada.
  | 'REJECTED';        // Fallo estructural o de calidad.

export interface GeoContextData {
  poiId?: number;
  dossier?: IngestionDossier;
  narrative?: {
    title: string;
    hook: string;
    script: string;
  };
  rejectionReason?: string;
}

export interface GeoEngineReturn {
  status: GeoEngineState;
  data: GeoContextData;
  userLocation: UserLocation | null;
  activePOI: ActivePOI | null;
  nearbyPOIs: any[];
  isSearching: boolean;
  isLocked: boolean; // Si true, el GPS deja de actualizar para respetar el anclaje manual.
  error: string | null;

  initSensors: () => void;
  setManualAnchor: (lng: number, lat: number) => void;

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

/**
 * UTILIDAD: fileToBase64
 * Transmuta objetos File/Blob a strings para la capa de transporte JIT.
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
 * II. NÚCLEO SENSORIAL (HOOK PRINCIPAL)
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

  const watchId = useRef<number | null>(null);
  const lastSyncLocation = useRef<{ lat: number; lng: number } | null>(null);
  const lastRequestTimestamp = useRef<number>(0);

  // Constantes de Misión
  const MOVEMENT_THRESHOLD = 15;
  const NETWORK_COOLDOWN = 5000;

  /**
   * calculateDistance: Fórmula de Haversine para proximidad local.
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
   * fetchNearbyPOIs: Sincroniza la malla urbana activa.
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
      setNearbyPOIs(pois || []);
    } catch (err: any) {
      console.error("🔥 [GeoEngine] Sync Fail:", err.message);
    } finally {
      setIsSearching(false);
    }
  }, [supabase]);

  /**
   * evaluateResonance: Detecta cruces de proximidad con nodos existentes.
   */
  const evaluateResonance = useCallback((location: UserLocation) => {
    if (nearbyPOIs.length === 0) return;

    let closest: ActivePOI | null = null;
    let minDistance = Infinity;

    nearbyPOIs.forEach((poi) => {
      if (!poi.geo_location?.coordinates) return;

      const poiLat = poi.geo_location.coordinates[1];
      const poiLng = poi.geo_location.coordinates[0];
      const dist = calculateDistance(location.latitude, location.longitude, poiLat, poiLng);

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
  }, [nearbyPOIs, calculateDistance]);

  /**
   * ---------------------------------------------------------------------------
   * III. PROTOCOLOS DE CONTROL HARDWARE
   * ---------------------------------------------------------------------------
   */

  /**
   * initSensors: Encendido de hardware GPS (Telemetría Ubicua).
   * [SINTONÍA V6.3]: Reportamos posición inmediata aunque la precisión sea baja (PC Support).
   */
  const initSensors = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setError("HARDWARE_GPS_DESACTIVADO");
      return;
    }

    if (isLocked) return;

    setStatus('SENSORS_READY');

    // 1. Captura Inmediata (WiFi / IP) para encender el mapa rápido
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: UserLocation = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: null
        };
        setUserLocation(loc);
        evaluateResonance(loc);
        fetchNearbyPOIs();
        nicepodLog(`🛰️ [GeoEngine] Posición inicial (WiFi/IP) resuelta: ${pos.coords.accuracy}m`);
      },
      (err) => console.warn("GPS Pre-check failed", err),
      { enableHighAccuracy: false, timeout: 5000 }
    );

    // 2. Seguimiento de alta precisión (Sustituye a la anterior si mejora)
    const handleSuccess = (position: GeolocationPosition) => {
      // Si el Admin bloqueó la posición manualmente, ignoramos los saltos del GPS.
      if (isLocked) return;

      const loc: UserLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading
      };

      setUserLocation(loc);
      evaluateResonance(loc);

      const dist = !lastSyncLocation.current ? Infinity :
        calculateDistance(loc.latitude, loc.longitude, lastSyncLocation.current.lat, lastSyncLocation.current.lng);

      if (dist > MOVEMENT_THRESHOLD) {
        fetchNearbyPOIs();
        lastSyncLocation.current = { lat: loc.latitude, lng: loc.longitude };
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      setError(err.message);
      nicepodLog(`⚠️ [GeoEngine] Fallo de enlace: ${err.message}`);
    };

    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true, timeout: 15000, maximumAge: 0
    });

  }, [fetchNearbyPOIs, calculateDistance, isLocked, evaluateResonance]);

  /**
   * setManualAnchor: Sobreescritura manual del Administrador.
   * Cancela el GPS y bloquea la posición a la mira del mapa.
   */
  const setManualAnchor = useCallback((lng: number, lat: number) => {
    nicepodLog(`📍 [GeoEngine] Autoridad Admin: Posición bloqueada manualmente.`);

    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate([10, 50, 10]);
    }

    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    const manualLocation: UserLocation = {
      latitude: lat,
      longitude: lng,
      accuracy: 1, // Precisión absoluta (Verificada por Admin)
      heading: null
    };

    setUserLocation(manualLocation);
    evaluateResonance(manualLocation);
    setIsLocked(true);
    setStatus('SENSORS_READY');

    fetchNearbyPOIs();
  }, [fetchNearbyPOIs, evaluateResonance]);

  /**
   * ---------------------------------------------------------------------------
   * IV. PIPELINES DE SOBERANÍA (CEREBRO DUAL V2.6)
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
    if (!userLocation) {
      setError("POSICIÓN_NO_ANCLADA");
      return;
    }

    setIsLocked(true);
    setStatus('INGESTING');

    try {
      nicepodLog("📦 [GeoEngine] Preparando despacho multimodal...");
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

      // Cierre de Misión Acústica (Fase 1.5)
      if (params.ambientAudio) {
        nicepodLog("🔊 [GeoEngine] Sincronizando Paisaje Sonoro...");
        const audioBase64 = await fileToBase64(params.ambientAudio);
        await attachAmbientAudioAction({ poiId, audioBase64 });
      }

      const newDossier: IngestionDossier = {
        poi_id: poiId,
        raw_ocr_text: analysis.ocrText || null,
        weather_snapshot: {
          temp_c: location.currentTemp || 0,
          condition: "Capturado",
          is_day: true
        },
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
      nicepodLog(`✅ [GeoEngine] Ingesta exitosa para POI #${poiId}`);

      return { poiId, dossier: newDossier };

    } catch (e: any) {
      nicepodLog(`🛑 [GeoEngine] Fallo en la fase sensorial: ${e.message}`);
      setStatus('REJECTED');
      setData({ rejectionReason: e.message });
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
      nicepodLog(`🧠 [GeoEngine] Despertando al Agente 42 para POI #${params.poiId}`);
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
      nicepodLog("✍️ [GeoEngine] Crónica Urbana forjada con éxito.");

    } catch (e: any) {
      nicepodLog(`🛑 [GeoEngine] Fallo en la Síntesis: ${e.message}`);
      setStatus('REJECTED');
      setData(prev => ({ ...prev, rejectionReason: e.message }));
    }
  };

  const reset = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setStatus('IDLE');
    setData({});
    setIsLocked(false);
    lastSyncLocation.current = null;
    setUserLocation(null);
    nicepodLog("🧹 [GeoEngine] Terminal Sensorial Purificada.");
  };

  useEffect(() => {
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  return {
    status,
    data,
    userLocation,
    activePOI,
    nearbyPOIs,
    isSearching,
    isLocked,
    error,
    initSensors,
    setManualAnchor,
    ingestSensoryData,
    synthesizeNarrative,
    reset
  };
}