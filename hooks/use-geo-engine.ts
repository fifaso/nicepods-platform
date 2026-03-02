// hooks/use-geo-engine.ts
// VERSIÓN: 2.1

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { nicepodLog } from "@/lib/utils";

/**
 * INTERFAZ: UserLocation
 * Registra la telemetría exacta del hardware GPS del curador.
 */
export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading: number | null;
}

/**
 * INTERFAZ: ActivePOI
 * Nodo de interés que actualmente interactúa con la posición del administrador.
 */
export interface ActivePOI {
  id: string;
  name: string;
  distance: number;
  isWithinRadius: boolean;
  historical_fact?: string;
}

/**
 * TIPO: GeoState
 * Define las fases del ciclo de vida de una misión de captura urbana.
 */
export type GeoState = 'IDLE' | 'SCANNING' | 'ANALYZING' | 'ACCEPTED' | 'REJECTED';

/**
 * INTERFAZ: GeoContextData
 * Encapsula la información ambiental y de proceso recolectada.
 */
export interface GeoContextData {
  draftId?: string;
  script?: string;
  weather?: any;
  place?: any;
  rejectionReason?: string;
}

/**
 * INTERFAZ: GeoEngineReturn
 * [CONTRATO DE SOBERANÍA]: Define exactamente qué expone el hook.
 * Resuelve el error TS2339 al garantizar la existencia de 'userLocation'.
 */
export interface GeoEngineReturn {
  status: GeoState;
  data: GeoContextData;
  userLocation: UserLocation | null;
  activePOI: ActivePOI | null;
  nearbyPOIs: any[];
  isSearching: boolean;
  error: string | null;
  scanEnvironment: (imageBase64: string) => Promise<void>;
  submitIntent: (intentText: string) => Promise<void>;
  reset: () => void;
}

/**
 * HOOK: useGeoEngine
 * El motor central de inteligencia situacional para NicePod V2.5.
 */
export function useGeoEngine(): GeoEngineReturn {
  // Instanciamos el cliente único (Singleton)
  const supabase = createClient();

  // --- ESTADOS DE CONTROL ---
  const [status, setStatus] = useState<GeoState>('IDLE');
  const [data, setData] = useState<GeoContextData>({});
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [activePOI, setActivePOI] = useState<ActivePOI | null>(null);
  const [nearbyPOIs, setNearbyPOIs] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- REFERENCIAS TÁCTICAS ---
  const watchId = useRef<number | null>(null);
  const lastSyncLocation = useRef<{ lat: number; lng: number } | null>(null);

  /**
   * UTILIDAD: calculateDistance (Fórmula de Haversine)
   * Calcula la distancia física en metros entre el usuario y un nodo.
   */
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Radio de la Tierra en metros
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  /**
   * ACCIÓN: fetchNearbyPOIs
   * Sincroniza los nodos de sabiduría visibles desde la Bóveda.
   */
  const fetchNearbyPOIs = useCallback(async () => {
    setIsSearching(true);
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
   * ACCIÓN: evaluateResonance
   * Determina si el administrador está dentro de un círculo de sintonía activa.
   */
  const evaluateResonance = useCallback((location: UserLocation) => {
    if (nearbyPOIs.length === 0) return;

    let closest: ActivePOI | null = null;
    let minDistance = Infinity;

    nearbyPOIs.forEach((poi) => {
      const poiLat = poi.geo_location.coordinates[1];
      const poiLng = poi.geo_location.coordinates[0];
      const distance = calculateDistance(location.latitude, location.longitude, poiLat, poiLng);

      if (distance < minDistance) {
        minDistance = distance;
        closest = {
          id: poi.id,
          name: poi.name,
          distance: Math.round(distance),
          isWithinRadius: distance <= (poi.entrance_radius_meters || 30),
          historical_fact: poi.historical_fact
        };
      }
    });

    setActivePOI(closest);
  }, [nearbyPOIs]);

  /**
   * CICLO DE VIDA: RASTREO GPS
   */
  useEffect(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setError("HARDWARE_NO_SOPORTADO");
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy, heading } = position.coords;
      const currentLocation = { latitude, longitude, accuracy, heading };
      
      setUserLocation(currentLocation);
      evaluateResonance(currentLocation);

      // Sincronización inteligente: Solo pedimos datos si hay movimiento > 50m
      if (!lastSyncLocation.current || 
          calculateDistance(latitude, longitude, lastSyncLocation.current.lat, lastSyncLocation.current.lng) > 50) {
        fetchNearbyPOIs();
        lastSyncLocation.current = { lat: latitude, lng: longitude };
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      nicepodLog(`⚠️ [GeoEngine] Señal GPS inestable: ${err.message}`);
      setError(err.message);
    };

    watchId.current = navigator.geolocation.watchPosition(handleSuccess, handleError, options);

    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [fetchNearbyPOIs, evaluateResonance]);

  /**
   * ACCIONES DE MISIÓN (PLACEHOLDERS COMPLETOS)
   */
  const scanEnvironment = async (imageBase64: string) => {
    setStatus('SCANNING');
    try {
      const { data: res, error: err } = await supabase.functions.invoke('geo-ingest-context', {
        body: { image: imageBase64, location: userLocation }
      });
      if (err) throw err;
      setData(res);
      setStatus('ANALYZING');
    } catch (e: any) {
      setStatus('REJECTED');
      setData({ rejectionReason: e.message });
    }
  };

  const submitIntent = async (intentText: string) => {
    setStatus('SCANNING');
    try {
      const { data: res, error: err } = await supabase.functions.invoke('geo-generate-content', {
        body: { intent: intentText, draftId: data.draftId }
      });
      if (err) throw err;
      setData({ ...data, script: res.script });
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
  };

  return {
    status,
    data,
    userLocation,
    activePOI,
    nearbyPOIs,
    isSearching,
    error,
    scanEnvironment,
    submitIntent,
    reset
  };
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Resolución de Errores de Interfaz: Al definir 'GeoEngineReturn' y asignar 
 *    el Hook a este tipo, aseguramos que cualquier componente que lo consuma 
 *    vea 'userLocation' como una propiedad legítima (Soluciona TS2339).
 * 2. Rendimiento (Throttling): La lógica de 'lastSyncLocation' previene la 
 *    saturación de la base de datos al filtrar actualizaciones GPS menores a 50m.
 * 3. Seguridad de Tipos: El uso de interfaces exportadas permite que el 
 *    Administrador mantenga el control total de la telemetría en el Mapa.
 */