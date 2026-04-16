/**
 * ARCHIVO: hooks/geo-engine/radar-core.tsx
 * VERSIÓN: 4.2
 * PROTOCOLO: MADRID RESONANCE V4.5
 * MISIÓN: Sincronizar la Bóveda de Conocimiento NKV con blindaje BSS.
 * NIVEL DE INTEGRIDAD: 100%
 */

"use client";

import { calculateDistanceBetweenPoints } from "@/lib/geo-kinematics";
import { createClient } from "@/lib/supabase/client";
import { nicepodLog } from "@/lib/utils";
import { 
  ActivePointOfInterest, 
  PointOfInterest, 
  UserLocation,
  GeoPoint
} from "@/types/geo-sovereignty";
import React, { createContext, useCallback, useContext, useRef, useState } from "react";

/**
 * UMBRALES DE GOBERNANZA TÁCTICA INDUSTRIAL
 */
const FETCH_DISTANCE_THRESHOLD_METERS = 150;
const EVALUATION_DISTANCE_THRESHOLD_METERS = 2; 

/**
 * INTERFAZ: RadarCoreReturn
 * Misión: Exponer las capacidades de inteligencia de proximidad a la Fachada Soberana.
 */
interface RadarCoreReturn {
  nearbyPointsOfInterest: PointOfInterest[];
  activePointOfInterest: ActivePointOfInterest | null;
  isRadarSearchProcessActive: boolean;
  localGeographicData: { 
    isProximityConflictDetected?: boolean; 
    manualGeographicPlaceName?: string 
  };
  
  fetchRadarIntelligence: (userLocation: UserLocation, forceRefreshAction?: boolean) => Promise<void>;
  evaluateProximityResonance: (userLocation: UserLocation) => void;
  setManualGeographicPlaceName: (placeName: string) => void;
  clearRadarIntelligence: () => void;
}

const RadarContext = createContext<RadarCoreReturn | undefined>(undefined);

/**
 * RadarProvider: El subsistema de inteligencia de proximidad unificado de la plataforma.
 */
export function RadarProvider({ children }: { children: React.ReactNode }) {
  const supabaseClient = createClient();

  // --- I. ESTADOS DE LA MALLA GEOGRÁFICA LOCAL (NOMINAL INTEGRITY) ---
  const [nearbyPointsOfInterestCollection, setNearbyPointsOfInterestCollection] = useState<PointOfInterest[]>([]);
  const [activePointOfInterest, setActivePointOfInterest] = useState<ActivePointOfInterest | null>(null);
  const [isRadarSearchProcessActive, setIsRadarSearchProcessActive] = useState<boolean>(false);
  const [localGeographicData, setLocalGeographicData] = useState<{ 
    isProximityConflictDetected?: boolean; 
    manualGeographicPlaceName?: string 
  }>({});

  // --- II. MEMORIA TÁCTICA (REFERENCIAS MUTABLES - PILAR 4) ---
  const lastFetchGeographicPositionReference = useRef<{ latitudeCoordinate: number, longitudeCoordinate: number } | null>(null);
  const lastEvaluationGeographicPositionReference = useRef<{ latitudeCoordinate: number, longitudeCoordinate: number } | null>(null);
  const networkAbortControllerReference = useRef<AbortController | null>(null);
  
  /**
   * isRequestCurrentlyInProgressReference:
   * [INTERVENCIÓN V4.1]: Misión: Actuar como un bloqueo lógico (Atomic Lock) para prevenir 
   * el "Request Flooding" durante el ciclo de hidratación o ante micro-movimientos.
   */
  const isRequestCurrentlyInProgressReference = useRef<boolean>(false);

  /**
   * fetchRadarIntelligence:
   * Misión: Sincronizar los nodos de la Bóveda NKV con la malla local del dispositivo.
   * [SINCRO V4.1]: Implementación de de-duplicación de peticiones de red.
   */
  const fetchRadarIntelligence = useCallback(async (
    userLocation: UserLocation, 
    forceRefreshAction: boolean = false
  ) => {
    // 1. PROTOCOLO DE BLOQUEO LÓGICO: Si una petición ya está en vuelo, abortamos la redundancia.
    if (isRequestCurrentlyInProgressReference.current && !forceRefreshAction) {
      nicepodLog("🛡️ [RadarCore] Bloqueo de concurrencia activo. Evitando petición redundante.");
      return;
    }

    // 2. FILTRO DE EMISIÓN POR PROXIMIDAD: Evitamos peticiones si el Voyager no se ha desplazado lo suficiente.
    if (!forceRefreshAction && lastFetchGeographicPositionReference.current) {
      const distanceFromLastFetchMagnitude = calculateDistanceBetweenPoints(
        { 
          latitude: userLocation.latitudeCoordinate, 
          longitude: userLocation.longitudeCoordinate 
        },
        { 
          latitude: lastFetchGeographicPositionReference.current.latitudeCoordinate, 
          longitude: lastFetchGeographicPositionReference.current.longitudeCoordinate 
        }
      );
      
      if (distanceFromLastFetchMagnitude < FETCH_DISTANCE_THRESHOLD_METERS) {
        return;
      }
    }

    /**
     * 3. PROTOCOLO DE HIGIENE DE RED (ABORT ATÓMICO):
     * Mantenemos el controlador para cancelar peticiones si el componente se desmonta 
     * o si se requiere un refresco forzado.
     */
    if (networkAbortControllerReference.current) {
      networkAbortControllerReference.current.abort();
    }
    networkAbortControllerReference.current = new AbortController();

    setIsRadarSearchProcessActive(true);
    isRequestCurrentlyInProgressReference.current = true;
    
    try {
      nicepodLog(`🛰️ [RadarCore] Sincronizando Bóveda NKV (${forceRefreshAction ? 'COMANDO_FORZADO' : 'FETCH_PROXIMIDAD'})`);
      
      const { data: pointOfInterestIntelligenceResults, error: supabaseDatabaseQueryException } = await supabaseClient
        .from('vw_map_resonance_active')
        .select('*')
        .abortSignal(networkAbortControllerReference.current.signal);

      if (supabaseDatabaseQueryException) {
        throw supabaseDatabaseQueryException;
      }

      /**
       * [BUILD SHIELD]: MAPEADOR DE INTEGRIDAD SOBERANA.
       * Sincronizado con la Constitución V8.6 y el Metal V2.0.
       */
      const sanitizedPointsCollection: PointOfInterest[] = (pointOfInterestIntelligenceResults || []).map((pointOfInterestItem: Record<string, unknown>) => ({
        identification: pointOfInterestItem.identification as number,
        authorIdentification: (pointOfInterestItem.author_identification as string) || "NICEPOD_SYSTEM_AUTHORITY",
        name: (pointOfInterestItem.point_of_interest_name as string) || "Nodo No Identificado",
        categoryMission: pointOfInterestItem.category_mission as import('@/types/geo-sovereignty').CategoryMission,
        categoryEntity: pointOfInterestItem.category_entity as import('@/types/geo-sovereignty').CategoryEntity,
        historicalEpoch: pointOfInterestItem.historical_epoch as import('@/types/geo-sovereignty').HistoricalEpoch,
        geographicLocation: pointOfInterestItem.geo_location as GeoPoint,
        resonanceRadiusMeters: (pointOfInterestItem.resonance_radius as number) || 35,
        importanceScore: (pointOfInterestItem.importance_score as number) || 1,
        historicalFact: pointOfInterestItem.historical_fact as string,
        richDescription: null, 
        galleryUniformResourceLocatorsCollection: (pointOfInterestItem.gallery_urls as string[]) || [],
        ambientAudioUniformResourceLocator: (pointOfInterestItem.ambient_audio_url as string) || null,
        status: 'published',
        isPublished: true,
        referencePodcastIdentification: (pointOfInterestItem.reference_podcast_id as number) || null,
        creationTimestamp: new Date().toISOString(),
        updateTimestamp: new Date().toISOString(),
        metadata: {
            externalSourceUniformResourceLocator: pointOfInterestItem.external_reference_url as string
        }
      }));

      setNearbyPointsOfInterestCollection(sanitizedPointsCollection);
      
      lastFetchGeographicPositionReference.current = { 
        latitudeCoordinate: userLocation.latitudeCoordinate, 
        longitudeCoordinate: userLocation.longitudeCoordinate 
      };
    } catch (operationalException: unknown) {
      if (!(operationalException instanceof Error && operationalException.name === 'AbortError')) {
        nicepodLog("🔥 [RadarCore] Fallo crítico en conexión con Bóveda NKV.", (operationalException instanceof Error) ? operationalException : String(operationalException), 'error');
      }
    } finally {
      setIsRadarSearchProcessActive(false);
      isRequestCurrentlyInProgressReference.current = false;
    }
  }, [supabaseClient]);

  /**
   * evaluateProximityResonance:
   * Misión: Procesar en el cliente el radio de acción de los nodos.
   */
  const evaluateProximityResonance = useCallback((userLocation: UserLocation) => {
    if (nearbyPointsOfInterestCollection.length === 0) {
      return;
    }

    if (lastEvaluationGeographicPositionReference.current) {
      const distanceFromLastEvaluationMagnitude = calculateDistanceBetweenPoints(
        { 
          latitude: userLocation.latitudeCoordinate, 
          longitude: userLocation.longitudeCoordinate 
        },
        { 
          latitude: lastEvaluationGeographicPositionReference.current.latitudeCoordinate, 
          longitude: lastEvaluationGeographicPositionReference.current.longitudeCoordinate 
        }
      );
      
      if (distanceFromLastEvaluationMagnitude < EVALUATION_DISTANCE_THRESHOLD_METERS) {
        return;
      }
    }

    let closestResonancePoint: ActivePointOfInterest | null = null;
    let minimumDistanceObservedMagnitude = Infinity;

    nearbyPointsOfInterestCollection.forEach((pointOfInterestItem) => {
      const [pointLongitudeCoordinate, pointLatitudeCoordinate] = pointOfInterestItem.geographicLocation.coordinates;
      
      const distanceToNodeMagnitude = calculateDistanceBetweenPoints(
        { 
          latitude: userLocation.latitudeCoordinate, 
          longitude: userLocation.longitudeCoordinate 
        }, 
        { 
          latitude: pointLatitudeCoordinate, 
          longitude: pointLongitudeCoordinate 
        }
      );

      if (distanceToNodeMagnitude < minimumDistanceObservedMagnitude) {
        minimumDistanceObservedMagnitude = distanceToNodeMagnitude;
        closestResonancePoint = {
          identification: pointOfInterestItem.identification.toString(), 
          name: pointOfInterestItem.name, 
          distanceMeters: Math.round(distanceToNodeMagnitude),
          isWithinRadius: distanceToNodeMagnitude <= (pointOfInterestItem.resonanceRadiusMeters || 35),
          historicalFact: pointOfInterestItem.historicalFact || undefined
        };
      }
    });

    setActivePointOfInterest(closestResonancePoint);
    
    setLocalGeographicData(previousGeographicData => ({ 
      ...previousGeographicData, 
      isProximityConflictDetected: minimumDistanceObservedMagnitude < 10 
    }));

    lastEvaluationGeographicPositionReference.current = { 
      latitudeCoordinate: userLocation.latitudeCoordinate, 
      longitudeCoordinate: userLocation.longitudeCoordinate 
    };
  }, [nearbyPointsOfInterestCollection]);

  /**
   * clearRadarIntelligence:
   * Misión: Purga física de la memoria del radar y aniquilación de hilos de red.
   */
  const clearRadarIntelligence = useCallback(() => {
    if (networkAbortControllerReference.current) {
      networkAbortControllerReference.current.abort();
    }
    setNearbyPointsOfInterestCollection([]);
    setActivePointOfInterest(null);
    setLocalGeographicData({});
    lastFetchGeographicPositionReference.current = null;
    lastEvaluationGeographicPositionReference.current = null;
    isRequestCurrentlyInProgressReference.current = false;
    nicepodLog("🧹 [RadarCore] Malla de proximidad purgada íntegramente.");
  }, []);

  /**
   * radarApplicationProgrammingInterface:
   * Composición de la firma pública que satisface el contrato RadarCoreReturn.
   */
  const radarApplicationProgrammingInterface: RadarCoreReturn = {
    nearbyPointsOfInterest: nearbyPointsOfInterestCollection, 
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
    throw new Error("CRITICAL_ERROR: 'useGeoRadar' debe invocarse dentro del perímetro de su RadarProvider.");
  }
  return radarContext;
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (V4.1):
 * 1. Logic Locking (Mission 3): Se ha implementado 'isRequestCurrentlyInProgressReference' 
 *    para evitar colisiones de red. Esto erradica el ruido de peticiones canceladas en el 
 *    Dashboard y optimiza el consumo de cuota del Metal.
 * 2. Zero Abbreviations Policy (ZAP): Purificación total de variables de bucle y estado 
 *    (distanceFromLastFetchMagnitude, sanitizedPointsCollection, pointOfInterestItem).
 * 3. Network Efficiency: El uso del controlador de aborto en combinación con el bloqueo 
 *    lógico garantiza que la Workstation sea resiliente ante ráfagas de telemetría inestables.
 */