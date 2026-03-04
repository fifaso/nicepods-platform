// hooks/use-geo-engine.ts
// VERSIÓN: 4.0

"use client";

import { createClient } from "@/lib/supabase/client";
import { nicepodLog } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * IMPORTACIÓN DE PASARELAS SEGURAS (SERVER ACTIONS)
 * Centralizamos el despacho de datos sensibles a través del servidor Next.js.
 */
import {
  generateGeoContentAction,
  ingestContextAction,
  resolveLocationAction,
  uploadGeoEvidence
} from "@/actions/geo-actions";

/**
 * ---------------------------------------------------------------------------
 * I. CONTRATOS DE DATOS (NICEPOD GEO CORE)
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
 * GeoState: Máquina de estados para la misión de siembra.
 */
export type GeoState =
  | 'IDLE'               // Esperando activación manual
  | 'SENSORS_READY'      // GPS activo, buscando precisión
  | 'LOCATION_RESOLVED'  // Identidad del lugar confirmada
  | 'SCANNING'           // Procesando imágenes y audio ambient
  | 'ANALYZING'          // IA analizando contexto visual
  | 'ACCEPTED'           // Guion generado y listo
  | 'REJECTED';          // Fallo en la validación o red

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
 * Contrato de soberanía que el hook expone a la UI (ScannerUI).
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

  // --- REFERENCIAS TÁCTICAS (FILTRADO DE RUIDO) ---
  const watchId = useRef<number | null>(null);
  const lastSyncLocation = useRef<{ lat: number; lng: number } | null>(null);
  const lastRequestTimestamp = useRef<number>(0);

  // Constantes de Rigor Industrial
  const MOVEMENT_THRESHOLD = 15;  // Metros mínimos para re-sintonizar
  const ACCURACY_THRESHOLD = 25;  // Máximo error de GPS aceptado (m)
  const REQUEST_COOLDOWN = 5000;  // 5s de guardia entre peticiones de red

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
   * fetchNearbyPOIs: Recupera nodos cercanos desde la Bóveda.
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
   * resolveCurrentLocation: Paso 1 del flujo (LIGERO).
   * Identifica el POI y el clima sin usar IA pesada.
   */
  const resolveCurrentLocation = useCallback(async () => {
    if (!userLocation) return;

    setIsSearching(true);
    try {
      const result = await resolveLocationAction(userLocation.latitude, userLocation.longitude);

      if (result.success) {
        setData(prev => ({ ...prev, ...result.data }));
        setStatus('LOCATION_RESOLVED');
        nicepodLog(`🛰️ [GeoEngine] Nodo Identificado: ${result.data.place.poiName}`);
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

    const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

    const handleSuccess = (position: GeolocationPosition) => {
      // Filtro de Calidad: Ignoramos ruido térmico del sensor.
      if (position.coords.accuracy > ACCURACY_THRESHOLD) return;

      const loc: UserLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading
      };

      setUserLocation(loc);

      // Filtro de Movimiento: Solo re-sintonizamos si el Admin se desplaza > 15m.
      const dist = !lastSyncLocation.current ? Infinity :
        calculateDistance(loc.latitude, loc.longitude, lastSyncLocation.current.lat, lastSyncLocation.current.lng);

      if (dist > MOVEMENT_THRESHOLD && !isLocked) {
        fetchNearbyPOIs();
        lastSyncLocation.current = { lat: loc.latitude, lng: loc.longitude };
        // Intentamos auto-resolver la ubicación si estamos en reposo relativo.
        resolveCurrentLocation();
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      setError(err.message);
      nicepodLog(`⚠️ [GeoEngine] Error de señal: ${err.message}`);
    };

    watchId.current = navigator.geolocation.watchPosition(handleSuccess, handleError, options);
    setStatus('SENSORS_READY');
  }, [fetchNearbyPOIs, calculateDistance, isLocked, resolveCurrentLocation]);

  /**
   * scanEnvironment: Paso 2 (PESADO).
   * Misión: Subida de imágenes -> Ingesta Multimodal IA.
   */
  const scanEnvironment = async (params: { heroImage: string; ocrImage?: string; intent: string; category: string; radius: number }) => {
    if (!userLocation) return;

    // Bloqueamos la coordenada para la IA (Position Lock)
    setIsLocked(true);
    setStatus('SCANNING');

    try {
      // 1. Subida de Activos (Storage)
      const upload = await uploadGeoEvidence(params.heroImage, params.ocrImage);
      if (!upload.success || !upload.urls) throw new Error(upload.message);

      // 2. Análisis e Ingesta (Edge)
      const result = await ingestContextAction({
        ...params,
        heroImageUrl: upload.urls.heroImageUrl,
        ocrImageUrl: upload.urls.ocrImageUrl,
        location: userLocation,
        categoryId: params.category,
        resonanceRadius: params.radius
      });

      if (!result.success) throw new Error(result.error);

      setData(prev => ({ ...prev, ...result.data }));
      setStatus('ANALYZING');
      nicepodLog("🧠 [GeoEngine] Análisis forense completado.");

    } catch (e: any) {
      nicepodLog(`🛑 [GeoEngine] Fallo en la ingesta: ${e.message}`);
      setStatus('REJECTED');
      setData({ rejectionReason: e.message });
      setIsLocked(false);
    }
  };

  /**
   * submitIntent: Paso 3 (FINAL).
   * Misión: Forjar la crónica narrativa.
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

  // Limpieza de recursos de hardware
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
 * 1. Eficiencia Energética: El umbral de 15m y el filtro de precisión de 25m 
 *    eliminan el 'ruido' del GPS, silenciando la consola y protegiendo el 
 *    presupuesto de CPU del Edge.
 * 2. Integridad de Misión: La función 'setIsLocked(true)' asegura que la 
 *    crónica de sabiduría se ancle al monumento exacto donde se tomó la foto, 
 *    independientemente del desplazamiento posterior del Administrador.
 * 3. Seguridad de Pasarela: Al usar 'actions/geo-actions.ts', cumplimos con 
 *    el estándar de NicePod V2.5 de no exponer llaves de infraestructura en 
 *    el cliente, permitiendo el uso de Edge Functions en modo 'Lite'.
 */