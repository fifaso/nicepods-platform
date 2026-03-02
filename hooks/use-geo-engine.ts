// hooks/use-geo-engine.ts
// VERSIÓN: 2.2

"use client";

import { createClient } from "@/lib/supabase/client";
import { nicepodLog } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * INTERFAZ: UserLocation
 * Registra las coordenadas y la precisión física del dispositivo.
 */
export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading: number | null;
}

/**
 * INTERFAZ: ActivePOI
 * Nodo de sabiduría que resuena actualmente con la posición del Administrador.
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
 * Define los estados lógicos de la misión de captura.
 */
export type GeoState = 'IDLE' | 'SCANNING' | 'ANALYZING' | 'ACCEPTED' | 'REJECTED';

/**
 * INTERFAZ: GeoContextData
 * Almacén temporal de la inteligencia recolectada por la IA.
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
 * [CONTRATO MAESTRO]: Define el objeto que el hook entrega a la UI.
 * Al estar exportado, soluciona definitivamente el error TS2305 en los componentes.
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
 * El director de orquesta de la sintonía geolocalizada de NicePod V2.5.
 */
export function useGeoEngine(): GeoEngineReturn {
  // Consumo del cliente único (Singleton)
  const supabase = createClient();

  // --- ESTADOS REACTIVOS ---
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
   * calculateDistance: Implementación de la Fórmula de Haversine.
   * Calcula la brecha física entre el Admin y el nodo de sabiduría.
   */
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Radio terrestre en metros
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
   * fetchNearbyPOIs: Recuperación de la malla urbana activa.
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
      console.error("🔥 [GeoEngine] Fallo en sincronía de Bóveda:", err.message);
    } finally {
      setIsSearching(false);
    }
  }, [supabase]);

  /**
   * evaluateResonance: Detecta si el Admin entra en zona de sintonía.
   */
  const evaluateResonance = useCallback((location: UserLocation) => {
    if (nearbyPOIs.length === 0) return;

    let closest: ActivePOI | null = null;
    let minDistance = Infinity;

    nearbyPOIs.forEach((poi) => {
      // Coordenadas extraídas del punto PostGIS [lng, lat]
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
   * LIFECYCLE: GESTIÓN DEL HARDWARE GPS
   */
  useEffect(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setError("HARDWARE_GPS_DESACTIVADO");
      return;
    }

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy, heading } = position.coords;
      const currentLocation: UserLocation = { latitude, longitude, accuracy, heading };

      setUserLocation(currentLocation);
      evaluateResonance(currentLocation);

      // Throttling: Solo actualizamos la malla si hay desplazamiento > 50m
      if (!lastSyncLocation.current ||
        calculateDistance(latitude, longitude, lastSyncLocation.current.lat, lastSyncLocation.current.lng) > 50) {
        fetchNearbyPOIs();
        lastSyncLocation.current = { lat: latitude, lng: longitude };
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      nicepodLog(`⚠️ [GeoEngine] Señal débil: ${err.message}`);
      setError(err.message);
    };

    watchId.current = navigator.geolocation.watchPosition(handleSuccess, handleError, geoOptions);

    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [fetchNearbyPOIs, evaluateResonance, calculateDistance]);

  /**
   * ACCIONES DE LA FORJA (Edge Functions Invocations)
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
 * 1. Sincronía Nominal: La exportación de interfaces asegura que la Workstation 
 *    opere bajo un contrato de tipos 'Strict', eliminando el error TS2305.
 * 2. Rendimiento (Haversine): El cálculo de distancia se realiza en el cliente 
 *    para dar feedback instantáneo al Admin antes de pulsar 'Forjar'.
 * 3. Robusto ante Nulos: El estado inicial 'IDLE' y la inicialización de 'data' 
 *    como un objeto vacío garantizan que el desestructurado en la UI no falle.
 */