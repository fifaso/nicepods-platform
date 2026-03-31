/**
 * ARCHIVO: hooks/use-geo-engine.tsx
 * VERSIÓN: 39.0 (NicePod Sovereign Geo-Engine - View-Access & Performance Guard Edition)
 * PROTOCOLO: MADRID RESONANCE V2.8
 * 
 * Misión: Orquestar telemetría y red erradicando el error 404 y la saturación de CPU.
 * [REFORMA V39.0]: Transmutación de RPC a View 'vw_map_resonance_active' y Throttling Pro.
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
const FETCH_DISTANCE_THRESHOLD = 150; // Refresco de red: cada 150 metros
const EVALUATION_DISTANCE_THRESHOLD = 5; // Throttling de CPU: cada 5 metros
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

  // Override Manual y Contexto Local
  const [manualAnchor, setManualAnchorState] = useState<UserLocation | null>(null);
  const [localData, setLocalData] = useState<{ isProximityConflict?: boolean; manualPlaceName?: string }>({});

  const effectiveLocation = manualAnchor || telemetry;

  // --- III. CONTROL DE TRÁFICO GEOESPACIAL (REFS DE ALTA VELOCIDAD) ---
  const lastFetchPosRef = useRef<{ lat: number, lng: number } | null>(null);
  const lastEvalPosRef = useRef<{ lat: number, lng: number } | null>(null);
  const lastSourceRef = useRef<string | null>(initialData?.source || null);
  const lastEmittedLocationRef = useRef<UserLocation | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * fetchNearbyPOIs: Sincronización Inteligente con Bóveda NKV.
   * [SOLUCIÓN AL 404]: Cambiamos la llamada RPC por una consulta a la VISTA SQL.
   */
  const fetchNearbyPOIs = useCallback(async (location: UserLocation, force: boolean = false) => {
    // 1. Verificación de Throttling Geográfico
    if (!force && lastFetchPosRef.current) {
      const distanceTraveled = calculateDistance(
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: lastFetchPosRef.current.lat, longitude: lastFetchPosRef.current.lng }
      );
      if (distanceTraveled < FETCH_DISTANCE_THRESHOLD) return;
    }

    // 2. Gestión de Concurrencia de Red (AbortController)
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setIsSearching(true);
    try {
      nicepodLog(`🛰️ [GeoEngine] Consultando Bóveda NKV vía Vista Soberana...`);
      
      /**
       * [MANDATO V39.0]: Consultamos directamente la vista vw_map_resonance_active.
       * Esto erradica el error 404 (Not Found) del RPC fantasma.
       */
      const { data: pois, error: dbError } = await supabase
        .from('vw_map_resonance_active')
        .select('*');

      if (dbError) throw dbError;

      // Inyectamos los datos en la memoria local (RAM)
      setNearbyPOIs((pois as PointOfInterest[]) || []);
      lastFetchPosRef.current = { lat: location.latitude, lng: location.longitude };

    } catch (err: any) {
      if (err.name === 'AbortError') return;
      nicepodLog("🔥 [GeoEngine] Fallo en conexión con el Metal de Supabase.", err, 'error');
    } finally {
      setIsSearching(false);
    }
  }, [supabase]);

  /**
   * evaluateEnvironment: Procesador de Resonancia local (CPU Shield).
   * [MEJORA V39.0]: Implementa Throttling de 5m para liberar el Main Thread.
   */
  const evaluateEnvironment = useCallback((location: UserLocation) => {
    if (nearbyPOIs.length === 0) return;

    // Solo calculamos si el Voyager se desplazó más allá del umbral de 5m
    if (lastEvalPosRef.current) {
      const evalDistance = calculateDistance(
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: lastEvalPosRef.current.lat, longitude: lastEvalPosRef.current.lng }
      );
      if (evalDistance < EVALUATION_DISTANCE_THRESHOLD) return;
    }

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
    
    // Sincronizamos la última posición de evaluación
    lastEvalPosRef.current = { lat: location.latitude, lng: location.longitude };
  }, [nearbyPOIs]);

  // --- IV. SINCRONIZACIÓN DE CICLO DE VIDA (MOTOR DE AUTORIDAD) ---

  useEffect(() => {
    if (effectiveLocation) {
      const currentSource = effectiveLocation.source || 'unknown';
      const currentAccuracy = effectiveLocation.accuracy || 9999;

      // 1. Detección de Aterrizaje Balístico (Transmutación IP -> GPS)
      const isGpsFix = currentSource === 'gps' && currentAccuracy < GPS_LOCK_THRESHOLD;
      const sourceJustChanged = currentSource === 'gps' && lastSourceRef.current !== 'gps';

      if (isGpsFix && sourceJustChanged && !hasPerformedLandingRef.current) {
        nicepodLog("🚀 [GeoEngine] GPS Lock Certificado. Disparando Aterrizaje Balístico.");
        setNeedsBallisticLanding(true);
        hasPerformedLandingRef.current = true;
        fetchNearbyPOIs(effectiveLocation, true);
      }

      // 2. Inteligencia Local (Throttled)
      evaluateEnvironment(effectiveLocation);

      // 3. Gobernanza de Red
      if (!lastFetchPosRef.current) {
        fetchNearbyPOIs(effectiveLocation, true); // Fetch inicial síncrono
      } else {
        fetchNearbyPOIs(effectiveLocation); // Fetch por movimiento
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
      nicepodLog(`🎥 [GeoEngine] Conmutando Perspectiva: ${next}`);
      return next;
    });
    setRecenterTrigger(prev => prev + 1);
  }, []);

  const recenterCamera = useCallback(() => {
    nicepodLog("🎯 [GeoEngine] Orden de Recentrado: Emitiendo Pulso.");
    setIsManualMode(false);
    setRecenterTrigger(prev => prev + 1);
    setNeedsBallisticLanding(true); 
  }, []);

  const reSyncRadar = useCallback(() => {
    nicepodLog("🔄 [GeoEngine] Invalidación de Malla: Refrescando Bóveda NKV.");
    lastFetchPosRef.current = null;
    lastEvalPosRef.current = null;
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
      nicepodLog("🏁 [GeoEngine] Acknowledgment de cámara recibido.");
      setNeedsBallisticLanding(false);
    },
    toggleCameraPerspective,
    recenterCamera,
    setManualMode: (active: boolean) => {
      if (active !== isManualMode) {
        setIsManualMode(active);
        if (active) nicepodLog("🖐️ [GeoEngine] Mando Manual Activado.");
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
      lastEvalPosRef.current = null;
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
  if (!context) throw new Error("useGeoEngine debe invocarse dentro de un GeoEngineProvider.");
  return context;
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V39.0):
 * 1. RPC 404 Resolution: Se sustituyó la llamada RPC por una consulta directa a la vista
 *    vw_map_resonance_active, garantizando la sintonía del radar en cada despliegue.
 * 2. Cognitive CPU Shield: Throttling de 5 metros en evaluateEnvironment para erradicar
 *    las violaciones de rendimiento del Main Thread (Imagen 31).
 * 3. Authority Integrity: Se mantiene el pulso recenterTrigger para asegurar que 
 *    el mando único responda de forma determinista.
 * 4. Zero-Flicker Persistence: Sincronización absoluta de isTriangulated para evitar 
 *    discrepancias de hidratación SSR/Cliente.
 */