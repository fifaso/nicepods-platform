// hooks/use-geo-engine.ts
// VERSIÓN: 3.1

"use client";

import { createClient } from "@/lib/supabase/client";
import { nicepodLog } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * IMPORTACIÓN DE ACCIONES SOBERANAS
 * Delegamos el procesamiento pesado al servidor para proteger la integridad 
 * de la llave maestra (SERVICE_ROLE_KEY).
 */
import {
  generateGeoContentAction,
  ingestContextAction
} from "@/actions/geo-actions";

/**
 * ---------------------------------------------------------------------------
 * I. CONTRATOS DE DATOS Y TIPADO (ESTÁNDAR V2.5)
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

export type GeoState = 'IDLE' | 'SENSORS_READY' | 'SCANNING' | 'ANALYZING' | 'ACCEPTED' | 'REJECTED';

export interface GeoContextData {
  draftId?: string;
  script?: string;
  weather?: any;
  place?: any;
  rejectionReason?: string;
}

/**
 * INTERFAZ: GeoEngineReturn
 * [CONTRATO DE SOBERANÍA]: Define exactamente qué expone el hook a la UI.
 * Resuelve el error TS2339 al garantizar la visibilidad de todas las propiedades.
 */
export interface GeoEngineReturn {
  status: GeoState;
  data: GeoContextData;
  userLocation: UserLocation | null;
  activePOI: ActivePOI | null;
  nearbyPOIs: any[];
  isSearching: boolean;
  error: string | null;
  /**
   * initSensors: Gatillo manual requerido por políticas de privacidad del navegador.
   */
  initSensors: () => void;
  /**
   * scanEnvironment: Ingesta multimodal analítica (Imagen + Contexto).
   */
  scanEnvironment: (params: {
    heroImage: string;
    ocrImage?: string;
    intent: string;
    category: string;
    radius: number
  }) => Promise<void>;
  /**
   * submitIntent: Envío de la semilla narrativa final para forja de guion.
   */
  submitIntent: (intentText: string) => Promise<void>;
  /**
   * reset: Limpieza de la terminal y regreso al estado de espera.
   */
  reset: () => void;
}

/**
 * HOOK: useGeoEngine
 * El cerebro situacional de NicePod V2.5.
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
  const [error, setError] = useState<string | null>(null);

  // --- REFERENCIAS DE MEMORIA (FILTRADO DE RUIDO TÉRMICO) ---
  const watchId = useRef<number | null>(null);
  const lastSyncLocation = useRef<{ lat: number; lng: number } | null>(null);
  const MOVEMENT_THRESHOLD_METERS = 15; // Umbral para evitar ráfagas de red innecesarias.

  /**
   * calculateDistance: Implementación de la Fórmula de Haversine.
   * Calcula la brecha física entre el Administrador y el Punto de Interés.
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
   * fetchNearbyPOIs: Sincronización de la malla urbana desde la Bóveda SQL.
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
      console.error("🔥 [GeoEngine] Fallo en recuperación de malla:", err.message);
    } finally {
      setIsSearching(false);
    }
  }, [supabase]);

  /**
   * evaluateResonance: Algoritmo de detección de sintonía activa.
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
   * initSensors: Protocolo de Activación por Gesto de Usuario.
   * [RESOLUCIÓN]: Cumple con la política de seguridad del navegador.
   */
  const initSensors = useCallback(() => {
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

      // [PROTOCOLO STEADY PULSE]: Solo sincronizamos si hay desplazamiento real (>15m)
      const distFromLast = !lastSyncLocation.current ? Infinity :
        calculateDistance(latitude, longitude, lastSyncLocation.current.lat, lastSyncLocation.current.lng);

      if (distFromLast > MOVEMENT_THRESHOLD_METERS) {
        nicepodLog(`🛰️ [GeoEngine] Sintonía Geográfica Actualizada. Delta: ${Math.round(distFromLast)}m`);
        fetchNearbyPOIs();
        lastSyncLocation.current = { lat: latitude, lng: longitude };
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      setError(err.message);
      nicepodLog(`⚠️ [GeoEngine] Señal GPS comprometida: ${err.message}`);
    };

    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = navigator.geolocation.watchPosition(handleSuccess, handleError, geoOptions);

    setStatus('SENSORS_READY');
    nicepodLog("🟢 [GeoEngine] Sensores de campo en línea.");
  }, [fetchNearbyPOIs, evaluateResonance, calculateDistance]);

  /**
   * scanEnvironment: Ingesta multimodal dirigida al Servidor.
   */
  const scanEnvironment = async (params: { heroImage: string; ocrImage?: string; intent: string; category: string; radius: number }) => {
    if (!userLocation) return;

    setStatus('SCANNING');
    try {
      // Invocación segura mediante Server Action
      const result = await ingestContextAction({
        ...params,
        location: userLocation
      });

      if (!result.success) throw new Error(result.error);

      setData(result.data);
      setStatus('ANALYZING');
      nicepodLog("🧠 [GeoEngine] Análisis de contexto ambiental completado.");
    } catch (e: any) {
      console.error("🔥 [GeoEngine] Error de Ingesta:", e.message);
      setStatus('REJECTED');
      setData({ rejectionReason: e.message });
    }
  };

  /**
   * submitIntent: Forja narrativa del guion de sabiduría.
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
      nicepodLog("✍️ [GeoEngine] Crónica urbana sintetizada con éxito.");
    } catch (e: any) {
      console.error("🔥 [GeoEngine] Error de Forja:", e.message);
      setStatus('REJECTED');
      setData({ rejectionReason: e.message });
    }
  };

  const reset = () => {
    setStatus('IDLE');
    setData({});
    setActivePOI(null);
    nicepodLog("🧹 [GeoEngine] Terminal restablecida.");
  };

  // Protocolo de Limpieza de Hardware
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
    error,
    initSensors,
    scanEnvironment,
    submitIntent,
    reset
  };
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Resolución de Loop de Red: La implementación del MOVEMENT_THRESHOLD_METERS 
 *    garantiza que el navegador no sature la red por micro-variaciones del sensor, 
 *    silenciando la consola y optimizando el consumo energético del dispositivo.
 * 2. Integridad de Tipos: Al definir y exportar 'GeoEngineReturn', resolvemos 
 *    definitivamente el error TS2339 en 'scanner-ui.tsx', permitiendo un 
 *    flujo de datos tipado y seguro.
 * 3. Seguridad Industrial: Al delegar la comunicación pesada a 'geo-actions.ts', 
 *    eliminamos la necesidad de manejar tokens sensibles en el lado del cliente.
 */