// hooks/use-geo-engine.ts
// VERSIÓN: 5.0

"use client";

import { createClient } from "@/lib/supabase/client";
import { nicepodLog } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * IMPORTACIÓN DE PASARELAS SEGURAS (SERVER ACTIONS)
 * El uso de Server Actions permite inyectar la llave maestra SERVICE_ROLE_KEY
 * en el entorno seguro de Vercel, permitiendo que las Edge Functions operen
 * en modo 'Lite' para maximizar el presupuesto de CPU.
 */
import {
  analyzeMultimodalAction,
  generateGeoContentAction,
  resolveLocationAction,
  uploadGeoEvidence
} from "@/actions/geo-actions";

/**
 * ---------------------------------------------------------------------------
 * I. CONTRATOS DE DATOS Y TIPADO (ESTÁNDAR GEO V2.5)
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
 * GeoState: Máquina de estados finitos para la misión de captura.
 */
export type GeoState =
  | 'IDLE'               // Esperando activación manual (User Gesture)
  | 'SENSORS_READY'      // Hardware GPS en línea y calibrando
  | 'LOCATION_RESOLVED'  // Identidad del lugar y clima confirmados
  | 'SCANNING'           // Transfiriendo binarios (fotos/audio)
  | 'ANALYZING'          // IA procesando evidencia visual y OCR
  | 'ACCEPTED'           // Crónica forjada con éxito
  | 'REJECTED';          // Error de validación, red o integridad

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
 * Contrato de soberanía que el hook expone a la terminal de mando (ScannerUI).
 */
export interface GeoEngineReturn {
  status: GeoState;
  data: GeoContextData;
  userLocation: UserLocation | null;
  activePOI: ActivePOI | null;
  nearbyPOIs: any[];
  isSearching: boolean;
  isLocked: boolean; // Indica si la posición de siembra ha sido congelada
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
 * El orquestador sensorial de NicePod V2.5.
 */
export function useGeoEngine(): GeoEngineReturn {
  const supabase = createClient();

  // --- ESTADOS REACTIVOS DE MISIÓN ---
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
  const ACCURACY_THRESHOLD = 50;  // Máximo error aceptado para visualización
  const NETWORK_COOLDOWN = 5000;  // 5s de guardia entre peticiones de red

  /**
   * calculateDistance: Implementación de la Fórmula de Haversine.
   * Calcula la brecha física entre el Administrador y el nodo de sabiduría.
   */
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Radio terrestre en metros
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }, []);

  /**
   * fetchNearbyPOIs: Recupera la malla urbana activa desde la Bóveda SQL.
   */
  const fetchNearbyPOIs = useCallback(async () => {
    const now = Date.now();
    // Bloqueo por Cooldown: Evita saturar la base de datos en ráfagas de movimiento.
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
   * evaluateResonance: Detecta si el Admin está en un radio de sintonía activa.
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
   * initSensors: Protocolo de Activación por Gesto.
   * [RESOLUCIÓN]: Satisface el requisito de seguridad del navegador y rompe el loop inicial.
   */
  const initSensors = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setError("HARDWARE_GPS_DESACTIVADO");
      return;
    }

    setIsLocked(false);
    const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

    const handleSuccess = (position: GeolocationPosition) => {
      // Filtro de Calidad: Ignoramos ruido térmico extremo del sensor.
      if (position.coords.accuracy > ACCURACY_THRESHOLD) {
        nicepodLog(`🟡 [GeoEngine] Señal débil (${Math.round(position.coords.accuracy)}m). Calibrando...`);
        return;
      }

      const loc: UserLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading
      };

      setUserLocation(loc);
      evaluateResonance(loc);

      // [FILTRO DE MOVIMIENTO]: Solo actualizamos la malla si hay desplazamiento > 15m.
      const distFromLast = !lastSyncLocation.current ? Infinity :
        calculateDistance(loc.latitude, loc.longitude, lastSyncLocation.current.lat, lastSyncLocation.current.lng);

      if (distFromLast > MOVEMENT_THRESHOLD && !isLocked) {
        nicepodLog(`🛰️ [GeoEngine] Movimiento detectado (${Math.round(distFromLast)}m). Sincronizando.`);
        fetchNearbyPOIs();
        lastSyncLocation.current = { lat: loc.latitude, lng: loc.longitude };

        // Disparamos la fase ligera de resolución nominal del lugar.
        resolveCurrentLocation();
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      setError(err.message);
      nicepodLog(`⚠️ [GeoEngine] Error de hardware GPS: ${err.message}`);
    };

    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = navigator.geolocation.watchPosition(handleSuccess, handleError, options);

    setStatus('SENSORS_READY');
  }, [fetchNearbyPOIs, calculateDistance, isLocked]);

  /**
   * resolveCurrentLocation: Fase 1 (LIGERA).
   * Identifica el lugar y el clima sin activar la IA pesada.
   */
  const resolveCurrentLocation = async () => {
    if (!userLocation || status === 'SCANNING') return;

    setIsSearching(true);
    try {
      const result = await resolveLocationAction(userLocation.latitude, userLocation.longitude);
      if (result.success) {
        setData(prev => ({ ...prev, ...result.data }));
        setStatus('LOCATION_RESOLVED');
      }
    } catch (err: any) {
      console.error("🔥 [GeoEngine] Resolve Fail:", err.message);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * scanEnvironment: Fase 2 (PESADA).
   * Misión: Transporte de binarios -> Ingesta Multimodal IA.
   */
  const scanEnvironment = async (params: { heroImage: string; ocrImage?: string; intent: string; category: string; radius: number }) => {
    if (!userLocation) return;

    // Bloqueamos la coordenada (Position Lock) para la integridad de la IA.
    setIsLocked(true);
    setStatus('SCANNING');

    try {
      // 1. Subida de Activos (Storage Bridge)
      nicepodLog("📦 [GeoEngine] Asegurando evidencia visual...");
      const upload = await uploadGeoEvidence(params.heroImage, params.ocrImage);
      if (!upload.success || !upload.urls) throw new Error(upload.message);

      // 2. Ingesta Analítica Multimodal (Edge Function)
      // Enviamos el nombre del lugar ya resuelto para anular alucinaciones de la IA.
      const result = await analyzeMultimodalAction({
        ...params,
        heroImageUrl: upload.urls.heroImageUrl,
        ocrImageUrl: upload.urls.ocrImageUrl,
        placeName: data.place?.poiName || "Hito Urbano",
        location: userLocation,
        categoryId: params.category,
        resonanceRadius: params.radius
      });

      if (!result.success) throw new Error(result.error);

      setData(prev => ({ ...prev, ...result.data }));
      setStatus('ANALYZING');
      nicepodLog("🧠 [GeoEngine] Análisis forense completado.");

    } catch (e: any) {
      nicepodLog(`🛑 [GeoEngine] Fallo en la fase pesada: ${e.message}`);
      setStatus('REJECTED');
      setData({ rejectionReason: e.message });
      setIsLocked(false);
    }
  };

  /**
   * submitIntent: Fase 3 (FINAL).
   * Misión: Forjar la narrativa del guion de sabiduría.
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
      nicepodLog("✍️ [GeoEngine] Crónica urbana forjada con éxito.");
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

  // Limpieza de hardware al desmontar el componente.
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
 * 1. Eficiencia CPU: Al separar la resolución del lugar (Fase 1) del análisis IA 
 *    (Fase 2), garantizamos que la Edge Function pesada no exceda su tiempo de 
 *    ejecución real, ya que ya conoce el contexto del lugar.
 * 2. Supresión de Loops: El umbral de 15 metros y el cooldown de 5 segundos 
 *    aniquilan el bucle de peticiones innecesarias en la consola.
 * 3. Seguridad de Datos: El uso de 'isLocked' es un guardia de integridad. 
 *    Evita que el sistema intente re-analizar el lugar si el Administrador 
 *    camina mientras la IA está escribiendo el guion.
 */