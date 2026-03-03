// hooks/use-geo-engine.ts
// VERSIÓN: 3.2

"use client";

import { createClient } from "@/lib/supabase/client";
import { nicepodLog } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * IMPORTACIÓN DE ACCIONES SOBERANAS
 * El despacho a través de Server Actions garantiza que la credencial
 * SERVICE_ROLE_KEY se inyecte solo en el entorno seguro del servidor.
 */
import {
  generateGeoContentAction,
  ingestContextAction
} from "@/actions/geo-actions";

/**
 * ---------------------------------------------------------------------------
 * I. CONTRATOS DE DATOS (NICEPOD GEO STANDARD V2.5)
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
 * GeoState: Evolución de la máquina de estados para incluir sintonía.
 */
export type GeoState = 'IDLE' | 'SENSORS_READY' | 'SCANNING' | 'ANALYZING' | 'ACCEPTED' | 'REJECTED';

export interface GeoContextData {
  draftId?: string;
  script?: string;
  weather?: any;
  place?: any;
  rejectionReason?: string;
}

export interface GeoEngineReturn {
  status: GeoState;
  data: GeoContextData;
  userLocation: UserLocation | null;
  activePOI: ActivePOI | null;
  nearbyPOIs: any[];
  isSearching: boolean;
  isLocked: boolean; // Indica si la posición de siembra está anclada
  error: string | null;
  initSensors: () => void;
  lockPosition: () => void; // Permite al Admin fijar el punto de forja
  scanEnvironment: (params: {
    heroImage: string;
    ocrImage?: string;
    intent: string;
    category: string;
    radius: number
  }) => Promise<void>;
  submitIntent: (intentText: string) => Promise<void>;
  reset: () => void;
}

/**
 * HOOK: useGeoEngine
 * El director sensorial de NicePod V2.5.
 */
export function useGeoEngine(): GeoEngineReturn {
  const supabase = createClient();

  // --- ESTADOS DE CONTROL DE MISIÓN ---
  const [status, setStatus] = useState<GeoState>('IDLE');
  const [data, setData] = useState<GeoContextData>({});
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [activePOI, setActivePOI] = useState<ActivePOI | null>(null);
  const [nearbyPOIs, setNearbyPOIs] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- REFERENCIAS TÁCTICAS (FILTRADO DE ENTROPÍA) ---
  const watchId = useRef<number | null>(null);
  const lastSyncLocation = useRef<{ lat: number; lng: number } | null>(null);
  const lastRequestTimestamp = useRef<number>(0);

  // Constantes de Rigor Industrial
  const MOVEMENT_THRESHOLD = 15; // Metros
  const ACCURACY_LIMIT = 25;    // Ignorar señales con >25m de error
  const NETWORK_COOLDOWN = 5000; // 5 segundos entre disparos de red

  /**
   * calculateDistance: Implementación de la Fórmula de Haversine.
   */
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  /**
   * fetchNearbyPOIs: Sincroniza los nodos de la ciudad.
   */
  const fetchNearbyPOIs = useCallback(async () => {
    const now = Date.now();
    // Bloqueo por Cooldown: Evita saturar la base de datos en ráfagas de movimiento.
    if (now - lastRequestTimestamp.current < NETWORK_COOLDOWN) return;

    setIsSearching(true);
    lastRequestTimestamp.current = now;

    try {
      const { data: poiData, error: dbError } = await supabase
        .from('vw_map_resonance_active')
        .select('*');

      if (dbError) throw dbError;
      setNearbyPOIs(poiData || []);
    } catch (err: any) {
      console.error("🔥 [GeoEngine] Error de Bóveda:", err.message);
    } finally {
      setIsSearching(false);
    }
  }, [supabase]);

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
   * lockPosition: Fija el punto de siembra.
   * [ESTRATEGIA]: Detiene el procesamiento de nuevas señales GPS para
   * asegurar que la IA trabaje sobre una coordenada inmutable.
   */
  const lockPosition = useCallback(() => {
    setIsLocked(true);
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    nicepodLog("🛡️ [GeoEngine] Posición de siembra anclada. Sensores en standby.");
  }, []);

  /**
   * initSensors: Gatillo manual de sintonía.
   */
  const initSensors = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setError("HARDWARE_GPS_DESACTIVADO");
      return;
    }

    setIsLocked(false);
    const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

    const handleSuccess = (position: GeolocationPosition) => {
      // FILTRO 1: Calidad de Señal
      if (position.coords.accuracy > ACCURACY_LIMIT) {
        nicepodLog(`🟡 [GeoEngine] Señal imprecisa (${Math.round(position.coords.accuracy)}m). Ignorando...`);
        return;
      }

      const { latitude, longitude, accuracy, heading } = position.coords;
      const currentLocation: UserLocation = { latitude, longitude, accuracy, heading };

      setUserLocation(currentLocation);
      evaluateResonance(currentLocation);

      // FILTRO 2: Umbral de Movimiento
      const distFromLast = !lastSyncLocation.current ? Infinity :
        calculateDistance(latitude, longitude, lastSyncLocation.current.lat, lastSyncLocation.current.lng);

      if (distFromLast > MOVEMENT_THRESHOLD) {
        fetchNearbyPOIs();
        lastSyncLocation.current = { lat: latitude, lng: longitude };
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      setError(err.message);
      nicepodLog(`⚠️ [GeoEngine] Error de hardware: ${err.message}`);
    };

    watchId.current = navigator.geolocation.watchPosition(handleSuccess, handleError, options);
    setStatus('SENSORS_READY');
  }, [fetchNearbyPOIs, evaluateResonance, calculateDistance]);

  /**
   * scanEnvironment: Ingesta analítica (vía Server Action).
   */
  const scanEnvironment = async (params: { heroImage: string; ocrImage?: string; intent: string; category: string; radius: number }) => {
    if (!userLocation) return;

    // Anclamos la posición automáticamente al iniciar el escaneo
    lockPosition();
    setStatus('SCANNING');

    try {
      const result = await ingestContextAction({
        ...params,
        location: userLocation
      });

      if (!result.success) throw new Error(result.error);

      setData(result.data);
      setStatus('ANALYZING');
      nicepodLog("🧠 [GeoEngine] Análisis ambiental sincronizado.");
    } catch (e: any) {
      setStatus('REJECTED');
      setData({ rejectionReason: e.message });
      setIsLocked(false); // Liberamos si hubo error para re-intentar
    }
  };

  /**
   * submitIntent: Forja de guion (vía Server Action).
   */
  const submitIntent = async (intentText: string) => {
    if (!data.draftId) return;

    setStatus('SCANNING');
    try {
      const result = await generateGeoContentAction({
        intent: intentText,
        draftId: data.draftId,
        depth: 'cronica',
        tone: 'academico'
      });

      if (!result.success) throw new Error(result.error);

      setData({ ...data, script: result.data.script });
      setStatus('ACCEPTED');
    } catch (e: any) {
      setStatus('REJECTED');
      setData({ rejectionReason: e.message });
    }
  };

  const reset = () => {
    setStatus('IDLE');
    setData({});
    setActivePOI(null);
    setIsLocked(false);
    initSensors();
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
    lockPosition,
    scanEnvironment,
    submitIntent,
    reset
  };
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Protocolo Steady Pulse: El umbral de 15m y el filtro de precisión de 25m 
 *    eliminan el ruido del GPS que causaba el loop infinito de peticiones.
 * 2. CPU Safety: El 'NETWORK_COOLDOWN' de 5s garantiza que no se disparen 
 *    múltiples llamadas a la base de datos en un solo movimiento brusco.
 * 3. Atomicidad de Siembra: Al invocar 'lockPosition' dentro de 'scanEnvironment', 
 *    aseguramos que la IA procese la imagen basándose en el punto geográfico 
 *    donde se tomó la foto, sin desviaciones posteriores por movimiento del Admin.
 */