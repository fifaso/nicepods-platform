/**
 * ARCHIVO: hooks/geo-engine/radar-core.tsx
 * VERSIÓN: 4.0 (NicePod Radar Core - High-Fidelity Proximity & Nominal Shield Edition)
 * PROTOCOLO: MADRID RESONANCE V4.5
 * 
 * Misión: Evaluar el entorno geográfico y sincronizar la Bóveda de Conocimiento NKV 
 * de forma independiente a la interfaz, garantizando sintonía de proximidad milimétrica
 * y optimización de recursos de red mediante el protocolo de aborto atómico.
 * [REFORMA V4.0]: Implementación integral de la Zero Abbreviations Policy (ZAP). 
 * Sincronización total con la Constitución V8.6 y el Metal V2.0. Refuerzo del 
 * filtrado de proximidad para prevenir colisiones de hilos de red y optimización 
 * del Hilo Principal (Main Thread Isolation).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
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
const EVALUATION_DISTANCE_THRESHOLD_METERS = 2; // Mayor sensibilidad para peritaje de precisión

/**
 * INTERFAZ: RadarCoreReturn
 * Misión: Exponer las capacidades de inteligencia de proximidad a la Fachada Soberana.
 */
interface RadarCoreReturn {
  /** nearbyPointsOfInterestCollection: Colección de nodos detectados en la malla local. */
  nearbyPointsOfInterest: PointOfInterest[];
  /** activePointOfInterest: El hito con mayor resonancia de proximidad actual. */
  activePointOfInterest: ActivePointOfInterest | null;
  /** isRadarSearchProcessActive: Flag de estado para la sincronización con el Metal. */
  isRadarSearchProcessActive: boolean;
  /** localGeographicData: Metadatos situacionales para la interfaz de usuario. */
  localGeographicData: { 
    isProximityConflictDetected?: boolean; 
    manualGeographicPlaceName?: string 
  };
  
  /** fetchRadarIntelligence: Sincroniza los nodos de la Bóveda con la posición del Voyager. */
  fetchRadarIntelligence: (userLocation: UserLocation, forceRefreshAction?: boolean) => Promise<void>;
  /** evaluateProximityResonance: Procesa el radio de acción de los nodos en el cliente. */
  evaluateProximityResonance: (userLocation: UserLocation) => void;
  /** setManualGeographicPlaceName: Establece una identidad nominativa manual. */
  setManualGeographicPlaceName: (placeName: string) => void;
  /** clearRadarIntelligence: Purga física de la memoria del radar. */
  clearRadarIntelligence: () => void;
}

const RadarContext = createContext<RadarCoreReturn | undefined>(undefined);

/**
 * RadarProvider: El subsistema de inteligencia de proximidad unificado.
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
   * fetchRadarIntelligence:
   * Misión: Sincronizar los nodos de la Bóveda NKV con la malla local del dispositivo.
   */
  const fetchRadarIntelligence = useCallback(async (
    userLocation: UserLocation, 
    forceRefreshAction: boolean = false
  ) => {
    // 1. Filtro de Emisión: Evitamos peticiones redundantes si el desplazamiento es despreciable.
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
     * 2. PROTOCOLO DE HIGIENE DE RED (ABORT ATÓMICO):
     * Cancelamos cualquier petición pendiente para evitar el procesamiento de datos obsoletos.
     */
    if (networkAbortControllerReference.current) {
      networkAbortControllerReference.current.abort();
    }
    networkAbortControllerReference.current = new AbortController();

    setIsRadarSearchProcessActive(true);
    
    try {
      nicepodLog(`🛰️ [RadarCore] Sincronizando Bóveda NKV (${forceRefreshAction ? 'COMANDO_FORZADO' : 'FETCH_PROXIMIDAD'})`);
      
      // Consultamos la vista de resonancia activa optimizada por PostGIS en el Metal.
      const { data: pointOfInterestIntelligenceResults, error: supabaseDatabaseQueryException } = await supabaseClient
        .from('vw_map_resonance_active')
        .select('*')
        .abortSignal(networkAbortControllerReference.current.signal);

      if (supabaseDatabaseQueryException) {
        throw supabaseDatabaseQueryException;
      }

      /**
       * [BUILD SHIELD]: MAPEADOR DE INTEGRIDAD SOBERANA.
       * Transmutamos la salida de la vista SQL hacia el contrato estricto de la Constitución.
       */
      const sanitizedPointsCollection: PointOfInterest[] = (pointOfInterestIntelligenceResults || []).map((pointOfInterestItem: any) => ({
        identification: pointOfInterestItem.identification,
        authorIdentification: pointOfInterestItem.author_identification || "NICEPOD_SYSTEM_AUTHORITY",
        name: pointOfInterestItem.point_of_interest_name || "Nodo No Identificado",
        categoryMission: pointOfInterestItem.category_mission,
        categoryEntity: pointOfInterestItem.category_entity,
        historicalEpoch: pointOfInterestItem.historical_epoch,
        geographicLocation: pointOfInterestItem.geo_location as GeoPoint,
        resonanceRadiusMeters: pointOfInterestItem.resonance_radius || 35,
        importanceScore: pointOfInterestItem.importance_score || 1,
        historicalFact: pointOfInterestItem.historical_fact,
        richDescription: null, // Campo excluido del radar para optimizar ancho de banda
        galleryUniformResourceLocatorsCollection: pointOfInterestItem.gallery_urls || [],
        ambientAudioUniformResourceLocator: pointOfInterestItem.ambient_audio_url || null,
        status: 'published',
        isPublished: true,
        referencePodcastIdentification: pointOfInterestItem.reference_podcast_id || null,
        creationTimestamp: new Date().toISOString(),
        updateTimestamp: new Date().toISOString(),
        metadata: {
            externalSourceUniformResourceLocator: pointOfInterestItem.external_reference_url
        }
      }));

      setNearbyPointsOfInterestCollection(sanitizedPointsCollection);
      
      lastFetchGeographicPositionReference.current = { 
        latitudeCoordinate: userLocation.latitudeCoordinate, 
        longitudeCoordinate: userLocation.longitudeCoordinate 
      };
    } catch (operationalException: any) {
      if (operationalException.name !== 'AbortError') {
        nicepodLog("🔥 [RadarCore] Fallo crítico en comunicación con Bóveda NKV.", operationalException, 'error');
      }
    } finally {
      setIsRadarSearchProcessActive(false);
    }
  }, [supabaseClient]);

  /**
   * evaluateProximityResonance:
   * Misión: Calcular en el cliente el radio de resonancia y detectar conflictos geodésicos.
   * [MTI]: Implementación de throttling por distancia para proteger el hilo principal.
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

    // Escaneo de la Malla Local (Complejidad O(N))
    nearbyPointsOfInterestCollection.forEach((pointOfInterestItem) => {
      // Estándar PostGIS: [Longitud, Latitud]
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
    
    /**
     * Conflicto de Proximidad: 
     * Se activa si el Voyager intenta forjar un hito a menos de 10m de un hito existente,
     * protegiendo la densidad de la Malla.
     */
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
   * Misión: Purga física de la memoria del radar y aniquilación de hilos de red pendientes.
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
 * NOTA TÉCNICA DEL ARCHITECT (V4.0):
 * 1. Zero Abbreviations Policy (ZAP): Se han purificado todas las variables internas y de estado 
 *    (distanceMagnitude, operationalException, sanitizedPointsCollection, etc.).
 * 2. Contractual Symmetry: El mapeador de integridad sincroniza la vista PostGIS con el 
 *    tipo PointOfInterest V8.6, asegurando que 'authorIdentification' sea persistente.
 * 3. Network Resilience: El uso de AbortController previene condiciones de carrera 
 *    durante desplazamientos rápidos a alta velocidad del Voyager.
 */