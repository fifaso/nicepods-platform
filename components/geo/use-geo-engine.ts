// components/geo/use-geo-engine.ts
// VERSIÓN: 5.1

"use client";

import { createClient } from "@/lib/supabase/client";
import { nicepodLog } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * IMPORTACIÓN DE PASARELAS SEGURAS (SERVER ACTIONS)
 * Centralizamos el despacho síncrono para proteger la SERVICE_ROLE_KEY.
 * [SINCRO]: Se utiliza 'analyzeMultimodalAction' para paridad con actions/geo-actions.ts v3.1.
 */
import {
  analyzeMultimodalAction,
  generateGeoContentAction,
  resolveLocationAction,
  uploadGeoEvidence
} from "@/actions/geo-actions";

/**
 * ---------------------------------------------------------------------------
 * I. CONTRATOS DE DATOS Y TIPADO (ESTÁNDAR NICEPOD V2.5)
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
 * GeoState: Máquina de estados para la misión de siembra geoespacial.
 */
export type GeoState =
  | 'IDLE'               // Esperando activación manual
  | 'SENSORS_READY'      // GPS en línea, calibrando precisión
  | 'LOCATION_RESOLVED'  // Nodo identificado y clima capturado
  | 'SCANNING'           // Transfiriendo activos binarios al Storage
  | 'ANALYZING'          // IA procesando evidencia y OCR
  | 'ACCEPTED'           // Crónica sintetizada correctamente
  | 'REJECTED';          // Fallo de integridad o error de red

export interface GeoContextData {
  draftId?: string;
  script?: string;
  weather?: {
    temp_c: number;
    condition: string;
    is_day: boolean;
  };
  place?: {
    poiName: string;
    cityName: string;
    fullAddress: string;
  };
  rejectionReason?: string;
  analysis?: any;
}

/**
 * INTERFAZ: GeoEngineReturn
 * Define la soberanía del objeto que el hook entrega a la interfaz de usuario.
 */
export interface GeoEngineReturn {
  status: GeoState;
  data: GeoContextData;
  userLocation: UserLocation | null;
  activePOI: ActivePOI | null;
  nearbyPOIs: any[];
  isSearching: boolean;
  isLocked: boolean;
  error: string | null;
  initSensors: () => void;
  resolveCurrentLocation: () => Promise<void>;
  scanEnvironment: (params: {
    heroImage: string;
    ocrImage?: string;
    intent: string;
    category: string;
    radius: number
  }) => Promise<void>;
  submitIntent: (params: {
    intentText: string;
    depth: string;
    tone: string;
    categoryId: string;
    historicalFact: string
  }) => Promise<void>;
  reset: () => void;
}

/**
 * HOOK: useGeoEngine
 * El orquestador sensorial de la Workstation NicePod.
 */
export function useGeoEngine(): GeoEngineReturn {
  const supabase = createClient();

  // --- ESTADOS REACTIVOS ---
  const [status, setStatus] = useState<GeoState>('IDLE');
  const [data, setData] = useState<GeoContextData>({});
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [activePOI, setActivePOI] = useState<ActivePOI | null>(null);
  const [nearbyPOIs, setNearbyPOIs] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- REFERENCIAS DE MEMORIA (PROTOCOLO STEADY PULSE) ---
  const watchId = useRef<number | null>(null);
  const lastSyncLocation = useRef<{ lat: number; lng: number } | null>(null);
  const lastRequestTimestamp = useRef<number>(0);

  const MOVEMENT_THRESHOLD = 15;  // Metros mínimos para re-sintonizar
  const ACCURACY_LIMIT = 30;      // Ignorar señales GPS con >30m de error
  const NETWORK_COOLDOWN = 5000;  // 5s de guardia entre peticiones de red

  /**
   * calculateDistance: Implementación de la Fórmula de Haversine.
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
   * fetchNearbyPOIs: Sincroniza la malla urbana desde la base de datos.
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
   * resolveCurrentLocation: Identificación nominal del lugar (Fase Ligera).
   */
  const resolveCurrentLocation = useCallback(async () => {
    if (!userLocation || isLocked) return;

    setIsSearching(true);
    try {
      const result = await resolveLocationAction(userLocation.latitude, userLocation.longitude);
      if (result.success) {
        setData(prev => ({ ...prev, ...result.data }));
        setStatus('LOCATION_RESOLVED');
        nicepodLog(`🛰️ [GeoEngine] Nodo Identificado: ${result.data.place.poiName}`);
      }
    } catch (err: any) {
      console.error("🔥 [GeoEngine] Resolve Fail:", err.message);
    } finally {
      setIsSearching(false);
    }
  }, [userLocation, isLocked]);

  /**
   * evaluateResonance: Detecta sintonía con crónicas locales.
   */
  const evaluateResonance = useCallback((location: UserLocation) => {
    if (nearbyPOIs.length === 0) return;

    let closest: ActivePOI | null = null;
    let minDistance = Infinity;

    nearbyPOIs.forEach((poi) => {
      const poiLat = poi.geo_location.coordinates[1];
      const poiLng = poi.geo_location.coordinates[0];
      const dist = calculateDistance(location.latitude, location.longitude, poiLat, poiLng);

      if (dist < minDistance) {
        minDistance = dist;
        closest = {
          id: poi.id,
          name: poi.name,
          distance: Math.round(dist),
          isWithinRadius: dist <= (poi.entrance_radius_meters || 35),
          historical_fact: poi.historical_fact
        };
      }
    });

    setActivePOI(closest);
  }, [nearbyPOIs, calculateDistance]);

  /**
   * initSensors: Gatillo de activación por gesto de usuario.
   */
  const initSensors = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setError("HARDWARE_GPS_DESACTIVADO");
      return;
    }

    setIsLocked(false);
    const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

    const handleSuccess = (position: GeolocationPosition) => {
      if (position.coords.accuracy > ACCURACY_LIMIT) return;

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

      if (dist > MOVEMENT_THRESHOLD && !isLocked) {
        fetchNearbyPOIs();
        lastSyncLocation.current = { lat: loc.latitude, lng: loc.longitude };
        resolveCurrentLocation();
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      setError(err.message);
      nicepodLog(`⚠️ [GeoEngine] Error de señal: ${err.message}`);
    };

    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = navigator.geolocation.watchPosition(handleSuccess, handleError, options);
    setStatus('SENSORS_READY');
  }, [fetchNearbyPOIs, calculateDistance, isLocked, resolveCurrentLocation, evaluateResonance]);

  /**
   * scanEnvironment: Fase Multimodal (Pesada).
   * [RESOLUCIÓN]: Se vincula con 'analyzeMultimodalAction' para el build de Vercel.
   */
  const scanEnvironment = async (params: { heroImage: string; ocrImage?: string; intent: string; category: string; radius: number }) => {
    if (!userLocation) return;

    setIsLocked(true); // Anclaje inmutable de posición
    setStatus('SCANNING');

    try {
      // 1. Transporte de evidencia al Storage
      const upload = await uploadGeoEvidence(params.heroImage, params.ocrImage);
      if (!upload.success || !upload.urls) throw new Error(upload.message);

      // 2. Ingesta Analítica mediante Server Action
      const result = await analyzeMultimodalAction({
        heroImageUrl: upload.urls.heroImageUrl,
        ocrImageUrl: upload.urls.ocrImageUrl,
        placeName: data.place?.poiName || "Hito Urbano",
        intent: params.intent,
        location: userLocation,
        categoryId: params.category,
        resonanceRadius: params.radius
      });

      if (!result.success) throw new Error(result.error);

      setData(prev => ({ ...prev, ...result.data }));
      setStatus('ANALYZING');
      nicepodLog("🧠 [GeoEngine] Dossier analítico completado.");

    } catch (e: any) {
      nicepodLog(`🛑 [GeoEngine] Fallo en la ingesta: ${e.message}`);
      setStatus('REJECTED');
      setData({ rejectionReason: e.message });
      setIsLocked(false);
    }
  };

  /**
   * submitIntent: Fase de Forja Narrativa final.
   */
  const submitIntent = async (params: { intentText: string; depth: string; tone: string; categoryId: string; historicalFact: string }) => {
    if (!data.draftId) return;

    setStatus('SCANNING');
    try {
      const result = await generateGeoContentAction({
        ...params,
        draftId: data.draftId,
        intent: params.intentText
      });

      if (!result.success) throw new Error(result.error);

      setData(prev => ({ ...prev, script: result.data.script }));
      setStatus('ACCEPTED');
      nicepodLog("✍️ [GeoEngine] Crónica forjada con éxito.");
    } catch (e: any) {
      setStatus('REJECTED');
      setData({ rejectionReason: e.message });
    }
  };

  const reset = () => {
    setStatus('IDLE');
    setData({});
    setIsLocked(false);
    lastSyncLocation.current = null;
    nicepodLog("🧹 [GeoEngine] Terminal restablecida.");
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
    resolveCurrentLocation,
    scanEnvironment,
    submitIntent,
    reset
  };
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V5.1):
 * 1. Consistencia de Nomenclatura: Se ha corregido la llamada a 'analyzeMultimodalAction', 
 *    asegurando que el error TS2305 del build de Vercel desaparezca hoy.
 * 2. Protocolo Steady Pulse: El umbral de 15m y el cooldown de 5s protegen el 
 *    presupuesto térmico del dispositivo y la latencia del servidor.
 * 3. Atomicidad Geoespacial: La función 'setIsLocked(true)' garantiza que la 
 *    IA trabaje sobre la coordenada exacta de la captura visual, eliminando 
 *    derivas de datos durante el movimiento del administrador.
 */