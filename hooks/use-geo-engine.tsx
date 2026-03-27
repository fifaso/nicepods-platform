//hooks/use-geo-engine.tsx
/**
 * NICEPOD V30.0 - SOVEREIGN GEO-ENGINE (ORCHESTRATOR)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Orquestar telemetría, red y cinemática balística.
 * [ESTABILIZACIÓN]: Implementación de needsBallisticLanding y Transmutación de Autoridad.
 */

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
  initialData?: {
    lat: number;
    lng: number;
    city: string;
    source: string;
  } | null;
}

const FETCH_DISTANCE_THRESHOLD = 100; // 100 metros para proteger el Metal (Supabase)
const GPS_LOCK_ACCURACY = 80;         // Umbral de autoridad satelital

export function GeoEngineProvider({ children, initialData }: GeoEngineProviderProps) {
  const supabase = createClient();

  // --- I. CONSUMO DE ESPECIALISTAS ---
  const {
    telemetry,
    isDenied,
    isAcquiring,
    isIgnited,
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

  // --- II. ESTADO DE INTELIGENCIA Y MALLA ---
  const [nearbyPOIs, setNearbyPOIs] = useState<PointOfInterest[]>([]);
  const [activePOI, setActivePOI] = useState<ActivePOI | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isTriangulated, setIsTriangulated] = useState<boolean>(!!initialData || !!telemetry);

  // [NUEVO]: Estado de Aterrizaje Balístico
  // Misión: Disparar un vuelo cinemático único cuando pasamos de IP a GPS real.
  const [needsBallisticLanding, setNeedsBallisticLanding] = useState<boolean>(false);
  const hasPerformedLandingRef = useRef<boolean>(false);

  // Override Manual y Contexto Local
  const [manualAnchor, setManualAnchorState] = useState<UserLocation | null>(null);
  const [localData, setLocalData] = useState<{ isProximityConflict?: boolean; manualPlaceName?: string }>({});

  const effectiveLocation = manualAnchor || telemetry;

  // --- III. CONTROL DE TRÁFICO GEOESPACIAL (REFS) ---
  const lastFetchPosRef = useRef<{ lat: number, lng: number } | null>(null);
  const lastSourceRef = useRef<string | null>(telemetry?.source || initialData?.source || null);
  const lastEmittedLocationRef = useRef<UserLocation | null>(null);

  /**
   * fetchNearbyPOIs: Sincronización Inteligente con Bóveda NKV.
   */
  const fetchNearbyPOIs = useCallback(async (location: UserLocation, force: boolean = false) => {
    if (!force && lastFetchPosRef.current) {
      const distanceTraveled = calculateDistance(
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: lastFetchPosRef.current.lat, longitude: lastFetchPosRef.current.lng }
      );
      if (distanceTraveled < FETCH_DISTANCE_THRESHOLD) return;
    }

    setIsSearching(true);
    try {
      nicepodLog(`🛰️ [GeoEngine] Fetch Bóveda NKV (${force ? 'FORCED' : 'THROTTLED'}).`);
      const { data, error } = await supabase.rpc('get_nearby_resonances_v2', {
        user_lat: location.latitude,
        user_lng: location.longitude,
        radius_meters: 1500
      });
      if (error) throw error;
      setNearbyPOIs((data as PointOfInterest[]) || []);
      lastFetchPosRef.current = { lat: location.latitude, lng: location.longitude };
    } catch (err) {
      nicepodLog("🔥 [GeoEngine] Error en Bóveda NKV", err, 'error');
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

  // --- IV. SINCRONIZACIÓN DE CICLO DE VIDA (MOTOR DE AUTORIDAD) ---

  useEffect(() => {
    if (effectiveLocation) {
      const currentSource = effectiveLocation.source || 'unknown';
      const currentAccuracy = effectiveLocation.accuracy || 9999;

      /**
       * 1. DETECCIÓN DE ATERRIZAJE BALÍSTICO
       * Si pasamos de IP/Cache a GPS real con buena precisión, activamos el aterrizaje.
       */
      const isGpsFix = currentSource === 'gps' && currentAccuracy < GPS_LOCK_ACCURACY;
      if (isGpsFix && !hasPerformedLandingRef.current) {
        nicepodLog("🚀 [GeoEngine] Protocolo Balístico: Ignición de Aterrizaje.");
        setNeedsBallisticLanding(true);
        hasPerformedLandingRef.current = true;
        fetchNearbyPOIs(effectiveLocation, true); // Fetch forzado al aterrizar
      }

      // 2. Detección de Movimiento Significativo para refresco de red
      let isWalking = false;
      if (lastEmittedLocationRef.current) {
        const stepDist = calculateDistance(
          { latitude: effectiveLocation.latitude, longitude: effectiveLocation.longitude },
          { latitude: lastEmittedLocationRef.current.latitude, longitude: lastEmittedLocationRef.current.longitude }
        );
        if (stepDist > 40) isWalking = true;
      }

      evaluateEnvironment(effectiveLocation);

      // 3. Gobernanza de Red
      if (isWalking) {
        fetchNearbyPOIs(effectiveLocation);
      } else if (!lastFetchPosRef.current) {
        // Fetch inicial de cortesía (IP)
        fetchNearbyPOIs(effectiveLocation, true);
      }

      lastEmittedLocationRef.current = effectiveLocation;
      if (!isTriangulated) setIsTriangulated(true);
      lastSourceRef.current = currentSource;
    }
  }, [effectiveLocation, evaluateEnvironment, fetchNearbyPOIs, isTriangulated]);

  // --- V. ENSAMBLAJE DE LA API PÚBLICA ---

  const derivedStatus = useMemo((): GeoEngineState => {
    if (forgeStatus !== 'IDLE') return forgeStatus;
    if (isDenied) return 'PERMISSION_DENIED';
    if (isIgnited || effectiveLocation) return 'SENSORS_READY';
    return 'IDLE';
  }, [forgeStatus, isDenied, isIgnited, effectiveLocation]);

  const api: GeoEngineReturn = {
    status: derivedStatus,
    userLocation: effectiveLocation,
    nearbyPOIs,
    activePOI,
    isTriangulated,
    isGPSLock: telemetry?.source === 'gps' && telemetry.accuracy < GPS_LOCK_ACCURACY,

    // [NUEVA AUTORIDAD V30.0]
    needsBallisticLanding,
    confirmLanding: () => {
      nicepodLog("🏁 [GeoEngine] Aterrizaje Confirmado por la Cámara.");
      setNeedsBallisticLanding(false);
    },

    error: forgeError || (isDenied ? "GPS_RESTRICTED" : null),
    data: { ...forgeData, ...localData },
    isSearching,
    isLocked: isForgeLocked,
    isIgnited,

    setTriangulated: () => setIsTriangulated(true),
    initSensors: startHardwareWatch,
    reSyncRadar: reSync,
    ingestSensoryData: (params) => ingestSensoryData(effectiveLocation, params),
    synthesizeNarrative,
    transcribeVoiceIntent,
    setManualAnchor: (lng, lat) => {
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
    setManualPlaceName: (name) => setLocalData(prev => ({ ...prev, manualPlaceName: name })),
    reset: () => {
      killHardwareWatch();
      resetForge();
      setIsTriangulated(false);
      setNearbyPOIs([]);
      setActivePOI(null);
      setManualAnchorState(null);
      setLocalData({});
      setNeedsBallisticLanding(false);
      hasPerformedLandingRef.current = false;
      lastFetchPosRef.current = null;
      lastSourceRef.current = null;
    }
  };

  return <GeoEngineContext.Provider value={api}>{children}</GeoEngineContext.Provider>;
}

export function useGeoEngine() {
  const context = useContext(GeoEngineContext);
  if (!context) throw new Error("useGeoEngine fuera de Provider.");
  return context;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V30.0):
 * 1. Ballistic Protocol: Se añade needsBallisticLanding para forzar flyTo cinematográfico.
 * 2. Authority Transmutation: El paso IP -> GPS ahora es un evento explícito, no una casualidad.
 * 3. Atomic State: confirmLanding() permite que el CameraController cierre el bucle de salto.
 * 4. Zero-Flicker: La materialización por IP se mantiene como base de cortesía (Zinc).
 */