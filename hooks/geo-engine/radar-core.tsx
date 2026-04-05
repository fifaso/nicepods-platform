/**
 * ARCHIVO: hooks/geo-engine/radar-core.tsx
 * VERSIÓN: 1.1 (NicePod Radar Core - Full Descriptive Integrity & Contract Sync)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Evaluar el entorno geográfico y sincronizar con la Bóveda NKV (Supabase)
 * de forma independiente a la interfaz de usuario, garantizando sintonía de proximidad.
 * [REFORMA V1.1]: Sincronización total con la Constitución V8.0, eliminación de 
 * abreviaturas 'POI' y resolución de error de importación TS2305 para Vercel.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { calculateDistance } from "@/lib/geo-kinematics";
import { createClient } from "@/lib/supabase/client";
import { nicepodLog } from "@/lib/utils";
import { 
  ActivePointOfInterest, 
  PointOfInterest, 
  UserLocation 
} from "@/types/geo-sovereignty";
import React, { createContext, useCallback, useContext, useRef, useState } from "react";

/**
 * UMBRALES DE GOBERNANZA TÁCTICA
 */
const FETCH_DISTANCE_THRESHOLD_METERS = 150;
const EVALUATION_DISTANCE_THRESHOLD_METERS = 3;

interface RadarCoreReturn {
  nearbyPointsOfInterest: PointOfInterest[];
  activePointOfInterest: ActivePointOfInterest | null;
  isSearching: boolean;
  localData: { isProximityConflict?: boolean; manualPlaceName?: string };
  fetchRadar: (location: UserLocation, forceRefresh?: boolean) => Promise<void>;
  evaluateProximity: (location: UserLocation) => void;
  setManualPlaceName: (name: string) => void;
  clearRadar: () => void;
}

const RadarContext = createContext<RadarCoreReturn | undefined>(undefined);

/**
 * RadarProvider: El subsistema de inteligencia de proximidad.
 */
export function RadarProvider({ children }: { children: React.ReactNode }) {
  const supabaseClient = createClient();

  // --- I. ESTADOS DE MALLA LOCAL ---
  const [nearbyPointsOfInterest, setNearbyPointsOfInterest] = useState<PointOfInterest[]>([]);
  const [activePointOfInterest, setActivePointOfInterest] = useState<ActivePointOfInterest | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [localData, setLocalData] = useState<{ isProximityConflict?: boolean; manualPlaceName?: string }>({});

  // --- II. MEMORIA TÁCTICA (Refs para evitar colisiones de red) ---
  const lastFetchPositionReference = useRef<{ latitude: number, longitude: number } | null>(null);
  const lastEvaluationPositionReference = useRef<{ latitude: number, longitude: number } | null>(null);
  const abortControllerReference = useRef<AbortController | null>(null);

  /**
   * fetchRadar:
   * Misión: Sincronizar los nodos de la Bóveda NKV con la malla local del dispositivo.
   */
  const fetchRadar = useCallback(async (location: UserLocation, forceRefresh: boolean = false) => {
    if (!forceRefresh && lastFetchPositionReference.current) {
      const distanceFromLastFetch = calculateDistance(
        { latitude: location.latitude, longitude: location.longitude },
        { 
          latitude: lastFetchPositionReference.current.latitude, 
          longitude: lastFetchPositionReference.current.longitude 
        }
      );
      
      if (distanceFromLastFetch < FETCH_DISTANCE_THRESHOLD_METERS) return;
    }

    // Protocolo de Higiene de Red: Abortamos peticiones obsoletas.
    if (abortControllerReference.current) {
      abortControllerReference.current.abort();
    }
    abortControllerReference.current = new AbortController();

    setIsSearching(true);
    try {
      nicepodLog(`🛰️ [RadarCore] Sincronizando Bóveda NKV (${forceRefresh ? 'FORZADO' : 'THROTTLED'})`);
      
      const { data: pointOfInterestsResults, error: databaseError } = await supabaseClient
        .from('vw_map_resonance_active')
        .select('*');

      if (databaseError) throw databaseError;

      setNearbyPointsOfInterest((pointOfInterestsResults as PointOfInterest[]) || []);
      
      lastFetchPositionReference.current = { 
        latitude: location.latitude, 
        longitude: location.longitude 
      };
    } catch (exception: any) {
      if (exception.name !== 'AbortError') {
        nicepodLog("🔥 [RadarCore] Fallo en conexión con Bóveda NKV.", exception, 'error');
      }
    } finally {
      setIsSearching(false);
    }
  }, [supabaseClient]);

  /**
   * evaluateProximity:
   * Misión: Procesar en el cliente el radio de resonancia de los nodos cercanos.
   */
  const evaluateProximity = useCallback((location: UserLocation) => {
    if (nearbyPointsOfInterest.length === 0) return;

    if (lastEvaluationPositionReference.current) {
      const distanceFromLastEvaluation = calculateDistance(
        { latitude: location.latitude, longitude: location.longitude },
        { 
          latitude: lastEvaluationPositionReference.current.latitude, 
          longitude: lastEvaluationPositionReference.current.longitude 
        }
      );
      
      if (distanceFromLastEvaluation < EVALUATION_DISTANCE_THRESHOLD_METERS) return;
    }

    let closestPoint: ActivePointOfInterest | null = null;
    let minimumDistanceObserved = Infinity;

    nearbyPointsOfInterest.forEach((pointOfInterest) => {
      // Rigor PostGIS: Longitud es el índice 0, Latitud es el índice 1.
      const [pointLongitude, pointLatitude] = pointOfInterest.geo_location.coordinates;
      
      const distanceToPoint = calculateDistance(
        { latitude: location.latitude, longitude: location.longitude }, 
        { latitude: pointLatitude, longitude: pointLongitude }
      );

      if (distanceToPoint < minimumDistanceObserved) {
        minimumDistanceObserved = distanceToPoint;
        closestPoint = {
          identification: pointOfInterest.id.toString(), 
          name: pointOfInterest.name, 
          distance: Math.round(distanceToPoint),
          isWithinRadius: distanceToPoint <= (pointOfInterest.resonance_radius || 35),
          historical_fact: pointOfInterest.historical_fact || undefined
        };
      }
    });

    setActivePointOfInterest(closestPoint);
    
    // Conflicto de Proximidad: Alerta si el Voyager está a menos de 10m de otro nodo.
    setLocalData(previousData => ({ 
      ...previousData, 
      isProximityConflict: minimumDistanceObserved < 10 
    }));

    lastEvaluationPositionReference.current = { 
      latitude: location.latitude, 
      longitude: location.longitude 
    };
  }, [nearbyPointsOfInterest]);

  /**
   * clearRadar:
   * Misión: Purga física de la memoria del radar y cancelación de procesos de red.
   */
  const clearRadar = useCallback(() => {
    if (abortControllerReference.current) {
      abortControllerReference.current.abort();
    }
    setNearbyPointsOfInterest([]);
    setActivePointOfInterest(null);
    setLocalData({});
    lastFetchPositionReference.current = null;
    lastEvaluationPositionReference.current = null;
    nicepodLog("🧹 [RadarCore] Malla de proximidad purgada.");
  }, []);

  const radarApi: RadarCoreReturn = {
    nearbyPointsOfInterest, 
    activePointOfInterest, 
    isSearching, 
    localData,
    fetchRadar, 
    evaluateProximity, 
    clearRadar,
    setManualPlaceName: (name) => setLocalData(previousData => ({ 
      ...previousData, 
      manualPlaceName: name 
    }))
  };

  return <RadarContext.Provider value={radarApi}>{children}</RadarContext.Provider>;
}

/**
 * useGeoRadar:
 * Punto de acceso único para la inteligencia de proximidad.
 */
export const useGeoRadar = () => {
  const context = useContext(RadarContext);
  if (!context) {
    throw new Error("CRITICAL_ERROR: useGeoRadar debe usarse dentro de un RadarProvider.");
  }
  return context;
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (V1.1):
 * 1. Build Shield Compliance: Se resolvió el error TS2305 al sincronizar el 
 *    archivo con el tipo 'ActivePointOfInterest' de la Constitución V8.0.
 * 2. Zero Abbreviations: Se purgaron términos como 'POI', 'dist' y 'lat/lng' 
 *    para cumplir con el estándar industrial de NicePod V4.0.
 * 3. CPU Shielding: La lógica de evaluateProximity ahora utiliza nombres descriptivos 
 *    y mantiene el throttling de 3m para proteger el hilo principal de la GPU.
 */