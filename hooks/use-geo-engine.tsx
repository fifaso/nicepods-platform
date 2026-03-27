// hooks/use-geo-engine.tsx
// VERSIÓN: 28.2 (NicePod Sovereign Geo-Engine - Absolute Authority & Sync Edition)
// Misión: Orquestar el Cerebro Dual garantizando la actualización automática y fluida.
// [ESTABILIZACIÓN]: Sello de tipos UserLocation (source/timestamp) y Materialización Bi-Fásica.

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
 * GeoEngineProvider: El Orquestador de Misión de NicePod.
 * Misión: Unificar telemetría y capital intelectual con materialización inmediata.
 */
export function GeoEngineProvider({ children, initialData }: GeoEngineProviderProps) {
  const supabase = createClient();

  // --- I. CONSUMO DE ESPECIALISTAS (CEREBRO DUAL) ---

  // A. El Centinela de Hardware (GPS/Heading/Speed)
  const {
    telemetry,
    isDenied,
    isAcquiring,
    startHardwareWatch,
    killHardwareWatch,
    reSync
  } = useSensorAuthority({ initialData });

  // B. El Escriba de la Forja (IA/Ingesta/Síntesis)
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
  const lastSourceRef = useRef<string | null>(null);
  const lastEmittedLocationRef = useRef<UserLocation | null>(null);

  const FETCH_DISTANCE_THRESHOLD = 100; // Throttling de Red: 100 metros.

  /**
   * fetchNearbyPOIs: Sincronización Inteligente con Bóveda NKV.
   * Misión: Consultar la red solo cuando sea estrictamente necesario o forzado.
   */
  const fetchNearbyPOIs = useCallback(async (location: UserLocation, force: boolean = false) => {
    if (!force && lastFetchPosRef.current) {
      const distanceTraveled = calculateDistance(
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: lastFetchPosRef.current.lat, longitude: lastFetchPosRef.current.lng }
      );

      // Si nos movemos menos de 100m y no es un evento forzado, abortamos.
      if (distanceTraveled < FETCH_DISTANCE_THRESHOLD) return;
    }

    setIsSearching(true);
    try {
      nicepodLog(`🛰️ [Network] Sincronizando Bóveda (Ref: ${force ? 'AUTHORITY_SHIFT' : 'MOVEMENT'}).`);

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

  useEffect(() => {
    if (effectiveLocation) {
      // 1. Detección de Transmutación de Fuente (IP -> GPS)
      const currentSource = effectiveLocation.source || 'unknown';
      const sourceChangedToGPS = currentSource === 'gps' && lastSourceRef.current !== 'gps';

      // 2. Detección de Movimiento Crítico (Paso Humano)
      let isMovingFast = false;
      if (lastEmittedLocationRef.current) {
        const stepDist = calculateDistance(
          { latitude: effectiveLocation.latitude, longitude: effectiveLocation.longitude },
          { latitude: lastEmittedLocationRef.current.latitude, longitude: lastEmittedLocationRef.current.longitude }
        );
        if (stepDist > 30) isMovingFast = true;
      }

      // 3. Ejecución de Resonancia Local
      evaluateEnvironment(effectiveLocation);

      /**
       * 4. GESTIÓN DE ACTUALIZACIÓN AUTOMÁTICA
       * Si hay cambio de fuente o movimiento grande, forzamos la actualización.
       */
      if (sourceChangedToGPS || isMovingFast) {
        nicepodLog(`🎯 [Geo-Orchestrator] Actualización Automática (${sourceChangedToGPS ? 'GPS-LOCK' : 'STEP'}).`);
        fetchNearbyPOIs(effectiveLocation, true);
        if (sourceChangedToGPS) lastSourceRef.current = 'gps';
      } else {
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

    error: forgeError || (isDenied ? "ACCESO_GPS_DENEGADO" : null),
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

    // Métodos de Gestión Manual
    setManualAnchor: (lng, lat) => {
      nicepodLog(`📍 [Geo-Orchestrator] Aplicando anclaje manual.`);
      setManualAnchorState({
        latitude: lat,
        longitude: lng,
        accuracy: 1,
        heading: telemetry?.heading ?? null,
        speed: null,
        source: 'gps', // Marcamos como GPS para habilitar autoridad visual inmediata
        timestamp: Date.now()
      });
    },
    setManualPlaceName: (name) => {
      nicepodLog(`🏷️ [Geo-Orchestrator] Nombre manual asignado: ${name}`);
      setLocalData(prev => ({ ...prev, manualPlaceName: name }));
    },

    // Limpieza Atómica
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
 * NOTA TÉCNICA DEL ARCHITECT (V28.2):
 * 1. Protocolo de Transmutación T0: El orquestador detecta el paso de IP a GPS 
 *    y fuerza una actualización instantánea, materializando al usuario en 
 *    su posición real sin intervención manual.
 * 2. Bypass de Inercia: Si el Voyager se desplaza > 30m, el sistema ignora 
 *    los filtros de estabilidad para asegurar que el avatar 'camine' en el mapa.
 * 3. Resolución de Tipos ts(2339/2353): Se alineó el objeto 'api' con la 
 *    interfaz v4.3 de UserLocation, permitiendo el uso legal de 'source' y 'timestamp'.
 * 4. Rigor NCIS: Implementación completa, funcional y preparada para la Malla 3D.
 */