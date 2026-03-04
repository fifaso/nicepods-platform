// hooks/use-geo-engine.ts
// VERSIÓN: 4.1

"use client";

import { createClient } from "@/lib/supabase/client";
import { nicepodLog } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * IMPORTACIÓN DE PASARELAS SEGURAS (SERVER ACTIONS)
 * El despacho síncrono desde el servidor garantiza que la SERVICE_ROLE_KEY 
 * permanezca oculta y las Edge Functions operen en modo 'Lite'.
 */
import {
  generateGeoContentAction,
  ingestContextAction,
  resolveLocationAction,
  uploadGeoEvidence
} from "@/actions/geo-actions";

/**
 * ---------------------------------------------------------------------------
 * I. CONTRATOS DE DATOS (NICEPOD GEO CORE V4.1)
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

export type GeoState =
  | 'IDLE'               // Standby
  | 'SENSORS_READY'      // Hardware Activo
  | 'LOCATION_RESOLVED'  // Nodo Localizado
  | 'SCANNING'           // Procesando Binarios
  | 'ANALYZING'          // IA en Proceso
  | 'ACCEPTED'           // Forja Exitosa
  | 'REJECTED';          // Error de Validación

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
 * [CONTRATO DE SOBERANÍA]: Define exactamente qué expone el hook a la UI.
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
 * El director sensorial de NicePod V2.5.
 */
export function useGeoEngine(): GeoEngineReturn {
  const supabase = createClient();

  // --- ESTADOS DE CONTROL ---
  const [status, setStatus] = useState<GeoState>('IDLE');
  const [data, setData] = useState<GeoContextData>({});
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [activePOI, setActivePOI] = useState<ActivePOI | null>(null);
  const [nearbyPOIs, setNearbyPOIs] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- REFERENCIAS DE FILTRADO (STEADY PULSE) ---
  const watchId = useRef<number | null>(null);
  const lastSyncLocation = useRef<{ lat: number; lng: number } | null>(null);
  const lastRequestTimestamp = useRef<number>(0);

  const MOVEMENT_THRESHOLD = 15;  // Metros
  const ACCURACY_THRESHOLD = 25;  // Precisión mínima
  const REQUEST_COOLDOWN = 5000;  // 5s entre peticiones

  /**
   * calculateDistance: Haversine para precisión de sintonía.
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
   * fetchNearbyPOIs: Recupera la malla urbana.
   */
  const fetchNearbyPOIs = useCallback(async () => {
    const now = Date.now();
    if (now - lastRequestTimestamp.current < REQUEST_COOLDOWN) return;

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
   * resolveCurrentLocation: Paso 1 del flujo (Anclaje).
   */
  const resolveCurrentLocation = useCallback(async () => {
    if (!userLocation) return;

    setIsSearching(true);
    try {
      const result = await resolveLocationAction(userLocation.latitude, userLocation.longitude);

      if (result.success) {
        setData(prev => ({ ...prev, ...result.data }));
        setStatus('LOCATION_RESOLVED');
        nicepodLog(`🛰️ [GeoEngine] Nodo Localizado: ${result.data.place.poiName}`);
      }
    } catch (err: any) {
      console.error("🔥 [GeoEngine] Resolve Error:", err.message);
    } finally {
      setIsSearching(false);
    }
  }, [userLocation]);

  /**
   * initSensors: Protocolo de Activación por Gesto.
   */
  const initSensors = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setError("HARDWARE_GPS_DESACTIVADO");
      return;
    }

    setIsLocked(false);
    const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

    const handleSuccess = (position: GeolocationPosition) => {
      if (position.coords.accuracy > ACCURACY_THRESHOLD) return;

      const loc: UserLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading
      };

      setUserLocation(loc);

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
    };

    watchId.current = navigator.geolocation.watchPosition(handleSuccess, handleError, options);
    setStatus('SENSORS_READY');
  }, [fetchNearbyPOIs, calculateDistance, isLocked, resolveCurrentLocation]);

  /**
   * scanEnvironment: Paso 2 (Inmersión IA).
   * [RESOLUCIÓN TS2345]: Mapeo exacto de propiedades para ingestContextAction.
   */
  const scanEnvironment = async (params: { heroImage: string; ocrImage?: string; intent: string; category: string; radius: number }) => {
    if (!userLocation) return;

    setIsLocked(true); // Anclaje de posición
    setStatus('SCANNING');

    try {
      // 1. Subida de Activos al Storage
      const upload = await uploadGeoEvidence(params.heroImage, params.ocrImage);
      if (!upload.success || !upload.urls) throw new Error(upload.message);

      // 2. Ingesta Analítica Multimodal
      // Mapeamos: heroImage -> heroImageUrl, category -> categoryId, radius -> resonanceRadius
      const result = await ingestContextAction({
        heroImageUrl: upload.urls.heroImageUrl,
        ocrImageUrl: upload.urls.ocrImageUrl,
        intent: params.intent,
        location: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          accuracy: userLocation.accuracy
        },
        categoryId: params.category,
        resonanceRadius: params.radius
      });

      if (!result.success) throw new Error(result.error);

      setData(prev => ({ ...prev, ...result.data }));
      setStatus('ANALYZING');
      nicepodLog("🧠 [GeoEngine] Ingesta completada.");

    } catch (e: any) {
      setStatus('REJECTED');
      setData({ rejectionReason: e.message });
      setIsLocked(false);
    }
  };

  /**
   * submitIntent: Paso 3 (Forja Narrativa).
   * [RESOLUCIÓN]: Alineación total con generateGeoContentAction.
   */
  const submitIntent = async (params: { intentText: string; depth: string; tone: string; categoryId: string; historicalFact: string }) => {
    if (!data.draftId) return;

    setStatus('SCANNING');
    try {
      const result = await generateGeoContentAction({
        draftId: data.draftId,
        intent: params.intentText,
        depth: params.depth,
        tone: params.tone,
        categoryId: params.categoryId,
        historicalFact: params.historicalFact
      });

      if (!result.success) throw new Error(result.error);

      setData(prev => ({ ...prev, script: result.data.script }));
      setStatus('ACCEPTED');
      nicepodLog("✍️ [GeoEngine] Crónica urbana forjada.");
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
    nicepodLog("🧹 [GeoEngine] Terminal reseteada.");
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
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Resolución de Fuga de Tipos: Se han alineado los nombres de las propiedades 
 *    (heroImageUrl, categoryId, resonanceRadius) con las definiciones de 
 *    'actions/geo-actions.ts', permitiendo que Vercel build pase en verde. ✅
 * 2. Integridad de Datos: Se ha incluido 'historicalFact' y 'categoryId' en la 
 *    llamada final de 'submitIntent', garantizando que el punto de interés 
 *    nazca con su ADN completo. ✅
 * 3. Throttling de Red: El sistema de cooldown y el umbral de movimiento 
 *    protegen el presupuesto de CPU del Administrador y la latencia del Edge. ✅
 */