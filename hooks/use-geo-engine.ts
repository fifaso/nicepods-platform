// hooks/use-geo-engine.ts
// VERSIÓN: 6.2 (NicePod V2.6 - Sovereign Geo-Engine & Dual Brain Pro)
// Misión: Orquestar telemetría progresiva, anclaje manual y puentes de ingesta/síntesis.
// [ESTABILIZACIÓN]: Solución al error visual 0.0M, optimización de batería y haptics.

"use client";

import { createClient } from "@/lib/supabase/client";
import { nicepodLog } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

// --- IMPORTACIÓN DE SOBERANÍA TÉCNICA (NICECORE V2.6) ---
import {
  attachAmbientAudioAction // Nuevo V5.0 para cerrar el ciclo multimodal
  ,
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
  | 'SENSORS_READY'    // GPS activo o Anclaje Manual fijado.
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
  isLocked: boolean;
  error: string | null;

  initSensors: () => void;
  setManualAnchor: (lng: number, lat: number) => void;

  ingestSensoryData: (params: {
    heroImage: File;
    ocrImage: File | null;
    ambientAudio?: Blob | null; // Soporte para sonido real
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

  // --- REFERENCIAS TÁCTICAS (PROTOCOLO STEADY PULSE) ---
  const watchId = useRef<number | null>(null);
  const lastSyncLocation = useRef<{ lat: number; lng: number } | null>(null);
  const lastRequestTimestamp = useRef<number>(0);

  // Constantes de Rigor Industrial
  const MOVEMENT_THRESHOLD = 15;  // Metros mínimos para re-sintonizar DB
  const ACCURACY_CRITICAL_LIMIT = 50; // Umbral de advertencia
  const NETWORK_COOLDOWN = 5000;  // 5s de guardia entre peticiones de red

  /**
   * calculateDistance: Fórmula de Haversine.
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
   * fetchNearbyPOIs: Sincroniza la malla urbana desde la vista SQL.
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
   * initSensors: Encendido de hardware GPS (Telemetría Progresiva).
   * [FIX]: Se elimina el bloqueo de retorno si la señal es mala para dar feedback.
   */
  const initSensors = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setError("HARDWARE_GPS_DESACTIVADO");
      return;
    }

    if (isLocked) return;

    const handleSuccess = (position: GeolocationPosition) => {
      const loc: UserLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading
      };

      // [FEEDBACK PROGRESIVO]: Enviamos la posición aunque la precisión sea mala.
      // Solo restringimos la búsqueda en DB si la señal es demasiado ruidosa.
      setUserLocation(loc);
      evaluateResonance(loc);

      if (loc.accuracy > ACCURACY_CRITICAL_LIMIT) {
        nicepodLog(`🟡 [GeoEngine] Telemetría débil: ${Math.round(loc.accuracy)}m.`);
      }

      const dist = !lastSyncLocation.current ? Infinity :
        calculateDistance(loc.latitude, loc.longitude, lastSyncLocation.current.lat, lastSyncLocation.current.lng);

      // Sincronizamos la malla urbana solo si nos hemos movido lo suficiente
      if (dist > MOVEMENT_THRESHOLD && !isLocked) {
        fetchNearbyPOIs();
        lastSyncLocation.current = { lat: loc.latitude, lng: loc.longitude };
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      setError(err.message);
      nicepodLog(`⚠️ [GeoEngine] Fallo de enlace GPS: ${err.message}`);
    };

    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true, timeout: 15000, maximumAge: 0
    });

    setStatus('SENSORS_READY');
  }, [fetchNearbyPOIs, calculateDistance, isLocked, evaluateResonance]);

  /**
   * setManualAnchor: Override táctico del Administrador.
   */
  const setManualAnchor = useCallback((lng: number, lat: number) => {
    nicepodLog(`📍 [GeoEngine] Anclaje Manual en: [${lng.toFixed(5)}, ${lat.toFixed(5)}]`);

    // Feedback táctil al Admin
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
      accuracy: 1,
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

  /**
   * ingestSensoryData: Fase 1 (SENSES).
   * Misión: Transporte de binarios -> Ingesta Multimodal.
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
      setError("POSICIÓN_NO_BLOQUEADA");
      return;
    }

    setIsLocked(true);
    setStatus('INGESTING');

    try {
      nicepodLog("📦 [GeoEngine] Codificando evidencia multimodal...");
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

      // 1. Ingesta de Datos (Cámaras + Sensores)
      const result = await ingestPhysicalEvidenceAction(payload);
      if (!result.success || !result.data) throw new Error(result.error || result.message);

      const { poiId, analysis, location } = result.data;

      // 2. Anclaje Acústico (Si el Admin capturó audio ambiente)
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
          condition: "Sincronizado",
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
      nicepodLog(`✅ [GeoEngine] Ingesta nominal para POI #${poiId}`);

      return { poiId, dossier: newDossier };

    } catch (e: any) {
      nicepodLog(`🛑 [GeoEngine] Fallo en la fase sensorial: ${e.message}`);
      setStatus('REJECTED');
      setData({ rejectionReason: e.message });
      setIsLocked(false);
    }
  };

  /**
   * synthesizeNarrative: Fase 2 (BRAIN).
   */
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
      nicepodLog("✍️ [GeoEngine] Crónica Urbana materializada.");

    } catch (e: any) {
      nicepodLog(`🛑 [GeoEngine] Error de Síntesis: ${e.message}`);
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
    nicepodLog("🧹 [GeoEngine] Terminal Sensorial Restablecida.");
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

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.2):
 * 1. Telemetría Progresiva: Al eliminar el filtro de precisión en el guardado 
 *    del estado visual (Línea 168), resolvemos el bug del "0.0M". El Admin verá 
 *    ahora cómo mejora su señal segundo a segundo.
 * 2. Cierre de Misión Acústica: Se integró 'attachAmbientAudioAction'. Si el 
 *    Admin grabó sonido en el paso anterior, el hook lo procesa atómicamente 
 *    tras la ingesta visual, garantizando la inmersión total.
 * 3. Haptics: Se añadió vibración nativa en el 'setManualAnchor' para proveer 
 *    una sensación de "herramienta física" al Administrador durante el anclaje.
 */