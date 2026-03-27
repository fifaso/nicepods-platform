// hooks/use-geo-engine.tsx
// VERSIÓN: 29.0 (NicePod Sovereign Geo-Engine - Thread Sovereignty & Materialization Edition)
// Misión: Orquestar la telemetría global eliminando pestañeos y garantizando actualización automática.
// [ESTABILIZACIÓN]: Integración de IP-T0, Transmutación de Fuente y Bypass de Movimiento Crítico.

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

// --- SERVICIOS ESPECIALIZADOS (FRAGMENTACIÓN DE RESPONSABILIDAD) ---
import { calculateDistance } from "@/lib/geo-kinematics";
import { useForgeOrchestrator } from "./use-forge-orchestrator";
import { useSensorAuthority } from "./use-sensor-authority";

// --- CONSTITUCIÓN DE TIPOS (BUILD SHIELD V4.3) ---
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
  /** initialData: Ubicación estimada por IP capturada en el Edge de Vercel. */
  initialData?: {
    lat: number;
    lng: number;
    city: string;
    source: string;
  } | null;
}

/**
 * GeoEngineProvider: El Reactor Sensorial Maestro de NicePod.
 */
export function GeoEngineProvider({ children, initialData }: GeoEngineProviderProps) {
  const supabase = createClient();

  // --- I. CONSUMO DE ESPECIALISTAS (CEREBRO DUAL) ---

  // A. El Centinela de Hardware (GPS/IP-Fallback)
  const {
    telemetry,
    isDenied,
    isAcquiring,
    startHardwareWatch,
    killHardwareWatch,
    reSync
  } = useSensorAuthority({ initialData });

  // B. El Escriba de la Forja (IA/Ingesta)
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
  const [isTriangulated, setIsTriangulated] = useState<boolean>(!!initialData || !!telemetry);

  // Override Manual y Contexto Local (Clima/Nombre)
  const [manualAnchor, setManualAnchorState] = useState<UserLocation | null>(null);
  const [localData, setLocalData] = useState<{ isProximityConflict?: boolean; manualPlaceName?: string }>({});

  const effectiveLocation = manualAnchor || telemetry;

  // --- III. CONTROL DE TRÁFICO GEOESPACIAL (REFS) ---
  const lastFetchPosRef = useRef<{ lat: number, lng: number } | null>(null);
  const lastSourceRef = useRef<string | null>(telemetry?.source || initialData?.source || null);
  const lastEmittedLocationRef = useRef<UserLocation | null>(null);

  const FETCH_DISTANCE_THRESHOLD = 100; // Throttling: 100 metros para red.

  /**
   * fetchNearbyPOIs: Sincronización Inteligente con Bóveda NKV.
   * Misión: Consultar la red solo si hay movimiento real o cambio de autoridad.
   */
  const fetchNearbyPOIs = useCallback(async (location: UserLocation, force: boolean = false) => {
    // 1. Verificamos si la distancia justifica una nueva petición.
    if (!force && lastFetchPosRef.current) {
      const distanceTraveled = calculateDistance(
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: lastFetchPosRef.current.lat, longitude: lastFetchPosRef.current.lng }
      );

      if (distanceTraveled < FETCH_DISTANCE_THRESHOLD) return;
    }

    setIsSearching(true);
    try {
      nicepodLog(`🛰️ [Network] Sincronizando Bóveda (${force ? 'FORCED_BY_AUTHORITY' : 'DISTANCE_REFRESH'})`);

      const { data: pois, error: dbError } = await supabase
        .from('vw_map_resonance_active')
        .select('*');

      if (dbError) throw dbError;

      setNearbyPOIs((pois as PointOfInterest[]) || []);
      lastFetchPosRef.current = { lat: location.latitude, lng: location.longitude };

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      nicepodLog("🔥 [Network] Error al consultar Bóveda NKV", msg, 'error');
    } finally {
      setIsSearching(false);
    }
  }, [supabase]);

  /**
   * evaluateEnvironment: Procesador de Resonancia local (60fps).
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
          isWithinRadius: dist <= (poi.resonance_radius || 35),
          historical_fact: poi.historical_fact || undefined
        };
      }
    });

    setActivePOI(closest);
    setLocalData(prev => ({ ...prev, isProximityConflict: minDistance < 10 }));
  }, [nearbyPOIs]);

  // --- IV. SINCRONIZACIÓN DE CICLO DE VIDA (MATERIALIZACIÓN) ---

  /**
   * Efecto de Pulso Sensorial y Refinamiento Automático:
   * Misión: Detectar el paso de IP a GPS y el movimiento caminando.
   */
  useEffect(() => {
    if (effectiveLocation) {
      // 1. Detección de Transmutación de Fuente (IP -> GPS)
      const currentSource = effectiveLocation.source || 'unknown';
      const sourceChangedToGPS = currentSource === 'gps' && lastSourceRef.current !== 'gps';

      // 2. Detección de Movimiento Crítico (Bypass de Jitter)
      let isWalking = false;
      if (lastEmittedLocationRef.current) {
        const stepDist = calculateDistance(
          { latitude: effectiveLocation.latitude, longitude: effectiveLocation.longitude },
          { latitude: lastEmittedLocationRef.current.latitude, longitude: lastEmittedLocationRef.current.longitude }
        );
        // Si se movió más de 30 metros, forzamos la actualización visual
        if (stepDist > 30) isWalking = true;
      }

      // 3. Ejecución de Inteligencia Local
      evaluateEnvironment(effectiveLocation);

      /**
       * 4. GESTIÓN DE ACTUALIZACIÓN SOBERANA
       * Forzamos la red si:
       * - Es la primera vez que se detecta GPS real.
       * - El usuario ha caminado una distancia considerable.
       */
      if (sourceChangedToGPS || isWalking) {
        nicepodLog(`🎯 [Geo-Orchestrator] Actualización Automática (${sourceChangedToGPS ? 'GPS_LOCK' : 'WALKING'}).`);
        fetchNearbyPOIs(effectiveLocation, true);
        if (sourceChangedToGPS) lastSourceRef.current = 'gps';
      } else {
        // Throttling estándar de 100m
        fetchNearbyPOIs(effectiveLocation);
      }

      lastEmittedLocationRef.current = effectiveLocation;

      if (!isTriangulated) {
        setIsTriangulated(true);
      }
    }
  }, [effectiveLocation, evaluateEnvironment, fetchNearbyPOIs, isTriangulated]);

  // --- V. ENSAMBLAJE DE LA API PÚBLICA (BUILD SHIELD) ---

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

    // isGPSLock: Certifica la precisión satelital (<80m).
    isGPSLock: telemetry?.source === 'gps' && telemetry.accuracy < 80,

    error: forgeError || (isDenied ? "GPS_RESTRICTED" : null),
    data: { ...forgeData, ...localData },
    isSearching,
    isLocked: isForgeLocked,

    // Métodos de Control Global
    setTriangulated: () => setIsTriangulated(true),
    initSensors: startHardwareWatch,
    reSyncRadar: reSync,

    // Flujos de Inteligencia
    ingestSensoryData: (params) => ingestSensoryData(effectiveLocation, params),
    synthesizeNarrative,
    transcribeVoiceIntent,

    // Gestión Manual
    setManualAnchor: (lng, lat) => {
      nicepodLog(`📍 [Geo-Orchestrator] Anclaje manual en curso.`);
      setManualAnchorState({
        latitude: lat,
        longitude: lng,
        accuracy: 1,
        heading: telemetry?.heading ?? null,
        speed: null,
        source: 'gps',
        timestamp: Date.now()
      });
    },
    setManualPlaceName: (name) => {
      setLocalData(prev => ({ ...prev, manualPlaceName: name }));
    },

    // Purga de Sesión
    reset: () => {
      nicepodLog("🧹 [Geo-Orchestrator] Purga de sesión ejecutada.");
      killHardwareWatch();
      resetForge();
      setIsTriangulated(false);
      setNearbyPOIs([]);
      setActivePOI(null);
      setManualAnchorState(null);
      setLocalData({});
      lastFetchPosRef.current = null;
      lastSourceRef.current = null;
      lastEmittedLocationRef.current = null;
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
  if (!context) {
    throw new Error("useGeoEngine debe ser invocado dentro de un GeoEngineProvider nominal.");
  }
  return context;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V29.0):
 * 1. Materialización T0 Sincronizada: Se resolvió el pestañeo inicial integrando 
 *    el estado de triangulación con el nacimiento del hook. El sistema ya sabe 
 *    si debe mostrar al Voyager desde el primer render.
 * 2. Protocolo de Transmutación: El sistema escucha activamente el cambio de IP 
 *    a GPS, forzando la actualización de la malla urbana para que el usuario 
 *    llegue a su punto exacto sin esperas de red.
 * 3. Liberación del Hilo Principal: El filtrado de 100m y la separación de 
 *    responsabilidades eliminan las tareas largas que bloqueaban el GPS.
 * 4. Build Shield: Resolución final de errores ts(2339) y ts(2353).
 */