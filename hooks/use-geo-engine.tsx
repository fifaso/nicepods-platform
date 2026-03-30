/**
 * ARCHIVO: hooks/use-geo-engine.tsx
 * VERSIÓN: 38.1 (NicePod Sovereign Geo-Engine - Type Alignment & Build Stability Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Orquestar telemetría y red sincronizando la interfaz con el motor de IA.
 * [REPARACIÓN CRÍTICA]: Alineación de tipos 'tone' y 'depth' para sanar error TS2345.
 * Nivel de Integridad: 100% (Sin abreviaciones / Producción-Ready)
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

// --- SERVICIOS ESPECIALIZADOS (CINEMÁTICA Y HARDWARE) ---
import { calculateDistance } from "@/lib/geo-kinematics";
import { useForgeOrchestrator } from "./use-forge-orchestrator";
import { useSensorAuthority } from "./use-sensor-authority";

// --- CONSTITUCIÓN DE TIPOS V6.4 (BUILD SHIELD) ---
import {
  ActivePOI,
  GeoEngineReturn,
  GeoEngineState,
  PointOfInterest,
  UserLocation,
  GeoContextData,
  CameraPerspective,
  NarrativeDepth,
  NarrativeTone
} from "@/types/geo-sovereignty";

const GeoEngineContext = createContext<GeoEngineReturn | undefined>(undefined);

interface GeoEngineProviderProps {
  children: React.ReactNode;
  /** initialData: Telemetría de red inyectada por el servidor (T0). */
  initialData?: {
    lat: number;
    lng: number;
    city: string;
    source: string;
  } | null;
}

// CONSTANTES DE GOBERNANZA INDUSTRIAL
const FETCH_DISTANCE_THRESHOLD = 100; // Throttling: 100 metros
const GPS_LOCK_THRESHOLD = 80;        // Autoridad Satelital: 80 metros

/**
 * GeoEngineProvider: El Reactor Sensorial Maestro de NicePod.
 */
export function GeoEngineProvider({ children, initialData }: GeoEngineProviderProps) {
  const supabase = createClient();

  // --- I. CONSUMO DE ESPECIALISTAS (SENSES & BRAIN) ---

  const {
    telemetry,
    isDenied,
    isAcquiring,
    isIgnited,
    startHardwareWatch,
    killHardwareWatch,
    reSync: reSyncHardware
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
  const [isTriangulated, setIsTriangulated] = useState<boolean>(!!initialData || !!telemetry);

  // GOBERNANZA CINEMÁTICA
  const [cameraPerspective, setCameraPerspective] = useState<CameraPerspective>('OVERVIEW');
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const [recenterTrigger, setRecenterTrigger] = useState<number>(0);
  const [needsBallisticLanding, setNeedsBallisticLanding] = useState<boolean>(false);
  
  const hasPerformedLandingRef = useRef<boolean>(false);

  // Override Manual
  const [manualAnchor, setManualAnchorState] = useState<UserLocation | null>(null);
  const [localData, setLocalData] = useState<{ isProximityConflict?: boolean; manualPlaceName?: string }>({});

  const effectiveLocation = manualAnchor || telemetry;

  // --- III. CONTROL DE TRÁFICO GEOESPACIAL (REFS DE ALTA VELOCIDAD) ---
  const lastFetchPosRef = useRef<{ lat: number, lng: number } | null>(null);
  const lastSourceRef = useRef<string | null>(initialData?.source || null);
  const lastEmittedLocationRef = useRef<UserLocation | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

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

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsSearching(true);
    try {
      nicepodLog(`🛰️ [GeoEngine] Fetching Bóveda NKV (${force ? 'FORCED' : 'THROTTLED'})`);
      
      const { data, error: dbError } = await supabase.rpc('get_nearby_resonances', {
        user_lat: location.latitude,
        user_lng: location.longitude,
        radius_meters: 1500 
      });

      if (dbError) {
        if (dbError.code === 'PGRST202') {
          nicepodLog("⚠️ [GeoEngine] RPC 'get_nearby_resonances' 404. Radar pasivo.", null, 'warn');
        } else if (dbError.message?.includes('aborted')) {
          return; 
        } else {
          throw dbError;
        }
      }

      setNearbyPOIs((data as PointOfInterest[]) || []);
      lastFetchPosRef.current = { lat: location.latitude, lng: location.longitude };

    } catch (err) {
      nicepodLog("🔥 [GeoEngine] Fallo en enlace de datos Supabase.", err, 'error');
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

  // --- IV. SINCRONIZACIÓN DE CICLO DE VIDA ---

  useEffect(() => {
    if (effectiveLocation) {
      const currentSource = effectiveLocation.source || 'unknown';
      const currentAccuracy = effectiveLocation.accuracy || 9999;

      const isGpsFix = currentSource === 'gps' && currentAccuracy < GPS_LOCK_THRESHOLD;
      const sourceJustChanged = currentSource === 'gps' && lastSourceRef.current !== 'gps';

      if (isGpsFix && sourceJustChanged && !hasPerformedLandingRef.current) {
        nicepodLog("🚀 [GeoEngine] GPS Lock detectado. Iniciando Aterrizaje.");
        setNeedsBallisticLanding(true);
        hasPerformedLandingRef.current = true;
        fetchNearbyPOIs(effectiveLocation, true);
      }

      evaluateEnvironment(effectiveLocation);

      if (!lastFetchPosRef.current) {
        fetchNearbyPOIs(effectiveLocation, true);
      } else {
        fetchNearbyPOIs(effectiveLocation);
      }

      lastEmittedLocationRef.current = effectiveLocation;
      lastSourceRef.current = currentSource;
      if (!isTriangulated) setIsTriangulated(true);
    }
  }, [effectiveLocation, evaluateEnvironment, fetchNearbyPOIs, isTriangulated]);

  // --- V. MÉTODOS DE SOBERANÍA CINEMÁTICA ---

  const toggleCameraPerspective = useCallback(() => {
    setCameraPerspective(prev => {
      const next = prev === 'STREET' ? 'OVERVIEW' : 'STREET';
      nicepodLog(`🎥 [GeoEngine] Cambio de Perspectiva: ${next}`);
      return next;
    });
    setRecenterTrigger(prev => prev + 1);
  }, []);

  const recenterCamera = useCallback(() => {
    nicepodLog("🎯 [GeoEngine] Comando de Recentrado: Pulso de Autoridad.");
    setIsManualMode(false);
    setRecenterTrigger(prev => prev + 1);
    setNeedsBallisticLanding(true); 
  }, []);

  const reSyncRadar = useCallback(() => {
    nicepodLog("🔄 [GeoEngine] Forzando sincronía total de malla.");
    lastFetchPosRef.current = null;
    if (effectiveLocation) {
      fetchNearbyPOIs(effectiveLocation, true);
    }
    reSyncHardware();
  }, [effectiveLocation, fetchNearbyPOIs, reSyncHardware]);

  // --- VI. ENSAMBLAJE DE LA API PÚBLICA (BUILD SHIELD V6.4) ---

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
    isGPSLock: telemetry?.source === 'gps' && telemetry.accuracy < GPS_LOCK_THRESHOLD,
    isSearching,
    isLocked: isForgeLocked,
    isIgnited,
    error: forgeError || (isDenied ? "GPS_RESTRICTED" : null),
    data: { ...forgeData, ...localData } as GeoContextData,

    needsBallisticLanding,
    recenterTrigger,
    cameraPerspective,
    isManualMode,
    confirmLanding: () => {
      nicepodLog("🏁 [GeoEngine] Acknowledgment de cámara.");
      setNeedsBallisticLanding(false);
    },
    toggleCameraPerspective,
    recenterCamera,
    setManualMode: (active: boolean) => {
      if (active !== isManualMode) {
        setIsManualMode(active);
        if (active) nicepodLog("🖐️ [GeoEngine] Mando Manual.");
      }
    },

    initSensors: startHardwareWatch,
    reSyncRadar,
    setTriangulated: () => setIsTriangulated(true),
    setManualAnchor: (lng, lat) => {
      setManualAnchorState({
        latitude: lat, longitude: lng, accuracy: 1,
        heading: telemetry?.heading ?? null, speed: null,
        source: 'gps', timestamp: Date.now()
      });
    },
    setManualPlaceName: (name) => setLocalData(prev => ({ ...prev, manualPlaceName: name })),

    ingestSensoryData: (params) => ingestSensoryData(effectiveLocation, params),
    
    // [FIX TS2345]: Alineación explícita con el contrato NarrativeTone y NarrativeDepth
    synthesizeNarrative: (params: {
      poiId: number;
      depth: NarrativeDepth;
      tone: NarrativeTone;
      refinedIntent?: string;
    }) => synthesizeNarrative(params),
    
    transcribeVoiceIntent: (audioBase64) => transcribeVoiceIntent(audioBase64),

    reset: () => {
      nicepodLog("Sweep [GeoEngine] Purga total.");
      if (abortControllerRef.current) abortControllerRef.current.abort();
      killHardwareWatch();
      resetForge();
      setIsTriangulated(false);
      setNearbyPOIs([]);
      setActivePOI(null);
      setManualAnchorState(null);
      setLocalData({});
      setNeedsBallisticLanding(false);
      setRecenterTrigger(0);
      setCameraPerspective('OVERVIEW');
      setIsManualMode(false);
      hasPerformedLandingRef.current = false;
      lastFetchPosRef.current = null;
      lastSourceRef.current = null;
    }
  };

  return (
    <GeoEngineContext.Provider value={api}>
      {children}
    </GeoEngineContext.Provider>
  );
}

/**
 * HOOK: useGeoEngine
 * Único punto de acceso a la telemetría y mando visual.
 */
export function useGeoEngine() {
  const context = useContext(GeoEngineContext);
  if (!context) throw new Error("useGeoEngine fuera de Provider.");
  return context;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V38.1):
 * 1. Build Shield Secured: Se implementó la firma tipada de synthesizeNarrative,
 *    eliminando el error TS2345 al alinear los literales de 'tone' y 'depth'.
 * 2. RPC Resilience: Mantiene el nombre 'get_nearby_resonances' para asegurar 
 *    la conexión con la base de datos industrial de NicePod.
 * 3. Atomic Handover: Garantiza la persistencia de la ubicación entre Dashboard 
 *    y Mapa Full, optimizando el tiempo de carga percibido.
 * 4. Zero Abbreviations: Archivo íntegro listo para despliegue nominal.
 */