// hooks/use-geo-engine.tsx
// VERSIÓN: 27.0 (NicePod Sovereign Geo-Engine - Bi-Phasic Authority Edition)
// Misión: Orquestar el Cerebro Dual diferenciando entre Estimación (IP) y Autoridad (GPS).
// [ESTABILIZACIÓN]: Implementación de isGPSLock (80m), Throttling de 100m y Fusión de Contexto.

"use client";

import { createClient } from "@/lib/supabase/client";
import { nicepodLog } from "@/lib/utils";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

// --- SERVICIOS ESPECIALIZADOS ---
import { calculateDistance } from "@/lib/geo-kinematics";
import { useForgeOrchestrator } from "./use-forge-orchestrator";
import { useSensorAuthority } from "./use-sensor-authority";

// --- CONSTITUCIÓN DE TIPOS (BUILD SHIELD V4.2) ---
import {
  ActivePOI,
  GeoEngineReturn,
  GeoEngineState,
  PointOfInterest,
  UserLocation
} from "@/types/geo-sovereignty";

const GeoEngineContext = createContext<GeoEngineReturn | undefined>(undefined);

interface GeoEngineProviderProps {
  children: React.ReactNode;
  initialData?: {
    lat: number;
    lng: number;
    city: string;
    source: string;
  } | null;
}

/**
 * GeoEngineProvider: El Orquestador Maestro de la Workstation.
 */
export function GeoEngineProvider({ children, initialData }: GeoEngineProviderProps) {
  const supabase = createClient();

  // --- I. CONSUMO DE ESPECIALISTAS (HARDWARE & IA) ---
  const {
    telemetry,
    isDenied,
    isAcquiring,
    startHardwareWatch,
    killHardwareWatch,
    reSync
  } = useSensorAuthority({ initialData });

  const {
    forgeStatus,
    forgeData,
    isForgeLocked,
    forgeError,
    ingestSensoryData,
    synthesizeNarrative,
    transcribeVoiceIntent,
    resetForge
  } = useForgeOrchestrator();

  // --- II. ESTADO DE INTELIGENCIA Y MALLA LOCAL ---
  const [nearbyPOIs, setNearbyPOIs] = useState<PointOfInterest[]>([]);
  const [activePOI, setActivePOI] = useState<ActivePOI | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isTriangulated, setIsTriangulated] = useState<boolean>(false);

  const [manualAnchor, setManualAnchorState] = useState<UserLocation | null>(null);
  const [localData, setLocalData] = useState<{ isProximityConflict?: boolean; manualPlaceName?: string }>({});

  const effectiveLocation = manualAnchor || telemetry;

  // --- III. CONTROL DE TRÁFICO GEOESPACIAL (REFS) ---
  const lastFetchPosRef = useRef<{ lat: number, lng: number } | null>(null);
  const FETCH_DISTANCE_THRESHOLD = 100; // Throttling de Red: 100 metros.

  /**
   * fetchNearbyPOIs: Sincronización con Bóveda NKV.
   */
  const fetchNearbyPOIs = useCallback(async (location: UserLocation) => {
    if (lastFetchPosRef.current) {
      const distanceTraveled = calculateDistance(
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: lastFetchPosRef.current.lat, longitude: lastFetchPosRef.current.lng }
      );
      if (distanceTraveled < FETCH_DISTANCE_THRESHOLD) return;
    }

    setIsSearching(true);
    try {
      const { data: pois, error: dbError } = await supabase
        .from('vw_map_resonance_active')
        .select('*');

      if (dbError) throw dbError;

      setNearbyPOIs((pois as PointOfInterest[]) || []);
      lastFetchPosRef.current = { lat: location.latitude, lng: location.longitude };

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      nicepodLog("🔥 [Network] Error de Bóveda", msg, 'error');
    } finally {
      setIsSearching(false);
    }
  }, [supabase]);

  /**
   * evaluateEnvironment: Radar de proximidad local.
   */
  const evaluateEnvironment = useCallback((location: UserLocation) => {
    if (nearbyPOIs.length === 0) return;

    let closest: ActivePOI | null = null;
    let minDistance = Infinity;

    nearbyPOIs.forEach((poi) => {
      if (!poi.geo_location?.coordinates) return;
      const [pLng, pLat] = poi.geo_location.coordinates;
      const dist = calculateDistance(
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: pLat, longitude: pLng }
      );
      if (dist < minDistance) {
        minDistance = dist;
        closest = {
          id: poi.id.toString(),
          name: poi.name,
          distance: Math.round(dist),
          isWithinRadius: dist <= (poi.resonance_radius || 35)
        };
      }
    });

    setActivePOI(closest);
    setLocalData(prev => ({ ...prev, isProximityConflict: minDistance < 10 }));
  }, [nearbyPOIs]);

  // --- IV. SINCRONIZACIÓN DE CICLO DE VIDA ---

  useEffect(() => {
    if (effectiveLocation) {
      evaluateEnvironment(effectiveLocation);
      fetchNearbyPOIs(effectiveLocation);

      if (!isTriangulated) {
        setIsTriangulated(true);
      }
    }
  }, [effectiveLocation, evaluateEnvironment, fetchNearbyPOIs, isTriangulated]);

  // --- V. ENSAMBLAJE DE LA API PÚBLICA ---

  const derivedStatus = useMemo((): GeoEngineState => {
    if (forgeStatus !== 'IDLE') return forgeStatus;
    if (isDenied) return 'PERMISSION_DENIED';
    if (isAcquiring || effectiveLocation) return 'SENSORS_READY';
    return 'IDLE';
  }, [forgeStatus, isDenied, isAcquiring, effectiveLocation]);

  const api: GeoEngineReturn = {
    status: derivedStatus,
    userLocation: effectiveLocation,
    nearbyPOIs,
    activePOI,
    isTriangulated,

    // [MANDATO V2.7]: Autoridad Progresiva. 
    // isGPSLock solo es true si el hardware confirma precisión de calle (<80m).
    isGPSLock: telemetry?.source === 'gps' && telemetry.accuracy < 80,

    error: forgeError || (isDenied ? "GPS_BLOQUEADO" : null),
    data: { ...forgeData, ...localData },
    isSearching,
    isLocked: isForgeLocked,

    setTriangulated: () => setIsTriangulated(true),
    initSensors: startHardwareWatch,
    reSyncRadar: reSync,

    ingestSensoryData: (params) => ingestSensoryData(effectiveLocation, params),
    synthesizeNarrative,
    transcribeVoiceIntent,

    setManualAnchor: (lng, lat) => {
      setManualAnchorState({
        latitude: lat, longitude: lng,
        accuracy: 1, heading: telemetry?.heading ?? null, speed: null
      });
    },
    setManualPlaceName: (name) => setLocalData(prev => ({ ...prev, manualPlaceName: name })),

    reset: () => {
      killHardwareWatch();
      resetForge();
      setIsTriangulated(false);
      setNearbyPOIs([]);
      setActivePOI(null);
      setManualAnchorState(null);
      setLocalData({});
      lastFetchPosRef.current = null;
    }
  };

  return (
    <GeoEngineContext.Provider value={api}>
      {children}
    </GeoEngineContext.Provider>
  );
}

export function useGeoEngine() {
  const context = useContext(GeoEngineContext);
  if (!context) throw new Error("useGeoEngine out of bounds.");
  return context;
}