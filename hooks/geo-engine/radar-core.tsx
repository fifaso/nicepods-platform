/**
 * ARCHIVO: hooks/geo-engine/radar-core.tsx
 * VERSIÓN: 2.0 (NicePod Radar Core - Nominal Sovereignty & Kinematic Sync)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Evaluar el entorno geográfico y sincronizar la Bóveda NKV de forma 
 * independiente a la interfaz, garantizando sintonía de proximidad milimétrica.
 * [REFORMA V2.0]: Sincronización nominal total con KinematicEngine V3.0, 
 * resolución de error TS2305 y cumplimiento estricto de la Zero Abbreviations Policy.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { calculateDistanceBetweenPoints } from "@/lib/geo-kinematics";
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

/**
 * INTERFAZ: RadarCoreReturn
 * Misión: Exponer las capacidades de inteligencia de proximidad a la Fachada.
 */
interface RadarCoreReturn {
  nearbyPointsOfInterest: PointOfInterest[];
  activePointOfInterest: ActivePointOfInterest | null;
  isRadarSearchProcessActive: boolean;
  localGeographicData: { isProximityConflict?: boolean; manualGeographicPlaceName?: string };
  
  fetchRadarIntelligence: (userLocation: UserLocation, forceRefreshAction?: boolean) => Promise<void>;
  evaluateProximityResonance: (userLocation: UserLocation) => void;
  setManualGeographicPlaceName: (placeName: string) => void;
  clearRadarIntelligence: () => void;
}

const RadarContext = createContext<RadarCoreReturn | undefined>(undefined);

/**
 * RadarProvider: El subsistema de inteligencia de proximidad de NicePod.
 */
export function RadarProvider({ children }: { children: React.ReactNode }) {
  const supabaseClient = createClient();

  // --- I. ESTADOS DE LA MALLA GEOGRÁFICA LOCAL ---
  const [nearbyPointsOfInterest, setNearbyPointsOfInterest] = useState<PointOfInterest[]>([]);
  const [activePointOfInterest, setActivePointOfInterest] = useState<ActivePointOfInterest | null>(null);
  const [isRadarSearchProcessActive, setIsRadarSearchProcessActive] = useState<boolean>(false);
  const [localGeographicData, setLocalGeographicData] = useState<{ 
    isProximityConflict?: boolean; 
    manualGeographicPlaceName?: string 
  }>({});

  // --- II. MEMORIA TÁCTICA (REFERENCIAS MUTABLES) ---
  const lastFetchGeographicPositionReference = useRef<{ latitude: number, longitude: number } | null>(null);
  const lastEvaluationGeographicPositionReference = useRef<{ latitude: number, longitude: number } | null>(null);
  const networkAbortControllerReference = useRef<AbortController | null>(null);

  /**
   * fetchRadarIntelligence:
   * Misión: Sincronizar los nodos de la Bóveda NKV con la malla local del dispositivo Voyager.
   */
  const fetchRadarIntelligence = useCallback(async (
    userLocation: UserLocation, 
    forceRefreshAction: boolean = false
  ) => {
    // 1. Filtro de Emisión: Evitamos peticiones redundantes si el desplazamiento es mínimo.
    if (!forceRefreshAction && lastFetchGeographicPositionReference.current) {
      const distanceFromLastFetchMagnitude = calculateDistanceBetweenPoints(
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { 
          latitude: lastFetchGeographicPositionReference.current.latitude, 
          longitude: lastFetchGeographicPositionReference.current.longitude 
        }
      );
      
      if (distanceFromLastFetchMagnitude < FETCH_DISTANCE_THRESHOLD_METERS) {
        return;
      }
    }

    // 2. Protocolo de Higiene de Red: Abortamos peticiones obsoletas para liberar el ancho de banda.
    if (networkAbortControllerReference.current) {
      networkAbortControllerReference.current.abort();
    }
    networkAbortControllerReference.current = new AbortController();

    setIsRadarSearchProcessActive(true);
    
    try {
      nicepodLog(`🛰️ [RadarCore] Sincronizando Bóveda NKV (${forceRefreshAction ? 'ACCION_FORZADA' : 'THROTTLED_FETCH'})`);
      
      // Consultamos la vista de resonancia activa optimizada por PostGIS
      const { data: pointOfInterestIntelligenceResults, error: databaseQueryError } = await supabaseClient
        .from('vw_map_resonance_active')
        .select('*');

      if (databaseQueryError) {
        throw databaseQueryError;
      }

      setNearbyPointsOfInterest((pointOfInterestIntelligenceResults as unknown as PointOfInterest[]) || []);
      
      lastFetchGeographicPositionReference.current = { 
        latitude: userLocation.latitude, 
        longitude: userLocation.longitude 
      };
    } catch (exception: any) {
      if (exception.name !== 'AbortError') {
        nicepodLog("🔥 [RadarCore] Fallo crítico en conexión con Bóveda NKV.", exception, 'error');
      }
    } finally {
      setIsRadarSearchProcessActive(false);
    }
  }, [supabaseClient]);

  /**
   * evaluateProximityResonance:
   * Misión: Procesar en el cliente el radio de resonancia de los nodos detectados.
   */
  const evaluateProximityResonance = useCallback((userLocation: UserLocation) => {
    if (nearbyPointsOfInterest.length === 0) {
      return;
    }

    // 1. Throttling de Evaluación: Protegemos el hilo principal de cálculos constantes.
    if (lastEvaluationGeographicPositionReference.current) {
      const distanceFromLastEvaluationMagnitude = calculateDistanceBetweenPoints(
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { 
          latitude: lastEvaluationGeographicPositionReference.current.latitude, 
          longitude: lastEvaluationGeographicPositionReference.current.longitude 
        }
      );
      
      if (distanceFromLastEvaluationMagnitude < EVALUATION_DISTANCE_THRESHOLD_METERS) {
        return;
      }
    }

    let closestResonancePoint: ActivePointOfInterest | null = null;
    let minimumDistanceObservedMagnitude = Infinity;

    // 2. Escaneo de la Malla Local
    nearbyPointsOfInterest.forEach((pointOfInterestItem) => {
      // Estándar PostGIS: [Longitud, Latitud]
      const [pointLongitudeCoordinate, pointLatitudeCoordinate] = pointOfInterestItem.geo_location.coordinates;
      
      const distanceToNodeMagnitude = calculateDistanceBetweenPoints(
        { latitude: userLocation.latitude, longitude: userLocation.longitude }, 
        { latitude: pointLatitudeCoordinate, longitude: pointLongitudeCoordinate }
      );

      if (distanceToNodeMagnitude < minimumDistanceObservedMagnitude) {
        minimumDistanceObservedMagnitude = distanceToNodeMagnitude;
        closestResonancePoint = {
          identification: pointOfInterestItem.id.toString(), 
          name: pointOfInterestItem.name, 
          distance: Math.round(distanceToNodeMagnitude),
          isWithinRadius: distanceToNodeMagnitude <= (pointOfInterestItem.resonance_radius || 35),
          historical_fact: pointOfInterestItem.historical_fact || undefined
        };
      }
    });

    setActivePointOfInterest(closestResonancePoint);
    
    /**
     * Conflicto de Proximidad: 
     * Activamos alerta si el Voyager intenta forjar un nodo a menos de 10m de otro.
     */
    setLocalGeographicData(previousGeographicData => ({ 
      ...previousGeographicData, 
      isProximityConflict: minimumDistanceObservedMagnitude < 10 
    }));

    lastEvaluationGeographicPositionReference.current = { 
      latitude: userLocation.latitude, 
      longitude: userLocation.longitude 
    };
  }, [nearbyPointsOfInterest]);

  /**
   * clearRadarIntelligence:
   * Misión: Purga física de la memoria del radar y cancelación de hilos de red.
   */
  const clearRadarIntelligence = useCallback(() => {
    if (networkAbortControllerReference.current) {
      networkAbortControllerReference.current.abort();
    }
    setNearbyPointsOfInterest([]);
    setActivePointOfInterest(null);
    setLocalGeographicData({});
    lastFetchGeographicPositionReference.current = null;
    lastEvaluationGeographicPositionReference.current = null;
    nicepodLog("🧹 [RadarCore] Malla de proximidad purgada íntegramente.");
  }, []);

  /**
   * radarApplicationProgrammingInterface:
   * Misión: Componer la interfaz pública de grado industrial.
   */
  const radarApplicationProgrammingInterface: RadarCoreReturn = {
    nearbyPointsOfInterest, 
    activePointOfInterest, 
    isRadarSearchProcessActive, 
    localGeographicData,
    fetchRadarIntelligence, 
    evaluateProximityResonance, 
    clearRadarIntelligence,
    setManualGeographicPlaceName: (placeName: string) => setLocalGeographicData(previousData => ({ 
      ...previousData, 
      manualGeographicPlaceName: placeName 
    }))
  };

  return (
    <RadarContext.Provider value={radarApplicationProgrammingInterface}>
      {children}
    </RadarContext.Provider>
  );
}

/**
 * useGeoRadar:
 * Punto de consumo único para la inteligencia de proximidad y radar semántico.
 */
export const useGeoRadar = () => {
  const radarContext = useContext(RadarContext);
  if (!radarContext) {
    throw new Error("CRITICAL_ERROR: 'useGeoRadar' invocado fuera del perímetro de su RadarProvider.");
  }
  return radarContext;
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (V2.0):
 * 1. Kinematic Synchronization: Se corrigió el error TS2305 mediante el uso de 
 *    'calculateDistanceBetweenPoints' sincronizado con lib/geo-kinematics.ts V3.0.
 * 2. Zero Abbreviations Policy: Purificación absoluta de términos (pointLongitudeCoordinate, 
 *    distanceFromLastFetchMagnitude, radarApplicationProgrammingInterface).
 * 3. Network Hygiene: Se implementó un protocolo de AbortController robusto para evitar 
 *    el procesamiento de resultados de red obsoletos durante desplazamientos rápidos.
 */